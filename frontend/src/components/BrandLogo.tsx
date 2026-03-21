import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface BrandLogoProps {
    compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
    return (
        <div className="flex items-center gap-3 cursor-pointer group pointer-events-auto">
            <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--accent)] text-white shadow-[0_12px_30px_rgba(23,76,60,0.16)]"
                whileHover={{ scale: 1.03, rotate: 6 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 360, damping: 20 }}
            >
                <Sparkles className="h-5 w-5" />
            </motion.div>
            <div className="flex flex-col">
                <span className="text-xl font-semibold tracking-tight text-[color:var(--text)] transition-colors duration-300 group-hover:text-[color:var(--accent)]">
                    OmniPitchAI
                </span>
                {!compact ? (
                    <span className="mt-0.5 text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
                        deck studio
                    </span>
                ) : null}
            </div>
        </div>
    );
}
