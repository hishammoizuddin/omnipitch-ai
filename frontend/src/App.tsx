import { useEffect, useState } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Joyride from 'react-joyride';
import type { Step } from 'react-joyride';

import { checkStatus, getDownloadUrl, getMe, uploadDocument } from './api/client';
import { BrandLogo } from './components/BrandLogo';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { CentralCanvas } from './components/Workspace/CentralCanvas';
import { LeftSidebar } from './components/Workspace/LeftSidebar';
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
  if (status === 'uploading') return 'Uploading';
  if (status === 'processing') return 'Generating';
  if (status === 'completed') return 'Deck Ready';
  return 'Needs Attention';
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [runTour, setRunTour] = useState(false);
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

  const tourSteps: Step[] = [
    {
      target: '.tour-step-1',
      content: 'This persona hub keeps the deck language and framing aligned with the role you care about.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-2',
      content: 'Build a context packet with notes plus mixed files like PDFs, docs, source code, images, or repo archives.',
    },
    {
      target: '.tour-step-3',
      content: 'Track the full generation path, see what sources were processed, and watch the outline take shape in real time.',
    },
    {
      target: '.tour-step-4',
      content: 'Review the generated deck directly in the workspace, then export it as PPTX or PDF without breaking the flow.',
    }
  ];

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
  const activeDeckLabel = presentation?.deck_title || generationRequest?.topic || 'New Executive Deck';

  useEffect(() => {
    if (user && status === 'idle') {
      const hasSeenTour = localStorage.getItem('omnipitch_tour_seen');
      if (!hasSeenTour) {
        setRunTour(true);
        localStorage.setItem('omnipitch_tour_seen', 'true');
      }
    }
  }, [user, status]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('omnipitch_token');
      if (token) {
        try {
          const userData = await getMe();
          if (userData) {
            setUser(userData);
          }
        } catch {
          localStorage.removeItem('omnipitch_token');
        }
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
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'Failed to start generation.');
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
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <LandingPage onLoginClick={() => setShowLogin(true)} />
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
          forcePersonaStep={true}
          onBackClick={() => setShowPersonaSelector(false)}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="fixed inset-0 w-full flex flex-col overflow-hidden bg-[#07111f] font-sans text-slate-200 selection:bg-sky-400/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.12),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.08),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent opacity-60" />

      <div className="h-20 w-full px-4 sm:px-6 xl:px-8 flex justify-between items-center z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <BrandLogo />
          <div className="hidden xl:flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
            <span className="uppercase tracking-[0.24em] text-slate-500">Workspace</span>
            <span className="max-w-[260px] truncate text-slate-100">{activeDeckLabel}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-sky-200/80">Status</p>
            <p className="mt-1 text-sm font-medium text-white">{shellStatus}</p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Current Stage</p>
            <p className="mt-1 text-sm font-medium text-white">{currentStep || 'Awaiting brief'}</p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Slides</p>
            <p className="mt-1 text-sm font-medium text-white">{liveSlideCount || '0'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="tour-step-1 flex items-center space-x-3 text-slate-300 border-r border-white/10 pr-4">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-sm backdrop-blur-md">
              <span className="font-semibold text-slate-200">{user?.first_name ? user.first_name.charAt(0) : user?.email?.charAt(0)}</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-100 leading-tight">{user?.first_name || user?.email}</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  {formatPersona(user?.persona)}
                </p>
                <button
                  onClick={() => {
                    setShowPersonaSelector(true);
                    resetGenerationState();
                  }}
                  className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-slate-300 transition-colors shadow-sm ml-2"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setUser(null);
              resetGenerationState();
              localStorage.removeItem('omnipitch_token');
            }}
            className="flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5 p-2 rounded-xl"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 w-full tour-step-2">
        <div className="hidden lg:block h-full">
          <LeftSidebar
            status={status}
            currentStep={currentStep}
            progressPercent={progressPercent}
            request={generationRequest}
            sources={sources}
            outline={outline}
            sourceSummary={sourceSummary}
            presentation={presentation}
          />
        </div>

        <div className="flex-1 overflow-y-auto relative z-10 bg-slate-950/40">
          {errorMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full flex items-center text-red-400 backdrop-blur-md shadow-lg text-sm"
              >
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <p>{errorMsg}</p>
              </motion.div>
            </div>
          )}

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
        </div>
      </div>

      <div className="h-12 w-full px-4 sm:px-6 xl:px-8 flex justify-between items-center text-slate-500 text-xs z-20 border-t border-white/10 bg-slate-950/70 backdrop-blur-2xl shrink-0">
        <p>OmniPitchAI transforms technical context into boardroom-ready decks.</p>
        <div className="hidden md:flex items-center gap-5">
          <span>Mixed-file ingestion</span>
          <span>Live preview workspace</span>
          <span>PPTX and PDF export</span>
        </div>
      </div>

      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            primaryColor: '#6366f1',
            backgroundColor: '#0f172a',
            arrowColor: '#0f172a',
            textColor: '#f1f5f9',
            overlayColor: 'rgba(0, 0, 0, 0.7)'
          },
          tooltipContainer: {
            textAlign: 'left'
          }
        }}
      />
    </div>
  );
}

export default App;
