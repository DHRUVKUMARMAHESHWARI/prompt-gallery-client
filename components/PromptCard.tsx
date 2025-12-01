
import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Star, Edit2, Trash2, Check, GitBranch, Zap, Terminal, Maximize2, Minimize2, Settings2, Play, X, Loader2, Sparkles } from 'lucide-react';
import { Prompt, Space } from '../types';
import { useStore } from '../context/StoreContext';
import { runPrompt } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptCardProps {
  prompt: Prompt;
  space?: Space;
  onEdit: (p: Prompt) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, space, onEdit }) => {
  const { toggleFavorite, deletePrompt, useAICredit, user } = useStore();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copyMode, setCopyMode] = useState<'RAW' | 'COMPILED'>('COMPILED');
  
  // Runner State
  const [isRunning, setIsRunning] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [runOutput, setRunOutput] = useState('');

  const aiCredits = user?.aiCredits ?? 0;

  // Parse text to identify static parts and variables
  const parsedContent = useMemo(() => {
    const parts = prompt.content.split(/(\[.*?\])/g);
    return parts.map((part, index) => {
      const isVariable = part.startsWith('[') && part.endsWith(']');
      return {
        id: index,
        text: part,
        isVariable,
        varName: isVariable ? part.slice(1, -1) : null
      };
    });
  }, [prompt.content]);

  // Check if we have variables to fill
  const hasVariables = parsedContent.some(p => p.isVariable);

  // Initialize variable inputs
  useEffect(() => {
     // If expanded and we have variables, default copy mode to compiled, else raw
     setCopyMode(hasVariables ? 'COMPILED' : 'RAW');
  }, [hasVariables, expanded]);

  const getCompiledText = () => {
      return parsedContent.map(part => {
        if (part.isVariable && part.varName) {
          return variableValues[part.varName] || part.text;
        }
        return part.text;
      }).join('');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    let textToCopy = prompt.content;

    if (copyMode === 'COMPILED' && hasVariables) {
      textToCopy = getCompiledText();
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isRunning) return;

      if (aiCredits <= 0) {
          setRunOutput("Daily AI Credits limit reached (20/20).");
          setShowTerminal(true);
          return;
      }
      
      const textToRun = hasVariables ? getCompiledText() : prompt.content;
      
      setIsRunning(true);
      setShowTerminal(true);
      setRunOutput(''); // Clear previous

      try {
          // Check Credits first
          const authorized = await useAICredit();
          if (!authorized) {
              setRunOutput("Daily AI Credits limit reached.");
              return;
          }

          const result = await runPrompt(textToRun);
          setRunOutput(result);
      } catch (err) {
          setRunOutput("Error executing prompt.");
      } finally {
          setIsRunning(false);
      }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(prompt.id);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative group rounded-2xl transition-all duration-300 border
        ${expanded 
          ? 'bg-[#121218] border-neon-blue/30 shadow-[0_0_30px_rgba(0,243,255,0.1)] z-40 col-span-1 md:col-span-2' 
          : 'bg-[#0f0f13] border-white/5 hover:border-white/10 hover:bg-[#15151a]'
        }
      `}
    >
        {/* Cyberpunk Decor */}
        <div className={`absolute top-0 left-0 w-3 h-3 border-l border-t transition-colors duration-300 rounded-tl-lg ${expanded ? 'border-neon-blue' : 'border-white/10 group-hover:border-white/30'}`} />
        <div className={`absolute top-0 right-0 w-3 h-3 border-r border-t transition-colors duration-300 rounded-tr-lg ${expanded ? 'border-neon-blue' : 'border-white/10 group-hover:border-white/30'}`} />
        <div className={`absolute bottom-0 left-0 w-3 h-3 border-l border-b transition-colors duration-300 rounded-bl-lg ${expanded ? 'border-neon-blue' : 'border-white/10 group-hover:border-white/30'}`} />
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-r border-b transition-colors duration-300 rounded-br-lg ${expanded ? 'border-neon-blue' : 'border-white/10 group-hover:border-white/30'}`} />

        <div className="p-5 flex flex-col h-full" onClick={() => !expanded && setExpanded(true)}>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-lg truncate transition-colors ${expanded ? 'text-neon-blue' : 'text-gray-100 group-hover:text-white'}`}>
                            {prompt.title}
                        </h3>
                        <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded px-1.5 py-0.5">
                           <GitBranch size={10} className="text-gray-500" />
                           <span className="text-[10px] font-mono text-gray-400">v{prompt.version}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {space && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                <span className={`w-1.5 h-1.5 rounded-full ${space.type === 'PRIVATE' ? 'bg-gray-400' : 'bg-neon-purple'}`} />
                                {space.name}
                            </span>
                        )}
                        <span>{new Date(prompt.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                     <button 
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                    >
                        {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button 
                        onClick={handleFavorite}
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${prompt.isFavorite ? 'text-yellow-400' : 'text-gray-500'}`}
                    >
                        <Star size={18} fill={prompt.isFavorite ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className={`
                relative rounded-xl border transition-all duration-300 overflow-hidden mb-4
                ${expanded ? 'bg-[#08080a] border-white/10 p-4' : 'bg-black/20 border-transparent p-3'}
            `}>
                <div className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${expanded ? 'text-gray-300' : 'text-gray-400 line-clamp-3'}`}>
                    {parsedContent.map((part) => (
                        <span key={part.id}>
                            {part.isVariable ? (
                                expanded ? (
                                    <span className="inline-block mx-1 relative top-0.5">
                                        <input 
                                            type="text"
                                            placeholder={part.varName || 'VAR'}
                                            value={variableValues[part.varName!] || ''}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setVariableValues(prev => ({...prev, [part.varName!]: e.target.value}))}
                                            className="bg-neon-blue/10 border border-neon-blue/30 text-neon-blue placeholder-neon-blue/30 rounded px-2 py-0.5 text-xs outline-none focus:border-neon-blue focus:bg-neon-blue/20 min-w-[80px] text-center font-bold"
                                        />
                                    </span>
                                ) : (
                                    <span className="text-neon-blue bg-neon-blue/5 border border-neon-blue/10 px-1.5 rounded text-xs font-bold mx-0.5">
                                        {part.text}
                                    </span>
                                )
                            ) : (
                                <span className={expanded ? "text-gray-300" : ""}>{part.text}</span>
                            )}
                        </span>
                    ))}
                </div>
                
                {/* Fade overlay if not expanded */}
                {!expanded && (
                     <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0f0f13] to-transparent pointer-events-none" />
                )}
            </div>

            {/* Variable Fill Area (Only if expanded and has variables) */}
            <AnimatePresence>
                {expanded && hasVariables && !showTerminal && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                         <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                                    <Terminal size={12} /> Variable Inputs
                                </span>
                                <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setCopyMode('RAW'); }}
                                        className={`px-2 py-0.5 text-[10px] rounded-md transition-all ${copyMode === 'RAW' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                                    >
                                        Raw
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setCopyMode('COMPILED'); }}
                                        className={`px-2 py-0.5 text-[10px] rounded-md transition-all ${copyMode === 'COMPILED' ? 'bg-neon-blue/20 text-neon-blue' : 'text-gray-500'}`}
                                    >
                                        Compiled
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {parsedContent.filter(p => p.isVariable).map(p => {
                                    // Deduplicate inputs based on varName
                                    if(!p.varName) return null;
                                    return (
                                        <div key={p.id} className="flex items-center gap-2 bg-black/20 px-2 py-1.5 rounded border border-white/5">
                                            <span className="text-xs font-mono text-neon-blue opacity-70 shrink-0">[{p.varName}]</span>
                                            <input 
                                                type="text"
                                                className="bg-transparent border-none text-xs text-white outline-none w-full"
                                                placeholder="Value..."
                                                value={variableValues[p.varName] || ''}
                                                onChange={(e) => setVariableValues(prev => ({...prev, [p.varName!]: e.target.value}))}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Terminal Output Window */}
            <AnimatePresence>
                {expanded && showTerminal && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner"
                    >
                         <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5">
                            <span className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                                <Terminal size={10} className="text-neon-green" /> 
                                AI_RUNNER_V1.0
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <Sparkles size={10} className={aiCredits > 0 ? "text-neon-purple" : "text-red-500"} />
                                    {aiCredits} Credits left
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowTerminal(false); }}
                                    className="text-gray-500 hover:text-white"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                         </div>
                         <div className="p-4 font-mono text-xs text-gray-300 max-h-[200px] overflow-y-auto custom-scrollbar">
                             {isRunning ? (
                                 <div className="flex items-center gap-2 text-neon-blue">
                                     <Loader2 size={14} className="animate-spin" />
                                     <span>Executing prompt...</span>
                                 </div>
                             ) : (
                                 <div className="whitespace-pre-wrap">
                                     <span className="text-neon-green/50 mr-2">$</span>
                                     {runOutput}
                                 </div>
                             )}
                         </div>
                         {!isRunning && runOutput && (
                             <div className="px-3 py-2 border-t border-white/5 bg-white/[0.02] flex justify-end">
                                 <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(runOutput);
                                    }}
                                    className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                                 >
                                     <Copy size={10} /> Copy Output
                                 </button>
                             </div>
                         )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                 <div className="flex gap-2">
                     {prompt.tags.slice(0, expanded ? 10 : 3).map(tag => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5 hover:border-white/20 transition-colors cursor-default">
                            #{tag}
                        </span>
                     ))}
                     {!expanded && prompt.tags.length > 3 && (
                         <span className="text-[10px] px-1.5 py-1 text-gray-500">+{prompt.tags.length - 3}</span>
                     )}
                 </div>

                 <div className="flex items-center gap-2">
                     <AnimatePresence>
                         {expanded && (
                             <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex gap-1 mr-2"
                             >
                                <button onClick={(e) => { e.stopPropagation(); onEdit(prompt); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); deletePrompt(prompt.id); }} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                             </motion.div>
                         )}
                     </AnimatePresence>
                     
                     {expanded && (
                         <button 
                            onClick={handleRun}
                            disabled={isRunning || aiCredits <= 0}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all duration-300
                                ${isRunning
                                    ? 'bg-neon-purple/10 text-neon-purple cursor-wait'
                                    : aiCredits <= 0 
                                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                        : 'bg-white/10 text-white hover:bg-neon-purple hover:text-white'
                                }
                            `}
                        >
                            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                            {isRunning ? 'Running' : 'Run'}
                        </button>
                     )}

                     <button 
                        onClick={handleCopy}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 shadow-lg
                            ${copied 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-white text-black hover:scale-105 active:scale-95'
                            }
                        `}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied' : (hasVariables && copyMode === 'COMPILED' && expanded ? 'Copy Result' : 'Copy')}
                    </button>
                 </div>
            </div>
        </div>
    </motion.div>
  );
};

export default PromptCard;
