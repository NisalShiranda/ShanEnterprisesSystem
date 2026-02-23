import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, user } = useAuth();

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

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
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
                <div className="flex justify-center mb-6">
                    <img src="/logo.jpeg" alt="Shan Enterprises Logo" className="h-32 w-auto" />
                </div>
                <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Management System</p>

                {error && (
                    <div className="p-3 mb-4 text-[11px] font-bold text-red-700 bg-red-50 border border-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm"
                            placeholder="admin@shanenterprises.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none transition text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-slate-200 transition duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
