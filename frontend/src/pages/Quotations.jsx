import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    FileText,
    Plus,
    Minus,
    Trash2,
    Printer,
    Search,
    ArrowLeft,
    FilePlus,
    History,
    Calendar,
    User,
    ChevronDown,
    ChevronUp,
    Package,
    HardHat,
    CirclePlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Quotations = () => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'create' or 'success'
    const [searchTerm, setSearchTerm] = useState('');
    const [successQuotation, setSuccessQuotation] = useState(null);

    // Creation State
    const [customerName, setCustomerName] = useState('');
    const [cart, setCart] = useState([]);
    const [parts, setParts] = useState([]);
    const [machines, setMachines] = useState([]);
    const [inventorySearch, setInventorySearch] = useState('');
    const [activeInventoryTab, setActiveInventoryTab] = useState('machines');
    const [customers, setCustomers] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [customItem, setCustomItem] = useState({ name: '', description: '', price: '', quantity: 1 });
    const [printMode, setPrintMode] = useState(false);

    useEffect(() => {
        fetchQuotations();
        fetchInventory();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/quotations');
            setQuotations(data);
        } catch (err) {
            console.error('Error fetching quotations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const [partsRes, machinesRes, customersRes] = await Promise.all([
                api.get('/parts'),
                api.get('/machines'),
                api.get('/customers')
            ]);
            setParts(partsRes.data);
            setMachines(machinesRes.data);
            setCustomers(customersRes.data);
        } catch (err) {
            console.error('Error fetching inventory/customers:', err);
        }
    };

    const addToCart = (item, type) => {
        const existing = cart.find(i => i.id === item._id);
        if (existing) {
            setCart(cart.map(i =>
                i.id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            ));
        } else {
            setCart([...cart, {
                id: item._id,
                name: item.name,
                description: item.description || '',
                price: item.price,
                quantity: 1,
                type: type
            }]);
        }
    };

    const addCustomItemToCart = () => {
        if (!customItem.name || !customItem.price) return alert('Please enter name and price');
        setCart([...cart, {
            id: 'custom-' + Date.now(),
            name: customItem.name,
            description: customItem.description,
            price: Number(customItem.price),
            quantity: Number(customItem.quantity),
            type: 'custom'
        }]);
        setCustomItem({ name: '', description: '', price: '', quantity: 1 });
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty > 0) return { ...item, quantity: newQty };
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
        if (cart.length === 0) return alert('Quotation is empty');
        if (!customerName) return alert('Customer name is required');

        try {
            const quotationData = {
                customerName,
                items: cart.map(i => ({
                    part: i.type === 'part' ? i.id : null,
                    machine: i.type === 'machine' ? i.id : null,
                    name: i.name,
                    description: i.description,
                    price: i.price,
                    quantity: i.quantity
                }))
            };

            const { data } = await api.post('/quotations', quotationData);
            setSuccessQuotation(data);
            setView('success');
            setCart([]);
            setCustomerName('');
            fetchQuotations();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating quotation');
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        const date = new Date(successQuotation.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
        const fileName = `Quotation_${successQuotation.quotationNumber}_${date}_${successQuotation.customerName}`;

        document.title = fileName;
        setPrintMode(true);

        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.title = originalTitle;
            }, 1000);
        }, 100);
    };

    const filteredInventory = (activeInventoryTab === 'parts' ? parts : machines).filter(i =>
        i.name.toLowerCase().includes(inventorySearch.toLowerCase())
    );

    const filteredQuotations = quotations.filter(q =>
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === 'success' && successQuotation) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Quotation Generated</h2>
                            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Safe and Ready for Download</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setView('list')}
                            className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors mr-2"
                        >
                            <ArrowLeft size={16} />
                            Back to List
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            <Printer size={16} />
                            Print/Download PDF
                        </button>
                    </div>
                </div>

                {/* Quotation Preview */}
                <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 print:shadow-none print:border-none print:p-10 relative overflow-hidden">
                    <div className="flex items-start justify-between mb-10 border-b-2 border-slate-100 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm">
                                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-full" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-[#0f172a] tracking-tighter">SHAN ENTERPRISES</h1>
                                <div className="mt-2 space-y-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    <p>No.170-C/10/B, Galmankadawatta, Kimbulapitiya.</p>
                                    <p>Tel: 0777-914930 / 076-7015159</p>
                                    <p>E-Mail: shanenterprises71@gmail.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-3">
                            <div className="bg-[#0f172a] text-white px-6 py-4 rounded-2xl flex flex-col items-center justify-center min-w-[160px]">
                                <span className="text-xs font-black tracking-[0.2em] uppercase">QUOTATION</span>
                            </div>
                            <div className="bg-[#f8fafc] px-4 py-2 rounded-lg border border-slate-100">
                                <p className="text-[11px] font-black text-[#0f172a] tracking-widest uppercase">REG. NO: W.4086</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 mb-8">
                        <div>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Customer / Party</p>
                            <p className="text-lg font-black text-slate-900">{successQuotation.customerName}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                                <span className="text-[9px] text-slate-400 font-black uppercase">QO NO :</span>
                                <span className="text-xs font-black text-slate-900">{successQuotation.quotationNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                                <span className="text-[9px] text-slate-400 font-black uppercase">DATE :</span>
                                <span className="text-xs font-black text-slate-900">{new Date(successQuotation.date).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>
                    </div>

                    <table className="w-full mb-10">
                        <thead>
                            <tr className="bg-slate-50 border-y-2 border-slate-900">
                                <th className="py-3 px-2 text-left text-[9px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-200">Item Name</th>
                                <th className="py-3 px-2 text-left text-[9px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-200">Description</th>
                                <th className="py-3 px-2 text-center text-[9px] font-black text-slate-900 uppercase tracking-widest">Qty</th>
                                <th className="py-3 px-2 text-right text-[9px] font-black text-slate-900 uppercase tracking-widest">Rate (LKR)</th>
                                <th className="py-3 px-2 text-right text-[9px] font-black text-slate-900 uppercase tracking-widest">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {successQuotation.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100">
                                    <td className="py-4 px-2 text-sm font-black text-slate-800 uppercase tracking-tight border-r border-slate-100">{item.name}</td>
                                    <td className="py-4 px-2 text-xs font-bold text-slate-500 italic border-r border-slate-100">{item.description || 'N/A'}</td>
                                    <td className="py-4 px-2 text-center text-sm font-black text-slate-900">{item.quantity}</td>
                                    <td className="py-4 px-2 text-right text-sm font-medium text-slate-600">{item.price.toLocaleString()}</td>
                                    <td className="py-4 px-2 text-right text-sm font-black text-slate-900">{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-900">
                                <td colSpan="3" className="py-5 text-right font-black text-slate-900 text-[10px] uppercase tracking-widest px-4">Estimated Total</td>
                                <td className="py-5 text-right font-black text-slate-900 text-xl tracking-tighter italic">LKR {successQuotation.totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

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
                            <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Customer Approval</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                {/* Catalog & Custom Entry */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-colors">
                            <ArrowLeft size={16} /> Back to History
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Quotation</h1>
                    </div>

                    {/* Custom Item Form */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CirclePlus size={18} className="text-indigo-500" />
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Add Custom Item / Service</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text" placeholder="Item Name (e.g. Site Visit)"
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-300 text-sm font-bold uppercase transition-all"
                                value={customItem.name}
                                onChange={e => setCustomItem({ ...customItem, name: e.target.value })}
                            />
                            <input
                                type="number" placeholder="Price (LKR)"
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-300 text-sm font-bold transition-all"
                                value={customItem.price}
                                onChange={e => setCustomItem({ ...customItem, price: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Description (Optional)"
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-300 text-sm font-bold transition-all"
                                value={customItem.description}
                                onChange={e => setCustomItem({ ...customItem, description: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number" placeholder="Qty"
                                    className="w-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-300 text-sm font-bold transition-all"
                                    value={customItem.quantity}
                                    onChange={e => setCustomItem({ ...customItem, quantity: e.target.value })}
                                />
                                <button
                                    onClick={addCustomItemToCart}
                                    className="flex-1 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    Add Custom Item
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                <button
                                    onClick={() => setActiveInventoryTab('machines')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeInventoryTab === 'machines' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <HardHat size={14} /> Machines
                                </button>
                                <button
                                    onClick={() => setActiveInventoryTab('parts')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeInventoryTab === 'parts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Package size={14} /> Parts
                                </button>
                            </div>
                            <div className="relative group min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text" placeholder="Search inventory..."
                                    className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-slate-50 transition-all shadow-sm"
                                    value={inventorySearch}
                                    onChange={e => setInventorySearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin">
                            {filteredInventory.map(item => (
                                <div
                                    key={item._id}
                                    className="group bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => addToCart(item, activeInventoryTab === 'parts' ? 'part' : 'machine')}
                                >
                                    <div>
                                        <p className="font-black text-slate-900 tracking-tight uppercase">{item.name}</p>
                                        <p className="text-slate-900 font-black mt-2 text-sm italic">LKR {item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus size={20} strokeWidth={3} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart / Quotation Panel */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl h-fit sticky top-24">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8">Quotation List</h2>

                    {cart.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                            <FilePlus size={32} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Add items to proceed</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="text-xs font-black text-slate-900 uppercase leading-tight">{item.name}</p>
                                            <button type="button" onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-1">
                                                <button type="button" onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400 hover:text-black"><Minus size={12} strokeWidth={3} /></button>
                                                <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQty(item.id, 1)} className="p-1 text-slate-400 hover:text-black"><Plus size={12} strokeWidth={3} /></button>
                                            </div>
                                            <span className="text-xs font-black text-slate-900 italic">LKR {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Customer Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-300 transition-all text-xs font-bold uppercase"
                                        value={customerName}
                                        onChange={e => {
                                            setCustomerName(e.target.value);
                                            setShowCustomerDropdown(true);
                                        }}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                        placeholder="Enter customer or company..."
                                    />
                                    {showCustomerDropdown && (
                                        <div className="absolute z-30 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                            {customers
                                                .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
                                                .map(customer => (
                                                    <div
                                                        key={customer._id}
                                                        className="px-5 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 text-xs font-black text-slate-800 uppercase"
                                                        onClick={() => setCustomerName(customer.name)}
                                                    >
                                                        {customer.name}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Estimate</span>
                                    <span className="text-2xl font-black text-slate-900 border-b-4 border-slate-900 tracking-tighter italic">LKR {total.toLocaleString()}</span>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all"
                                >
                                    Generate & Complete
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <FileText size={28} /> Quotation Management
                    </h1>
                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mt-1">Estimates and Professional Proposals</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group min-w-[250px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                        <input
                            type="text" placeholder="Search quotations..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setView('create')}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} strokeWidth={3} /> New Quotation
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / ID</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Value</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredQuotations.map((q) => (
                                <tr key={q._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 tracking-tight">
                                                    {new Date(q.date).toLocaleDateString('en-GB')}
                                                </p>
                                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{q.quotationNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{q.customerName}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                                            {q.items.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1 font-black text-slate-900 italic tracking-tighter">
                                            <span className="text-[10px] text-slate-400">LKR</span>
                                            {q.totalAmount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSuccessQuotation(q);
                                                setView('success');
                                            }}
                                            className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-all"
                                        >
                                            <Printer size={18} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Delete this quotation?')) {
                                                    await api.delete(`/quotations/${q._id}`);
                                                    fetchQuotations();
                                                }
                                            }}
                                            className="p-2 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-xl hover:border-rose-100 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredQuotations.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-sm font-bold text-slate-400 uppercase tracking-widest italic">
                                        No quotations found
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

export default Quotations;
