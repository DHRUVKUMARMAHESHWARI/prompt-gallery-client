
import React, { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Space } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  space: Space;
}

const EditSpaceModal: React.FC<Props> = ({ isOpen, onClose, space }) => {
  const { updateSpace, deleteSpace } = useStore();
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description || '');

  useEffect(() => {
    if (isOpen) {
        setName(space.name);
        setDescription(space.description || '');
    }
  }, [isOpen, space]);

  const handleSave = async () => {
      await updateSpace(space.id, name, description);
      onClose();
  };

  const handleDelete = async () => {
      if (confirm('Are you sure you want to delete this space? All prompts inside it will be lost.')) {
          await deleteSpace(space.id);
          onClose();
      }
  };

  if (!isOpen) return null;

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
            <h2 className="text-xl font-semibold">Space Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Space Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-24 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors resize-none"
                />
            </div>
            {space.joinCode && (
                 <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col md:flex-row items-center justify-between gap-2">
                    <span className="text-sm text-gray-400">Join Code</span>
                    <span className="font-mono font-bold text-white select-all bg-white/10 px-2 py-1 rounded">{space.joinCode}</span>
                 </div>
            )}
        </div>

        <div className="p-6 border-t border-white/5 bg-white/5 flex flex-col-reverse md:flex-row items-center justify-between gap-4">
            <button 
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
                <Trash2 size={16} /> Delete Space
            </button>
            <button 
                onClick={handleSave}
                disabled={!name}
                className="w-full md:w-auto px-6 py-2 rounded-xl font-medium bg-neon-blue text-black hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <Save size={16} /> Save
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditSpaceModal;
