/**
 * Buzzing Brain — Free Education for All
 * Open NCERT Handwritten Notes Engine, Chapter Assessments, Digital Textbooks & YouTube Portal
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  syncUserProfile, 
  updateStudentProfile,
  subscribeToUserProfile, 
  checkRedirectAuthResult,
  buildFallbackUserProfile,
  saveStudyNote, 
  deleteStudyNote, 
  subscribeToStudyNotes, 
  submitComplaint, 
  updateComplaintStatus, 
  subscribeToComplaints,
  getStoredGuestUser,
  onGuestAuthStateChanged
} from './services/firebase';
import { logger } from './services/logger';
import { Navbar, NavTab } from './components/Navbar';
import { AstraLandingPage } from './components/AstraLandingPage';
import { NcertBooksSection } from './components/NcertBooksSection';
import { SyllabusSection } from './components/SyllabusSection';
import { YouTubeChannelSection } from './components/YouTubeChannelSection';
import { StudentNotesLibrary } from './components/StudentNotesLibrary';
import { TestSection } from './components/TestSection';
import { CourseGeneratorSection } from './components/CourseGeneratorSection';
import { HomeworkScannerSection } from './components/HomeworkScannerSection';
import { InteractiveLabsAndMindMaps } from './components/InteractiveLabsAndMindMaps';
import { VirtualPracticalAcademy } from './features/virtual-lab';
import { SciLabStudio } from './features/scilab/SciLabStudio';
import { AdaptiveLearningDashboard } from './components/AdaptiveLearningDashboard';
import { ExamRevisionPlanner } from './components/ExamRevisionPlanner';
import { CommunityNotesHub } from './components/CommunityNotesHub';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { AdminDashboard } from './components/AdminDashboard';
import { TermsAndConditionsPage } from './components/TermsAndConditionsPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { ComplaintModal } from './components/ComplaintModal';
import { OnboardingModal } from './components/OnboardingModal';
import { TermsPrivacyModal } from './components/TermsPrivacyModal';
import { AiTutorChatDrawer } from './components/AiTutorChatDrawer';
import { AiTutorStudio } from './components/AiTutorStudio';
import { TeacherPortal } from './components/TeacherPortal';
import { AuthWallModal } from './components/AuthWallModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { InteractiveSpaceBackground } from './components/InteractiveSpaceBackground';
import { COMPREHENSIVE_CHAPTER_NOTES, getCuratedChapterNote } from './data/curatedChapterNotes';
import { TopperRegisterPage } from './components/TopperRegisterPage';
import { NotebookHeader } from './components/NotebookHeader';
import { ChapterDirectoryDrawer } from './components/ChapterDirectoryDrawer';
import { PyqAgentPanel } from './components/PyqAgentPanel';
import { PyqTestGeneratorModal } from './components/PyqTestGeneratorModal';
import { RevisionQuizModal } from './components/RevisionQuizModal';
import { SystemPromptViewer } from './components/SystemPromptViewer';
import { TopicGeneratorModal } from './components/TopicGeneratorModal';
import { convertNotePayloadToTopperMarkdown, PHOTOSYNTHESIS_TOPPER_MARKDOWN } from './utils/topperMarkdownAdapter';
import { PaperStyle, HandwritingFont, InkColor, UserStickyNote, NotePreset } from './types';
import { ChapterInfo } from './data/chaptersData';
import { 
  getFastLocalCachedNotes, 
  getOfflineNotes, 
  saveOfflineNote, 
  saveMultipleOfflineNotes, 
  deleteOfflineNote 
} from './services/offlineNotesCache';
import { OfflineIndicator } from './components/OfflineIndicator';
import { 
  StudyNote, 
  UserProfile, 
  ComplaintTicket, 
  NoteContentPayload, 
  HandwritingStyleConfig,
  ComplaintCategory,
  AuthStateStatus
} from './types';
import { 
  Sparkles, 
  PenTool, 
  BookOpen, 
  ShieldCheck, 
  Shield,
  AlertCircle, 
  HelpCircle,
  FileText,
  Lock,
  ArrowRight,
  Play,
  CheckCircle2,
  Award,
  BrainCircuit
} from 'lucide-react';

export default function App() {
  // Authentication & Profile Lifecycle State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStateStatus>('AUTH_LOADING');

  // App Navigation & Selected Grade (Default to Class 11 or landing)
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [activeClass, setActiveClass] = useState<string>('Class 11');
  const [labsInitialSubTab, setLabsInitialSubTab] = useState<'virtual_academy' | 'mindmaps' | 'organs3d' | 'virtual_tools' | 'simulations' | 'journal' | 'practicals'>('virtual_academy');

  const handleGoToLabs = (subTab: 'virtual_academy' | 'mindmaps' | 'organs3d' | 'virtual_tools' | 'simulations' | 'journal' | 'practicals' = 'virtual_academy') => {
    setLabsInitialSubTab(subTab);
    setCurrentTab('labs');
  };

  // Study Notes State — Initialized from fast offline cache so student library is instantly available offline
  const [notesList, setNotesList] = useState<StudyNote[]>(() => {
    return getFastLocalCachedNotes();
  });
  const [currentActiveNote, setCurrentActiveNote] = useState<NoteContentPayload | null>(
    COMPREHENSIVE_CHAPTER_NOTES["Class 10:Science:Photosynthesis"] || null
  );
  const [currentActiveStyle, setCurrentActiveStyle] = useState<HandwritingStyleConfig | null>(null);
  const [activeNoteSavedId, setActiveNoteSavedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [queuedCommand, setQueuedCommand] = useState<string | undefined>(undefined);

  // Complaints & Grievance State
  const [complaintsList, setComplaintsList] = useState<ComplaintTicket[]>([]);

  // Tests Initial SubTab Focus (Catalog vs 25-Yr PYQ Guru vs PYQ Test Simulator)
  const [testInitialSubTab, setTestInitialSubTab] = useState<'catalog' | 'pyq_guru' | 'pyq_test'>('catalog');

  // Unified Topper-Style Handwritten Notes State
  const [topperPaperStyle, setTopperPaperStyle] = useState<PaperStyle>('ruled');
  const [topperFont, setTopperFont] = useState<HandwritingFont>('kalam');
  const [topperInkColor, setTopperInkColor] = useState<InkColor>('blue');
  const [topperFontSize, setTopperFontSize] = useState<number>(18);
  const [topperStickyNotes, setTopperStickyNotes] = useState<UserStickyNote[]>([
    {
      id: 'sticky_init_1',
      text: '⭐ High-Yield NEET/Board: Revise Z-scheme vs Cyclic Photophosphorylation & 1:3:2 Calvin cycle ratio!',
      color: 'yellow',
    }
  ]);
  const [topperMarkdown, setTopperMarkdown] = useState<string>(PHOTOSYNTHESIS_TOPPER_MARKDOWN);
  const [topperTopic, setTopperTopic] = useState('Photosynthesis');
  const [topperGrade, setTopperGrade] = useState('Class 10 CBSE / GCSE');
  const [topperSubject, setTopperSubject] = useState('Biology');
  const [showChapterDirectory, setShowChapterDirectory] = useState(false);
  const [showPyqAgent, setShowPyqAgent] = useState(false);
  const [showPyqTestModal, setShowPyqTestModal] = useState(false);
  const [showRevisionQuiz, setShowRevisionQuiz] = useState(false);
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [showTopicGeneratorModal, setShowTopicGeneratorModal] = useState(false);

  const TOPIC_PRESETS: NotePreset[] = [
    { topic: 'Photosynthesis', grade: 'Class 10 CBSE / GCSE', subject: 'Biology' },
    { topic: 'Light – Reflection and Refraction', grade: 'Class 10 (CBSE / ICSE Board)', subject: 'Physics' },
    { topic: 'Chemical Reactions and Equations', grade: 'Class 10 (CBSE / ICSE Board)', subject: 'Chemistry' },
    { topic: 'Rotational Motion & Torque', grade: 'Class 11 (CBSE / JEE / NEET)', subject: 'Physics' },
    { topic: 'Aldehydes, Ketones & Carboxylic Acids', grade: 'Class 12 (CBSE / State / NEET / JEE)', subject: 'Chemistry' },
    { topic: 'Molecular Basis of Inheritance', grade: 'Class 12 (CBSE / State / NEET / JEE)', subject: 'Biology' },
    { topic: 'Definite Integrals & King\'s Rule', grade: 'Dropper (JEE Main & Advanced Batch)', subject: 'Mathematics' },
  ];

  // Modals & Drawers
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');
  const [showTutorChat, setShowTutorChat] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authWallMessage, setAuthWallMessage] = useState<string | undefined>(undefined);
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Listen for Auth State & sync Profile Lifecycle
  useEffect(() => {
    // Keyboard shortcut for Global Search (Cmd+K / Ctrl+K)
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowGlobalSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    logger.info('App', 'Mounting auth lifecycle listener');
    let isMounted = true;

    // Check for incoming redirect OAuth credentials on boot
    checkRedirectAuthResult().then((redirectUser) => {
      if (redirectUser && isMounted) {
        logger.info('App', `Redirect OAuth verified for: ${redirectUser.email}`);
      }
    });

    const handleUserSync = async (user: FirebaseUser | null) => {
      if (!isMounted) return;
      const effectiveUser = user || getStoredGuestUser();
      setFirebaseUser(effectiveUser);

      if (!effectiveUser) {
        setUserProfile(null);
        setAuthStatus('UNAUTHENTICATED');
        return;
      }

      setAuthStatus('AUTHENTICATED_PROFILE_LOADING');

      try {
        const profile = await syncUserProfile(effectiveUser, activeClass);
        if (!isMounted) return;
        setUserProfile(profile);
        setAuthStatus('AUTHENTICATED_PROFILE_READY');

        // Check if required student profile details are present
        const isComplete = Boolean(
          profile.acceptedTerms && 
          profile.age && 
          profile.sex && 
          profile.mobileNumber && 
          profile.targetExam
        );
        const isDismissed = sessionStorage.getItem(`bb_onboarding_dismissed_${effectiveUser.uid}`);
        if (!isComplete && !isDismissed && !effectiveUser.isAnonymous) {
          setShowOnboarding(true);
        }
      } catch (err) {
        logger.error('App', 'Profile sync notice:', err);
        if (!isMounted) return;
        setAuthStatus('AUTHENTICATED_PROFILE_ERROR');
        // Resilient fallback profile keeps student authenticated
        const fallback = buildFallbackUserProfile(effectiveUser, activeClass);
        setUserProfile(fallback);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      await handleUserSync(user);
    });

    const unsubscribeGuest = onGuestAuthStateChanged((guestUser) => {
      if (!auth.currentUser) {
        handleUserSync(guestUser);
      }
    });

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      isMounted = false;
      unsubscribeAuth();
      unsubscribeGuest();
    };
  }, []);

  // Real-time Firestore user profile sync listener (updates in background)
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = subscribeToUserProfile(firebaseUser.uid, (remoteProfile) => {
      if (remoteProfile) {
        setUserProfile(remoteProfile);
      }
    });
    return () => unsub();
  }, [firebaseUser?.uid]);

  // 2. Real-time Firestore Notes Listener & Offline Cache Hydration
  useEffect(() => {
    // Immediate hydration from full IndexedDB offline database
    getOfflineNotes().then((cachedNotes) => {
      if (cachedNotes && cachedNotes.length > 0) {
        setNotesList((prev) => {
          const map = new Map<string, StudyNote>();
          for (const n of prev) map.set(n.id, n);
          for (const n of cachedNotes) map.set(n.id, n);
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        });
      }
    });

    const unsubNotes = subscribeToStudyNotes((notes) => {
      if (notes && notes.length > 0) {
        setNotesList((prev) => {
          const map = new Map<string, StudyNote>();
          // Remote authoritative notes
          for (const n of notes) map.set(n.id, n);
          // Keep offline notes not yet uploaded
          for (const n of prev) {
            if (!map.has(n.id)) map.set(n.id, n);
          }
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          // Persist to offline cache
          saveMultipleOfflineNotes(merged).catch(() => {});
          return merged;
        });
        logger.info('App', `Synced ${notes.length} notes from Firestore & updated offline cache`);
      } else {
        // Fallback to offline cache
        getOfflineNotes().then((cached) => {
          if (cached && cached.length > 0) {
            setNotesList(cached);
          }
        });
      }
    });

    return () => {
      unsubNotes();
    };
  }, []);

  // 3. Real-time Firestore Complaints Listener (only when authenticated)
  useEffect(() => {
    if (!firebaseUser) {
      setComplaintsList([]);
      return;
    }

    const unsubComplaints = subscribeToComplaints((complaints) => {
      setComplaintsList(complaints);
      logger.info('App', `Synced ${complaints.length} complaints from Firestore`);
    });

    return () => {
      unsubComplaints();
    };
  }, [firebaseUser]);

  // Quick Sample Chapter Selector
  const handleSelectSampleChapter = (chapterKey: string) => {
    const found = COMPREHENSIVE_CHAPTER_NOTES[chapterKey];
    if (found) {
      setCurrentActiveNote(found);
      setActiveClass(found.classGrade);
      setCurrentTab('studio');
      setActiveNoteSavedId(null);
      setQueuedCommand(undefined);
    }
  };

  // 4. Command Execution Engine (/handwriting) - Resolves Curated Notes or Calls AI Generator
  const handleExecuteCommand = async (
    commandString: string, 
    options?: Partial<HandwritingStyleConfig> & { thinkingMode?: 'standard' | 'high' }
  ) => {
    // 4a. Check if command targets one of our comprehensive curated chapter notes
    const lowerCmd = commandString.toLowerCase();
    if (lowerCmd.includes('photosynthesis')) {
      handleSelectSampleChapter("Class 10:Science:Photosynthesis");
      return;
    }
    if (lowerCmd.includes('laws of motion')) {
      handleSelectSampleChapter("Class 11:Physics:Laws of Motion");
      return;
    }
    if (lowerCmd.includes('quadratic')) {
      handleSelectSampleChapter("Class 10:Mathematics:Quadratic Equations");
      return;
    }
    if (lowerCmd.includes('chemical reaction')) {
      handleSelectSampleChapter("Class 10:Science:Chemical Reactions and Equations");
      return;
    }
    if (lowerCmd.includes('fundamental unit') || (lowerCmd.includes('cell') && lowerCmd.includes('9'))) {
      handleSelectSampleChapter("Class 9:Science:The Fundamental Unit of Life: Cell");
      return;
    }
    if (lowerCmd.includes('electric charge')) {
      handleSelectSampleChapter("Class 12:Physics:Electric Charges and Fields");
      return;
    }
    if (lowerCmd.includes('chemical bonding')) {
      handleSelectSampleChapter("Class 11:Chemistry:Chemical Bonding and Molecular Structure");
      return;
    }

    // 4b. For other bespoke topics, unauthenticated users get curated syllabus notes directly
    if (!firebaseUser) {
      const cleaned = commandString.replace('/handwriting', '').trim();
      const match = getCuratedChapterNote(activeClass, 'Science', cleaned);
      if (match) {
        setCurrentActiveNote(match);
        setCurrentTab('studio');
        return;
      }
      setAuthWallMessage("To synthesize custom AI handwritten NCERT study notes with formulas, diagrams, and PDF exports, please log in or sign up first. It's completely free!");
      setShowAuthWall(true);
      return;
    }

    setIsGenerating(true);
    setCurrentTab('studio');
    setGenerationError(null);
    logger.info('Pipeline', `Executing note generation: ${commandString}`);

    try {
      const response = await fetch('/api/handwriting/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: commandString,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedNote = data.noteContent as NoteContentPayload;
      const appliedStyle = data.styleConfig as HandwritingStyleConfig;

      setCurrentActiveNote(generatedNote);
      setCurrentActiveStyle(appliedStyle);
      setCurrentTab('studio');

      // Auto-save to Firestore if user is authenticated
      if (firebaseUser) {
        try {
          const noteId = await saveStudyNote({
            title: generatedNote.title,
            classGrade: generatedNote.classGrade,
            subject: generatedNote.subject,
            chapter: generatedNote.chapter,
            topic: generatedNote.topic,
            commandUsed: commandString,
            contentJson: JSON.stringify(generatedNote),
            styleConfig: JSON.stringify(appliedStyle),
            userId: firebaseUser.uid,
            userEmail: firebaseUser.email || undefined,
            userName: firebaseUser.displayName || 'Student',
            isPublic: true,
            likesCount: 0,
          });
          setActiveNoteSavedId(noteId);
          logger.info('Pipeline', `Auto-persisted note ${noteId} to Firestore`);
        } catch (dbErr) {
          logger.warn('Pipeline', 'Note generated but auto-save deferred:', dbErr);
        }
      } else {
        setActiveNoteSavedId(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate note';
      logger.error('Pipeline', 'Error during note generation:', err);
      setGenerationError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // 5. Save current note to user's library (with offline cache + remote sync)
  const handleSaveActiveNote = async () => {
    if (!currentActiveNote || !currentActiveStyle) return;

    const notePayload: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'> = {
      title: currentActiveNote.title,
      classGrade: currentActiveNote.classGrade,
      subject: currentActiveNote.subject,
      chapter: currentActiveNote.chapter,
      topic: currentActiveNote.topic,
      commandUsed: `/handwriting ${currentActiveNote.classGrade} ${currentActiveNote.subject} ${currentActiveNote.chapter}`,
      contentJson: JSON.stringify(currentActiveNote),
      parsedContent: currentActiveNote,
      styleConfig: JSON.stringify(currentActiveStyle),
      parsedStyle: currentActiveStyle,
      userId: firebaseUser ? firebaseUser.uid : 'offline_guest',
      userEmail: firebaseUser?.email || undefined,
      userName: firebaseUser?.displayName || 'Student',
      isPublic: true,
      likesCount: 0,
    };

    let remoteNoteId: string | null = null;
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

    if (firebaseUser && isOnline) {
      try {
        remoteNoteId = await saveStudyNote(notePayload);
      } catch (err) {
        logger.warn('App', 'Remote Firestore save deferred, saving to offline cache:', err);
      }
    }

    const noteId = remoteNoteId || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullNote: StudyNote = {
      ...notePayload,
      id: noteId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveOfflineNote(fullNote);
      setNotesList((prev) => [fullNote, ...prev.filter(n => n.id !== noteId)]);
      setActiveNoteSavedId(noteId);
      showToast('Handwritten note saved to your Student Library (Offline & Online ready)!');
    } catch (err) {
      logger.error('App', 'Failed to save note to cache:', err);
    }
  };

  // 5b. Regenerate an individual section of the active note without re-running everything
  const handleRegenerateSection = async (secIdx: number) => {
    if (!currentActiveNote) return;
    const targetSec = currentActiveNote.sections[secIdx];
    if (!targetSec) return;

    try {
      const response = await fetch('/api/handwriting/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter: currentActiveNote.chapter,
          subject: currentActiveNote.subject,
          classGrade: currentActiveNote.classGrade,
          sectionHeading: targetSec.heading,
          sectionContext: targetSec.content,
        }),
      });

      if (!response.ok) throw new Error('Failed to regenerate section');
      const data = await response.json();
      if (data.section) {
        const updated = [...currentActiveNote.sections];
        updated[secIdx] = data.section;
        const updatedNote = {
          ...currentActiveNote,
          sections: updated,
        };
        setCurrentActiveNote(updatedNote);

        // Update in offline cache if currently saved
        if (activeNoteSavedId) {
          const found = notesList.find(n => n.id === activeNoteSavedId);
          if (found) {
            const updatedStudyNote: StudyNote = {
              ...found,
              contentJson: JSON.stringify(updatedNote),
              parsedContent: updatedNote,
              updatedAt: new Date().toISOString(),
            };
            saveOfflineNote(updatedStudyNote).catch(() => {});
          }
        }
      }
    } catch (err) {
      logger.error('App', 'Failed to regenerate individual note section:', err);
    }
  };

  // 6. Select Note from Library (Fully functional offline!)
  const handleSelectNoteFromLibrary = (note: StudyNote) => {
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
    // Only prompt for auth when online and viewing other students' non-curated notes
    if (!firebaseUser && isOnline && !note.id.startsWith('curated_') && !note.id.startsWith('offline_')) {
      setAuthWallMessage("Please log in or sign up to read and open full handwritten study notes from the library.");
      setShowAuthWall(true);
      return;
    }

    try {
      const parsedContent = (note.parsedContent || JSON.parse(note.contentJson)) as NoteContentPayload;
      let parsedStyle: HandwritingStyleConfig = {
        penType: 'gel-pen',
        inkColor: 'royal-blue',
        paperType: 'ruled-notebook',
        fontFamily: 'Kalam',
        fontSize: 20,
        slantAngle: 0.3,
        inkPressure: 'medium',
        highlightColor: 'yellow',
        showMarginLine: true,
        showHoles: true,
      };
      if (note.parsedStyle) {
        parsedStyle = note.parsedStyle;
      } else if (note.styleConfig) {
        parsedStyle = JSON.parse(note.styleConfig);
      }
      setCurrentActiveNote(parsedContent);
      setCurrentActiveStyle(parsedStyle);
      setActiveNoteSavedId(note.id);
      setCurrentTab('studio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      logger.error('App', 'Failed to parse note content from library:', err);
    }
  };

  // 7. Delete Note (removes from offline cache and Firestore)
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteOfflineNote(noteId);
      setNotesList((prev) => prev.filter(n => n.id !== noteId));

      const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
      if (firebaseUser && isOnline && !noteId.startsWith('curated_') && !noteId.startsWith('offline_')) {
        await deleteStudyNote(noteId).catch(() => {});
      }
      if (activeNoteSavedId === noteId) {
        setActiveNoteSavedId(null);
      }
    } catch (err) {
      logger.error('App', 'Failed to delete note:', err);
    }
  };

  // 8. Complaint submission
  const handleSubmitComplaint = async (category: ComplaintCategory, title: string, description: string) => {
    if (!firebaseUser) {
      await handleSignIn();
      if (!auth.currentUser) throw new Error('Authentication required');
    }

    const complainant = auth.currentUser!;
    const ticketId = await submitComplaint({
      userId: complainant.uid,
      userEmail: complainant.email || '',
      userName: complainant.displayName || 'Student',
      category,
      title,
      description,
    });
    return ticketId;
  };

  // 9. Authentication Actions
  const handleSignIn = () => {
    setAuthModalMode('signin');
    setAuthWallMessage(undefined);
    setShowAuthWall(true);
  };

  const handleSignUp = () => {
    setAuthModalMode('signup');
    setAuthWallMessage(undefined);
    setShowAuthWall(true);
  };

  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
    userProfile?.email?.toLowerCase() === 'brainyyybuzz@gmail.com' ||
    userProfile?.email?.toLowerCase() === 'gautamankur0101@gmail.com' ||
    userProfile?.email?.toLowerCase() === 'pathpriya99@gmail.com' ||
    firebaseUser?.email?.toLowerCase() === 'brainyyybuzz@gmail.com' ||
    firebaseUser?.email?.toLowerCase() === 'gautamankur0101@gmail.com' ||
    firebaseUser?.email?.toLowerCase() === 'pathpriya99@gmail.com'
  );

  const isTeacher = Boolean(userProfile?.role === 'teacher');
  const isTeacherOrAdmin = isAdmin || isTeacher;

  const handleSignOut = async () => {
    try {
      await logOut();
      setUserProfile(null);
      setFirebaseUser(null);
      setAuthStatus('UNAUTHENTICATED');
      setCurrentTab('landing');
      logger.info('App', 'Sign-out finished cleanly');
    } catch (err) {
      logger.error('App', 'Sign-out failed:', err);
    }
  };

  // Handler for Topper's Register Topic Generation
  const handleGenerateTopperNotes = async (data: {
    topic: string;
    grade: string;
    subject: string;
    styleFocus: string;
    customDirectives: string;
  }) => {
    try {
      setIsGenerating(true);
      setShowTopicGeneratorModal(false);
      setTopperTopic(data.topic);
      setTopperGrade(data.grade);
      setTopperSubject(data.subject);

      const targetExam = data.grade.toLowerCase().includes('neet') ? 'neet' : (data.grade.toLowerCase().includes('jee') ? 'jee' : 'cbse');
      const cleanClassNum = data.grade.replace(/[^0-9]/g, '') || '10';

      const res = await fetch('/api/handwriting/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandText: `/handwriting ${data.topic} --class ${cleanClassNum} subject:${data.subject} --detailed`,
          options: {
            mode: 'detailed',
            targetExam,
          }
        }),
      });

      const json = await res.json();
      if (json && json.noteContent) {
        setCurrentActiveNote(json.noteContent);
        setTopperMarkdown(convertNotePayloadToTopperMarkdown(json.noteContent));
      } else {
        const fallbackNote = getCuratedChapterNote(`Class ${cleanClassNum}`, data.subject, data.topic);
        setTopperMarkdown(convertNotePayloadToTopperMarkdown(fallbackNote));
      }
      showToast(`Topper's study register created for ${data.topic}!`);
    } catch {
      const fallbackNote = getCuratedChapterNote('Class 10', data.subject, data.topic);
      setTopperMarkdown(convertNotePayloadToTopperMarkdown(fallbackNote));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectChapterFromDirectory = (chapter: ChapterInfo) => {
    setTopperTopic(chapter.name);
    setTopperGrade(chapter.classGrade);
    setTopperSubject(chapter.subject);
    const curated = getCuratedChapterNote(chapter.classGrade, chapter.subject, chapter.name);
    setCurrentActiveNote(curated);
    setTopperMarkdown(convertNotePayloadToTopperMarkdown(curated));
    setCurrentTab('studio');
    showToast(`Loaded ${chapter.name} in Notes!`);
  };

  // 10. Student Onboarding Completion
  const handleCompleteOnboarding = async (details: {
    className: string;
    classPreference: string;
    displayName: string;
    age: number | string;
    sex: string;
    mobileNumber: string;
    email: string;
    targetExam: string;
    acceptedTerms: boolean;
    role?: 'student' | 'teacher' | 'admin';
  }) => {
    if (firebaseUser) {
      try {
        const updated = await updateStudentProfile(firebaseUser.uid, details);
        setUserProfile(updated);
        setActiveClass(details.className || details.classPreference);
        sessionStorage.setItem(`bb_onboarding_dismissed_${firebaseUser.uid}`, 'true');
        logger.info('App', 'Student profile onboarding saved successfully');
      } catch (err) {
        logger.error('App', 'Failed to save student profile onboarding:', err);
      }
    }
    setShowOnboarding(false);
  };

  const handleTabChange = (tab: NavTab) => {
    if (tab === 'admin' && !isAdmin) {
      setAuthWallMessage("Administrative privileges required to access the Administrative Operations Roster.");
      setShowAuthWall(true);
      return;
    }
    if (tab === 'teacher' && !isTeacherOrAdmin) {
      setAuthWallMessage("Teacher and Educator Command Portal is restricted to verified teacher and administrator accounts.");
      setShowAuthWall(true);
      return;
    }
    if (!firebaseUser && tab !== 'landing' && tab !== 'terms' && tab !== 'privacy') {
      setAuthWallMessage("Login or Sign Up is compulsory before accessing study materials, handwritten notes, syllabus, textbooks, and tests. Please sign in or create your free student account.");
      setShowAuthWall(true);
      return;
    }
    setCurrentTab(tab);
  };

  const handleOpenLegal = (tab: 'terms' | 'privacy' = 'terms') => {
    setLegalModalTab(tab);
    setShowLegalModal(true);
  };

  // 11. Generate Notes from NCERT Books section or presets
  const handleGenerateFromBook = (classGrade: string, subject: string, chapter: string) => {
    const cmd = `/handwriting class:${classGrade.replace('Class ', '')} subject:${subject} chapter:${chapter} style:gel-pen paper:ruled ink:royal-blue thinking:high`;
    setQueuedCommand(cmd);
    setActiveClass(classGrade);

    if (!firebaseUser) {
      setAuthWallMessage(`Please log in or sign up to generate authentic handwritten study notes for ${chapter} (${classGrade} ${subject}).`);
      setShowAuthWall(true);
      return;
    }

    handleExecuteCommand(cmd);
  };

  const userComplaints = complaintsList.filter(c => c.userId === firebaseUser?.uid);

  // Dedicated Session Restoration Splash - Never flash login while Firebase restores session
  if (authStatus === 'AUTH_LOADING') {
    return (
      <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center p-4 z-50 text-white select-none">
        <div className="flex flex-col items-center gap-4 animate-in fade-in">
          <div className="relative">
            <img
              src="/BuzzingBrain_Video_Watermark_150x150.png"
              alt="Buzzing Brain"
              className="w-16 h-16 rounded-full border-2 border-amber-400/80 shadow-2xl object-cover animate-pulse"
            />
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-25"></div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-extrabold tracking-tight text-white">Buzzing Brain</h2>
            <p className="text-xs text-amber-300 font-medium">Free Education for All</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Restoring student session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InteractiveSpaceBackground>
      {/* Navigation Bar (Astra Style + Buzzing Brain Logo) */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={userProfile}
        authStatus={authStatus}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignOut={handleSignOut}
        activeClass={activeClass}
        onClassChange={setActiveClass}
        onOpenChat={() => setShowTutorChat(true)}
        onOpenComplaint={() => setShowComplaintModal(true)}
        onOpenProfile={() => setShowOnboarding(true)}
        onOpenSearch={() => setShowGlobalSearch(true)}
        onGoToLabs={handleGoToLabs}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Offline Profile Notification if Firestore sync encountered transient issue */}
        {authStatus === 'AUTHENTICATED_PROFILE_ERROR' && (
          <div className="mb-4 p-3 astra-card border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Local Session Mode:</strong> Working with cached student profile. Full handwritten studio, textbooks, and syllabus features remain active.
              </span>
            </div>
            <button
              onClick={async () => {
                if (firebaseUser) {
                  try {
                    const refreshed = await syncUserProfile(firebaseUser, activeClass);
                    setUserProfile(refreshed);
                    setAuthStatus('AUTHENTICATED_PROFILE_READY');
                  } catch (_) {}
                }
              }}
              className="text-[11px] font-bold text-amber-200 hover:text-white px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Error notification banner if generation failed */}
        {generationError && (
          <div className="mb-6 p-4 astra-card border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-300 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>Generation Notice:</strong> {generationError}</span>
            </div>
            <button
              onClick={() => setGenerationError(null)}
              className="font-bold text-rose-200 hover:text-white px-2 py-0.5 rounded hover:bg-rose-900/40"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab: Landing Page (Free Education for All) */}
        {currentTab === 'landing' && (
          <AstraLandingPage
            onGoToStudio={(sampleCmd) => {
              if (sampleCmd) {
                setQueuedCommand(sampleCmd);
                handleExecuteCommand(sampleCmd);
              } else {
                setCurrentTab('studio');
              }
            }}
            onGoToBooks={() => {
              if (!firebaseUser) {
                setAuthWallMessage("Login or Sign Up is compulsory to access digital NCERT textbooks. Please sign in or create your free account!");
                setShowAuthWall(true);
                return;
              }
              setCurrentTab('books');
            }}
            onGoToSyllabus={() => {
              if (!firebaseUser) {
                setAuthWallMessage("Login or Sign Up is compulsory to access the official NCERT syllabus and chapter breakdown!");
                setShowAuthWall(true);
                return;
              }
              setCurrentTab('syllabus');
            }}
            onGoToYouTube={() => setCurrentTab('youtube')}
            onGoToLibrary={() => {
              if (!firebaseUser) {
                setAuthWallMessage("Login or Sign Up is compulsory to access your personal study notes library.");
                setShowAuthWall(true);
                return;
              }
              setCurrentTab('library');
            }}
            onGoToTests={() => {
              if (!firebaseUser) {
                setAuthWallMessage("Login or Sign Up is compulsory to take chapter tests and track assessment results!");
                setShowAuthWall(true);
                return;
              }
              setCurrentTab('tests');
            }}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            onGoToCourses={() => setCurrentTab('courses')}
            onGoToScanner={() => setCurrentTab('scanner')}
            onGoToPracticals={() => setCurrentTab('practicals')}
            onGoToSciLab={() => setCurrentTab('scilab')}
            onGoToLabs={(subTab) => handleGoToLabs(subTab)}
            onGoToPlanner={() => setCurrentTab('planner')}
            onGoToCommunity={() => setCurrentTab('community')}
            onGoToAiTutor={() => setCurrentTab('ai-tutor')}
            onGoToTeacher={() => setCurrentTab('teacher')}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            user={userProfile}
          />
        )}

        {/* Tab: Handwritten Studio */}
        {currentTab === 'studio' && (
          <div className="space-y-6">
            {/* If user is not logged in, show student encouragement banner */}
            {!firebaseUser && (
              <div className="astra-card rounded-2xl p-4 sm:p-5 border border-amber-400/30 bg-amber-400/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl print:hidden no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Free NCERT Handwritten Notes Studio</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">100% OPEN</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Explore authentic 4-page topper register notes with ruled pages, formulas, diagrams &amp; PYQs. Sign in free anytime to save to your personal study locker!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignIn}
                  className="px-5 py-2.5 bg-white hover:bg-slate-200 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  Log In / Sign Up Free
                </button>
              </div>
            )}

            <div className="space-y-4">
              <NotebookHeader
                topic={topperTopic}
                grade={topperGrade}
                subject={topperSubject}
                onOpenGenerateModal={() => setShowTopicGeneratorModal(true)}
                onOpenPromptModal={() => setShowSystemPromptModal(true)}
                onOpenQuizModal={() => setShowRevisionQuiz(true)}
                onOpenChapterDirectory={() => setShowChapterDirectory(true)}
                onNavigateToPyq={() => {
                  setTestInitialSubTab('pyq_guru');
                  setCurrentTab('tests');
                }}
                onNavigateToPyqTest={() => {
                  setTestInitialSubTab('pyq_test');
                  setCurrentTab('tests');
                }}
                paperStyle={topperPaperStyle}
                onChangePaperStyle={setTopperPaperStyle}
                handwritingFont={topperFont}
                onChangeFont={setTopperFont}
                inkColor={topperInkColor}
                onChangeInkColor={setTopperInkColor}
                fontSize={topperFontSize}
                onChangeFontSize={setTopperFontSize}
                markdown={topperMarkdown}
              />

              <TopperRegisterPage
                topic={topperTopic}
                grade={topperGrade}
                subject={topperSubject}
                markdown={topperMarkdown}
                paperStyle={topperPaperStyle}
                handwritingFont={topperFont}
                inkColor={topperInkColor}
                fontSize={topperFontSize}
                stickyNotes={topperStickyNotes}
                onAddStickyNote={(text, color) => {
                  setTopperStickyNotes((prev) => [
                    ...prev,
                    { id: `sticky_${Date.now()}`, text, color }
                  ]);
                }}
                onDeleteStickyNote={(id) => {
                  setTopperStickyNotes((prev) => prev.filter((n) => n.id !== id));
                }}
              />
            </div>
          </div>
        )}

        {/* Tab: Official 2026-27 Syllabus Section */}
        {currentTab === 'syllabus' && (
          <SyllabusSection
            activeClass={activeClass}
            onClassChange={(cls) => setActiveClass(cls)}
            onGenerateNotesForChapter={(classGrade, subject, chapter) => {
              handleGenerateFromBook(classGrade, subject, chapter);
            }}
            onGoToTests={(classGrade, chapter) => {
              setCurrentTab('tests');
            }}
          />
        )}

        {/* Tab: NCERT Books Section */}
        {currentTab === 'books' && (
          <NcertBooksSection
            onGenerateNotesForChapter={handleGenerateFromBook}
          />
        )}

        {/* Tab: Practice Tests Section */}
        {currentTab === 'tests' && (
          <TestSection
            user={userProfile}
            onRequireAuth={() => {
              setAuthWallMessage("Please log in or sign up to attempt chapter practice tests and track your score.");
              setShowAuthWall(true);
            }}
            activeClass={activeClass}
            initialSubTab={testInitialSubTab}
            initialTopic={topperTopic}
            initialGrade={topperGrade}
            initialSubject={topperSubject}
            onGoToStudio={(cmd) => {
              setQueuedCommand(cmd);
              setCurrentTab('studio');
              if (firebaseUser) {
                handleExecuteCommand(cmd);
              } else {
                setAuthWallMessage("Please log in or sign up to view the handwritten note for this chapter.");
                setShowAuthWall(true);
              }
            }}
          />
        )}

        {/* Tab: YouTube Channel Section */}
        {currentTab === 'youtube' && (
          <YouTubeChannelSection
            channelUrl="https://www.youtube.com/@BrainBuzz2702"
          />
        )}

        {/* Tab: Notes Library */}
        {currentTab === 'library' && (
          <StudentNotesLibrary
            notes={notesList}
            currentUserId={firebaseUser?.uid}
            isAdmin={isAdmin}
            onSelectNote={handleSelectNoteFromLibrary}
            onDeleteNote={handleDeleteNote}
            onNewNoteClick={() => setCurrentTab('studio')}
            onSynthesizeChapter={(cls, sub, ch) => {
              handleExecuteCommand(`/handwriting ${cls} ${sub} ${ch}`);
            }}
          />
        )}

        {/* Tab: Admin Dashboard */}
        {currentTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              notes={notesList}
              complaints={complaintsList}
              currentProfile={userProfile}
              onUpdateComplaintStatus={updateComplaintStatus}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 astra-card border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Administrative Access Required</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You do not have administrative credentials to view telemetry and student grievances.
              </p>
              <button
                onClick={() => setCurrentTab('landing')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          )
        )}

        {/* Tab: Dedicated Terms & Conditions Page */}
        {currentTab === 'terms' && (
          <TermsAndConditionsPage
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {/* Tab: Dedicated Privacy Policy Page */}
        {currentTab === 'privacy' && (
          <PrivacyPolicyPage
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {/* Tab: Adaptive Learning Dashboard */}
        {currentTab === 'dashboard' && (
          <AdaptiveLearningDashboard
            user={userProfile}
            activeClass={activeClass}
            onGoToStudio={(cmd) => {
              if (cmd) {
                handleExecuteCommand(cmd);
              }
              setCurrentTab('studio');
            }}
            onGoToTests={() => setCurrentTab('tests')}
            onGoToCourses={() => setCurrentTab('courses')}
            onGoToAiTutor={() => setCurrentTab('ai-tutor')}
            onRequireAuth={() => {
              setAuthWallMessage("Please log in or sign up to view your personalized study dashboard.");
              setShowAuthWall(true);
            }}
          />
        )}

        {/* Tab: Textbook to Complete Course Generator */}
        {currentTab === 'courses' && (
          <CourseGeneratorSection
            user={userProfile}
            activeClass={activeClass}
            onGoToStudio={(cmd) => {
              handleExecuteCommand(cmd);
              setCurrentTab('studio');
            }}
            onRequireAuth={() => {
              setAuthWallMessage("Please log in or sign up to generate textbook courses.");
              setShowAuthWall(true);
            }}
          />
        )}


        {/* Tab: AI Homework Scanner */}
        {currentTab === 'scanner' && (
          <HomeworkScannerSection
            user={userProfile}
            activeClass={activeClass}
            onRequireAuth={() => {
              setAuthWallMessage("Please log in or sign up to scan and evaluate homework solutions.");
              setShowAuthWall(true);
            }}
          />
        )}

        {/* Tab: Virtual Practical Academy (CBSE / NEET / JEE Main / CUET Multi-Stage Labs) */}
        {(currentTab === 'practicals' || currentTab === 'practical_academy') && (
          <VirtualPracticalAcademy
            activeClass={activeClass}
            userProfile={userProfile}
            onNavigateTab={(tab, subTab) => {
              if (tab === 'labs' && subTab) {
                handleGoToLabs(subTab as any);
              } else {
                handleTabChange(tab as NavTab);
              }
            }}
          />
        )}

        {/* Tab: Mind Maps & Virtual Labs */}
        {currentTab === 'labs' && (
          <InteractiveLabsAndMindMaps
            activeClass={activeClass}
            initialSubTab={labsInitialSubTab}
            userProfile={userProfile}
            onGoToSciLab={() => setCurrentTab('scilab')}
          />
        )}

        {/* Tab: SciLab BioMolecular Studio (Bioinformatics, Molecular Dynamics, Chemistry Tools & Biological Databases) */}
        {currentTab === 'scilab' && (
          <SciLabStudio />
        )}

        {/* Tab: Exam Revision Planner (Phase 4) */}
        {currentTab === 'planner' && (
          <ExamRevisionPlanner
            user={userProfile}
            activeClass={activeClass}
            onGoToStudio={(cmd) => {
              setQueuedCommand(cmd);
              setCurrentTab('studio');
              if (firebaseUser) {
                handleExecuteCommand(cmd);
              } else {
                setAuthWallMessage("Please log in or sign up to generate study notes for this revision slot.");
                setShowAuthWall(true);
              }
            }}
            onGoToTests={() => setCurrentTab('tests')}
            onRequireAuth={() => {
              setAuthWallMessage("Please log in or sign up to personalize your exam revision schedule.");
              setShowAuthWall(true);
            }}
          />
        )}

        {/* Tab: Community Notes Hub & Study Circles (Phase 4) */}
        {currentTab === 'community' && (
          <CommunityNotesHub
            user={userProfile}
            activeClass={activeClass}
            onGoToStudio={(cmd) => {
              setQueuedCommand(cmd);
              setCurrentTab('studio');
              if (firebaseUser) {
                handleExecuteCommand(cmd);
              } else {
                setAuthWallMessage("Please log in or sign up to view and customize community handwritten notes.");
                setShowAuthWall(true);
              }
            }}
            onRequireAuth={() => {
              setAuthWallMessage("Please log in or sign up to upvote notes and join peer study circles.");
              setShowAuthWall(true);
            }}
          />
        )}

        {/* Tab: Dedicated Full-Page AI Tutor Studio (Phase 4) */}
        {currentTab === 'ai-tutor' && (
          <AiTutorStudio
            userProfile={userProfile}
            activeClass={activeClass}
            onClassChange={setActiveClass}
            onOpenNotesWithPayload={(payload, style) => {
              setCurrentActiveNote(payload);
              if (style) setCurrentActiveStyle(style);
              setCurrentTab('studio');
            }}
            onNavigateToSection={(tab, subTab) => {
              if (tab === 'labs' && subTab) {
                handleGoToLabs(subTab);
              } else {
                setCurrentTab(tab);
              }
            }}
          />
        )}

        {/* Tab: Teacher & Educator Command Portal (Phase 8) */}
        {currentTab === 'teacher' && (
          isTeacherOrAdmin ? (
            <TeacherPortal
              userProfile={userProfile}
              activeClass={activeClass}
              onNavigateToSection={(tab, subTab) => {
                if (tab === 'labs' && subTab) {
                  handleGoToLabs(subTab);
                } else {
                  setCurrentTab(tab);
                }
              }}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 astra-card border border-blue-500/30 rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <Shield className="w-12 h-12 text-blue-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Teacher or Admin Access Required</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This portal is exclusively reserved for teachers and administrators. Student accounts do not have access to the Educator Command Portal.
              </p>
              <button
                onClick={() => setCurrentTab('landing')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          )
        )}
      </main>

      {/* Astra Footer */}
      <footer className="bg-black/80 border-t border-white/10 mt-16 py-10 text-xs text-slate-400 print:hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/BuzzingBrain_Video_Watermark_150x150.png"
                alt="Buzzing Brain"
                className="w-8 h-8 rounded-full border border-amber-400/80 object-cover"
              />
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight">Sarve Vidhya</span>
                <span className="text-slate-500 block text-[11px]">Free Education for All &bull; Student-First Intelligent Learning Platform</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
              <button
                onClick={() => setCurrentTab('landing')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Free Education
              </button>
              <button
                onClick={() => setCurrentTab('syllabus')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                2026–27 Syllabus
              </button>
              <button
                onClick={() => setCurrentTab('books')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                NCERT Books
              </button>
              <button
                onClick={() => setCurrentTab('tests')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Practice Tests
              </button>
              <button
                onClick={() => setCurrentTab('studio')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Handwritten Studio
              </button>
              <button
                onClick={() => setCurrentTab('youtube')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                YouTube (@BrainBuzz2702)
              </button>
              <button
                onClick={() => setCurrentTab('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms and Conditions
              </button>
              <button
                onClick={() => setCurrentTab('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowComplaintModal(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Grievance Desk
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>&copy; {new Date().getFullYear()} Buzzing Brain. All NCERT references adhere to CBSE public curriculum.</span>
            <span className="font-mono">YouTube: @BrainBuzz2702 &bull; Free Open Platform</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleCompleteOnboarding}
        onClose={() => {
          if (firebaseUser) {
            sessionStorage.setItem(`bb_onboarding_dismissed_${firebaseUser.uid}`, 'true');
          }
          setShowOnboarding(false);
        }}
        userProfile={userProfile}
        userName={firebaseUser?.displayName || undefined}
        userEmail={firebaseUser?.email || undefined}
        onOpenLegalModal={(tab) => {
          setLegalModalTab(tab);
          setShowLegalModal(true);
        }}
      />

      <ComplaintModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        onSubmit={handleSubmitComplaint}
        myComplaints={userComplaints}
        currentProfile={userProfile}
      />

      <TermsPrivacyModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalModalTab}
      />

      <AiTutorChatDrawer
        isOpen={showTutorChat}
        onClose={() => setShowTutorChat(false)}
        activeNote={currentActiveNote}
        initialGrade={activeClass}
        onApplyCommand={(cmd) => {
          setShowTutorChat(false);
          handleExecuteCommand(cmd);
        }}
      />

      {/* Floating AI Tutor Quick Trigger Button */}
      {!showTutorChat && (
        <button
          onClick={() => setShowTutorChat(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-900/40 border border-purple-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Open AI Tutor (Hinglish, Hindi & English explanations)"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </div>
          <span>Ask AI Tutor</span>
          <span className="hidden sm:inline-block text-[10px] bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30 font-medium">
            Hinglish • हिंदी • English
          </span>
        </button>
      )}

      <AuthWallModal
        isOpen={showAuthWall}
        onClose={() => setShowAuthWall(false)}
        initialMode={authModalMode}
        description={authWallMessage}
        onOpenLegal={handleOpenLegal}
      />

      {/* Global Search & Content Discovery Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        activeClass={activeClass}
        onNavigate={(tab, subTab, cmd) => {
          if (cmd) {
            handleExecuteCommand(cmd);
          }
          if (subTab && tab === 'labs') {
            handleGoToLabs(subTab as any);
          } else {
            handleTabChange(tab);
          }
        }}
      />

      {/* Global Accessibility & Neuroinclusive Floating Toolbar */}
      <AccessibilityToolbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-semibold rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Chapter Directory & 25-Year Matrix Drawer */}
      <ChapterDirectoryDrawer
        isOpen={showChapterDirectory}
        onClose={() => setShowChapterDirectory(false)}
        onSelectChapterNotes={(chapter) => handleSelectChapterFromDirectory(chapter)}
        onOpenPyqAgent={(chapter) => {
          setTopperTopic(chapter.name);
          setTopperGrade(chapter.classGrade);
          setTopperSubject(chapter.subject);
          setShowPyqAgent(true);
        }}
        onOpenPyqTest={(chapter) => {
          setTopperTopic(chapter.name);
          setTopperGrade(chapter.classGrade);
          setTopperSubject(chapter.subject);
          setShowPyqTestModal(true);
        }}
        currentTopic={topperTopic}
      />

      {/* 25-Year PYQ AI Evaluator Agent Panel */}
      <PyqAgentPanel
        isOpen={showPyqAgent}
        onClose={() => setShowPyqAgent(false)}
        topic={topperTopic}
        grade={topperGrade}
        subject={topperSubject}
        onLoadNotesForChapter={(t, g, s) => {
          setTopperTopic(t);
          setTopperGrade(g);
          setTopperSubject(s);
          const curated = getCuratedChapterNote(g, s, t);
          setCurrentActiveNote(curated);
          setTopperMarkdown(convertNotePayloadToTopperMarkdown(curated));
          setCurrentTab('studio');
        }}
        onOpenPyqTest={() => setShowPyqTestModal(true)}
      />

      {/* 25-Year PYQ Test Simulator Generator Modal */}
      <PyqTestGeneratorModal
        isOpen={showPyqTestModal}
        onClose={() => setShowPyqTestModal(false)}
        topic={topperTopic}
        grade={topperGrade}
        subject={topperSubject}
        onOpenNotes={(t, g, s) => {
          setTopperTopic(t);
          setTopperGrade(g);
          setTopperSubject(s);
          const curated = getCuratedChapterNote(g, s, t);
          setCurrentActiveNote(curated);
          setTopperMarkdown(convertNotePayloadToTopperMarkdown(curated));
          setCurrentTab('studio');
        }}
      />

      {/* Examiner Rapid Recall Quiz Modal */}
      <RevisionQuizModal
        isOpen={showRevisionQuiz}
        onClose={() => setShowRevisionQuiz(false)}
        topic={topperTopic}
        markdown={topperMarkdown}
      />

      {/* System Prompt & Structure Directives Modal */}
      <SystemPromptViewer
        isOpen={showSystemPromptModal}
        onClose={() => setShowSystemPromptModal(false)}
        topic={topperTopic}
        grade={topperGrade}
      />

      {/* Topper Note Stylist Generator Modal */}
      <TopicGeneratorModal
        isOpen={showTopicGeneratorModal}
        onClose={() => setShowTopicGeneratorModal(false)}
        onGenerate={handleGenerateTopperNotes}
        isGenerating={isGenerating}
        presets={TOPIC_PRESETS}
      />

      {/* Offline Status & Local PWA Cache Notification */}
      <OfflineIndicator />
    </InteractiveSpaceBackground>
  );
}
