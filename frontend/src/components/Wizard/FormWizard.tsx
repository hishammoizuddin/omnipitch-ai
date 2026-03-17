import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    ChevronRight,
    Code2,
    FileArchive,
    FileText,
    Image as ImageIcon,
    Sparkles,
    UploadCloud,
    X,
} from 'lucide-react';
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
    files: File[];
}

const ACCEPTED_SOURCE_TYPES = {
    'application/zip': ['.zip'],
    'text/markdown': ['.md', '.markdown'],
    'text/plain': [
        '.txt', '.py', '.ts', '.tsx', '.js', '.jsx', '.json', '.yaml', '.yml',
        '.toml', '.sql', '.html', '.css', '.scss', '.sh', '.env', '.xml'
    ],
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
} as const;

const MAX_FILES = 12;

const steps = [
    { id: 'topic', title: 'Topic & Audience' },
    { id: 'details', title: 'Duration & Tone' },
    { id: 'content', title: 'Context Packet' },
];

function formatFileSize(size: number) {
    if (size >= 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (size >= 1024) {
        return `${Math.round(size / 1024)} KB`;
    }
    return `${size} B`;
}

function getFileMeta(file: File) {
    const ext = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    if (ext === '.zip') {
        return { label: 'Archive', icon: FileArchive };
    }
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        return { label: 'Image', icon: ImageIcon };
    }
    if (['.py', '.ts', '.tsx', '.js', '.jsx', '.json', '.yaml', '.yml', '.toml', '.sql', '.html', '.css', '.scss', '.sh', '.env', '.xml'].includes(ext)) {
        return { label: 'Code / Config', icon: Code2 };
    }
    return { label: 'Document', icon: FileText };
}

function mergeFiles(existingFiles: File[], newFiles: File[]) {
    const seen = new Set(existingFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
    const merged = [...existingFiles];

    newFiles.forEach((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!seen.has(key) && merged.length < MAX_FILES) {
            merged.push(file);
            seen.add(key);
        }
    });

    return merged;
}

export function FormWizard({ onGenerate, isUploading }: FormWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [dropError, setDropError] = useState('');
    const [formData, setFormData] = useState<WizardData>({
        topic: '',
        audience: '',
        duration: '10',
        tone: 'Professional & Executive',
        sections: '',
        files: [],
    });

    const totalFileSize = formData.files.reduce((total, file) => total + file.size, 0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
            return;
        }

        onGenerate(formData);
    };

    const updateFormData = (field: keyof WizardData, value: string | File[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const removeFile = (fileToRemove: File) => {
        updateFormData(
            'files',
            formData.files.filter((file) => file !== fileToRemove)
        );
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles, fileRejections) => {
            setDropError('');

            if (fileRejections.length > 0) {
                setDropError(fileRejections[0].errors[0]?.message || 'Some files could not be added.');
            }

            if (acceptedFiles.length > 0) {
                updateFormData('files', mergeFiles(formData.files, acceptedFiles));
            }
        },
        accept: ACCEPTED_SOURCE_TYPES,
        maxFiles: MAX_FILES,
        multiple: true,
    });

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return formData.topic.trim().length > 0;
            case 1:
                return formData.duration.trim().length > 0 && formData.tone.trim().length > 0;
            case 2:
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-10 mt-2">
            <div className="grid gap-4 md:grid-cols-3 relative">
                <div className="absolute left-0 top-6 w-full h-[2px] bg-white/5 -z-10 hidden md:block" />
                <div
                    className="absolute left-0 top-6 h-[2px] bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 transition-all duration-500 ease-out -z-10 hidden md:block"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    return (
                        <div key={step.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
                            <div className="flex items-center gap-4">
                            <div
                                className={clsx(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shrink-0",
                                    isCompleted ? "bg-sky-400 border-sky-400 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.35)]" :
                                        isCurrent ? "bg-slate-900 border-sky-400 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.16)]" :
                                            "bg-slate-900 border-white/10 text-slate-500"
                                )}
                            >
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
                            </div>

                                <div className="min-w-0">
                                    <p
                                        className={clsx(
                                            "text-[10px] uppercase tracking-[0.22em] transition-colors duration-300",
                                            isCurrent ? "text-sky-200/80" : isCompleted ? "text-slate-400" : "text-slate-600"
                                        )}
                                    >
                                        Step {index + 1}
                                    </p>
                                    <span
                                        className={clsx(
                                            "mt-1 block text-sm font-medium transition-colors duration-300",
                                            isCurrent ? "text-white" : isCompleted ? "text-slate-200" : "text-slate-500"
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden relative min-h-[440px]">
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
                                    <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">What are we building?</h2>
                                    <p className="text-slate-400 text-sm mb-6">Start with the core topic so the deck has the right frame from the first slide.</p>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Topic / Company Name</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner text-lg"
                                        placeholder="e.g. Acme Corp platform modernization"
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
                                        placeholder="e.g. Board, enterprise buyers, internal leadership"
                                        value={formData.audience}
                                        onChange={(e) => updateFormData('audience', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && isStepValid()) nextStep(); }}
                                    />
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {['Angel Investors', 'Enterprise Leads', 'Internal Team', 'Board Review'].map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
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
                                    <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Shape the story</h2>
                                    <p className="text-slate-400 text-sm mb-6">Tune the deck length and voice before we assemble the context packet.</p>

                                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Target Duration</label>
                                    <div className="grid grid-cols-4 gap-3 mb-6">
                                        {['5', '10', '15', '30'].map((min) => (
                                            <button
                                                key={min}
                                                type="button"
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
                                            { id: 'Professional & Executive', desc: 'Direct, clear, and numbers-focused.' },
                                            { id: 'Visionary & Bold', desc: 'Big-picture, energetic, and high-conviction.' },
                                            { id: 'Technical & Deep', desc: 'Architecture-forward with stronger technical detail.' },
                                            { id: 'Story-Driven', desc: 'Narrative-led with pacing and emotional clarity.' },
                                        ].map((tone) => (
                                            <button
                                                key={tone.id}
                                                type="button"
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
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-2xl font-semibold text-white tracking-tight">Build the context packet</h2>
                                    <p className="text-slate-400 text-sm">
                                        Add any mix of source files plus optional notes. The deck can be generated from files, notes, or both.
                                    </p>
                                </div>

                                <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 flex-1">
                                    <div className="space-y-5">
                                        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Guidance for the AI</label>
                                            <textarea
                                                className="w-full h-28 bg-transparent border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-500/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner text-sm resize-none"
                                                placeholder="Call out priority themes, architecture wins, business outcomes, or anything that must appear in the final deck."
                                                value={formData.sections}
                                                onChange={(e) => updateFormData('sections', e.target.value)}
                                            />
                                            <p className="text-xs text-slate-500 mt-3">
                                                Good prompt example: “Focus on the AWS migration, platform reliability gains, and the ROI of automation.”
                                            </p>
                                        </div>

                                        <div
                                            {...getRootProps()}
                                            className={clsx(
                                                "rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 min-h-[220px] flex flex-col items-center justify-center",
                                                isDragActive ? "border-indigo-400 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.14)]" : "border-white/10 bg-slate-950/30 hover:border-white/25 hover:bg-white/[0.03]",
                                                formData.files.length > 0 ? "border-emerald-500/40 bg-emerald-500/[0.04]" : ""
                                            )}
                                        >
                                            <input {...getInputProps()} />
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <UploadCloud className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Drop source files here</h3>
                                            <p className="text-sm text-slate-400 max-w-md">
                                                Upload mixed inputs like zip archives, markdown, PDFs, Word docs, code files, and images in one generation.
                                            </p>
                                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                                {['ZIP', 'Markdown', 'PDF', 'DOCX', 'Code', 'Images'].map((label) => (
                                                    <span key={label} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-wide text-slate-300">
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-4">Up to {MAX_FILES} files per deck</p>
                                        </div>

                                        {dropError && (
                                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                                                {dropError}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-white">Context summary</p>
                                                <p className="text-xs text-slate-500 mt-1">What the AI will ingest for this run</p>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                                                {formData.files.length} file{formData.files.length === 1 ? '' : 's'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                                                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Total size</p>
                                                <p className="text-sm font-medium text-white">{formatFileSize(totalFileSize)}</p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                                                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Briefing</p>
                                                <p className="text-sm font-medium text-white">{formData.sections.trim() ? 'Included' : 'Using form inputs'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                                            {formData.files.length > 0 ? formData.files.map((file) => {
                                                const meta = getFileMeta(file);
                                                const Icon = meta.icon;

                                                return (
                                                    <div key={`${file.name}-${file.lastModified}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-3 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                                <Icon className="w-4 h-4 text-slate-300" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                                                <p className="text-xs text-slate-500 mt-1">{meta.label} • {formatFileSize(file.size)}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(file)}
                                                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center shrink-0"
                                                            aria-label={`Remove ${file.name}`}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            }) : (
                                                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5 text-sm text-slate-400 leading-relaxed">
                                                    No files added yet. You can still generate from your brief and presentation settings alone.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="pt-8 mt-auto border-t border-white/5 flex justify-between items-center bg-slate-900/40 -mx-8 -mb-8 px-8 py-5">
                    {currentStep > 0 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep((prev) => prev - 1)}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        type="button"
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
                                Starting generation...
                            </span>
                        ) : currentStep === steps.length - 1 ? (
                            <>
                                <Sparkles className="w-4 h-4 mr-1" />
                                <span>Generate Deck</span>
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
