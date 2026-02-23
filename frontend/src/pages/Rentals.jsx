import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Plus, RefreshCw, Printer, User, HardHat, DollarSign, History, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

const Rentals = () => {
    const [rentals, setRentals] = useState([]);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);
    const [printData, setPrintData] = useState(null); // { rental, invoice, balanceAtTime }
    const [paymentData, setPaymentData] = useState({ amount: '', method: 'Cash' });
    const [formData, setFormData] = useState({
        customerName: '',
        machineId: '',
        startDate: new Date().toISOString().split('T')[0],
        monthlyRate: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
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

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/rentals/${selectedRental._id}/payment`, paymentData);
            setShowPaymentModal(false);
            setPaymentData({ amount: '', method: 'Cash' });
            fetchData();
            alert('Payment recorded successfully');
        } catch (err) {
            console.error('Error recording payment:', err);
            alert(err.response?.data?.message || 'Error recording payment. Please check your connection.');
        }
    };

    const calculateBalance = (rental) => {
        const totalBilled = rental.invoices.reduce((acc, inv) => acc + inv.amount, 0);
        const balance = totalBilled - (rental.totalPaid || 0);
        return { totalBilled, balance };
    };

    const handlePrintInvoice = (rental, invoice) => {
        // Calculate balance *at the time of this invoice*
        const billingUpToNow = rental.invoices
            .filter(inv => new Date(inv.invoiceDate) <= new Date(invoice.invoiceDate))
            .reduce((acc, inv) => acc + inv.amount, 0);

        const paymentsUpToNow = (rental.payments || [])
            .filter(pay => new Date(pay.paymentDate) <= new Date(invoice.invoiceDate))
            .reduce((acc, pay) => acc + pay.amount, 0);

        const balanceAtTime = billingUpToNow - paymentsUpToNow;

        setPrintData({
            rental,
            invoice,
            balanceAtTime,
            billingUpToNow,
            paymentsUpToNow
        });

        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div className="space-y-6">
            {/* Printable Invoice Component (Hidden on Screen) */}
            {printData && (
                <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-4 border-slate-900 pb-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200">
                                <img src="/logo.jpeg" alt="SE" className="w-full h-full object-cover invert" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">SHAN ENTERPRISES</h1>
                                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tight">Kimbulapitiya, Tel: 0777-914930 / 076-7015159</p>
                                <p className="text-[8px] font-bold text-slate-600 uppercase">E-Mail: shanenterprises71@gmail.com</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest mb-1">RENTAL BILL</div>
                            <p className="text-[8px] font-black text-slate-900 uppercase">Reg. No: W.4086</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Customer / Party</p>
                            <p className="text-base font-black text-slate-900 uppercase">{printData.rental.customerName}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Machine: {printData.rental.machine?.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-900 uppercase"><span className="text-slate-400">Bill Date:</span> {new Date(printData.invoice.invoiceDate).toLocaleDateString('en-GB')}</p>
                                <p className="text-[10px] font-black text-slate-900 uppercase"><span className="text-slate-400">Contract Start:</span> {new Date(printData.rental.startDate).toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <table className="w-full mb-10 border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-y-2 border-slate-900">
                                <th className="py-3 px-2 text-left text-[9px] font-black text-slate-900 uppercase tracking-widest">Billing Period</th>
                                <th className="py-3 px-2 text-right text-[9px] font-black text-slate-900 uppercase tracking-widest">Rate (LKR)</th>
                                <th className="py-3 px-2 text-right text-[9px] font-black text-slate-900 uppercase tracking-widest">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-6 px-2 text-sm font-black text-slate-800 uppercase">
                                    Machine Rental - {new Date(printData.invoice.invoiceDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                                </td>
                                <td className="py-6 px-2 text-right text-sm font-medium text-slate-600">{printData.rental.monthlyRate.toLocaleString()}</td>
                                <td className="py-6 px-2 text-right text-sm font-black text-slate-900 italic">{printData.invoice.amount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-900">
                                <td colSpan="2" className="py-4 text-right font-black text-slate-900 text-[10px] uppercase tracking-widest px-4">Total for this Month</td>
                                <td className="py-4 text-right font-black text-slate-900 text-base italic">LKR {printData.invoice.amount.toLocaleString()}</td>
                            </tr>
                            <tr className="bg-slate-50">
                                <td colSpan="2" className="py-2 text-right font-bold text-slate-400 text-[9px] uppercase tracking-widest px-4">Previous Arrears (up to this date)</td>
                                <td className="py-2 text-right font-black text-slate-900 text-xs italic">LKR {(printData.balanceAtTime - printData.invoice.amount).toLocaleString()}</td>
                            </tr>
                            <tr className="border-t border-slate-200">
                                <td colSpan="2" className="py-4 text-right font-black text-rose-600 text-[11px] uppercase tracking-widest px-4 italic">Grand Total Balance Due</td>
                                <td className="py-4 text-right font-black text-rose-600 text-xl tracking-tighter italic border-b-4 border-rose-600 inline-block w-full">LKR {printData.balanceAtTime.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer */}
                    <div className="grid grid-cols-3 gap-8 mt-16 mb-8 pt-8 border-t border-slate-100">
                        <div className="flex flex-col items-center">
                            <div className="w-full border-t border-dashed border-slate-400 mb-2"></div>
                            <p className="text-[8px] font-black text-slate-900 uppercase">Prepared By</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-full border-t border-dashed border-slate-400 mb-2"></div>
                            <p className="text-[8px] font-black text-slate-900 uppercase">Approved By</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase leading-tight italic">Thank you for your business. Please settle outstanding balances within 7 days.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Rental Hub</h1>
                        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Automated billing & accumulation tracking</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 font-bold text-xs uppercase tracking-widest"
                    >
                        <Plus size={16} strokeWidth={3} />
                        New Rental Contract
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : rentals.length === 0 ? (
                        <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
                            <Calendar className="mx-auto text-slate-300 mb-4" size={40} />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active rental contracts found</p>
                        </div>
                    ) : rentals.map(rental => {
                        const { totalBilled, balance } = calculateBalance(rental);
                        return (
                            <div key={rental._id} className="group bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden hover:border-slate-300 transition-all">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                                <HardHat size={16} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">{rental.machine?.name}</h3>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 ml-0.5">
                                            <User size={12} strokeWidth={3} /> {rental.customerName}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border ${rental.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                        {rental.status}
                                    </span>
                                </div>

                                <div className="px-6 py-5 bg-slate-50/50 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Billed</p>
                                            <p className="text-sm font-black text-slate-900 tracking-tighter italic">LKR {totalBilled.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Paid</p>
                                            <p className="text-sm font-black text-emerald-600 tracking-tighter italic">LKR {(rental.totalPaid || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Balance Due</p>
                                            <p className={`text-xl font-black tracking-tighter italic ${balance > 0 ? 'text-rose-600 underline decoration-rose-200 decoration-4' : 'text-emerald-500'}`}>
                                                LKR {balance.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Monthly</p>
                                            <p className="text-xs font-black text-slate-600">LKR {rental.monthlyRate?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedRental(rental);
                                            setShowHistoryModal(true);
                                        }}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <History size={14} />
                                        History
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedRental(rental);
                                            setShowPaymentModal(true);
                                        }}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-xl hover:bg-slate-800 transition text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200"
                                    >
                                        <DollarSign size={14} />
                                        Pay Now
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* New Rental Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900 text-white rounded-xl"><Plus size={20} /></div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Rental</h3>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors bg-white w-8 h-8 rounded-full shadow-sm flex items-center justify-center">✕</button>
                            </div>
                            <form onSubmit={handleCreate} className="p-8 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Customer / Company Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition text-sm font-bold"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        placeholder="Enter customer name..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign Machine</label>
                                    <select
                                        required
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition text-sm font-bold appearance-none"
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
                                        <option value="">Choose designated asset...</option>
                                        {machines.map(m => (
                                            <option key={m._id} value={m._id}>{m.name} (LKR {m.rentalPricePerMonth?.toLocaleString()})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Activation Date</label>
                                        <input
                                            type="date" required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition text-sm font-bold"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Monthly Rate</label>
                                        <input
                                            type="number" required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition text-sm font-bold"
                                            value={formData.monthlyRate}
                                            onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-black text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 mt-4"
                                >
                                    Initiate Contract
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && selectedRental && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Receive Payment</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">For {selectedRental.customerName}</p>
                            </div>
                            <form onSubmit={handleRecordPayment} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Amount (LKR)</label>
                                    <input
                                        type="number" required min="1"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition text-lg font-black italic tracking-tighter"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Cash', 'Bank Transfer'].map(method => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setPaymentData({ ...paymentData, method })}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${paymentData.method === method ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">Record Payment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* History Modal */}
                {showHistoryModal && selectedRental && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                            <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Billing & Payment Hub</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Audit trail: {selectedRental.customerName}</p>
                                </div>
                                <button onClick={() => setShowHistoryModal(false)} className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">
                                        <Clock size={14} /> Monthly Bill Accumulation
                                    </h4>
                                    <div className="space-y-3">
                                        {[...selectedRental.invoices].reverse().map((inv, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none">Rental - {new Date(inv.invoiceDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{new Date(inv.invoiceDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-sm font-black text-slate-900 italic tracking-tighter">LKR {inv.amount.toLocaleString()}</p>
                                                    <button
                                                        onClick={() => handlePrintInvoice(selectedRental, inv)}
                                                        className="p-2 bg-white text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-200 group/print"
                                                        title="Print Monthly Bill"
                                                    >
                                                        <Printer size={14} className="group-hover/print:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">
                                        <CheckCircle2 size={14} /> Payment History
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedRental.payments?.length > 0 ? (
                                            [...selectedRental.payments].reverse().map((pay, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm">
                                                            <DollarSign size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-emerald-900 leading-none">Received via {pay.method}</p>
                                                            <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-tighter mt-1">{new Date(pay.paymentDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-black text-emerald-600 italic tracking-tighter">+ LKR {pay.amount.toLocaleString()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No payments recorded yet</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="p-10 border-t border-slate-100 bg-slate-900 text-white flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Total Outstanding Balance</p>
                                    <p className="text-3xl font-black italic tracking-tighter">LKR {calculateBalance(selectedRental).balance.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowHistoryModal(false);
                                        setShowPaymentModal(true);
                                    }}
                                    className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                                >
                                    Record New Payment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rentals;
