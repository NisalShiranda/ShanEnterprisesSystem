import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, user } = useAuth();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/users/login', { email, password });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-outfit">
            {/* Left Side - Visual with Black Gradient Overlay */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-black">
                <img
                    src="/login-bg.png"
                    alt="Garment System Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent"></div>

                <div className="relative z-10 flex flex-col justify-between p-16 h-full w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                            <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg brightness-110" />
                        </div>
                        <span className="text-white text-xl font-black tracking-tight uppercase">Shan Enterprises</span>
                    </div>

                    <div className="max-w-md">
                        <div className="w-16 h-1 bg-white/30 rounded-full mb-8"></div>
                        <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tighter mb-6">
                            Smart <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Garment</span> <br />
                            Manager.
                        </h1>
                        <p className="text-white/60 text-lg font-medium leading-relaxed">
                            Precision at every stitch. Manage your manufacturing,
                            sales, and inventory with our premium industrial ecosystem.
                        </p>
                    </div>

                    <div className="flex items-center gap-12">
                        <div>
                            <p className="text-white text-2xl font-black">2.4k+</p>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Active Units</p>
                        </div>
                        <div>
                            <p className="text-white text-2xl font-black">99.9%</p>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Efficiency</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 sm:p-12 xl:p-20 bg-slate-50/50">
                <div className="w-full max-w-sm">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Personnel Authentication Required</p>
                    </div>

                    {error && (
                        <div className="p-4 mb-8 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                            <input
                                type="email"
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
                                placeholder="name@shanenterprises.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Pin</label>
                                <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 h-16 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Authorize Access'}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-400 text-xs font-bold font-medium tracking-tight">
                            System restricted to authorized personnel. <br />
                            <Link to="/register" className="text-black hover:underline font-black uppercase tracking-widest text-[10px] inline-block mt-4">Initialize Account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
