import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UploadCloud, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';

interface FormWizardProps {
    onGenerate: (data: WizardData) => void;
    isUploading: boolean;
}

export interface WizardData {
    topic: string;
    audience: string;
    duration: string;
    tone: string;
    sections: string;
    file?: File;
}

const steps = [
    { id: 'topic', title: 'Topic & Audience' },
    { id: 'details', title: 'Duration & Tone' },
    { id: 'content', title: 'Context & Assets' },
];

export function FormWizard({ onGenerate, isUploading }: FormWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<WizardData>({
        topic: '',
        audience: '',
        duration: '10',
        tone: 'Professional & Executive',
        sections: '',
    });

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onGenerate(formData);
        }
    };

    const updateFormData = (field: keyof WizardData, value: string | File) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                updateFormData('file', acceptedFiles[0]);
            }
        },
        accept: {
            'application/zip': ['.zip'],
            'text/markdown': ['.md'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    const isStepValid = () => {
        switch (currentStep) {
            case 0: return formData.topic.trim().length > 0;
            case 1: return formData.duration.trim().length > 0 && formData.tone.trim().length > 0;
            case 2: return true; // Optional content
            default: return false;
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 mt-12">
            {/* Stepper Progress */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 -z-10" />
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-500 transition-all duration-500 ease-out -z-10"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isCompleted ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" :
                                        isCurrent ? "bg-slate-900 border-indigo-400 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]" :
                                            "bg-slate-900 border-white/10 text-slate-500"
                                )}
                            >
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
                            </div>
                            <span className={clsx(
                                "mt-3 text-xs font-medium absolute -bottom-6 w-32 text-center transition-colors duration-300",
                                isCurrent ? "text-indigo-300" : isCompleted ? "text-slate-300" : "text-slate-500"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Form Area */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative min-h-[400px]">
                <AnimatePresence mode="wait" custom={currentStep}>
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-6 flex flex-col h-full"
                    >
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">What are we pitching?</h2>
                                    <p className="text-slate-400 text-sm mb-6">Describe the core idea or product.</p>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Topic / Company Name</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner text-lg"
                                        placeholder="e.g. Acme Corp Q3 Series B Deck"
                                        value={formData.topic}
                                        onChange={(e) => updateFormData('topic', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && isStepValid()) nextStep(); }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Target Audience</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner text-base"
                                        placeholder="e.g. Non-technical VCs, Enterprise Clients..."
                                        value={formData.audience}
                                        onChange={(e) => updateFormData('audience', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && isStepValid()) nextStep(); }}
                                    />
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {['Angel Investors', 'Enterprise Leads', 'Internal Team'].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => updateFormData('audience', tag)}
                                                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 whitespace-nowrap transition-colors"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Format details</h2>
                                    <p className="text-slate-400 text-sm mb-6">How long do you have, and what's the vibe?</p>

                                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Target Duration (Minutes) / Slide Count</label>
                                    <div className="grid grid-cols-4 gap-3 mb-6">
                                        {['5', '10', '15', '30'].map(min => (
                                            <button
                                                key={min}
                                                onClick={() => updateFormData('duration', min)}
                                                className={clsx(
                                                    "py-3 rounded-xl border transition-all text-center font-medium",
                                                    formData.duration === min
                                                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                                                        : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                                                )}
                                            >
                                                {min}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Tone & Voice</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'Professional & Executive', desc: 'Direct, clear, numbers-focused' },
                                            { id: 'Visionary & Bold', desc: 'Inspirational, futuristic, big picture' },
                                            { id: 'Technical & Deep', desc: 'Detailed, precise, architecture-first' },
                                            { id: 'Story-Driven', desc: 'Narrative focused, emotional appeal' }
                                        ].map(tone => (
                                            <button
                                                key={tone.id}
                                                onClick={() => updateFormData('tone', tone.id)}
                                                className={clsx(
                                                    "p-4 rounded-xl border transition-all text-left",
                                                    formData.tone === tone.id
                                                        ? "bg-indigo-500/10 border-indigo-500/50 text-white"
                                                        : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                                                )}
                                            >
                                                <div className="font-medium mb-1">{tone.id}</div>
                                                <div className="text-xs opacity-70">{tone.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 h-full flex flex-col">
                                <div>
                                    <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Any references?</h2>
                                    <p className="text-slate-400 text-sm mb-4">Provide key talking points or upload source materials (code dicts, raw markdown).</p>

                                    <textarea
                                        className="w-full h-24 bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner text-sm resize-none"
                                        placeholder="Specific sections to include? E.g., 'Make sure to cover the Q2 architecture migration, the ROI of new AWS services, and the team.' (Optional)"
                                        value={formData.sections}
                                        onChange={(e) => updateFormData('sections', e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 mt-2">
                                    <div
                                        {...getRootProps()}
                                        className={clsx(
                                            "h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300",
                                            isDragActive ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/5",
                                            formData.file ? "border-emerald-500/50 bg-emerald-500/5" : ""
                                        )}
                                    >
                                        <input {...getInputProps()} />
                                        {formData.file ? (
                                            <div className="flex flex-col items-center text-emerald-400">
                                                <CheckCircle2 className="w-10 h-10 mb-2 opacity-80" />
                                                <span className="font-medium text-sm">{formData.file.name}</span>
                                                <span className="text-xs mt-1 opacity-70">Ready to ingest</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400">
                                                <UploadCloud className="w-8 h-8 mb-3 opacity-70" />
                                                <span className="font-medium text-sm text-slate-300">Drop reference material</span>
                                                <span className="text-xs mt-1">.zip, .md, or .pdf (Optional)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Navigation */}
                <div className="pt-8 mt-auto border-t border-white/5 flex justify-between items-center bg-slate-900/40 -mx-8 -mb-8 px-8 py-5">
                    {currentStep > 0 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <div /> // Placeholder
                    )}

                    <button
                        onClick={nextStep}
                        disabled={!isStepValid() || isUploading}
                        className={clsx(
                            "flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-lg",
                            !isStepValid() || isUploading
                                ? "bg-white/5 text-slate-500 cursor-not-allowed"
                                : currentStep === steps.length - 1
                                    ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                                    : "bg-white hover:bg-slate-200 text-slate-900 hover:-translate-y-0.5"
                        )}
                    >
                        {isUploading ? (
                            <span className="flex items-center">
                                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white/20 border-t-white rounded-full" />
                                Initializing...
                            </span>
                        ) : currentStep === steps.length - 1 ? (
                            <>
                                <Sparkles className="w-4 h-4 mr-1" />
                                <span>Generate PPT</span>
                            </>
                        ) : (
                            <>
                                <span>Continue</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
