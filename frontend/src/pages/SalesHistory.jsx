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
    Trash2,
    Minus,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        method: 'Cash',
        paymentDate: new Date().toISOString().split('T')[0]
    });

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

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/sales/${selectedSale._id}/payment`, paymentData);
            setShowPaymentModal(false);
            setPaymentData({
                amount: '',
                method: 'Cash',
                paymentDate: new Date().toISOString().split('T')[0]
            });
            fetchSales();
            alert('Payment recorded successfully');
        } catch (err) {
            console.error('Error recording payment:', err);
            alert(err.response?.data?.message || 'Error recording payment');
        }
    };

    const filteredSales = sales.filter(sale =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [expandedSales, setExpandedSales] = useState({});

    const toggleExpand = (id) => {
        setExpandedSales(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

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
        <>
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
                                    <React.Fragment key={sale._id}>
                                        <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => toggleExpand(sale._id)}
                                                        className="p-1 hover:bg-white rounded-md transition-all text-slate-400 hover:text-slate-900"
                                                    >
                                                        {expandedSales[sale._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
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
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-black tracking-tighter ${sale.dueAmount > 0 ? 'text-rose-500 italic' : 'text-slate-400'}`}>
                                                        LKR {Number(sale.dueAmount || 0).toLocaleString()}
                                                    </span>
                                                    {sale.dueAmount > 0 && (
                                                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">Balance</span>
                                                    )}
                                                </div>
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
                                                {sale.dueAmount > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSale(sale);
                                                            setPaymentData({ ...paymentData, amount: sale.dueAmount });
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="p-2 text-emerald-500 hover:text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all active:scale-95"
                                                        title="Record Payment"
                                                    >
                                                        <DollarSign size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(sale._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-xl hover:border-rose-100 hover:shadow-md transition-all active:scale-95"
                                                    title="Delete Transaction"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Payment History */}
                                        {expandedSales[sale._id] && (
                                            <tr>
                                                <td colSpan="7" className="px-12 py-4 bg-slate-50/80 border-y border-slate-100/50">
                                                    <div className="animate-in slide-in-from-top-2 duration-200">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment History Breakdown</h4>
                                                        </div>
                                                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                                            <table className="w-full text-left">
                                                                <thead>
                                                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                                                        <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid On</th>
                                                                        <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                                                        <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-50">
                                                                    {sale.payments?.map((payment, idx) => (
                                                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                                            <td className="px-4 py-2.5 text-[10px] font-bold text-slate-600">
                                                                                {new Date(payment.paymentDate).toLocaleDateString('en-GB', {
                                                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                                                    hour: '2-digit', minute: '2-digit'
                                                                                })}
                                                                            </td>
                                                                            <td className="px-4 py-2.5">
                                                                                <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-500 uppercase tracking-tight">
                                                                                    {payment.method}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-4 py-2.5 text-right text-[10px] font-black text-emerald-600 italic">
                                                                                LKR {payment.amount.toLocaleString()}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    {(!sale.payments || sale.payments.length === 0) && (
                                                                        <tr>
                                                                            <td colSpan="3" className="px-4 py-6 text-center text-xs font-bold text-slate-400 uppercase italic">
                                                                                No payment records found
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
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

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Record Payment</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Update balance for {selectedSale?.customerName}</p>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all"
                            >
                                <Minus size={18} strokeWidth={3} />
                            </button>
                        </div>

                        <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Payment Amount (LKR)</label>
                                <input
                                    type="number"
                                    required
                                    max={selectedSale?.dueAmount}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all text-sm font-black text-emerald-600"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                                <p className="mt-1.5 ml-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">
                                    Current Due: LKR {selectedSale?.dueAmount.toLocaleString()}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Method</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all text-xs font-bold"
                                        value={paymentData.method}
                                        onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all text-[10px] font-bold"
                                        value={paymentData.paymentDate}
                                        onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default SalesHistory;
