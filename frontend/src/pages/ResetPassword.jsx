import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/users/resetpassword/${token}`, { password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-outfit">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-black">
                <img
                    src="/login-bg.png"
                    alt="Garment System"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
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
                            Define <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Security</span> <br />
                            Parameters.
                        </h1>
                    </div>

                    <div className="text-white/40">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Access Initialization Flow</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 sm:p-12 xl:p-16 bg-slate-50/50">
                <div className="w-full max-w-sm">
                    {success ? (
                        <div className="text-center animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <ShieldCheck className="text-green-600" size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Reset Successful</h2>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-12">
                                Your security pin has been updated. Redirecting to auth portal in a few seconds...
                            </p>
                            <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto relative overflow-hidden">
                                <div className="absolute inset-0 bg-black animate-progress origin-left"></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Configure Pin</h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Enter your new security credentials</p>
                            </div>

                            {error && (
                                <div className="p-4 mb-6 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Security Pin</label>
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
                                    <input
                                        type="password"
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center h-14"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Apply Credentials'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
