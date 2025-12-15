import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, X, HelpCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UsageSignalToastProps {
    visible: boolean;
    onSignal: (signal: 'THUMBS_UP' | 'THUMBS_DOWN' | 'NOT_SURE', note?: string) => void;
    onDismiss: () => void;
}

const UsageSignalToast: React.FC<UsageSignalToastProps> = ({ visible, onSignal, onDismiss }) => {
    const [step, setStep] = useState<'VOTE' | 'NOTE'>('VOTE');
    const [selectedSignal, setSelectedSignal] = useState<'THUMBS_UP' | 'THUMBS_DOWN' | null>(null);
    const [note, setNote] = useState('');

    // Reset state when visibility changes
    useEffect(() => {
        if (!visible) {
            const t = setTimeout(() => {
                setStep('VOTE');
                setSelectedSignal(null);
                setNote('');
            }, 300); // Reset after exit animation
            return () => clearTimeout(t);
        }
    }, [visible]);

    const handleVote = (signal: 'THUMBS_UP' | 'THUMBS_DOWN' | 'NOT_SURE') => {
        if (signal === 'NOT_SURE') {
            onSignal('NOT_SURE'); // Immediate submit for this one
            return;
        }
        setSelectedSignal(signal);
        setStep('NOTE');
    };

    const handleSubmitNote = () => {
        if (selectedSignal) {
            onSignal(selectedSignal, note);
        }
    };

    const handleSkipNote = () => {
        if (selectedSignal) {
            onSignal(selectedSignal); // Submit without note
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
                >
                    <div className="bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl p-4 w-[320px] backdrop-blur-xl">
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-white">
                                {step === 'VOTE' ? "Did this prompt work?" : "Optional Feedback"}
                            </h4>
                            <button
                                onClick={onDismiss}
                                className="text-gray-500 hover:text-white transition-colors -mt-1 -mr-1 p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {step === 'VOTE' ? (
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    onClick={() => handleVote('THUMBS_UP')}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40 py-2 rounded-lg transition-all text-sm font-medium"
                                >
                                    <ThumbsUp size={16} /> Yes
                                </button>
                                <button
                                    onClick={() => handleVote('THUMBS_DOWN')}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 py-2 rounded-lg transition-all text-sm font-medium"
                                >
                                    <ThumbsDown size={16} /> No
                                </button>
                                <button
                                    onClick={() => handleVote('NOT_SURE')}
                                    className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    title="Not sure"
                                >
                                    <HelpCircle size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mt-1">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder={selectedSignal === 'THUMBS_UP' ? "Ex: Great for API debugging!" : "Ex: Too generic, returned 404..."}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitNote()}
                                />
                                <div className="flex items-center justify-end gap-2 mt-1">
                                    <button
                                        onClick={handleSkipNote}
                                        className="text-xs text-gray-500 hover:text-white px-2 py-1 transition-colors"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={handleSubmitNote}
                                        className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                                    >
                                        Send <Send size={10} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UsageSignalToast;
