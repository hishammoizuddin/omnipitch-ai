import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Props {
    currentStep: string;
}

const STEPS = [
    "Parsing Architecture",
    "Extracting Business Value",
    "Structuring Narrative",
    "Formatting Custom JSON",
    "Completed"
];

export const ExecutionStepper: React.FC<Props> = ({ currentStep }) => {
    const currentIndex = STEPS.indexOf(currentStep) !== -1 ? STEPS.indexOf(currentStep) : 0;

    return (
        <div className="w-full max-w-2xl mx-auto mt-12 space-y-4 bg-white/5 backdrop-blur-2xl rounded-3xl md:p-10 p-6 border border-white/10 relative shadow-2xl">
            <h2 className="text-xl font-semibold tracking-tight text-center mb-10 text-white">Generation Progress</h2>
            <div className="relative">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex && step !== "Completed";
                    const isFinalCompleted = step === "Completed" && index === currentIndex;

                    let Icon = Circle;
                    let iconColor = "text-slate-600";
                    if (isCompleted || isFinalCompleted) {
                        Icon = CheckCircle2;
                        iconColor = "text-indigo-400";
                    } else if (isCurrent) {
                        Icon = Loader2;
                        iconColor = "text-blue-400 animate-spin";
                    }

                    return (
                        <div key={step} className="flex items-center mb-8 last:mb-0 relative group">
                            <div className="relative z-10 flex items-center justify-center bg-slate-900 rounded-full shadow-sm ring-4 ring-slate-900">
                                <Icon className={`w-7 h-7 ${iconColor} bg-slate-900`} />
                            </div>

                            <div className="ml-6 flex-1">
                                <motion.div
                                    initial={{ opacity: 0.5, x: -10 }}
                                    animate={{
                                        opacity: isCurrent || isCompleted || isFinalCompleted ? 1 : 0.4,
                                        x: isCurrent || isCompleted || isFinalCompleted ? 0 : -5
                                    }}
                                    className={`text-base font-medium transition-colors duration-300 ${isCurrent ? 'text-white' : isCompleted || isFinalCompleted ? 'text-slate-300' : 'text-slate-500'}`}
                                >
                                    {step}
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
                {/* Connecting Line */}
                <div className="absolute left-[13px] top-6 bottom-6 w-0.5 bg-white/10 -z-10 shrink-0 rounded-full"></div>
            </div>
        </div>
    );
};
