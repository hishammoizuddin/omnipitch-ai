import { useState } from 'react';
import {
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
const QUICK_AUDIENCES = ['Board', 'Leadership', 'Investors', 'Customers'];
const DURATIONS = ['5', '10', '15', '30'];
const TONES = ['Executive', 'Analytical', 'Technical', 'Persuasive'];

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
        return { label: 'Code', icon: Code2 };
    }

    return { label: 'Doc', icon: FileText };
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
    const [dropError, setDropError] = useState('');
    const [formData, setFormData] = useState<WizardData>({
        topic: '',
        audience: '',
        duration: '10',
        tone: 'Executive',
        sections: '',
        files: [],
    });

    const totalFileSize = formData.files.reduce((total, file) => total + file.size, 0);
    const canGenerate = formData.topic.trim().length > 0 && !isUploading;

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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!canGenerate) {
            return;
        }

        onGenerate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <section className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_24px_70px_rgba(24,38,31,0.06)] md:p-7">
                <div className="max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">New deck</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text)]">Start with the essentials.</h2>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                        One topic, one audience, optional notes, and any files you want the deck to use.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[color:var(--text)]">Topic</span>
                        <input
                            type="text"
                            autoFocus
                            value={formData.topic}
                            onChange={(e) => updateFormData('topic', e.target.value)}
                            className="w-full rounded-[24px] border border-[color:var(--border)] bg-[color:var(--input)] px-5 py-4 text-lg text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                            placeholder="Acme platform modernization"
                        />
                    </label>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
                        <div>
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[color:var(--text)]">Audience</span>
                                <input
                                    type="text"
                                    value={formData.audience}
                                    onChange={(e) => updateFormData('audience', e.target.value)}
                                    className="w-full rounded-[24px] border border-[color:var(--border)] bg-[color:var(--input)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                                    placeholder="Leadership"
                                />
                            </label>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {QUICK_AUDIENCES.map((audience) => (
                                    <button
                                        key={audience}
                                        type="button"
                                        onClick={() => updateFormData('audience', audience)}
                                        className="rounded-full border border-[color:var(--border)] bg-[color:var(--panel-soft)] px-3 py-1.5 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--text)]"
                                    >
                                        {audience}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="mb-2 block text-sm font-medium text-[color:var(--text)]">Length</span>
                            <div className="grid grid-cols-2 gap-2">
                                {DURATIONS.map((duration) => (
                                    <button
                                        key={duration}
                                        type="button"
                                        onClick={() => updateFormData('duration', duration)}
                                        className={clsx(
                                            'rounded-2xl border px-4 py-3 text-sm font-medium transition',
                                            formData.duration === duration
                                                ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-white'
                                                : 'border-[color:var(--border)] bg-[color:var(--panel-strong)] text-[color:var(--text)] hover:border-[color:var(--accent)]'
                                        )}
                                    >
                                        {duration} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="mb-2 block text-sm font-medium text-[color:var(--text)]">Tone</span>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            {TONES.map((tone) => (
                                <button
                                    key={tone}
                                    type="button"
                                    onClick={() => updateFormData('tone', tone)}
                                    className={clsx(
                                        'rounded-[22px] border px-4 py-3 text-left text-sm transition',
                                        formData.tone === tone
                                            ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                                            : 'border-[color:var(--border)] bg-[color:var(--panel-strong)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]'
                                    )}
                                >
                                    {tone}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[color:var(--text)]">Notes</span>
                        <textarea
                            value={formData.sections}
                            onChange={(e) => updateFormData('sections', e.target.value)}
                            className="h-32 w-full resize-none rounded-[24px] border border-[color:var(--border)] bg-[color:var(--input)] px-4 py-3 text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]"
                            placeholder="Optional: key themes, outcomes, or points that must be included."
                        />
                    </label>

                    <div
                        {...getRootProps()}
                        className={clsx(
                            'rounded-[28px] border border-dashed px-6 py-8 transition',
                            isDragActive
                                ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]'
                                : 'border-[color:var(--border)] bg-[color:var(--surface-muted)] hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-soft)]'
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--panel-strong)] text-[color:var(--accent)]">
                                <UploadCloud className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-lg font-medium text-[color:var(--text)]">Add files</p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">
                                Drop docs, PDFs, code, images, or zip files. You can also generate from the brief alone.
                            </p>
                            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                                up to {MAX_FILES} files
                            </p>
                        </div>
                    </div>

                    {dropError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {dropError}
                        </div>
                    ) : null}
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-[color:var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[color:var(--muted)]">
                        {formData.files.length > 0 ? `${formData.files.length} file${formData.files.length === 1 ? '' : 's'} ready` : 'No files yet'}
                    </p>
                    <button
                        type="submit"
                        disabled={!canGenerate}
                        className={clsx(
                            'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition',
                            canGenerate
                                ? 'bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-strong)]'
                                : 'cursor-not-allowed bg-[color:var(--surface-muted)] text-[color:var(--muted)]'
                        )}
                    >
                        {isUploading ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate deck
                            </>
                        )}
                    </button>
                </div>
            </section>

            <aside className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_24px_70px_rgba(24,38,31,0.05)]">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Summary</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[24px] bg-[color:var(--panel-strong)] px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Files</p>
                        <p className="mt-2 text-xl font-semibold text-[color:var(--text)]">{formData.files.length}</p>
                    </div>
                    <div className="rounded-[24px] bg-[color:var(--panel-strong)] px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Size</p>
                        <p className="mt-2 text-xl font-semibold text-[color:var(--text)]">{formatFileSize(totalFileSize)}</p>
                    </div>
                </div>

                <div className="mt-4 rounded-[24px] bg-[color:var(--panel-strong)] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Deck setup</p>
                    <div className="mt-3 space-y-2 text-sm text-[color:var(--text)]">
                        <p>{formData.audience || 'General audience'}</p>
                        <p>{formData.duration} min</p>
                        <p>{formData.tone}</p>
                    </div>
                </div>

                <div className="mt-4 rounded-[24px] bg-[color:var(--panel-strong)] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Files</p>
                    <div className="mt-3 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                        {formData.files.length > 0 ? formData.files.map((file) => {
                            const meta = getFileMeta(file);
                            const Icon = meta.icon;

                            return (
                                <div
                                    key={`${file.name}-${file.lastModified}`}
                                    className="flex items-start justify-between gap-3 rounded-2xl bg-[color:var(--surface-muted)] px-3 py-3"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--panel-strong)] text-[color:var(--accent)]">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-[color:var(--text)]">{file.name}</p>
                                            <p className="mt-1 text-xs text-[color:var(--muted)]">
                                                {meta.label} · {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(file)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--panel-strong)] text-[color:var(--muted)] transition hover:text-[color:var(--text)]"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        }) : (
                            <div className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
                                Add files if you have them. The deck can still be generated from the topic and notes alone.
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </form>
    );
}
