import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface UploadDropzoneProps {
    onUpload: (file: File, orgName: string, purpose: string, targetAudience: string, keyMessage: string, designVibe: string) => void;
    isUploading: boolean;
}

export function UploadDropzone({ onUpload, isUploading }: UploadDropzoneProps) {
    const [error, setError] = useState<string | null>(null);
    const [orgName, setOrgName] = useState('');
    const [purpose, setPurpose] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [keyMessage, setKeyMessage] = useState('');
    const [designVibe, setDesignVibe] = useState('');

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        setError(null);

        if (fileRejections.length > 0) {
            setError(fileRejections[0].errors[0].message);
            return;
        }

        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0], orgName, purpose, targetAudience, keyMessage, designVibe);
        }
    }, [onUpload, orgName, purpose, targetAudience, keyMessage, designVibe]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/zip': ['.zip'],
            'text/markdown': ['.md']
        },
        maxFiles: 1
    });

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-12">
            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Company Name</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm text-base"
                            placeholder="e.g. Aisynch Labs, Inc."
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Presentation Purpose</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm text-base"
                            placeholder="e.g. Q3 Investor Update"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Target Audience (Optional)</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm text-base"
                            placeholder="e.g. Non-technical VCs"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Key Message (Optional)</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm text-base"
                            placeholder="e.g. Focus on ROI and scale"
                            value={keyMessage}
                            onChange={(e) => setKeyMessage(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Design Vibe & Theme (Optional)</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm text-base"
                            placeholder="e.g. Google, Apple Monochrome, Cyberpunk, Classic Corporate..."
                            value={designVibe}
                            onChange={(e) => setDesignVibe(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div
                {...getRootProps()}
                className={clsx(
                    "relative border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all duration-300 ease-in-out backdrop-blur-xl bg-white/5",
                    isDragActive ? "border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]" : "border-white/10 hover:border-white/30 hover:bg-white/10 shadow-lg",
                    isUploading && "opacity-50 pointer-events-none"
                )}
            >
                <input {...getInputProps()} />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div className="mx-auto w-20 h-20 mb-6 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-sm">
                        <UploadCloud className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white tracking-tight">
                        Upload Architecture Data
                    </h3>
                    <p className="text-slate-400 text-base font-light">
                        Drag and drop your repository zip or markdown documentation here.
                    </p>
                    {error && (
                        <div className="mt-6 flex items-center justify-center text-red-400 bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl text-sm backdrop-blur-sm">
                            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                            {error}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
