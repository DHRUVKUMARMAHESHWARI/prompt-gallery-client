
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, UserPlus, Info, AlertCircle, X, CheckCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
      const unread = notifications.filter(n => !n.read);
      for(const n of unread) {
          await markNotificationRead(n.id);
      }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'JOIN': return <UserPlus size={18} className="text-neon-blue" />;
          case 'SYSTEM': return <AlertCircle size={18} className="text-neon-purple" />;
          default: return <Info size={18} className="text-gray-400" />;
      }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
            {/* Backdrop for mobile only */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[60] md:hidden" onClick={onClose} />
            
            <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className={`
                fixed z-[70] 
                bottom-20 left-4 right-4 md:left-64 md:right-auto md:bottom-20
                w-auto md:w-96
                bg-[#09090b]/90 backdrop-blur-xl border border-neon-blue/20 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] 
                overflow-hidden flex flex-col max-h-[60vh]
            `}
            >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Bell size={16} className="text-neon-blue" />
                    <h3 className="font-bold text-white text-sm tracking-wide">NOTIFICATIONS</h3>
                    {unreadCount > 0 && (
                        <span className="text-[10px] bg-neon-blue text-black px-1.5 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="p-1.5 text-gray-400 hover:text-neon-blue transition-colors rounded-lg hover:bg-white/5"
                            title="Mark all as read"
                        >
                            <CheckCheck size={16} />
                        </button>
                    )}
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <X size={16} />
                    </button>
                </div>
            </div>
            
            {/* List */}
            <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <Bell size={20} className="opacity-30" />
                        </div>
                        <p className="text-sm">All caught up!</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <motion.div 
                            key={notif.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => !notif.read && markNotificationRead(notif.id)}
                            className={`
                                relative p-4 rounded-xl flex gap-4 transition-all cursor-pointer border border-transparent
                                ${!notif.read 
                                    ? 'bg-white/5 hover:bg-white/10 border-white/5 shadow-lg' 
                                    : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                                }
                            `}
                        >
                            <div className={`mt-1 p-2 rounded-full h-fit shrink-0 ${!notif.read ? 'bg-black/40 shadow-inner' : 'bg-transparent'}`}>
                                {getIcon(notif.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${!notif.read ? 'text-white font-medium' : 'text-gray-400'}`}>
                                    {notif.message}
                                </p>
                                <p className="text-[10px] text-gray-600 mt-2 font-mono uppercase tracking-wider">
                                    {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>

                            {!notif.read && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
                            )}
                        </motion.div>
                    ))
                )}
            </div>
            </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
