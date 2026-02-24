import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { loginUser, registerUser, updatePersona } from '../api/client';
import { PERSONAS } from '../data/personas';
import { BrandLogo } from './BrandLogo';

interface LoginProps {
    onLoginSuccess: (persona: string) => void;
    forcePersonaStep?: boolean;
    onBackClick?: () => void;
}

export function Login({ onLoginSuccess, forcePersonaStep = false, onBackClick }: LoginProps) {
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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);

    const filteredPersonas = PERSONAS.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPersonas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPersonas = itemsPerPage === 100 ? filteredPersonas : filteredPersonas.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset pagination on new search
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        try {
            if (isLoginTab) {
                const res = await loginUser(email, password);
                localStorage.setItem('omnipitch_token', res.access_token);
                if (res.persona) {
                    onLoginSuccess(res.persona);
                } else {
                    setStep('persona');
                }
            } else {
                await registerUser(firstName, lastName, companyName, email, password);
                const loginRes = await loginUser(email, password);
                localStorage.setItem('omnipitch_token', loginRes.access_token);
                setStep('persona');
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePersonaSelect = async (personaId: string) => {
        try {
            await updatePersona(personaId);
            onLoginSuccess(personaId);
        } catch (err) {
            setErrorMsg('Failed to update persona');
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans">
            {/* Global Branding overlay */}
            <div className="absolute top-6 left-6 z-50 pointer-events-none">
                <BrandLogo />
            </div>

            <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 relative">
                {/* Subtle Apple-like glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

                {onBackClick && (
                    <div className="absolute top-6 right-6 z-50">
                        <button
                            onClick={onBackClick}
                            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm font-medium px-4 py-2 rounded-full transition-all shadow-sm backdrop-blur-md"
                        >
                            Back
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 'auth' ? (
                        <motion.div
                            key="auth"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-[2rem] border border-white/10 shadow-2xl relative z-10"
                        >
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">
                                    Welcome
                                </h2>
                                <p className="text-sm text-slate-400">Sign in to OmniPitchAI</p>
                            </div>

                            <div className="flex bg-slate-900/50 backdrop-blur-md rounded-2xl p-1 mb-8 border border-white/5">
                                <button
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${isLoginTab ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                                    onClick={() => setIsLoginTab(true)}
                                >
                                    Log In
                                </button>
                                <button
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${!isLoginTab ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                                    onClick={() => setIsLoginTab(false)}
                                >
                                    Register
                                </button>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-4">
                                {!isLoginTab && (
                                    <>
                                        <div className="flex space-x-3">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">First Name</label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={e => setFirstName(e.target.value)}
                                                    required={!isLoginTab}
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                                    placeholder="John"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={e => setLastName(e.target.value)}
                                                    required={!isLoginTab}
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Company</label>
                                            <input
                                                type="text"
                                                value={companyName}
                                                onChange={e => setCompanyName(e.target.value)}
                                                required={!isLoginTab}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                                placeholder="Acme Corp"
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="name@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {errorMsg && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium px-1 pt-1">{errorMsg}</motion.p>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-white text-slate-950 hover:bg-slate-100 font-semibold rounded-xl py-3.5 mt-8 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {isLoading ? 'Processing...' : (isLoginTab ? 'Continue' : 'Create Account')}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="persona"
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-7xl pt-8 px-4 relative z-10"
                        >
                            <div className="max-w-3xl mx-auto text-center mb-12">
                                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                                    Choose Your Role
                                </h2>
                                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto font-light">
                                    Select the perspective you want the AI to adopt when generating your corporate artifacts.
                                </p>

                                <div className="relative max-w-xl mx-auto group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-14 pr-6 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xl text-lg"
                                        placeholder="Search 100+ personas..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12">
                                {currentPersonas.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: Math.min(idx, 15) * 0.02, ease: "easeOut" }}
                                        onClick={() => handlePersonaSelect(p.id)}
                                        className="cursor-pointer group relative bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/[0.06] rounded-2xl p-6 transition-all duration-300 flex flex-col items-start h-40 shadow-lg hover:shadow-xl hover:-translate-y-1"
                                    >
                                        <div className="flex items-center space-x-3 mb-3 shrink-0">
                                            <div className="p-2 rounded-lg bg-white/5 text-slate-300 group-hover:text-white group-hover:bg-indigo-500/20 transition-colors">
                                                {p.icon}
                                            </div>
                                            <h3 className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">{p.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed line-clamp-2">{p.description}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination Interface */}
                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 pb-24 text-sm font-medium text-slate-400">
                                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                    <span>Show:</span>
                                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                                        {[9, 50, 100].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => { setItemsPerPage(val); setCurrentPage(1); }}
                                                className={`px-3 py-1.5 rounded-lg transition-colors ${itemsPerPage === val ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/5 hover:text-slate-300'}`}
                                            >
                                                {val === 100 ? 'All' : val}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="hidden sm:inline">personas</span>
                                </div>

                                {itemsPerPage !== 100 && totalPages > 1 && (
                                    <div className="flex items-center space-x-6">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-slate-300 font-semibold tracking-wide">
                                            Page {currentPage} <span className="text-slate-500 font-normal">of {totalPages}</span>
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
