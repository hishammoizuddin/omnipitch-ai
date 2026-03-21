import { useEffect, useLayoutEffect, useState } from 'react';
import { AlertCircle, LogOut, Settings2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { checkStatus, getDownloadUrl, getMe, uploadDocument } from './api/client';
import { BrandLogo } from './components/BrandLogo';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { SiteFooter } from './components/SiteFooter';
import { ThemeToggle } from './components/ThemeToggle';
import { CentralCanvas } from './components/Workspace/CentralCanvas';
import type { WizardData } from './components/Wizard/FormWizard';
import type {
  GenerationSource,
  GenerationSourceSummary,
  GenerationStatusPayload,
  PresentationDeck,
} from './types/generation';

interface UserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  persona?: string;
}

type ThemeMode = 'light' | 'dark';

const EMPTY_SOURCE_SUMMARY: GenerationSourceSummary = {
  files_received: 0,
  text_sources: 0,
  image_sources: 0,
  archive_entries: 0,
};

function formatPersona(persona: string | null | undefined): string {
  if (!persona) return 'Standard';

  if (persona.length <= 3) {
    return persona.toUpperCase();
  }

  return persona
    .replace(/[_]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatStatus(status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error') {
  if (status === 'idle') return 'Ready';
  if (status === 'uploading') return 'Starting';
  if (status === 'processing') return 'Building';
  if (status === 'completed') return 'Done';
  return 'Error';
}

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

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem('omnipitch_theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [user, setUser] = useState<UserData | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPersonaSelector, setShowPersonaSelector] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [generationRequest, setGenerationRequest] = useState<WizardData | null>(null);
  const [sources, setSources] = useState<GenerationSource[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [outline, setOutline] = useState<string[]>([]);
  const [slidesGenerated, setSlidesGenerated] = useState(0);
  const [sourceSummary, setSourceSummary] = useState<GenerationSourceSummary>(EMPTY_SOURCE_SUMMARY);
  const [presentation, setPresentation] = useState<PresentationDeck | null>(null);

  const resetGenerationState = () => {
    setJobId(null);
    setStatus('idle');
    setCurrentStep('');
    setProgressPercent(0);
    setErrorMsg(null);
    setGenerationRequest(null);
    setSources([]);
    setWarnings([]);
    setOutline([]);
    setSlidesGenerated(0);
    setSourceSummary(EMPTY_SOURCE_SUMMARY);
    setPresentation(null);
  };

  const syncGenerationState = (payload: GenerationStatusPayload) => {
    setCurrentStep(payload.current_step);
    setProgressPercent(payload.progress_percent || 0);
    setWarnings(payload.warnings || []);
    setSources(payload.sources || []);
    setOutline(payload.outline || []);
    setSlidesGenerated(payload.slides_generated || 0);
    setSourceSummary(payload.source_summary || EMPTY_SOURCE_SUMMARY);
    setPresentation(payload.presentation_json || null);
  };

  const liveSlideCount = presentation ? presentation.slides.length + 2 : slidesGenerated;
  const shellStatus = formatStatus(status);
  const activeDeckLabel = presentation?.deck_title || generationRequest?.topic || 'New deck';
  const userInitial = (user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'O').toUpperCase();

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('omnipitch_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((current) => current === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('omnipitch_token');

      if (!token) {
        return;
      }

      try {
        const userData = await getMe();
        if (userData) {
          setUser(userData);
        }
      } catch {
        localStorage.removeItem('omnipitch_token');
      }
    };

    checkAuth();
  }, []);

  const handleGenerate = async (data: WizardData) => {
    try {
      setStatus('uploading');
      setErrorMsg(null);
      setGenerationRequest(data);

      const response = await uploadDocument(
        data.files,
        data.topic,
        `${data.duration} minutes`,
        data.audience || 'General Audience',
        data.sections || 'General overview',
        data.tone
      );

      setJobId(response.job_id);
      setStatus('processing');
      syncGenerationState(response);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(getErrorMessage(err, 'Failed to start generation.'));
    }
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (jobId && status === 'processing') {
      intervalId = setInterval(async () => {
        try {
          const response = await checkStatus(jobId);
          syncGenerationState(response);

          if (response.status === 'completed') {
            setStatus('completed');
            clearInterval(intervalId);
          } else if (response.status === 'error') {
            setStatus('error');
            setErrorMsg(response.error_msg);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Error checking status', err);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, status]);

  if (!user || (!user.persona && !showPersonaSelector)) {
    if (!showLogin) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onLoginClick={() => setShowLogin(true)} theme={theme} onToggleTheme={handleToggleTheme} />
          </motion.div>
        </AnimatePresence>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <Login
          onLoginSuccess={async () => {
            const userData = await getMe();
            setUser(userData);
            setShowPersonaSelector(false);
            setShowLogin(false);
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onBackClick={() => setShowLogin(false)}
        />
      </AnimatePresence>
    );
  }

  if (showPersonaSelector) {
    return (
      <AnimatePresence mode="wait">
        <Login
          onLoginSuccess={async () => {
            const userData = await getMe();
            setUser(userData);
            setShowPersonaSelector(false);
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          forcePersonaStep={true}
          onBackClick={() => setShowPersonaSelector(false)}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--app-bg)] text-[color:var(--text)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(23,76,60,0.12),transparent_24%),radial-gradient(circle_at_90%_14%,rgba(184,105,54,0.12),transparent_24%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-6 xl:px-8">
        <header className="rounded-[30px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-4 shadow-[0_22px_60px_rgba(24,38,31,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <BrandLogo compact />
              <div className="hidden h-10 w-px bg-[color:var(--border)] lg:block" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">Current deck</p>
                <p className="truncate text-sm font-medium text-[color:var(--text)]">{activeDeckLabel}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
                <div className="rounded-full bg-[color:var(--surface-muted)] px-4 py-2 text-sm text-[color:var(--text)]">
                  {shellStatus}
                </div>
                {status !== 'idle' ? (
                  <div className="rounded-full bg-[color:var(--surface-muted)] px-4 py-2 text-sm text-[color:var(--muted)]">
                    {currentStep || 'Preparing'}{liveSlideCount > 0 ? ` · ${liveSlideCount} slides` : ''}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-2 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm font-semibold text-white">
                  {userInitial}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-[color:var(--text)]">{user?.first_name || user?.email}</p>
                  <p className="text-xs text-[color:var(--muted)]">{formatPersona(user?.persona)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPersonaSelector(true);
                    resetGenerationState();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-muted)] text-[color:var(--muted)] transition hover:text-[color:var(--text)]"
                  title="Change persona"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setUser(null);
                    resetGenerationState();
                    localStorage.removeItem('omnipitch_token');
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-muted)] text-[color:var(--muted)] transition hover:text-[color:var(--text)]"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {errorMsg ? (
          <div className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </motion.div>
          </div>
        ) : null}

        <main className="mt-4 flex-1">
          <CentralCanvas
            status={status}
            currentStep={currentStep}
            progressPercent={progressPercent}
            request={generationRequest}
            warnings={warnings}
            sources={sources}
            sourceSummary={sourceSummary}
            outline={outline}
            slidesGenerated={slidesGenerated}
            presentation={presentation}
            downloadUrl={jobId ? getDownloadUrl(jobId) : ''}
            onGenerate={handleGenerate}
            onReset={resetGenerationState}
          />
        </main>

        <SiteFooter className="mt-4 rounded-[28px] bg-[color:var(--surface-strong)]" />
      </div>
    </div>
  );
}

export default App;
