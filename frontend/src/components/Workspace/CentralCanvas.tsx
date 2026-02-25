import { FormWizard } from '../Wizard/FormWizard';
import type { WizardData } from '../Wizard/FormWizard';
import { ExecutionStepper } from '../ExecutionStepper';
import { Download, RefreshCcw, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CentralCanvasProps {
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    currentStep: string;
    onGenerate: (data: WizardData) => void;
    jobId: string | null;
    downloadUrl: string;
}

export function CentralCanvas({ status, currentStep, onGenerate, downloadUrl }: CentralCanvasProps) {
    const isGenerating = status === 'processing' || status === 'completed';

    return (
        <div className="flex-1 flex flex-col bg-slate-950 px-8 lg:px-16 overflow-y-auto w-full max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
                {!isGenerating ? (
                    <motion.div
                        key="wizard"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="w-full m-auto py-8 lg:py-12 flex flex-col"
                    >
                        <div className="mb-8 pl-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create New Presentation</h1>
                            <p className="text-slate-400 text-sm font-light">Follow the steps below to configure your slide deck narrative and design.</p>
                        </div>
                        <FormWizard onGenerate={onGenerate} isUploading={status === 'uploading'} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full h-full flex flex-col pt-12 pb-24"
                    >
                        {/* Top Progress Indicator */}
                        <div className="mb-12">
                            <ExecutionStepper currentStep={currentStep} />
                        </div>

                        {/* Simulated Live Preview Area */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-full max-w-3xl aspect-[16/9] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative group">
                                {/* Simulated Content inside canvas */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                                    {status === 'completed' ? (
                                        <>
                                            <h2 className="text-4xl font-bold text-white mb-6">OmniPitch Initial AI Generation</h2>
                                            <p className="text-xl text-slate-400 max-w-lg mx-auto">Seamless architecture to executive narrative translation leveraging advanced LangGraph orchestration.</p>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
                                            <h2 className="text-2xl font-semibold text-slate-300">Generating Slides...</h2>
                                            <p className="text-slate-500 mt-2 text-sm">{currentStep || 'Analyzing inputs'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Per-slide actions overlay on hover */}
                                {status === 'completed' && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="bg-slate-950/80 hover:bg-slate-800 text-white p-2 rounded-lg border border-white/10 backdrop-blur tooltip transition-colors">
                                            <RefreshCcw className="w-4 h-4 text-slate-300" />
                                        </button>
                                        <button className="bg-slate-950/80 hover:bg-slate-800 text-white p-2 rounded-lg border border-white/10 backdrop-blur tooltip transition-colors">
                                            <Edit2 className="w-4 h-4 text-slate-300" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Actions if Completed */}
                            <AnimatePresence>
                                {status === 'completed' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-10"
                                    >
                                        <a
                                            href={downloadUrl}
                                            download
                                            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-semibold rounded-full shadow-xl shadow-white/5 transition-all hover:scale-105"
                                        >
                                            <Download className="w-5 h-5" />
                                            <span>Export .pptx</span>
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
