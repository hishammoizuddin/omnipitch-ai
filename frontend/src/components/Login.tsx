import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';

import { loginUser, registerUser, updatePersona } from '../api/client';
import { PERSONAS } from '../data/personas';
import { BrandLogo } from './BrandLogo';
import { SiteFooter } from './SiteFooter';
import { ThemeToggle } from './ThemeToggle';

interface LoginProps {
    onLoginSuccess: (persona?: string) => void | Promise<void>;
    forcePersonaStep?: boolean;
    onBackClick?: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const FEATURED_PERSONA_IDS = ['c_suite', 'ceo', 'cto', 'cfo', 'vp_eng', 'investor'];

function getErrorMessage(error: unknown, fallback: string) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
    ) {
        const response = (error as { response?: { data?: { detail?: string } } }).response;
        return response?.data?.detail || fallback;
    }

    return fallback;
}

export function Login({ onLoginSuccess, forcePersonaStep = false, onBackClick, theme, onToggleTheme }: LoginProps) {
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'auth' | 'persona'>(forcePersonaStep ? 'persona' : 'auth');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPersonas = useMemo(
        () => PERSONAS.filter((persona) =>
            persona.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            persona.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [searchQuery]
    );

    const featuredPersonas = useMemo(
        () => FEATURED_PERSONA_IDS
            .map((id) => PERSONAS.find((persona) => persona.id === id))
            .filter((persona): persona is NonNullable<typeof persona> => Boolean(persona)),
        []
    );

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (isLoginTab) {
                const res = await loginUser(email, password);
                localStorage.setItem('omnipitch_token', res.access_token);

                if (res.persona) {
                    await onLoginSuccess(res.persona);
                } else {
                    setStep('persona');
                }
            } else {
                await registerUser(firstName, lastName, companyName, email, password);
                const loginRes = await loginUser(email, password);
                localStorage.setItem('omnipitch_token', loginRes.access_token);
                setStep('persona');
            }
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Authentication failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePersonaSelect = async (personaId: string) => {
        try {
            setErrorMsg('');
            await updatePersona(personaId);
            await onLoginSuccess(personaId);
        } catch {
            setErrorMsg('Could not save that role. Please try again.');
        }
    };

    const allRoles = searchQuery.trim().length > 0 ? filteredPersonas : PERSONAS;

    return (
        <div className="min-h-screen bg-[color:var(--app-bg)] px-4 py-6 text-[color:var(--text)] sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
                <div className="flex items-center justify-between">
                    <BrandLogo />
                    <div className="flex items-center gap-3">
                        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                        {onBackClick ? (
                            <button
                                onClick={onBackClick}
                                className="rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--panel-soft)]"
                            >
                                Back
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="relative mt-8 flex flex-1 items-center justify-center">
                    <div className="pointer-events-none absolute left-0 top-8 h-72 w-72 rounded-full bg-[color:var(--accent-soft)] blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[rgba(184,105,54,0.14)] blur-3xl" />

                    <AnimatePresence mode="wait">
                        {step === 'auth' ? (
                            <motion.div
                                key="auth"
                                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                                transition={{ duration: 0.32, ease: 'easeOut' }}
                                className="relative z-10 w-full max-w-md rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 shadow-[0_30px_80px_rgba(24,38,31,0.08)]"
                            >
                                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Welcome</p>
                                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text)]">
                                    {isLoginTab ? 'Sign in' : 'Create your account'}
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                                    Keep it simple. Sign in, pick a role, and start your first deck.
                                </p>

                                <div className="mt-6 grid grid-cols-2 rounded-2xl bg-[color:var(--surface-muted)] p-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsLoginTab(true)}
                                        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${isLoginTab ? 'bg-[color:var(--panel-strong)] text-[color:var(--text)] shadow-sm' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                                    >
                                        Sign in
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsLoginTab(false)}
                                        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${!isLoginTab ? 'bg-[color:var(--panel-strong)] text-[color:var(--text)] shadow-sm' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                                    >
                                        Create account
                                    </button>
                                </div>

                                <form onSubmit={handleAuth} className="mt-6 space-y-4">
                                    {!isLoginTab ? (
                                        <>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <label className="block">
                                                    <span className="mb-2 block text-sm text-[color:var(--muted)]">First name</span>
                                                    <input
                                                        type="text"
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        required={!isLoginTab}
                                                        className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--input)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                                                        placeholder="John"
                                                    />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-2 block text-sm text-[color:var(--muted)]">Last name</span>
                                                    <input
                                                        type="text"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        required={!isLoginTab}
                                                        className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--input)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                                                        placeholder="Doe"
                                                    />
                                                </label>
                                            </div>

                                            <label className="block">
                                                <span className="mb-2 block text-sm text-[color:var(--muted)]">Company</span>
                                                <input
                                                    type="text"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    required={!isLoginTab}
                                                    className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--input)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                                                    placeholder="Acme"
                                                />
                                            </label>
                                        </>
                                    ) : null}

                                    <label className="block">
                                        <span className="mb-2 block text-sm text-[color:var(--muted)]">Email</span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--input)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                                            placeholder="name@company.com"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm text-[color:var(--muted)]">Password</span>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--input)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                                            placeholder="••••••••"
                                        />
                                    </label>

                                    {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full rounded-full bg-[color:var(--accent)] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[color:var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isLoading ? 'Please wait...' : isLoginTab ? 'Continue' : 'Create account'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="persona"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.32, ease: 'easeOut' }}
                                className="relative z-10 w-full max-w-6xl rounded-[36px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_30px_80px_rgba(24,38,31,0.08)] md:p-8"
                            >
                                <div className="max-w-2xl">
                                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Role</p>
                                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text)] md:text-4xl">
                                        Pick the lens for your deck.
                                    </h1>
                                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                                        Choose a common role below, or search if you want something more specific.
                                    </p>
                                </div>

                                <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
                                    <div>
                                        <p className="text-sm font-medium text-[color:var(--text)]">Popular roles</p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {featuredPersonas.map((persona) => (
                                                <button
                                                    key={persona.id}
                                                    type="button"
                                                    onClick={() => handlePersonaSelect(persona.id)}
                                                    className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--panel)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-strong)]"
                                                >
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                                                        {persona.icon}
                                                    </div>
                                                    <p className="mt-4 text-base font-medium text-[color:var(--text)]">{persona.title}</p>
                                                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{persona.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-5">
                                        <p className="text-sm font-medium text-[color:var(--text)]">Search all roles</p>
                                        <div className="relative mt-4">
                                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search roles"
                                                className="w-full rounded-full border border-[color:var(--border)] bg-[color:var(--input)] px-11 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                                            />
                                        </div>

                                        <div className="mt-4 max-h-[24rem] space-y-2 overflow-y-auto pr-1">
                                            {allRoles.map((persona) => (
                                                <button
                                                    key={persona.id}
                                                    type="button"
                                                    onClick={() => handlePersonaSelect(persona.id)}
                                                    className="flex w-full items-start gap-3 rounded-2xl border border-transparent bg-[color:var(--panel-soft)] px-4 py-3 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-strong)]"
                                                >
                                                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                                                        {persona.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-[color:var(--text)]">{persona.title}</p>
                                                        <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{persona.description}</p>
                                                    </div>
                                                </button>
                                            ))}

                                            {allRoles.length === 0 ? (
                                                <div className="rounded-2xl bg-[color:var(--panel-strong)] px-4 py-5 text-sm text-[color:var(--muted)]">
                                                    No roles match that search.
                                                </div>
                                            ) : null}
                                        </div>

                                        {errorMsg ? <p className="mt-4 text-sm text-red-600">{errorMsg}</p> : null}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <SiteFooter className="mt-6 bg-[color:var(--surface)]" />
            </div>
        </div>
    );
}
