import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data } = await api.post('/users/forgotpassword', { email });
            setMessage(data.message);
            if (data.resetToken) {
                setResetToken(data.resetToken);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
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
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                            <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg" />
                        </div>
                        <span className="text-white text-xl font-black tracking-tight uppercase">Shan Enterprises</span>
                    </div>

                    <div className="max-w-md">
                        <div className="w-16 h-1 bg-white/30 rounded-full mb-8"></div>
                        <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tighter mb-6">
                            Secure <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Recovery</span> <br />
                            Service.
                        </h1>
                    </div>

                    <div className="text-white/40">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Access Restoration Protocol</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 sm:p-12 xl:p-20 bg-slate-50/50">
                <div className="w-full max-w-sm">
                    <div className="mb-10">
                        <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-black transition-colors mb-8 group">
                            <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Sign In</span>
                        </Link>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Recover Access</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Lost your security pin?</p>
                    </div>

                    {error && (
                        <div className="p-4 mb-8 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl">
                            {error}
                        </div>
                    )}

                    {message ? (
                        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl shadow-slate-200/50 animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                                <Mail className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Request Processed</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                {message}. In a production environment, you would receive an email. Since we are in system setup mode, use the link below:
                            </p>

                            <Link
                                to={`/reset-password/${resetToken}`}
                                className="w-full py-5 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center transition-all shadow-xl"
                            >
                                Reset Pin Now
                            </Link>

                            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                Token: <span className="text-primary select-all">{resetToken}</span>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                                <input
                                    type="email"
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm font-medium shadow-sm"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 h-16 flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Request Reset Token'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
