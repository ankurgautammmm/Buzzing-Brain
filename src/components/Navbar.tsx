import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Shield,
  AlertCircle, 
  LogIn, 
  LogOut, 
  Sparkles, 
  FileText, 
  Play, 
  Lock, 
  Search, 
  ExternalLink, 
  ChevronDown,
  Award,
  Camera,
  GitBranch,
  LayoutDashboard,
  Layers,
  Calendar,
  Users,
  Download,
  Heart,
  Sliders,
  FlaskConical,
  Dna
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile, AuthStateStatus } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { NotificationCenter } from './NotificationCenter';

export type NavTab = 
  | 'landing' 
  | 'dashboard'
  | 'ai-tutor'
  | 'courses'
  | 'studio' 
  | 'scanner'
  | 'tests' 
  | 'planner'
  | 'community'
  | 'practicals'
  | 'practical_academy'
  | 'labs'
  | 'scilab'
  | 'books' 
  | 'syllabus' 
  | 'teacher'
  | 'youtube' 
  | 'library' 
  | 'admin' 
  | 'terms' 
  | 'privacy';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: UserProfile | null;
  authStatus?: AuthStateStatus;
  onSignIn: () => void;
  onSignUp?: () => void;
  onSignOut: () => void;
  activeClass: string;
  onClassChange: (newClass: string) => void;
  onOpenChat: () => void;
  onOpenComplaint: () => void;
  onOpenProfile?: () => void;
  onOpenSearch?: () => void;
  onGoToLabs?: (subTab?: 'virtual_academy' | 'mindmaps' | 'organs3d' | 'virtual_tools' | 'simulations' | 'journal' | 'practicals') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  authStatus,
  onSignIn,
  onSignUp,
  onSignOut,
  activeClass,
  onClassChange,
  onOpenChat,
  onOpenComplaint,
  onOpenProfile,
  onOpenSearch,
  onGoToLabs,
}) => {
  const isAdmin = Boolean(
    user?.role === 'admin' || 
    user?.email?.toLowerCase() === 'brainyyybuzz@gmail.com' || 
    user?.email?.toLowerCase() === 'gautamankur0101@gmail.com' ||
    user?.email?.toLowerCase() === 'pathpriya99@gmail.com'
  );

  const isTeacher = Boolean(user?.role === 'teacher');
  const isTeacherOrAdmin = isAdmin || isTeacher;

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const [installTooltip, setInstallTooltip] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setInstallTooltip('Browser menu → "Add to Home Screen"');
      setTimeout(() => setInstallTooltip(null), 4000);
      return;
    }
    deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-black/75 backdrop-blur-xl border-b border-white/10 text-slate-100 print:hidden no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand - Using User's Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('landing')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <img
                src="/BuzzingBrain_Video_Watermark_150x150.png"
                alt="Buzzing Brain Logo"
                className="w-10 h-10 rounded-full border border-amber-400/80 shadow-md object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>BuzzingBrain</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                    AI
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">
                  Free Education for All
                </span>
              </div>
            </button>

            {/* Quick Class Selector */}
            <div className="hidden xl:flex items-center bg-white/5 rounded-xl p-0.5 ml-3 text-xs font-semibold border border-white/10">
              {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => onClassChange(cls)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeClass === cls
                      ? 'bg-white/20 text-white shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-300">
            <button
              onClick={() => onTabChange('landing')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                currentTab === 'landing'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'dashboard'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onTabChange('ai-tutor')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                currentTab === 'ai-tutor'
                  ? 'text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 shadow-md shadow-amber-400/20 scale-[1.02]'
                  : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tutor Studio</span>
              <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-mono font-black">
                FULL
              </span>
            </button>

            <button
              onClick={() => onTabChange('courses')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'courses'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Courses</span>
            </button>

            <button
              onClick={() => onTabChange('studio')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'studio'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Notes</span>
            </button>

            <button
              onClick={() => onTabChange('scanner')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'scanner'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scanner</span>
            </button>

            <button
              onClick={() => onTabChange('tests')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'tests'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Tests</span>
            </button>

            <button
              onClick={() => onTabChange('planner')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'planner'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Revision Planner</span>
            </button>

            <button
              onClick={() => onTabChange('community')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'community'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Community</span>
            </button>

            {/* Virtual Practical Academy Dedicated Main Tab */}
            <button
              onClick={() => onTabChange('practicals')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                currentTab === 'practicals' || currentTab === 'practical_academy'
                  ? 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-600/30 ring-1 ring-purple-400/50 scale-[1.02]'
                  : 'text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:text-white'
              }`}
              title="Virtual Practical Academy (CBSE, NEET, JEE & CUET Multi-Stage Labs)"
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
              <span>Practical Academy</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/40 text-purple-200 font-mono font-black">
                3D
              </span>
            </button>

            {/* 3D Anatomical Organs, Virtual Tools & Mind Maps Hub */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (onGoToLabs) {
                    onGoToLabs('organs3d');
                  } else {
                    onTabChange('labs');
                  }
                }}
                className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'labs'
                    ? 'text-white bg-white/15 ring-1 ring-cyan-400/40 shadow-sm'
                    : 'hover:text-white hover:bg-white/5'
                }`}
                title="3D Anatomical Organs, Calibrated Virtual Tools & Mind Maps"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>3D Organs &amp; Labs</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold border border-cyan-400/30">
                  3D
                </span>
              </button>

              {/* Instant Flyout Menu for 3D Organs, Virtual Tools & Mind Maps */}
              <div className="absolute top-full left-0 mt-1 hidden group-hover:flex flex-col bg-[#070b1e] border border-cyan-400/30 rounded-2xl shadow-2xl p-2 min-w-[240px] z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 mb-1">
                  Scientific Visualization Hub
                </div>
                <button
                  onClick={() => onGoToLabs ? onGoToLabs('virtual_academy') : onTabChange('labs')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold hover:bg-purple-500/15 text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <span>3D Practical Academy</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/30 text-purple-300 font-mono">NEW 3D</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Stages 1–6: Three.js labs, formulas &amp; MCQs</div>
                  </div>
                </button>
                <button
                  onClick={() => onGoToLabs ? onGoToLabs('organs3d') : onTabChange('labs')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold hover:bg-rose-500/15 text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-[11px]">3D Anatomical Organs</div>
                    <div className="text-[10px] text-slate-400">Heart, Brain, Eye, Nephron, Cells, DNA</div>
                  </div>
                </button>
                <button
                  onClick={() => onGoToLabs ? onGoToLabs('virtual_tools') : onTabChange('labs')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold hover:bg-cyan-500/15 text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-[11px]">Calibrated Virtual Tools</div>
                    <div className="text-[10px] text-slate-400">1000x Microscope, Vernier, Titration</div>
                  </div>
                </button>
                <button
                  onClick={() => onGoToLabs ? onGoToLabs('mindmaps') : onTabChange('labs')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold hover:bg-amber-500/15 text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <GitBranch className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-[11px]">Mind Maps Library</div>
                    <div className="text-[10px] text-slate-400">Class 9–12 Complete Trees</div>
                  </div>
                </button>
                <button
                  onClick={() => onGoToLabs ? onGoToLabs('journal') : onTabChange('labs')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold hover:bg-emerald-500/15 text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <span>Experiment Journal</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">PDF</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Official CBSE/NCERT Practical Records</div>
                  </div>
                </button>
                <button
                  onClick={() => onTabChange('scilab')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold hover:bg-cyan-500/15 text-slate-200 hover:text-white transition-colors cursor-pointer border-t border-white/5 mt-1 pt-1.5"
                >
                  <Dna className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <span>SciLab BioMolecular Studio</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-300 font-mono font-bold">PRO</span>
                    </div>
                    <div className="text-[10px] text-slate-400">AlphaFold 3D, Verlet MD, PubChem, ChEMBL, STRING</div>
                  </div>
                </button>
              </div>
            </div>

            {/* SciLab Dedicated Main Tab */}
            <button
              onClick={() => onTabChange('scilab')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                currentTab === 'scilab'
                  ? 'text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400/50 scale-[1.02]'
                  : 'text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:text-white'
              }`}
              title="SciLab: Bioinformatics, Molecular Dynamics, Chemistry Tools & Biological Databases"
            >
              <Dna className="w-3.5 h-3.5 text-cyan-400" />
              <span>SciLab (Bio &amp; MD)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400/25 text-cyan-200 font-mono font-black border border-cyan-400/30">
                PRO
              </span>
            </button>

            <button
              onClick={() => onTabChange('books')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'books'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <span>NCERT</span>
            </button>

            <button
              onClick={() => onTabChange('syllabus')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'syllabus'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Syllabus</span>
            </button>

            <button
              onClick={() => onTabChange('youtube')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                currentTab === 'youtube'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Play className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span>YouTube</span>
            </button>

            <button
              onClick={() => onTabChange('library')}
              className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                currentTab === 'library'
                  ? 'text-white bg-white/15'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              Library
            </button>

            {isTeacherOrAdmin && (
              <button
                onClick={() => onTabChange('teacher')}
                className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                  currentTab === 'teacher'
                    ? 'text-white bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'hover:text-white hover:bg-white/5 text-blue-400'
                }`}
                title="Teacher & Educator Command Portal"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Teacher</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => onTabChange('admin')}
                className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                  currentTab === 'admin'
                    ? 'text-white bg-white/15'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Search Shortcut (Cmd+K) */}
            {onOpenSearch && (
              <>
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
                  title="Search chapters, formulas, 3D practicals, notes (⌘K / Ctrl+K)"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Search...</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-400">⌘K</kbd>
                </button>
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="md:hidden p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  title="Search (⌘K)"
                >
                  <Search className="w-4 h-4 text-amber-400" />
                </button>
              </>
            )}

            {/* In-App Notifications Center */}
            <NotificationCenter onNavigateTab={onTabChange} userId={user?.id} />

            {/* PWA In-App Install Prompt */}
            <PWAInstallButton />

            {/* Ask AI Study Buddy */}
            <button
              onClick={onOpenChat}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Tutor</span>
            </button>

            {/* User Log in or Profile */}
            {authStatus === 'AUTHENTICATED_PROFILE_LOADING' ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs text-slate-400">
                <div className="w-7 h-7 rounded-full bg-white/10 animate-pulse border border-white/10"></div>
                <span className="hidden sm:inline text-[11px] text-slate-400">Loading...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-85 transition-opacity cursor-pointer text-left"
                  title="View / Edit Student Profile (Class, Age, Mobile, Target Exam)"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full border border-amber-400/60 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-none truncate max-w-[110px]">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isAdmin ? 'Admin' : isTeacher ? 'Teacher' : (user.classPreference || 'Student')}
                    </span>
                  </div>
                </button>

                <button
                  onClick={onSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onSignIn}
                  className="px-3.5 py-1.5 rounded-full bg-transparent hover:bg-white/10 border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={onSignUp || onSignIn}
                  className="px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Install PWA Button */}
            <div className="relative hidden md:inline-block">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-medium text-xs border border-white/15 transition-all cursor-pointer"
                title="Install Buzzing Brain PWA App for offline study"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Install App</span>
              </button>
              {installTooltip && (
                <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-xl bg-slate-900 border border-amber-400/40 text-amber-200 text-[11px] shadow-xl z-50 animate-in fade-in">
                  {installTooltip}
                </div>
              )}
            </div>

            {/* Astra White Pill CTA Button: "Try Buzzing Brain" */}
            <button
              onClick={() => onTabChange('studio')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <span>Try Buzzing Brain</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-Bar (Smooth horizontal scroll) */}
        <div className="flex xl:hidden items-center py-2.5 border-t border-white/10 text-xs font-semibold overflow-x-auto gap-2 text-slate-300 scrollbar-none px-1">
          <button
            onClick={() => onTabChange('landing')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'landing' ? 'text-white font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'dashboard' ? 'text-amber-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('ai-tutor')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1 font-bold ${currentTab === 'ai-tutor' ? 'text-slate-950 bg-amber-400' : 'text-amber-400 bg-amber-400/10 border border-amber-400/30'}`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Tutor Studio</span>
          </button>
          <button
            onClick={() => onTabChange('courses')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'courses' ? 'text-amber-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Courses
          </button>
          <button
            onClick={() => onTabChange('studio')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'studio' ? 'text-amber-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Notes
          </button>
          <button
            onClick={() => onTabChange('scanner')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'scanner' ? 'text-emerald-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Scanner
          </button>
          <button
            onClick={() => onTabChange('tests')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'tests' ? 'text-amber-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Tests
          </button>
          <button
            onClick={() => onTabChange('planner')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'planner' ? 'text-amber-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Planner
          </button>
          <button
            onClick={() => onTabChange('community')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'community' ? 'text-emerald-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Community
          </button>
          <button
            onClick={() => onTabChange('practicals')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1.5 font-bold ${
              currentTab === 'practicals' || currentTab === 'practical_academy'
                ? 'text-white bg-purple-600 shadow-xs'
                : 'text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-white/5'
            }`}
          >
            <FlaskConical className="w-3 h-3 text-purple-400" />
            <span>Practical Academy</span>
          </button>
          <button
            onClick={() => onGoToLabs ? onGoToLabs('organs3d') : onTabChange('labs')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1.5 ${currentTab === 'labs' ? 'text-cyan-300 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            <Heart className="w-3 h-3 text-rose-400" />
            <span>3D Organs &amp; Labs</span>
          </button>
          <button
            onClick={() => onTabChange('scilab')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1.5 font-bold ${
              currentTab === 'scilab'
                ? 'text-white bg-cyan-600 shadow-xs'
                : 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-white/5'
            }`}
          >
            <Dna className="w-3 h-3 text-cyan-400" />
            <span>SciLab (Bio &amp; MD)</span>
          </button>
          <button
            onClick={() => onTabChange('books')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'books' ? 'text-white font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            NCERT
          </button>
          <button
            onClick={() => onTabChange('syllabus')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'syllabus' ? 'text-white font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Syllabus
          </button>
          <button
            onClick={() => onTabChange('youtube')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'youtube' ? 'text-rose-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            YouTube
          </button>
          <button
            onClick={() => onTabChange('library')}
            className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'library' ? 'text-white font-bold bg-white/15' : 'hover:bg-white/5'}`}
          >
            Library
          </button>
          {isTeacherOrAdmin && (
            <button
              onClick={() => onTabChange('teacher')}
              className={`px-3 py-1 rounded-lg shrink-0 text-blue-400 ${currentTab === 'teacher' ? 'font-bold bg-blue-500/20 text-blue-300' : 'hover:bg-white/5'}`}
              title="Teacher & Educator Command Portal"
            >
              Teacher
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => onTabChange('admin')}
              className={`px-3 py-1 rounded-lg shrink-0 ${currentTab === 'admin' ? 'text-rose-400 font-bold bg-white/15' : 'hover:bg-white/5'}`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
