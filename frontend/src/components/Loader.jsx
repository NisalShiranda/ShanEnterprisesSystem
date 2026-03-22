import React from 'react';

const Loader = ({ mode = 'full', className = '' }) => {
    if (mode === 'inline') {
        return (
            <div className={`w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`} />
        );
    }

    return (
        <div className={`flex items-center justify-center min-h-[50vh] ${className}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                    Shan Enterprises
                </p>
            </div>
        </div>
    );
};

export default Loader;
