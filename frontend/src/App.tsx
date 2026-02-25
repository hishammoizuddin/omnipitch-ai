import { useState, useEffect } from 'react';
import { LeftSidebar } from './components/Workspace/LeftSidebar';
import { CentralCanvas } from './components/Workspace/CentralCanvas';
import type { WizardData } from './components/Wizard/FormWizard';
import { uploadDocument, checkStatus, getDownloadUrl, getMe } from './api/client';
import { AlertCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Joyride from 'react-joyride';
import type { Step } from 'react-joyride';
import { Login } from './components/Login';
import { BrandLogo } from './components/BrandLogo';
import { LandingPage } from './components/LandingPage';

interface UserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  persona?: string;
}

function formatPersona(persona: string | null | undefined): string {
  if (!persona) return 'Standard';

  if (persona.length <= 3) {
    return persona.toUpperCase();
  }

  return persona
    .replace(/[_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [runTour, setRunTour] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPersonaSelector, setShowPersonaSelector] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);

  const tourSteps: Step[] = [
    {
      target: '.tour-step-1',
      content: 'Welcome to OmniPitchAI! This is your Persona Hub. We automatically tailor the generated strategy deck to your role.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-2',
      content: 'This is the Zero-Prompt Engine. Drag and drop any zip file (code) or raw markdown docs. We handle the rest.',
    },
    {
      target: '.tour-step-3',
      content: 'Watch in real-time as our Multi-Agent LangGraph architecture extracts business value and builds your narrative.',
    },
    {
      target: '.tour-step-4',
      content: 'Once complete, download your fully-formatted, executive-ready Aisynch Labs Pitch Deck.',
    }
  ];

  useEffect(() => {
    // Only run tour once when a user logs in for the first time
    if (user && status === 'idle') {
      const hasSeenTour = localStorage.getItem('omnipitch_tour_seen');
      if (!hasSeenTour) {
        setRunTour(true);
        localStorage.setItem('omnipitch_tour_seen', 'true');
      }
    }
  }, [user, status]);

  // Check auth on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('omnipitch_token');
      if (token) {
        try {
          const userData = await getMe();
          if (userData) {
            setUser(userData);
          }
        } catch (e) {
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
      // Fallback dummy file if none is provided since API requires multipart
      const fileToUpload = data.file || new File(['No data'], 'dummy.txt', { type: 'text/plain' });

      const response = await uploadDocument(
        fileToUpload,
        data.topic,
        data.duration + ' minutes',
        data.audience || 'General Audience',
        data.sections || 'General overview',
        data.tone
      );
      setJobId(response.job_id);
      setStatus('processing');
      setCurrentStep('Parsing Context');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || "Failed to start generation.");
    }
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (jobId && status === 'processing') {
      intervalId = setInterval(async () => {
        try {
          const res = await checkStatus(jobId);
          setCurrentStep(res.current_step);

          if (res.status === 'completed') {
            setStatus('completed');
            clearInterval(intervalId);
          } else if (res.status === 'error') {
            setStatus('error');
            setErrorMsg(res.error_msg);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Error checking status", err);
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
    <div className="fixed inset-0 w-full flex flex-col overflow-hidden bg-slate-950 font-sans text-slate-200 selection:bg-indigo-500/30">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />

      {/* Top Bar Navigation */}
      <div className="h-[72px] w-full px-6 flex justify-between items-center z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
        {/* Left: Branding */}
        <div className="flex-1">
          <BrandLogo />
        </div>

        {/* Right: User Settings */}
        <div className="flex items-center space-x-6">
          <div className="tour-step-1 flex items-center space-x-3 text-slate-300 border-r border-white/10 pr-6">
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
                    setJobId(null);
                    setStatus('idle');
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
              setJobId(null);
              setStatus('idle');
              localStorage.removeItem('omnipitch_token');
            }}
            className="flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5 p-2 rounded-xl"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 w-full tour-step-2">
        {/* Left Sidebar (Hidden on mobile) */}
        <div className="hidden lg:block h-full">
          <LeftSidebar status={status} currentStep={currentStep} />
        </div>

        {/* Central Canvas */}
        <div className="flex-1 overflow-y-auto relative z-10 bg-slate-950/50">
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
            jobId={jobId}
            downloadUrl={jobId ? getDownloadUrl(jobId) : ''}
            onGenerate={handleGenerate}
          />
        </div>

      </div>

      {/* Footer */}
      <div className="h-12 w-full px-6 flex justify-between items-center text-slate-500 text-xs z-20 border-t border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
        <p>© 2026 Aisynch Labs</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
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
