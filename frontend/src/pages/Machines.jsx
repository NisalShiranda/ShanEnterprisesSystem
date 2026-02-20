import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

const Machines = () => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        rentalPricePerMonth: '',
        stock: '',
        description: ''
    });

    const fetchMachines = async () => {
        try {
            const { data } = await api.get('/machines');
            setMachines(data);
        } catch (err) {
            console.error('Error fetching machines:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/machines', formData);
            setShowModal(false);
            setFormData({ name: '', category: '', price: '', rentalPricePerMonth: '', stock: '', description: '' });
            fetchMachines();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating machine');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this machine?')) {
            try {
                await api.delete(`/machines/${id}`);
                fetchMachines();
            } catch (err) {
                alert('Error deleting machine');
            }
        }
    };

    const filteredMachines = machines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Machines</h1>
                    <p className="text-slate-500">Manage your heavy machinery inventory</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition shadow-md"
                >
                    <Plus size={20} />
                    Add Machine
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or category..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
                            <tr>
                                <th className="px-6 py-4">Machine Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-center">Stock</th>
                                <th className="px-6 py-4">Sales Price</th>
                                <th className="px-6 py-4">Rental/mo</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-slate-500">Loading machines...</td>
                                </tr>
                            ) : filteredMachines.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-slate-500">No machines found</td>
                                </tr>
                            ) : filteredMachines.map((machine) => (
                                <tr key={machine._id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-800">{machine.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                                            {machine.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-bold ${machine.stock < 3 ? 'text-red-500' : 'text-slate-700'}`}>
                                            {machine.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">LKR {machine.price?.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium text-slate-700">LKR {machine.rentalPricePerMonth?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-primary transition"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(machine._id)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Add New Machine</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Machine Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sales Price</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Rental/mo</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.rentalPricePerMonth}
                                        onChange={(e) => setFormData({ ...formData, rentalPricePerMonth: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary h-24"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-bold"
                                >
                                    Save Machine
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Machines;
