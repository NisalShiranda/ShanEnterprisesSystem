import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Command, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`h-16 sticky top-0 z-10 transition-all duration-300 print:hidden ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm' : 'bg-white border-b border-slate-50'
            }`}>
            <div className="h-full px-8 flex items-center justify-between gap-8">
                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search everything... (Cmd+K)"
                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-50 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-600 outline-none transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-0.5 border border-slate-200 rounded text-[10px] text-slate-400 bg-white">
                        <Command size={10} />
                        K
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="h-8 w-px bg-slate-100 mx-2" />

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                            <p className="text-[11px] font-bold text-slate-400 tracking-wide uppercase mt-1">
                                {user?.isAdmin ? 'Global Admin' : 'Staff Member'}
                            </p>
                        </div>

                        <div className="relative group p-0.5 rounded-full bg-gradient-to-tr from-primary to-indigo-400">
                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white">
                                {/* Fallback to Icon */}
                                <UserIcon size={18} className="text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
