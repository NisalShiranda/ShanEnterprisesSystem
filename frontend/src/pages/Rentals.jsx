import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Plus, RefreshCw, Printer, User, HardHat } from 'lucide-react';

const Rentals = () => {
    const [rentals, setRentals] = useState([]);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        machineId: '',
        startDate: new Date().toISOString().split('T')[0],
        monthlyRate: ''
    });

    const fetchData = async () => {
        try {
            const [rentalRes, machineRes] = await Promise.all([
                api.get('/rentals'),
                api.get('/machines')
            ]);
            setRentals(rentalRes.data);
            setMachines(machineRes.data.filter(m => m.stock > 0));
        } catch (err) {
            console.error('Error fetching rental data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/rentals', formData);
            setShowModal(false);
            setFormData({ customerName: '', machineId: '', startDate: new Date().toISOString().split('T')[0], monthlyRate: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating rental');
        }
    };

    const handleRenew = async (id) => {
        try {
            await api.put(`/rentals/${id}/renew`);
            alert('Rental renewed successfully');
            fetchData();
        } catch (err) {
            alert('Error renewing rental');
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Rentals</h1>
                    <p className="text-slate-500">Track and manage machine rentals</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 font-bold text-xs uppercase tracking-widest"
                >
                    <Plus size={16} strokeWidth={3} />
                    New Rental
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-slate-400">Loading rentals...</div>
                ) : rentals.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-400 italic">No active rentals found</div>
                ) : rentals.map(rental => (
                    <div key={rental._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                        <div className="p-6 border-b border-slate-50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white border border-slate-100 border-b-4 border-b-slate-900 text-slate-900 rounded-xl shadow-sm">
                                    <HardHat size={20} />
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${rental.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {rental.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">{rental.machine?.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                <User size={14} />
                                {rental.customerName}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Started On:</span>
                                <span className="font-bold text-slate-700">{new Date(rental.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Next Renewal:</span>
                                <span className="font-bold text-slate-900 italic underline decoration-slate-300">{new Date(rental.nextRenewalDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Monthly Rate:</span>
                                <span className="font-bold text-slate-800">LKR {rental.monthlyRate?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-4 flex gap-2">
                            <button
                                onClick={() => handleRenew(rental._id)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm font-bold"
                            >
                                <RefreshCw size={16} />
                                Renew
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-secondary text-white rounded-lg hover:bg-slate-800 transition text-sm font-bold">
                                <Printer size={16} />
                                Invoice
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Record New Rental</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition text-sm shadow-inner"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Machine</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white"
                                    value={formData.machineId}
                                    onChange={(e) => {
                                        const machine = machines.find(m => m._id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            machineId: e.target.value,
                                            monthlyRate: machine ? machine.rentalPricePerMonth : ''
                                        });
                                    }}
                                >
                                    <option value="">Choose machine...</option>
                                    {machines.map(m => (
                                        <option key={m._id} value={m._id}>{m.name} (LKR {m.rentalPricePerMonth?.toLocaleString()}/mo)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition text-sm shadow-inner"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rate</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition text-sm shadow-inner"
                                        value={formData.monthlyRate}
                                        onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
                                >
                                    Start Rental
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rentals;
