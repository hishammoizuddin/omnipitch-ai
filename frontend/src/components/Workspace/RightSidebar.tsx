import { useState } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';

export function RightSidebar() {
    const [inputText, setInputText] = useState('');

    const suggestions = [
        "Make the tone more formal",
        "Shorten slide 4",
        "Add a tech architecture diagram",
    ];

    return (
        <div className="w-80 flex-shrink-0 border-l border-white/10 bg-slate-950/80 backdrop-blur-3xl flex flex-col h-full rounded-tr-xl rounded-br-xl shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="text-sm font-semibold text-white tracking-wide">OmniPitch Copilot</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                <div className="flex space-x-3 items-start">
                    <div className="w-6 h-6 rounded-full border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 bg-indigo-500/10">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-300 font-light leading-relaxed border border-white/5">
                        Hi! I'm here to help you refine your deck. You can ask me to rewrite sections, change the tone, or elaborate on key points.
                    </div>
                </div>

                {/* Placeholder for future chat messages */}
            </div>

            {/* Suggestion Chips */}
            <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((chip, idx) => (
                        <button
                            key={idx}
                            className="text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>

            {/* Composer */}
            <div className="p-4 pt-2 mb-4">
                <div className="relative group">
                    <input
                        type="text"
                        className="w-full bg-slate-900 border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                        placeholder="Ask Copilot anything..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/25">
                        <Send className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
