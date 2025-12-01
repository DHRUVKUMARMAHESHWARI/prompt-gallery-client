
import React, { useState } from 'react';
import { X, Plus, Folder, Briefcase, Globe } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Space } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateSpaceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createSpace } = useStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<Space['type']>('PRIVATE');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createSpace(name, type);
    setName('');
    setType('PRIVATE');
    onClose();
  };

  if (!isOpen) return null;

  const types = [
    { id: 'PRIVATE', label: 'Private', icon: Folder, desc: 'Only you can see these prompts.' },
    { id: 'TEAM', label: 'Team', icon: Briefcase, desc: 'Share with a group via code.' },
    { id: 'PUBLIC', label: 'Public', icon: Globe, desc: 'Visible to everyone in discovery.' },
  ];

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
        className="relative w-[95%] md:w-full max-w-md bg-[#121218] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-semibold">Create New Space</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Space Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Marketing Team, Python Scripts"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Space Type</label>
                <div className="grid grid-cols-1 gap-2">
                    {types.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id as Space['type'])}
                            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                                type === t.id 
                                ? 'bg-neon-blue/10 border-neon-blue/50' 
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${type === t.id ? 'bg-neon-blue text-black' : 'bg-white/10 text-gray-400'}`}>
                                <t.icon size={18} />
                            </div>
                            <div>
                                <h4 className={`text-sm font-medium ${type === t.id ? 'text-white' : 'text-gray-300'}`}>{t.label}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleCreate}
                disabled={!name.trim()}
                className="px-6 py-2 rounded-xl font-medium bg-neon-blue text-black hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
                <Plus size={16} /> Create Space
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateSpaceModal;
