import { useState, useEffect } from 'react';
import { UploadDropzone } from './components/UploadDropzone';
import { ExecutionStepper } from './components/ExecutionStepper';
import { uploadDocument, checkStatus, getDownloadUrl, getMe } from './api/client';
import { Download, AlertCircle, LogOut } from 'lucide-react';
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

  const handleUpload = async (file: File, orgName: string, purpose: string, targetAudience: string, keyMessage: string, designVibe: string) => {
    try {
      setStatus('uploading');
      setErrorMsg(null);
      const response = await uploadDocument(file, orgName, purpose, targetAudience, keyMessage, designVibe);
      setJobId(response.job_id);
      setStatus('processing');
      setCurrentStep('Parsing Architecture');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || "Failed to upload document.");
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-950 font-sans text-slate-200 selection:bg-indigo-500/30">
      {/* Subtle Apple-like background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            primaryColor: '#64748b',
            backgroundColor: '#0a0a0a',
            arrowColor: '#0a0a0a',
            textColor: '#cbd5e1',
            overlayColor: 'rgba(0, 0, 0, 0.9)'
          },
          tooltipContainer: {
            textAlign: 'left'
          },
          buttonNext: {
            backgroundColor: '#334155'
          },
          buttonBack: {
            color: '#64748b'
          }
        }}
      />

      {/* Top Bar Navigation */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 pointer-events-none">

        {/* Left: Branding */}
        <div className="flex-1">
          <BrandLogo />
        </div>

        {/* Right: User Settings */}
        <div className="flex items-center space-x-6 pointer-events-auto bg-slate-900/40 backdrop-blur-xl border border-white/10 pr-2 pl-4 py-2 rounded-full shadow-lg">
          <div className="tour-step-1 flex items-center space-x-3 text-slate-300 border-r border-white/10 pr-6">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-sm backdrop-blur-md">
              <span className="font-semibold text-slate-200">{user.first_name ? user.first_name.charAt(0) : user.email?.charAt(0)}</span>
            </div>
            <div className="text-sm">
              <p className="text-slate-400 text-xs">Logged in as</p>
              <p className="font-medium text-slate-100 leading-tight">{user.first_name || user.email}</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-[11px] text-slate-400 font-medium">
                  {formatPersona(user.persona)} Persona
                </p>
                <button
                  onClick={() => {
                    setShowPersonaSelector(true);
                    setJobId(null);
                    setStatus('idle');
                  }}
                  className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-slate-300 transition-colors shadow-sm"
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
      <div className="max-w-4xl w-full z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-300 tracking-wide">OmniPitchAI is ready</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-sm">
            Architecture, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">explained.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-4 font-light">
            Instantly translate raw code and architectures into executive narratives. <br className="hidden sm:block" /> Perfected for the C-Suite.
          </p>
        </motion.div>

        <div className="tour-step-2">
          <AnimatePresence mode="wait">
            {(status === 'idle' || status === 'uploading' || (status === 'error' && !jobId)) && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <UploadDropzone onUpload={handleUpload} isUploading={status === 'uploading'} />
              </motion.div>
            )}

            {(status === 'processing' || status === 'completed') && (
              <motion.div
                key="stepper"
                className="tour-step-3"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ExecutionStepper currentStep={currentStep} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center text-red-400 backdrop-blur-sm shadow-sm text-sm"
          >
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            <p>{errorMsg}</p>
          </motion.div>
        )}

        {status === 'completed' && jobId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="tour-step-4 mt-16 text-center"
          >
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={getDownloadUrl(jobId)}
              download
              className="inline-flex items-center px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 text-base font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5 mr-3" />
              Download Presentation
            </motion.a>
            <div className="mt-8">
              <button
                onClick={() => { setJobId(null); setStatus('idle'); setCurrentStep(''); }}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Generate Another Document
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-6 flex justify-between items-center text-slate-500 text-xs z-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-md">
        <p>© 2026 Aisynch Labs</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
        </div>
      </div>
    </div>
  );
}

export default App;
