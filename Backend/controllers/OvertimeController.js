import Overtime from '../models/OvertimeModel.js';
import DataPegawai from '../models/DataPegawaiModel.js';
import { Op } from 'sequelize';

const validateOvertimeInput = (data) => {
    const errors = [];
    
    if (!data.employee_id || !data.overtime_date || !data.hours || !data.reason) {
        errors.push('All fields are required');
    }
    
    if (data.hours) {
        const hours = parseFloat(data.hours);
        if (isNaN(hours) || hours < 1 || hours > 6) {
            errors.push('Overtime hours must be between 1 and 6');
        }
    }
    
    if (data.overtime_date) {
        const overtimeDate = new Date(data.overtime_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        
        if (overtimeDate > today) {
            errors.push('Date cannot be in the future');
        }
        
        if (overtimeDate < sevenDaysAgo) {
            errors.push('Date cannot be more than 7 days in the past');
        }
    }
    
    if (data.reason && data.reason.trim().length < 10) {
        errors.push('Reason must be at least 10 characters');
    }
    
    return errors;
};

export const addOvertime = async (req, res) => {
    try {
        const { employee_id, overtime_date, hours, reason } = req.body;
        
        const validationErrors = validateOvertimeInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', ')
            });
        }
        
        const employee = await DataPegawai.findOne({
            where: { id_pegawai: employee_id }
        });
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Worker does not exist in the system'
            });
        }
        
        const existingEntry = await Overtime.findOne({
            where: {
                employee_id: employee_id,
                overtime_date: overtime_date
            }
        });
        
        if (existingEntry) {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry: Overtime already logged for this worker on this date'
            });
        }
        
        const overtimeDate = new Date(overtime_date);
        const monthStart = new Date(overtimeDate.getFullYear(), overtimeDate.getMonth(), 1);
        const monthEnd = new Date(overtimeDate.getFullYear(), overtimeDate.getMonth() + 1, 0);
        
        const monthlyOvertime = await Overtime.sum('hours', {
            where: {
                employee_id: employee_id,
                overtime_date: {
                    [Op.between]: [monthStart, monthEnd]
                },
                status: {
                    [Op.ne]: 'rejected'
                }
            }
        }) || 0;
        
        const newHours = parseFloat(hours);
        if (monthlyOvertime + newHours > 60) {
            return res.status(400).json({
                success: false,
                message: `Total monthly overtime would exceed 60 hours. Current: ${monthlyOvertime}h, Adding: ${newHours}h`
            });
        }
        
        const overtime = await Overtime.create({
            employee_id,
            overtime_date,
            hours,
            reason,
            status: 'pending',
            created_by: req.session?.userId || 'admin'
        });
        
        res.status(201).json({
            success: true,
            message: 'Overtime entry created successfully',
            data: overtime
        });
        
    } catch (error) {
        console.error('Error creating overtime:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getOvertimeByEmployee = async (req, res) => {
    try {
        const { employee_id } = req.params;
        
        const overtime = await Overtime.findAll({
            where: { employee_id },
            order: [['overtime_date', 'DESC']]
        });
        
        res.json({
            success: true,
            data: overtime
        });
        
    } catch (error) {
        console.error('Error fetching overtime:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllOvertime = async (req, res) => {
    try {
        const overtime = await Overtime.findAll({
            include: [{
                model: DataPegawai,
                as: 'employee',
                attributes: ['id_pegawai', 'nama_pegawai', 'jabatan']
            }],
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: overtime
        });
        
    } catch (error) {
        console.error('Error fetching overtime:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const approveOvertime = async (req, res) => {
    try {
        const { id } = req.params;
        
        const overtime = await Overtime.findByPk(id);
        if (!overtime) {
            return res.status(404).json({
                success: false,
                message: 'Overtime entry not found'
            });
        }
        
        overtime.status = 'approved';
        await overtime.save();
        
        res.json({
            success: true,
            message: 'Overtime approved successfully',
            data: overtime
        });
        
    } catch (error) {
        console.error('Error approving overtime:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}; 