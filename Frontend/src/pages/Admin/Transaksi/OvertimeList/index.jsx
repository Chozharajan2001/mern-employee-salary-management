import { useState, useEffect } from 'react';
import Layout from '../../../../layout';
import { Breadcrumb } from '../../../../components';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../../../config/redux/action';
import { FaCheck } from 'react-icons/fa';

const OvertimeList = () => {
    const [overtimeEntries, setOvertimeEntries] = useState([]);
    const [loading, setLoading] = useState(true);
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
            fetchOvertimeEntries();
        }
    }, [isError, user, navigate]);

    const fetchOvertimeEntries = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/overtime', {
                withCredentials: true
            });
            setOvertimeEntries(response.data.data || []);
        } catch (error) {
            console.error('Error fetching overtime:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load overtime entries'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        Swal.fire({
            title: 'Approve Overtime?',
            text: 'This will approve the overtime entry for payroll processing.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.patch(`http://localhost:5000/overtime/${id}/approve`, {}, {
                        withCredentials: true
                    });
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Approved!',
                        text: 'Overtime entry has been approved.',
                        timer: 1500
                    });
                    
                    fetchOvertimeEntries();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Failed to approve overtime'
                    });
                }
            }
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <Layout>
            <Breadcrumb pageName='Overtime Approval' />
            
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Overtime Entries</h2>
                            <button
                                onClick={() => navigate('/overtime-entry')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                + New Overtime Entry
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : overtimeEntries.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">No overtime entries found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Worker
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Position
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hours
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {overtimeEntries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {entry.employee?.nama_pegawai || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {entry.employee?.jabatan || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(entry.overtime_date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {entry.hours} hrs
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {entry.reason}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(entry.status)}`}>
                                                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {entry.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleApprove(entry.id)}
                                                        className="text-green-600 hover:text-green-900 mr-3 inline-flex items-center gap-1"
                                                    >
                                                        <FaCheck /> Approve
                                                    </button>
                                                )}
                                                {entry.status === 'approved' && (
                                                    <span className="text-green-600 inline-flex items-center gap-1">
                                                        <FaCheck /> Approved
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default OvertimeList;