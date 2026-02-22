import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

const Machines = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [itemType, setItemType] = useState('machine'); // Default to machine
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        rentalPricePerMonth: '',
        stock: '',
        description: ''
    });

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const [machinesRes, partsRes] = await Promise.all([
                api.get('/machines'),
                api.get('/parts')
            ]);

            const machines = machinesRes.data.map(item => ({ ...item, type: 'machine' }));
            const parts = partsRes.data.map(item => ({ ...item, type: 'part' }));

            setInventory([...machines, ...parts]);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const endpoint = itemType === 'machine' ? '/machines' : '/parts';
            await api.post(endpoint, formData);
            setShowModal(false);
            setFormData({ name: '', price: '', rentalPricePerMonth: '', stock: '', description: '' });
            fetchInventory();
        } catch (err) {
            alert(err.response?.data?.message || `Error creating ${itemType}`);
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete this ${item.type}?`)) {
            try {
                const endpoint = item.type === 'machine' ? `/machines/${item._id}` : `/parts/${item._id}`;
                await api.delete(endpoint);
                fetchInventory();
            } catch (err) {
                alert(`Error deleting ${item.type}`);
            }
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
                    <p className="text-slate-500">Manage your machines and parts inventory</p>
                </div>
                <button
                    onClick={() => {
                        setItemType('machine');
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 font-bold text-xs uppercase tracking-widest"
                >
                    <Plus size={16} strokeWidth={3} />
                    Add Inventory
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm"
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
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Stock</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Rental/mo</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-500">Loading inventory...</td>
                                </tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-500">No inventory found</td>
                                </tr>
                            ) : filteredInventory.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${item.type === 'machine' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-bold ${item.stock < (item.type === 'machine' ? 3 : 10) ? 'text-red-500' : 'text-slate-700'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">LKR {item.price?.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {item.type === 'machine' ? `LKR ${item.rentalPricePerMonth?.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-slate-400">
                                            <button className="p-2 hover:text-black transition hover:bg-slate-100 rounded-lg"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
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
                            <h3 className="text-xl font-bold text-slate-800">Add New Inventory</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Type</label>
                                    <div className="flex gap-4">
                                        {['machine', 'part'].map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={type}
                                                    checked={itemType === type}
                                                    onChange={(e) => setItemType(e.target.value)}
                                                    className="w-4 h-4 text-black border-slate-300 focus:ring-black"
                                                />
                                                <span className="text-sm font-semibold capitalize">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition text-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition text-sm"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sales Price</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition text-sm"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                {itemType === 'machine' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Rental/mo</label>
                                        <input
                                            type="number" required={itemType === 'machine'}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition text-sm"
                                            value={formData.rentalPricePerMonth}
                                            onChange={(e) => setFormData({ ...formData, rentalPricePerMonth: e.target.value })}
                                        />
                                    </div>
                                )}
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
                                    className="px-8 py-2.5 bg-black text-white rounded-xl hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
                                >
                                    Save Inventory
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
