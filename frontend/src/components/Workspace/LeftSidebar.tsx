import { motion } from 'framer-motion';
import { LayoutList, Settings, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface LeftSidebarProps {
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    currentStep: string;
}

const mockOutline = [
    { id: 1, title: 'Executive Summary', status: 'done' },
    { id: 2, title: 'The Problem Statement', status: 'done' },
    { id: 3, title: 'Core Architecture', status: 'generating' },
    { id: 4, title: 'Go-to-Market Strategy', status: 'pending' },
    { id: 5, title: 'Financial Projections', status: 'pending' },
];

export function LeftSidebar({ status }: LeftSidebarProps) {
    return (
        <div className="w-64 flex-shrink-0 border-r border-white/10 bg-slate-950/80 backdrop-blur-3xl p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center space-x-2 text-slate-300 mb-8 px-2">
                <LayoutList className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-semibold tracking-wide">Presentation Outline</h2>
            </div>

            {status === 'idle' || status === 'uploading' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-5 h-5 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">
                        Fill out the wizard to generate your outline structure.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 px-2">
                    {mockOutline.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group flex items-center space-x-3"
                        >
                            <div
                                className={clsx(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    item.status === 'done' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" :
                                        item.status === 'generating' ? "bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" :
                                            "bg-slate-700"
                                )}
                            />
                            <span className={clsx(
                                "text-xs hover:text-white transition-colors cursor-pointer",
                                item.status === 'done' ? "text-slate-300" :
                                    item.status === 'generating' ? "text-indigo-200 font-medium" :
                                        "text-slate-600"
                            )}>
                                {idx + 1}. {item.title}
                            </span>
                        </motion.div>
                    ))}

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</p>
                        <button className="flex items-center space-x-3 text-xs text-slate-400 hover:text-white transition-colors w-full p-2 hover:bg-white/5 rounded-lg">
                            <Settings className="w-4 h-4" />
                            <span>Brand Guidelines</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
