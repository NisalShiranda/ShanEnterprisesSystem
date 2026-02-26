import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users as UsersIcon, Shield, ShieldAlert, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleAdmin = async (userId, currentStatus) => {
        try {
            await api.put(`/users/${userId}`, { isAdmin: !currentStatus });
            fetchUsers();
        } catch (err) {
            alert('Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to permanently remove this user?')) {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers();
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 font-outfit max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-black rounded-xl">
                            <UsersIcon className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personnel Management</h1>
                    </div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Authorized Access Control Center</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 mb-8 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-bottom border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Authority</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg uppercase transition-colors group-hover:bg-white border border-transparent group-hover:border-slate-200 shadow-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-tight mb-0.5">{user.name}</p>
                                                <p className="text-slate-400 text-xs font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${user.isAdmin
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-slate-600 border-slate-200'
                                            }`}>
                                            {user.isAdmin ? <Shield size={14} /> : <ShieldAlert size={14} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {user.isAdmin ? 'Global Administrator' : 'Standard Personnel'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                                                className={`p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 ${user.isAdmin
                                                        ? 'border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'
                                                        : 'border-black text-black hover:bg-black hover:text-white'
                                                    }`}
                                                title={user.isAdmin ? "Revoke Admin Access" : "Grant Admin Access"}
                                            >
                                                {user.isAdmin ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:scale-105 active:scale-95"
                                                title="Delete Account"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <UsersIcon className="text-slate-300" size={24} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No personnel units found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
