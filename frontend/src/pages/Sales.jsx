import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle, Package, HardHat, Search } from 'lucide-react';

const Sales = () => {
    const [parts, setParts] = useState([]);
    const [machines, setMachines] = useState([]);
    const [activeTab, setActiveTab] = useState('parts'); // 'parts' or 'machines'
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [dueAmount, setDueAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partsRes, machinesRes] = await Promise.all([
                    api.get('/parts'),
                    api.get('/machines')
                ]);
                setParts(partsRes.data);
                setMachines(machinesRes.data);
            } catch (err) {
                console.error('Error fetching inventory:', err);
            }
        };
        fetchData();
    }, []);

    const addToCart = (item, type) => {
        const existing = cart.find(i => i.id === item._id);
        if (existing) {
            if (existing.quantity >= item.stock) return alert('Out of stock');
            setCart(cart.map(i =>
                i.id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            ));
        } else {
            setCart([...cart, {
                id: item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                maxStock: item.stock,
                type: type
            }]);
        }
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty > 0 && newQty <= item.maxStock) {
                    return { ...item, quantity: newQty };
                }
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Cart is empty');

        setLoading(true);
        try {
            const { data } = await api.post('/sales', {
                customerName,
                items: cart.map(i => ({
                    part: i.type === 'part' ? i.id : null,
                    machine: i.type === 'machine' ? i.id : null,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity
                })),
                dueAmount
            });
            setSuccess(data);
            setCart([]);
            setCustomerName('');
            setDueAmount(0);
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing sale');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 print:shadow-none print:border-none print:p-0">
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-widest">
                        <CheckCircle size={20} />
                        Transaction Completed
                    </div>
                    <button
                        onClick={() => setSuccess(null)}
                        className="text-slate-400 hover:text-black font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                        + New Entry
                    </button>
                </div>

                <div className="text-center mb-10">
                    <img src="/logo.jpeg" alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">SHAN ENTERPRISES</h1>
                    <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black mt-1">Official Sales Invoice</p>
                    <div className="mt-6 flex justify-between border-y border-slate-50 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                        <span>Date: {new Date(success.createdAt).toLocaleDateString()}</span>
                        <span>Invoice: #{success._id.slice(-6).toUpperCase()}</span>
                    </div>
                </div>

                <div className="mb-8 px-2">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Customer / Consignee</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{success.customerName}</p>
                </div>

                <table className="w-full mb-10">
                    <thead>
                        <tr className="border-b border-slate-900">
                            <th className="py-4 text-left text-[10px] font-black text-slate-900 uppercase tracking-widest">Description</th>
                            <th className="py-4 text-center text-[10px] font-black text-slate-900 uppercase tracking-widest">Qty</th>
                            <th className="py-4 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">Unit Price</th>
                            <th className="py-4 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {success.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-4 text-sm font-bold text-slate-800 tracking-tight">{item.name}</td>
                                <td className="py-4 text-center text-sm font-medium text-slate-600">{item.quantity}</td>
                                <td className="py-4 text-right text-sm font-medium text-slate-600">{item.price.toLocaleString()}</td>
                                <td className="py-4 text-right text-sm font-black text-slate-900">{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-900">
                            <td colSpan="3" className="py-5 text-right font-black text-slate-900 text-xs uppercase tracking-widest">Grand Total</td>
                            <td className="py-5 text-right font-black text-slate-900 text-xl tracking-tighter italic">LKR {success.totalAmount.toLocaleString()}</td>
                        </tr>
                        {success.dueAmount > 0 && (
                            <tr>
                                <td colSpan="3" className="py-1 text-right font-bold text-rose-500 text-[10px] uppercase tracking-widest">Total Due</td>
                                <td className="py-1 text-right font-black text-rose-600 text-sm tracking-tight italic">LKR {success.dueAmount.toLocaleString()}</td>
                            </tr>
                        )}
                    </tfoot>
                </table>

                <div className="grid grid-cols-2 gap-12 mt-16 mb-12 items-end px-4">
                    <div className="border-t-2 border-slate-900 pt-3 text-center">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Client Acknowledgement</p>
                    </div>
                    <div className="border-t-2 border-slate-900 pt-3 text-center">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Authorized Signature</p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] hidden print:block">
                    Valid for 30 days. Software provided by Shan Enterprises Systems.
                </div>

                <button
                    onClick={handlePrint}
                    className="w-full py-4 bg-black text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all print:hidden font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
                >
                    <Printer size={18} />
                    Print Invoice & Gate Pass
                </button>
            </div>
        );
    }

    const filteredItems = (activeTab === 'parts' ? parts : machines).filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Catalog Section */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Transaction</h1>
                        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Select assets to generate a bill</p>
                    </div>

                    {/* Catalog Toggles */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setActiveTab('parts')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'parts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Package size={14} />
                            Parts
                        </button>
                        <button
                            onClick={() => setActiveTab('machines')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'machines' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <HardHat size={14} />
                            Machines
                        </button>
                    </div>
                </div>

                {/* Sub-Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'parts' ? 'spare parts' : 'heavy machinery'}...`}
                        className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-slate-50 focus:border-slate-200 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {filteredItems.map(item => (
                        <div
                            key={item._id}
                            className="group bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                            onClick={() => addToCart(item, activeTab === 'parts' ? 'part' : 'machine')}
                        >
                            <div className="relative z-10">
                                <p className="font-black text-slate-900 tracking-tight">{item.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.stock < 5 ? 'text-rose-500' : 'text-emerald-500'}`}>Stock: {item.stock}</span>
                                </div>
                                <p className="text-slate-900 font-black mt-3 text-sm italic border-l-4 border-slate-900 pl-3">LKR {item.price.toLocaleString()}</p>
                            </div>
                            <button className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-90 transition-all transform">
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 font-bold text-slate-400 text-sm uppercase tracking-widest">
                            No {activeTab} available matching search
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Section */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl h-fit sticky top-24">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ShoppingCart size={18} className="text-slate-900" />
                        Quick Bill
                    </h2>
                    <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">{cart.length}</span>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <ShoppingCart size={20} className="text-slate-300" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cart is empty</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {cart.map(item => (
                                <div key={item.id} className="flex flex-col bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-slate-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-slate-900 leading-tight uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-widest uppercase">{item.type}s</p>
                                        </div>
                                        <button type="button" onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                                            <button type="button" onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400 hover:text-black transition-colors"><Minus size={12} strokeWidth={3} /></button>
                                            <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                                            <button type="button" onClick={() => updateQty(item.id, 1)} className="p-1 text-slate-400 hover:text-black transition-colors"><Plus size={12} strokeWidth={3} /></button>
                                        </div>
                                        <span className="text-xs font-black text-slate-900 tracking-tight italic">LKR {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Customer / Party Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all text-xs font-bold"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Full name or company..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-rose-500">Credit / Due Amount</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-rose-50 focus:border-rose-100 transition-all text-xs font-bold text-rose-600"
                                    value={dueAmount}
                                    onChange={(e) => setDueAmount(Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="pt-4 flex flex-col items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Grand Total (payable)</span>
                                <span className="text-2xl font-black text-slate-900 border-b-4 border-slate-900 tracking-tighter italic">LKR {total.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                            >
                                {loading ? 'Processing Order...' : 'Confirm & Finalize Bill'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Sales;
