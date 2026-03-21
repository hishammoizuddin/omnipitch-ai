interface SiteFooterProps {
    className?: string;
}

export function SiteFooter({ className = '' }: SiteFooterProps) {
    return (
        <footer className={`relative overflow-hidden border-t border-[color:var(--border)] text-sm text-[color:var(--muted)] ${className}`.trim()}>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div className="text-center sm:text-left">
                    <span className="text-sm font-semibold tracking-tight text-[color:var(--text)]">
                        Aisynch Labs
                    </span>
                </div>

                <div className="text-center text-sm text-[color:var(--muted)] sm:text-right">
                    &copy; 2026 Aisynch Labs. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
