import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import DataPegawai from './DataPegawaiModel.js';

const { DataTypes } = Sequelize;

const Overtime = db.define('overtime_entries', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'data_pegawai',
            key: 'id_pegawai'
        }
    },
    overtime_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hours: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        validate: {
            min: 1,
            max: 6
        }
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    created_by: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'overtime_date']
        }
    ]
});

// Define association
Overtime.belongsTo(DataPegawai, {
    foreignKey: 'employee_id',
    as: 'employee'
});

export default Overtime;