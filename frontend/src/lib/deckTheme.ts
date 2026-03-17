export interface DeckTheme {
    name: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    accent: string;
    accentAlt: string;
    text: string;
    muted: string;
    border: string;
}

export function resolveDeckTheme(themeVibe: string): DeckTheme {
    const vibe = (themeVibe || '').toLowerCase();

    if (vibe.includes('google') || vibe.includes('startup') || vibe.includes('visionary') || vibe.includes('bold')) {
        return {
            name: 'Catalyst',
            background: '#f7f9fc',
            surface: '#ffffff',
            surfaceAlt: '#e8f0fe',
            accent: '#1a73e8',
            accentAlt: '#34a853',
            text: '#0f172a',
            muted: '#64748b',
            border: 'rgba(26, 115, 232, 0.18)',
        };
    }

    if (vibe.includes('apple') || vibe.includes('minimal') || vibe.includes('clean') || vibe.includes('story')) {
        return {
            name: 'Monochrome',
            background: '#f2f2f0',
            surface: '#ffffff',
            surfaceAlt: '#e5e7eb',
            accent: '#111111',
            accentAlt: '#6b7280',
            text: '#111111',
            muted: '#6b7280',
            border: 'rgba(17, 17, 17, 0.12)',
        };
    }

    if (vibe.includes('cyber') || vibe.includes('hacker') || vibe.includes('matrix') || vibe.includes('technical') || vibe.includes('deep')) {
        return {
            name: 'Signal Grid',
            background: '#08111f',
            surface: '#101a30',
            surfaceAlt: '#16233e',
            accent: '#12e7f2',
            accentAlt: '#ff4ecd',
            text: '#eafbff',
            muted: '#93a4bf',
            border: 'rgba(18, 231, 242, 0.22)',
        };
    }

    return {
        name: 'Executive Blueprint',
        background: '#0f172a',
        surface: '#111c33',
        surfaceAlt: '#1e293b',
        accent: '#38bdf8',
        accentAlt: '#f59e0b',
        text: '#f8fafc',
        muted: '#94a3b8',
        border: 'rgba(56, 189, 248, 0.18)',
    };
}
