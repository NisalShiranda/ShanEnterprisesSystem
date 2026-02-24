import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle, Package, HardHat, Search, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Sales = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [parts, setParts] = useState([]);
    const [machines, setMachines] = useState([]);
    const [activeTab, setActiveTab] = useState('machines'); // 'machines' or 'parts'
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [paidAmount, setPaidAmount] = useState(0);
    const [isManualPaid, setIsManualPaid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [printMode, setPrintMode] = useState('invoice'); // 'invoice' or 'gatepass'
    const [customers, setCustomers] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partsRes, machinesRes] = await Promise.all([
                    api.get('/parts'),
                    api.get('/machines')
                ]);
                setParts(partsRes.data);
                setMachines(machinesRes.data);

                const customersRes = await api.get('/customers');
                setCustomers(customersRes.data);

                // Check if we are viewing a specific sale from history
                const saleId = searchParams.get('id');
                if (saleId) {
                    try {
                        const { data } = await api.get(`/sales/${saleId}`);
                        if (!data) {
                            alert('Transaction not found. It may have been deleted.');
                            window.location.href = '/sales-history';
                            return;
                        }
                        setSuccess(data);
                    } catch (err) {
                        console.error('Error fetching sale:', err);
                        if (err.response?.status === 404) {
                            alert('Transaction not found. It may have been deleted.');
                            window.location.href = '/sales-history';
                        } else {
                            alert('Error loading transaction details.');
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching inventory:', err);
            }
        };
        fetchData();
    }, [searchParams]);

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

    // Update paidAmount whenever total changes if it's not manually edited
    useEffect(() => {
        if (!isManualPaid) {
            setPaidAmount(total);
        }
    }, [total, isManualPaid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Cart is empty');

        setLoading(true);
        try {
            const saleData = {
                customerName,
                items: cart.map(i => ({
                    part: i.type === 'part' ? i.id : null,
                    machine: i.type === 'machine' ? i.id : null,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity
                })),
                paidAmount: Number(paidAmount)
            };

            console.log('Sending Sale Data:', saleData);
            const { data } = await api.post('/sales', saleData);

            setSuccess(data);
            setCart([]);
            setCustomerName('');
            setPaidAmount(0);
            setIsManualPaid(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing sale');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (mode) => {
        setPrintMode(mode);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (success) {
        const renderDocument = (type) => {
            const isGatePass = type === 'gatepass';
            const isHiddenInPrint = printMode !== type;

            return (
                <div className={`${isHiddenInPrint ? 'print:hidden' : ''} bg-white p-10 rounded-2xl shadow-xl border border-slate-100 print:shadow-none print:border-none print:p-8 relative`}>
                    {/* Professional Header based on Physical Template */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b-4 border-slate-900 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white overflow-hidden border-4 border-slate-200 shadow-md">
                                <img src="/logo.jpeg" alt="SE" className="w-full h-full object-cover invert" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">SHAN ENTERPRISES</h1>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">No.170-C/10/B, Galmankadawatta, Kimbulapitiya.</p>
                                    <p className="text-[9px] font-bold text-slate-600">Tel: 0777-914930 / 076-7015159</p>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase">E-Mail: shanenterprises71@gmail.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-sm uppercase tracking-widest shadow-lg">
                                {isGatePass ? 'GATE PASS' : 'SALES INVOICE'}
                            </div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Reg. No: W.4086</p>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 px-2">
                        <div className="space-y-3">
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1 border-b border-slate-100 w-fit">Delivery To / Customer</p>
                                <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{success.customerName}</p>
                            </div>
                            {isGatePass && (
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1 border-b border-slate-100 w-fit">Attention</p>
                                    <p className="text-xs font-bold text-slate-400 italic">......................................................................</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-1">
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{isGatePass ? 'D.N. NO :' : 'INV NO :'}</p>
                                <p className="text-xs font-black text-slate-900 tracking-widest">#{success._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-1">
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{isGatePass ? 'D.N. DATE :' : 'DATE :'}</p>
                                <p className="text-xs font-black text-slate-900 tracking-widest">{new Date(success.createdAt).toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <table className="w-full mb-10 border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-y-2 border-slate-900">
                                {isGatePass ? (
                                    <>
                                        <th className="py-3 px-2 text-left text-[9px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-200">Style No</th>
                                        <th className="py-3 px-2 text-left text-[9px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-200">Colour</th>
                                        <th className="py-3 px-4 text-left text-[9px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-200">Description</th>
                                        <th className="py-3 px-2 text-center text-[9px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-200">Size</th>
                                        <th className="py-3 px-2 text-center text-[9px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-200">Good Qty</th>
                                        <th className="py-3 px-2 text-left text-[9px] font-black text-slate-900 uppercase tracking-widest">Remarks</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="py-3 px-2 text-left text-[9px] font-black text-slate-900 uppercase tracking-widest">Item Description</th>
                                        <th className="py-3 px-2 text-center text-[9px] font-black text-slate-900 uppercase tracking-widest">Qty</th>
                                        <th className="py-3 px-2 text-right text-[9px] font-black text-slate-900 uppercase tracking-widest">Rate (LKR)</th>
                                        <th className="py-3 px-2 text-right text-[9px] font-black text-slate-900 uppercase tracking-widest text-right">Subtotal</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {success.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100">
                                    {isGatePass ? (
                                        <>
                                            <td className="py-4 px-2 text-xs font-bold text-slate-300 border-r border-slate-100 italic">--</td>
                                            <td className="py-4 px-2 text-xs font-bold text-slate-300 border-r border-slate-100 italic">--</td>
                                            <td className="py-4 px-4 text-sm font-black text-slate-800 tracking-tight uppercase border-r border-slate-100">{item.name}</td>
                                            <td className="py-4 px-2 text-xs font-bold text-slate-300 border-r border-slate-100 italic text-center text-center">--</td>
                                            <td className="py-4 px-2 text-sm font-black text-slate-900 text-center border-r border-slate-100">{item.quantity}</td>
                                            <td className="py-4 px-2 text-xs font-bold text-slate-300 italic">..........</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-4 px-2 text-sm font-black text-slate-800 tracking-tight uppercase text-left">{item.name}</td>
                                            <td className="py-4 px-2 text-center text-sm font-black text-slate-900">{item.quantity}</td>
                                            <td className="py-4 px-2 text-right text-sm font-medium text-slate-600">{item.price.toLocaleString()}</td>
                                            <td className="py-4 px-2 text-right text-sm font-black text-slate-900 text-right">{(item.price * item.quantity).toLocaleString()}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            {isGatePass ? (
                                <tr className="border-t-2 border-slate-900">
                                    <td colSpan="4" className="py-4 text-left font-black text-slate-900 text-[10px] uppercase tracking-widest px-2">Total Good Qty Loaded</td>
                                    <td className="py-4 text-center font-black text-slate-900 text-sm italic">{success.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                    <td className="py-4 px-2 font-black text-slate-900 text-[10px] uppercase tracking-tighter">No: {success._id.slice(-4).toUpperCase()}</td>
                                </tr>
                            ) : (
                                <>
                                    <tr className="border-t-2 border-slate-900">
                                        <td colSpan="3" className="py-5 text-right font-black text-slate-900 text-[10px] uppercase tracking-widest px-4">Payable Amount</td>
                                        <td className="py-5 text-right font-black text-slate-900 text-xl tracking-tighter italic">LKR {success.totalAmount.toLocaleString()}</td>
                                    </tr>
                                    {success.dueAmount > 0 && (
                                        <tr>
                                            <td colSpan="3" className="py-1 text-right font-bold text-rose-500 text-[10px] uppercase tracking-widest px-4 italic">Outstanding Balance</td>
                                            <td className="py-1 text-right font-black text-rose-600 text-xs tracking-tight italic">LKR {success.dueAmount.toLocaleString()}</td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tfoot>
                    </table>

                    {/* Footer Section based on Physical Template */}
                    <div className="grid grid-cols-3 gap-8 mt-16 mb-8 px-4">
                        <div className="flex flex-col items-center">
                            <div className="w-full border-t border-dashed border-slate-400 mb-2"></div>
                            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Prepared By</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-full border-t border-dashed border-slate-400 mb-2"></div>
                            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Authorised By</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-full border-t border-dashed border-slate-400 mb-2"></div>
                            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Approved By</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center flex justify-between items-center px-4">
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Printed: {new Date().toLocaleString()}</p>
                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest">SYSTEM SECURED BY SHAN ENTERPRISES</p>
                    </div>
                </div>
            );
        };

        return (
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Control Panel (Screen Only) */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Billing Secured</h2>
                            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Select export format below</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/sales-history')}
                            className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors mr-2"
                        >
                            <ArrowLeft size={16} />
                            Back to History
                        </button>
                        <button
                            onClick={() => handlePrint('invoice')}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            <Printer size={16} />
                            Print Invoice
                        </button>
                        <button
                            onClick={() => handlePrint('gatepass')}
                            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <Printer size={16} />
                            Print Gate Pass
                        </button>
                        <button
                            onClick={() => {
                                setSuccess(null);
                                window.history.replaceState({}, '', '/sales');
                            }}
                            className="px-4 py-3 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            + New Entry
                        </button>
                    </div>
                </div>

                {/* Previews Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 print:hidden">Invoice Preview</p>
                        {renderDocument('invoice')}
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 print:hidden">Gate Pass Preview</p>
                        {renderDocument('gatepass')}
                    </div>
                </div>
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
                            onClick={() => setActiveTab('machines')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'machines' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <HardHat size={14} />
                            Machines
                        </button>
                        <button
                            onClick={() => setActiveTab('parts')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'parts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Package size={14} />
                            Parts
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
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Customer / Party Name</label>
                                <div className="relative">
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${showCustomerDropdown ? 'text-slate-900' : 'text-slate-300'}`} size={14} />
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all text-xs font-bold uppercase placeholder:text-slate-300"
                                        value={customerName}
                                        onChange={(e) => {
                                            setCustomerName(e.target.value);
                                            setShowCustomerDropdown(true);
                                        }}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                        placeholder="Full name or company..."
                                    />
                                </div>

                                {showCustomerDropdown && (
                                    <div className="absolute z-30 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                        {customers
                                            .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
                                            .map(customer => (
                                                <div
                                                    key={customer._id}
                                                    className="px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b last:border-0 border-slate-50"
                                                    onClick={() => {
                                                        setCustomerName(customer.name);
                                                        setShowCustomerDropdown(false);
                                                    }}
                                                >
                                                    <p className="text-xs font-black text-slate-800 uppercase">{customer.name}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{customer.phone || 'No phone'}</p>
                                                </div>
                                            ))}
                                        {customers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase())).length === 0 && customerName && (
                                            <div className="px-5 py-4 text-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">New Customer: "{customerName}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-emerald-500">Deposit / Paid Amount</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-100 transition-all text-xs font-bold text-emerald-600"
                                    value={paidAmount === '' ? '' : paidAmount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Allow only numbers and empty string
                                        if (val === '' || /^\d+$/.test(val)) {
                                            setPaidAmount(val); // Keep as string while typing
                                            setIsManualPaid(true);
                                        }
                                    }}
                                    onFocus={(e) => {
                                        // If it matches total and hasn't been manually edited yet, clear it
                                        if (Number(paidAmount) === total && !isManualPaid) {
                                            setPaidAmount('');
                                        }
                                    }}
                                    onBlur={() => {
                                        // If left empty, set back to 0
                                        if (paidAmount === '') setPaidAmount(0);
                                    }}
                                    placeholder="0.00"
                                />
                                {paidAmount < total && (
                                    <p className="mt-1 ml-1 text-[10px] font-bold text-rose-500 uppercase tracking-tight italic">
                                        Balance Due: LKR {(total - paidAmount).toLocaleString()}
                                    </p>
                                )}
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
