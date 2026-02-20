import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center">
                <h2 className="text-xl font-semibold text-slate-800">Management System</h2>
            </div>

            <div className="flex items-center gap-6">
                <button className="text-slate-500 hover:text-primary transition">
                    <Bell size={20} />
                </button>

                <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.isAdmin ? 'Administrator' : 'Staff'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary border border-slate-200">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
