import { Moon, SunMedium } from 'lucide-react';

interface ThemeToggleProps {
    theme: 'light' | 'dark';
    onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-2 text-sm font-medium text-[color:var(--text)] hover:bg-[color:var(--panel-soft)]"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
    );
}
