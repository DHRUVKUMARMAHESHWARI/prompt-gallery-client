import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, Loader2, Save, Check, Variable } from 'lucide-react';
import { Prompt } from '../types';
import { useStore } from '../context/StoreContext';
import { enhancePrompt, generateVariations } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editPrompt?: Prompt;
}

const AddPromptModal: React.FC<Props> = ({ isOpen, onClose, editPrompt }) => {
  const { addPrompt, updatePrompt, spaces, activeSpaceId, useAICredit, user } = useStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [incrementVersion, setIncrementVersion] = useState(false);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  const aiCredits = user?.aiCredits ?? 0;

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      if (editPrompt) {
        setTitle(editPrompt.title || '');
        setContent(editPrompt.content || '');
        setSelectedSpace(editPrompt.spaceId || '');
        setTags(editPrompt.tags || []);
      } else {
        setTitle('');
        setContent('');
        
        // Defensive check: ensure spaces array exists and has items
        const defaultSpaceId = 
          spaces && spaces.length > 0 && activeSpaceId !== 'all' && activeSpaceId !== 'favorites'
            ? activeSpaceId
            : spaces && spaces.length > 0
            ? spaces[0]?.id
            : '';
        
        setSelectedSpace(defaultSpaceId);
        setTags([]);
      }
      setVariations([]);
      setIncrementVersion(false);
    }
  }, [isOpen, editPrompt, activeSpaceId, spaces]);

  // Real-time variable detection
  useEffect(() => {
    const extractVariables = (text: string) => {
        const regex = /\[(.*?)\]/g;
        const matches = text.match(regex);
        if (!matches) return [];
        // Remove brackets and deduplicate
        return [...new Set(matches.map(m => m.slice(1, -1)))];
    };
    setDetectedVariables(extractVariables(content));
  }, [content]);

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !selectedSpace) {
      alert('Please fill in all required fields');
      return;
    }

    if (editPrompt) {
      updatePrompt(editPrompt.id, {
        title,
        content,
        spaceId: selectedSpace,
        tags,
        version: incrementVersion ? (editPrompt.version || 0) + 1 : editPrompt.version,
        variables: detectedVariables
      });
    } else {
      addPrompt({
        title,
        content,
        description: 'User created prompt',
        spaceId: selectedSpace,
        tags,
        variables: detectedVariables, 
      });
    }
    onClose();
  };

  const handleMagicEnhance = async () => {
    if (!content.trim()) return;
    if (aiCredits <= 0) {
        alert("Daily AI limit reached!");
        return;
    }

    setIsAiLoading(true);
    try {
      // Deduct credit first
      const authorized = await useAICredit();
      if (!authorized) {
          alert("Daily AI limit reached!");
          return;
      }
      
      const result = await enhancePrompt(content);
      if (result) {
        setContent(result.optimized || content);
        setTags([...new Set([...tags, ...(result.tags || [])])]);
      }
    } catch (error) {
      console.error('Enhance error:', error);
      alert('Failed to enhance prompt');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateVariations = async () => {
      if (!content.trim()) return;
      if (aiCredits <= 0) {
        alert("Daily AI limit reached!");
        return;
      }

      setIsAiLoading(true);
      try {
          const authorized = await useAICredit();
          if (!authorized) {
            alert("Daily AI limit reached!");
            return;
          }

          const vars = await generateVariations(content);
          setVariations(vars || []);
      } catch (error) {
        console.error('Variations error:', error);
        alert('Failed to generate variations');
      } finally {
          setIsAiLoading(false);
      }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && currentTag.trim()) {
          e.preventDefault();
          if (!tags.includes(currentTag)) {
              setTags([...tags, currentTag]);
          }
          setCurrentTag('');
      }
  }

  if (!isOpen) return null;

  // Ensure spaces is not undefined
  const safeSpaces = spaces || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-[95%] md:w-full max-w-2xl bg-[#121218] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-white/5 shrink-0">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                {editPrompt ? 'Edit Prompt' : 'New Prompt'}
                {isAiLoading && <Loader2 className="animate-spin text-neon-blue" size={16} />}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Space Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Space</label>
                {safeSpaces.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {safeSpaces.map(space => (
                        <button
                            key={space?.id}
                            onClick={() => setSelectedSpace(space?.id || '')}
                            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                selectedSpace === space?.id 
                                ? `bg-white text-black` 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {space?.name || 'Unnamed'}
                        </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No spaces available. Create one first.</div>
                )}
            </div>

            {/* Inputs */}
            <div className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Prompt Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-xl md:text-2xl font-bold placeholder-gray-600 border-none outline-none focus:ring-0 p-0"
                />
                
                <div className="relative">
                     <textarea 
                        placeholder="Paste your raw prompt here... Use [brackets] for variables."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-40 bg-black/20 rounded-xl border border-white/10 p-4 text-sm font-mono focus:border-neon-blue/50 outline-none resize-none transition-colors leading-relaxed"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-gray-400 mr-2">
                             <Sparkles size={10} className={aiCredits > 0 ? "text-neon-blue" : "text-red-500"} />
                             Credits: {aiCredits}/20
                        </div>
                        <button 
                            onClick={handleGenerateVariations}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                aiCredits > 0 && content
                                ? 'bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20' 
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }`}
                            disabled={isAiLoading || !content || aiCredits <= 0}
                        >
                            <Sparkles size={12} /> <span className="hidden sm:inline">Variations</span>
                        </button>
                        <button 
                            onClick={handleMagicEnhance}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                aiCredits > 0 && content
                                ? 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20' 
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }`}
                            disabled={isAiLoading || !content || aiCredits <= 0}
                        >
                            <Wand2 size={12} /> <span className="hidden sm:inline">AI Enhance</span>
                        </button>
                    </div>
                </div>

                {/* Detected Variables */}
                {detectedVariables.length > 0 && (
                     <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Variable size={14} className="text-neon-green" />
                        <span>Detected variables:</span>
                        <div className="flex gap-2">
                             {detectedVariables.map(v => (
                                 <span key={v} className="bg-neon-green/10 text-neon-green px-2 py-0.5 rounded font-mono border border-neon-green/20">
                                     [{v}]
                                 </span>
                             ))}
                        </div>
                     </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/5">
                    {tags.map(tag => (
                        <span key={tag} className="bg-white/10 text-xs px-2 py-1 rounded flex items-center gap-1">
                            #{tag}
                            <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-400"><X size={10} /></button>
                        </span>
                    ))}
                    <input 
                        type="text" 
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder={tags.length === 0 ? "Add tags (press enter)..." : "Add..."}
                        className="bg-transparent text-sm outline-none placeholder-gray-500 min-w-[100px] flex-1"
                    />
                </div>
            </div>

            {/* Variations Output */}
            <AnimatePresence>
            {variations.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-4 border-t border-white/10"
                >
                    <h3 className="text-sm font-semibold text-gray-400">AI Suggestions</h3>
                    <div className="grid gap-3">
                        {variations.map((v, i) => (
                            <div key={i} className="bg-white/5 p-3 rounded-lg text-xs font-mono text-gray-300 hover:bg-white/10 cursor-pointer" onClick={() => setContent(v)}>
                                {v}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-white/5 bg-white/5 flex flex-col-reverse md:flex-row items-center justify-between gap-3 shrink-0">
             {editPrompt && editPrompt.id ? (
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors select-none group w-full md:w-auto">
                    <div className={`w-5 h-5 rounded border border-white/20 flex items-center justify-center transition-all ${incrementVersion ? 'bg-neon-blue border-neon-blue' : 'bg-black/20 group-hover:border-white/40'}`}>
                        {incrementVersion && <Check size={12} className="text-black" />}
                    </div>
                     <input 
                        type="checkbox" 
                        checked={incrementVersion}
                        onChange={(e) => setIncrementVersion(e.target.checked)}
                        className="hidden"
                    />
                    <span>Save as <span className="font-mono text-neon-blue font-bold">v{(editPrompt.version || 0) + 1}</span></span>
                </label>
             ) : (
                 <div className="hidden md:block"/>
             )}

             <div className="flex gap-3 w-full md:w-auto">
                <button onClick={onClose} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-medium text-gray-400 hover:bg-white/5 transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={!title || !content || !selectedSpace}
                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-neon-blue to-neon-purple text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    Save
                </button>
             </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddPromptModal;
