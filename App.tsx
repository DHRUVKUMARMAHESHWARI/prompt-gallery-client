
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
    LayoutDashboard, Folder, Users, Globe, Plus,
    Search, Settings, Menu, Zap, Command, LogOut,
    Hash, Bell, X, Play, Gamepad2
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import PromptCard from './components/PromptCard';
import AddPromptModal from './components/AddPromptModal';
import EditSpaceModal from './components/EditSpaceModal';
import CreateSpaceModal from './components/CreateSpaceModal';
import NotificationPanel from './components/NotificationPanel';
import SnakeGameModal from './components/SnakeGameModal';
import Login from './pages/Login';
import Register from './pages/Register';
import { Prompt, Space } from './types';
import { AnimatePresence, motion } from 'framer-motion';

// --- Sidebar ---
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { spaces, activeSpaceId, setActiveSpaceId, joinSpace, logout, user, notifications } = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [showJoinInput, setShowJoinInput] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isGameOpen, setIsGameOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (await joinSpace(joinCode)) {
            setJoinCode('');
            setShowJoinInput(false);
        }
    };

    const navItems = [
        { id: 'all', icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { id: 'favorites', icon: Zap, label: 'Favorites', path: '/' },
    ];

    const handleNavClick = (id: string, path: string) => {
        setActiveSpaceId(id);
        navigate(path);
        if (window.innerWidth < 768) onClose();
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
        fixed left-0 top-0 h-screen bg-[#09090b] border-r border-white/5 flex flex-col z-[100] 
        transition-transform duration-300 ease-in-out w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
    `}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple flex items-center gap-2">
                        <Command className="text-neon-blue" />
                        PromptOS
                    </h1>
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide">
                    {/* Main Nav */}
                    <div className="space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id, item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSpaceId === item.id
                                    ? 'bg-white/10 text-white font-medium'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                navigate('/market');
                                if (window.innerWidth < 768) onClose();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/market'
                                ? 'bg-white/10 text-white font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Globe size={18} />
                            Marketplace
                        </button>
                    </div>

                    {/* Spaces */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">My Spaces</h3>
                            <button onClick={() => setIsCreateModalOpen(true)} className="text-gray-500 hover:text-white p-1">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="space-y-1">
                            {spaces.map(space => (
                                <button
                                    key={space.id}
                                    onClick={() => handleNavClick(space.id, '/')}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${activeSpaceId === space.id
                                        ? 'bg-white/5 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${space.type === 'PRIVATE' ? 'bg-gray-500' : space.type === 'TEAM' ? 'bg-neon-purple' : 'bg-neon-green'}`} />
                                        <span className="truncate">{space.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowJoinInput(!showJoinInput)}
                            className="mt-4 w-full flex items-center gap-2 px-4 py-2 text-sm text-neon-blue hover:underline"
                        >
                            <Hash size={14} /> Join via Code
                        </button>

                        {showJoinInput && (
                            <form onSubmit={handleJoin} className="mt-2 px-2 animate-fade-in">
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="Enter code..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </form>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 space-y-3">
                    {/* Mini Game Launcher */}
                    <button
                        onClick={() => setIsGameOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-neon-green bg-neon-green/5 border border-neon-green/10 hover:bg-neon-green/10 transition-colors"
                    >
                        <Gamepad2 size={16} /> Play Data Stream
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 mb-2 relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold text-black shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                            <span className="text-sm font-medium text-white truncate w-full">{user?.name}</span>
                            <span className="text-[10px] text-gray-500 truncate w-full">{user?.email}</span>
                        </div>

                        {/* Notification Bell */}
                        <div className="relative shrink-0">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-neon-blue rounded-full" />
                                )}
                            </button>
                            <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                        </div>
                    </div>

                    <button onClick={logout} className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 px-4 transition-colors">
                        <LogOut size={12} /> Sign Out
                    </button>
                </div>
            </div>
            <CreateSpaceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <SnakeGameModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
        </>
    );
};

// --- Main Dashboard Layout ---
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#09090b] text-white font-sans antialiased">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className={`flex-1 min-h-screen bg-black/50 relative transition-all duration-300 md:ml-64 ml-0`}>
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px] animate-blob" />
                    <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-neon-blue/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                </div>

                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as any, { onOpenSidebar: () => setIsSidebarOpen(true) });
                    }
                    return child;
                })}
            </div>
        </div>
    )
}


const MainContent = ({ onOpenSidebar }: { onOpenSidebar?: () => void }) => {
    const {
        filteredPrompts, activeSpaceId, spaces,
        searchQuery, setSearchQuery
    } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSpaceSettingsOpen, setIsSpaceSettingsOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>(undefined);

    const activeSpace = spaces.find(s => s.id === activeSpaceId);

    const getHeaderTitle = () => {
        if (activeSpaceId === 'all') return 'All Prompts';
        if (activeSpaceId === 'favorites') return 'Favorites';
        return activeSpace?.name || 'Space';
    };

    const handleEdit = (prompt: Prompt) => {
        setEditingPrompt(prompt);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPrompt(undefined);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-[60] backdrop-blur-xl bg-[#09090b]/80 border-b border-white/5 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onOpenSidebar}
                        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 truncate">
                            {getHeaderTitle()}
                            {activeSpace && activeSpace.role === 'OWNER' && (
                                <button
                                    onClick={() => setIsSpaceSettingsOpen(true)}
                                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Settings size={18} />
                                </button>
                            )}
                        </h2>
                        {activeSpace?.joinCode && (
                            <span className="hidden sm:inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-gray-400 border border-white/5">
                                CODE: <span className="text-white font-bold select-all">{activeSpace.joinCode}</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-1/3">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search prompts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#18181b] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder-gray-600"
                        />
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-8 flex-1">
                {activeSpace?.joinCode && (
                    <div className="sm:hidden mb-4 px-3 py-2 bg-white/10 rounded-lg text-xs font-mono text-gray-400 border border-white/5 text-center">
                        CODE: <span className="text-white font-bold select-all">{activeSpace.joinCode}</span>
                    </div>
                )}

                {filteredPrompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-gray-600" size={32} />
                        </div>
                        <h3 className="text-xl font-medium text-gray-300">No prompts found</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">Try searching or create a new prompt.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 px-6 py-2 bg-neon-blue text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Create First Prompt
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min items-start">
                        {filteredPrompts.map(prompt => (
                            <PromptCard
                                key={prompt.id}
                                prompt={prompt}
                                space={spaces.find(s => s.id === prompt.spaceId)}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}
            </main>

            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-white text-black rounded-full shadow-2xl shadow-neon-blue/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
            >
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <AddPromptModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editPrompt={editingPrompt}
            />

            {activeSpace && (
                <EditSpaceModal
                    isOpen={isSpaceSettingsOpen}
                    onClose={() => setIsSpaceSettingsOpen(false)}
                    space={activeSpace}
                />
            )}
        </div>
    );
};

const Marketplace = ({ onOpenSidebar }: { onOpenSidebar?: () => void }) => {
    return (
        <div className="p-4 md:p-8 text-white">
            <header className="mb-8 flex items-center gap-4">
                <button
                    onClick={onOpenSidebar}
                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-3xl md:text-4xl font-bold">Marketplace</h1>
            </header>
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                <Globe className="mx-auto h-16 w-16 text-neon-blue mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                <p className="text-gray-400">Discover community-created prompts.</p>
            </div>
        </div>
    )
}

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
    const { user, isLoading } = useStore();
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const App = () => {
    return (
        <StoreProvider>
            <HashRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <MainContent />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/market" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Marketplace />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </HashRouter>
        </StoreProvider>
    );
};

export default App;