import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Search,
    Phone,
    Mail,
    MapPin,
    FileText,
    X,
    UserCircle
} from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    });

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleEdit = (customer) => {
        setFormData({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
            notes: customer.notes || ''
        });
        setEditingId(customer._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/customers/${editingId}`, formData);
            } else {
                await api.post('/customers', formData);
            }
            setShowModal(false);
            resetForm();
            fetchCustomers();
        } catch (err) {
            alert(err.response?.data?.message || `Error ${isEditing ? 'updating' : 'creating'} customer`);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            notes: ''
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers();
            } catch (err) {
                alert('Error deleting customer');
            }
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <Users className="text-slate-900" size={28} />
                        Client Directory
                    </h1>
                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mt-1">Manage your customer relationships</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add Client
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 font-black text-sm border border-indigo-100 group-hover:scale-110 transition-transform">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{customer.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">Client ID: #{customer._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone size={12} className="text-slate-400" />
                                                <span className="text-xs font-bold tracking-tight">{customer.phone || 'No Phone'}</span>
                                            </div>
                                            {customer.email && (
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Mail size={12} className="text-slate-400" />
                                                    <span className="text-[10px] font-medium">{customer.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-2 max-w-[200px]">
                                            <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                            <span className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                                {customer.address || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(customer)}
                                            className="p-2.5 text-slate-400 hover:text-indigo-600 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 hover:shadow-md transition-all active:scale-95"
                                            title="Edit Client"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer._id)}
                                            className="p-2.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-xl hover:border-rose-100 hover:shadow-md transition-all active:scale-95"
                                            title="Delete Client"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                                                <Users className="text-slate-300" size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No clients found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-900 border border-slate-100">
                                    <UserCircle size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                        {isEditing ? 'Modify Client' : 'Register New Client'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Please fill in the details below</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all hover:shadow-md"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name / Company</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all text-sm font-bold placeholder:text-slate-300"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter customer name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="text"
                                            className="w-full px-5 pl-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all text-sm font-bold placeholder:text-slate-300"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="07X XXX XXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="email"
                                            className="w-full px-5 pl-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all text-sm font-bold placeholder:text-slate-300"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="client@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Residential / business address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-slate-300" size={16} />
                                        <textarea
                                            rows="2"
                                            className="w-full px-5 pl-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all text-sm font-bold placeholder:text-slate-300 resize-none"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Street, City, Province"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Internal Notes</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-4 text-slate-300" size={16} />
                                        <textarea
                                            rows="2"
                                            className="w-full px-5 pl-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all text-sm font-bold placeholder:text-slate-300 resize-none"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Additional information about this client..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {isEditing ? 'Update Client Record' : 'Register Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
