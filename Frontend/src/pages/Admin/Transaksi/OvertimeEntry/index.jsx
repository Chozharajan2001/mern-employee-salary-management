import { useState, useEffect } from 'react';
import Layout from '../../../../layout';
import { Breadcrumb } from '../../../../components';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../../../config/redux/action';

const OvertimeEntry = () => {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '',
        overtime_date: '',
        hours: '',
        reason: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isError } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getMe());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            navigate('/login');
            return;
        }
        if (user && user.hak_akses !== 'admin') {
            navigate('/dashboard');
            return;
        }
        if (user && user.hak_akses === 'admin') {
            fetchEmployees();
        }
    }, [isError, user, navigate]);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/data_pegawai', {
                withCredentials: true
            });
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load employee list'
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.employee_id) {
            newErrors.employee_id = 'Please select a worker';
        }
        
        if (!formData.overtime_date) {
            newErrors.overtime_date = 'Date is required';
        } else {
            const selectedDate = new Date(formData.overtime_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            
            if (selectedDate > today) {
                newErrors.overtime_date = 'Date cannot be in the future';
            } else if (selectedDate < sevenDaysAgo) {
                newErrors.overtime_date = 'Date cannot be more than 7 days in the past';
            }
        }
        
        if (!formData.hours) {
            newErrors.hours = 'Overtime hours are required';
        } else {
            const hours = parseFloat(formData.hours);
            if (isNaN(hours) || hours < 1 || hours > 6) {
                newErrors.hours = 'Overtime hours must be between 1 and 6';
            }
        }
        
        if (!formData.reason) {
            newErrors.reason = 'Reason is required';
        } else if (formData.reason.trim().length < 10) {
            newErrors.reason = 'Reason must be at least 10 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fix the form errors'
            });
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await axios.post('http://localhost:5000/overtime', formData, {
                withCredentials: true
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message,
                timer: 2000
            });
            
            setFormData({
                employee_id: '',
                overtime_date: '',
                hours: '',
                reason: ''
            });
            setErrors({});
            
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit overtime';
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const getMaxDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <Layout>
            <Breadcrumb pageName='Overtime Entry' />
            
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Log Overtime Hours</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Worker *
                            </label>
                            <select
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    errors.employee_id ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">-- Select Worker --</option>
                                {employees.map(emp => (
                                    <option key={emp.id_pegawai} value={emp.id_pegawai}>
                                        {emp.nama_pegawai} - {emp.jabatan || 'N/A'}
                                    </option>
                                ))}
                            </select>
                            {errors.employee_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.employee_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="overtime_date"
                                value={formData.overtime_date}
                                onChange={handleChange}
                                max={getMaxDate()}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    errors.overtime_date ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {errors.overtime_date && (
                                <p className="text-red-500 text-sm mt-1">{errors.overtime_date}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Overtime Hours (1-6 hours) *
                            </label>
                            <input
                                type="number"
                                name="hours"
                                value={formData.hours}
                                onChange={handleChange}
                                min="1"
                                max="6"
                                step="0.5"
                                placeholder="Enter hours (e.g., 2.5)"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    errors.hours ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {errors.hours && (
                                <p className="text-red-500 text-sm mt-1">{errors.hours}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason (minimum 10 characters) *
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter reason for overtime work..."
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    errors.reason ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            ></textarea>
                            {errors.reason && (
                                <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {formData.reason.length} / 10 characters minimum
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Submitting...' : 'Submit Overtime Entry'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default OvertimeEntry;