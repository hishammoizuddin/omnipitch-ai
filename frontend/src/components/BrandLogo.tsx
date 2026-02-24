import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function BrandLogo() {
    return (
        <div className="flex items-center space-x-3 cursor-pointer group pointer-events-auto">
            <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
                whileHover={{ scale: 1.05, rotate: 12 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-blue-400 transition-all duration-300">
                    OmniPitchAI
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
                    By Aisynch Labs
                </span>
            </div>
        </div>
    );
}
