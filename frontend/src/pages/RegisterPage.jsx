import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/users', { name, email, password });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-outfit">
            {/* Left Side - Visual with Black Gradient Overlay */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-black">
                <img
                    src="/register-bg.png"
                    alt="Registration System Background"
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
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Premium</span> <br />
                            Network.
                        </h1>
                        <p className="text-white/60 text-lg font-medium leading-relaxed">
                            Initialize your account to access the garment manufacturing
                            ecosystem. Secure, efficient, and built for scale.
                        </p>
                    </div>

                    <div className="flex items-center gap-12 text-white/40">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Authorized Access Only</p>
                        <div className="w-12 h-px bg-white/10"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">SECURE 256-BIT SSL</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 sm:p-12 xl:p-16 bg-slate-50/50">
                <div className="w-full max-w-sm">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create Account</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Enter your personnel details Below</p>
                    </div>

                    {error && (
                        <div className="p-4 mb-6 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
                                placeholder="Nisal Shiranda"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                            <input
                                type="email"
                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
                                placeholder="name@shanenterprises.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Set Security Pin</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
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

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Pin</label>
                            <div className="relative group">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 focus:outline-none transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center h-14"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Initialize Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-xs font-bold font-medium tracking-tight">
                            Existing personnel? <br />
                            <Link to="/login" className="text-black hover:underline font-black uppercase tracking-widest text-[10px] inline-block mt-3">Authorize Access</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
