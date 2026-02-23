import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    History,
    Search,
    Eye,
    Calendar,
    User,
    DollarSign,
    ArrowUpRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    Trash2
} from 'lucide-react';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/sales');
            setSales(data);
        } catch (err) {
            console.error('Error fetching sales history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            try {
                await api.delete(`/sales/${id}`);
                setSales(sales.filter(s => s._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting transaction');
            }
        }
    };

    const filteredSales = sales.filter(sale =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Partial': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Due': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <History className="text-slate-900" size={28} />
                        Sales Ledger
                    </h1>
                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mt-1">Audit trail of all transactions</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer or invoice..."
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-black">Due</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredSales.map((sale) => (
                                <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white transition-colors">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 tracking-tight">
                                                    {new Date(sale.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">#{sale._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 font-black text-[10px]">
                                                {sale.customerName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 tracking-tight">{sale.customerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                                            {sale.items.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-black text-slate-400">LKR</span>
                                            <span className="text-sm font-black text-slate-900 italic tracking-tighter">{sale.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-xs font-black tracking-tighter ${sale.dueAmount > 0 ? 'text-rose-500 italic' : 'text-slate-300'}`}>
                                            {sale.dueAmount > 0 ? `LKR ${sale.dueAmount.toLocaleString()}` : '--'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(sale.paymentStatus)}`}>
                                            {sale.paymentStatus === 'Paid' && <CheckCircle2 size={10} />}
                                            {sale.paymentStatus === 'Partial' && <Clock size={10} />}
                                            {sale.paymentStatus === 'Due' && <AlertCircle size={10} />}
                                            {sale.paymentStatus}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => window.location.href = `/sales?id=${sale._id}`}
                                            className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-md transition-all active:scale-95"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sale._id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-xl hover:border-rose-100 hover:shadow-md transition-all active:scale-95"
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                                                <History className="text-slate-300" size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;
