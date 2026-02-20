import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle } from 'lucide-react';

const Sales = () => {
    const [parts, setParts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [dueAmount, setDueAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchParts = async () => {
            const { data } = await api.get('/parts');
            setParts(data);
        };
        fetchParts();
    }, []);

    const addToCart = (part) => {
        const existing = cart.find(item => item.part === part._id);
        if (existing) {
            if (existing.quantity >= part.stock) return alert('Out of stock');
            setCart(cart.map(item =>
                item.part === part._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { part: part._id, name: part.name, price: part.price, quantity: 1, maxStock: part.stock }]);
        }
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.part === id) {
                const newQty = item.quantity + delta;
                if (newQty > 0 && newQty <= item.maxStock) {
                    return { ...item, quantity: newQty };
                }
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.part !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Cart is empty');

        setLoading(true);
        try {
            const { data } = await api.post('/sales', {
                customerName,
                items: cart,
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
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100 print:shadow-none print:border-none print:p-0">
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                        <CheckCircle size={24} />
                        Sale Successful!
                    </div>
                    <button
                        onClick={() => setSuccess(null)}
                        className="text-slate-500 hover:text-slate-700 font-medium"
                    >
                        New Sale
                    </button>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">SHAN ENTERPRISES</h1>
                    <p className="text-slate-500 uppercase tracking-widest text-sm font-bold mt-1">Sales Invoice / Gate Pass</p>
                    <div className="mt-4 border-t border-b border-slate-100 py-2 text-sm text-slate-600 flex justify-between px-4">
                        <span>Date: {new Date(success.createdAt).toLocaleString()}</span>
                        <span>Inv #: {success._id.slice(-6).toUpperCase()}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-slate-500 uppercase font-bold mb-1">Bill To:</p>
                    <p className="text-lg font-bold text-slate-800">{success.customerName}</p>
                </div>

                <table className="w-full mb-8">
                    <thead className="border-b border-slate-200">
                        <tr>
                            <th className="py-2 text-left text-slate-500 uppercase text-xs">Item</th>
                            <th className="py-2 text-center text-slate-500 uppercase text-xs">Qty</th>
                            <th className="py-2 text-right text-slate-500 uppercase text-xs">Price</th>
                            <th className="py-2 text-right text-slate-500 uppercase text-xs">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {success.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-3 text-slate-800 font-medium">{item.name}</td>
                                <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                                <td className="py-3 text-right text-slate-600">{item.price.toLocaleString()}</td>
                                <td className="py-3 text-right text-slate-800 font-bold">{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-200">
                            <td colSpan="3" className="py-4 text-right font-bold text-slate-700">SUB TOTAL</td>
                            <td className="py-4 text-right font-bold text-slate-900 text-lg">LKR {success.totalAmount.toLocaleString()}</td>
                        </tr>
                        {success.dueAmount > 0 && (
                            <tr>
                                <td colSpan="3" className="py-1 text-right font-medium text-red-500">DUE AMOUNT</td>
                                <td className="py-1 text-right font-bold text-red-600">LKR {success.dueAmount.toLocaleString()}</td>
                            </tr>
                        )}
                    </tfoot>
                </table>

                <div className="grid grid-cols-2 gap-8 mt-12 mb-8 items-end">
                    <div className="border-t border-slate-300 pt-2 text-center">
                        <p className="text-xs text-slate-500 uppercase">Customer Signature</p>
                    </div>
                    <div className="border-t border-slate-300 pt-2 text-center">
                        <p className="text-xs text-slate-500 uppercase">Authorized Signature</p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs hidden print:block">
                    Thank you for your business! This is a computer generated invoice.
                </div>

                <button
                    onClick={handlePrint}
                    className="w-full py-3 bg-secondary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition print:hidden font-bold"
                >
                    <Printer size={20} />
                    Print Invoice & Gate Pass
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">New Sale</h1>
                    <p className="text-slate-500">Select parts to generate a sales invoice</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parts.map(part => (
                        <div
                            key={part._id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition cursor-pointer"
                            onClick={() => addToCart(part)}
                        >
                            <div>
                                <p className="font-bold text-slate-800">{part.name}</p>
                                <p className="text-sm text-slate-500">{part.category} • Stock: {part.stock}</p>
                                <p className="text-primary font-bold mt-1">LKR {part.price.toLocaleString()}</p>
                            </div>
                            <button
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-fit sticky top-24">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <ShoppingCart size={24} className="text-primary" />
                    Shopping Cart
                </h2>

                {cart.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 italic">
                        Cart is empty. Select items to start.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.part} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">LKR {item.price.toLocaleString()} ea</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-white border rounded-md p-1">
                                            <button type="button" onClick={() => updateQty(item.part, -1)} className="text-slate-400 hover:text-red-500"><Minus size={14} /></button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button type="button" onClick={() => updateQty(item.part, 1)} className="text-slate-400 hover:text-primary"><Plus size={14} /></button>
                                        </div>
                                        <button type="button" onClick={() => removeFromCart(item.part)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Amount (Optional)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    value={dueAmount}
                                    onChange={(e) => setDueAmount(Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex justify-between items-center py-4 border-b">
                                <span className="text-slate-500 font-bold">Total Amount</span>
                                <span className="text-2xl font-bold text-slate-800 underline decoration-primary decoration-4">LKR {total.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition disabled:opacity-50"
                            >
                                {loading ? 'Processing Sale...' : 'Review & Generate Invoice'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Sales;
