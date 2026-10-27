import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  PenTool, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Download, 
  GraduationCap, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { NCERT_SYLLABUS, NCERTChapterItem } from '../data/ncertSyllabus';
import { SyllabusPdfViewerModal } from './SyllabusPdfViewerModal';

interface NcertBooksSectionProps {
  onGenerateNotesForChapter: (classGrade: string, subject: string, chapter: string) => void;
}

export const NcertBooksSection: React.FC<NcertBooksSectionProps> = ({
  onGenerateNotesForChapter,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSyllabusPdfModal, setShowSyllabusPdfModal] = useState(false);
  const [activeChapterModal, setActiveChapterModal] = useState<{
    chapter: NCERTChapterItem;
    classGrade: string;
    subject: string;
  } | null>(null);

  const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const classData = NCERT_SYLLABUS[selectedClass] || {};
  const availableSubjects = Object.keys(classData);

  // Filtered chapters
  const getSubjectList = () => {
    if (selectedSubject !== 'All') {
      return availableSubjects.filter(s => s.toLowerCase() === selectedSubject.toLowerCase());
    }
    return availableSubjects;
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 space-y-6">
      {/* Header Banner - 2026-27 Syllabus Reference Integration */}
      <div className="astra-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official NCERT &amp; CBSE Syllabus (2026–27 Academic Session)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curriculum Syllabus &amp; Digital Textbooks
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Browse all verified chapters across Class 9, 10, 11, and 12 according to the latest CBSE 2026–27 curriculum. Read chapter outlines, examine the official 17-page reference PDF, and instantly synthesize authentic handwritten study notes.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Prominent PDF Syllabus Document Action */}
          <button
            type="button"
            onClick={() => setShowSyllabusPdfModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Open 2026–27 Syllabus Reference PDF (17 Pages)</span>
          </button>

          <a
            href="https://ncert.nic.in/textbook.php"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>NCERT Textbooks</span>
          </a>

          <a
            href="https://ncert.nic.in/division/pd/online-textbook.php?ln=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Online Textbooks</span>
          </a>

          <a
            href="https://epathshala.nic.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>ePathshala Portal</span>
          </a>

          <a
            href="https://diksha.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            <span>DIKSHA National Portal</span>
          </a>
        </div>

        {/* Copyright & Permission Compliance Disclaimer */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/20 text-[11px] text-slate-400 flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300">Official Resource Linking &amp; Copyright Compliance: </strong> 
            Buzzing Brain strictly respects applicable NCERT, ePathshala, and Ministry of Education copyright terms. We direct students to official government portals for original copyrighted textbooks without unauthorized republication, bulk mirroring, or redistribution. Buzzing Brain provides original handwritten educational explanations, simulations, and formative assessments.
          </p>
        </div>
      </div>

      {/* Class Selector Tabs (Separate each class clearly) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-semibold mr-1">Select Class:</span>
          {classes.map((cls) => (
            <button
              key={cls}
              onClick={() => {
                setSelectedClass(cls);
                setSelectedSubject('All');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedClass === cls
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Search & Subject Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters, topics, formulas in 2026-27 syllabus..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedSubject('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSubject === 'All'
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              All Subjects
            </button>
            {availableSubjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSubject === subj
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Books & Chapters Grid */}
      <div className="space-y-8">
        {getSubjectList().map((subj) => {
          const rawChapters = classData[subj] || [];
          const filteredChapters = rawChapters.filter(ch => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
              ch.name.toLowerCase().includes(q) ||
              ch.unit.toLowerCase().includes(q) ||
              ch.keyTopics.some(t => t.toLowerCase().includes(q))
            );
          });

          if (filteredChapters.length === 0) return null;

          return (
            <div key={subj} className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <h3 className="text-lg font-bold text-white">
                    {selectedClass} &bull; {subj}
                  </h3>
                  <span className="text-xs text-slate-400">
                    ({filteredChapters.length} Chapters)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChapters.map((chapter) => (
                  <div
                    key={chapter.number}
                    className="astra-card astra-card-hover rounded-2xl p-5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-mono text-amber-400 font-bold">
                          Chapter {chapter.number}
                        </span>
                        <span className="truncate max-w-[150px] text-[11px] bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {chapter.unit}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors line-clamp-2">
                        {chapter.name}
                      </h4>

                      <div className="mt-3 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 block">Key NCERT Topics:</span>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {chapter.keyTopics.slice(0, 3).map((topic, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-1.5 line-clamp-1">
                              <span className="text-amber-400/80 leading-none">•</span>
                              <span className="truncate">{topic}</span>
                            </li>
                          ))}
                          {chapter.keyTopics.length > 3 && (
                            <li className="text-[10px] text-slate-500 italic">
                              +{chapter.keyTopics.length - 3} more syllabus points
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => setActiveChapterModal({ chapter, classGrade: selectedClass, subject: subj })}
                        className="text-slate-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Outline</span>
                      </button>

                      <button
                        onClick={() => onGenerateNotesForChapter(selectedClass, subj, chapter.name)}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Generate Notes</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chapter Overview Modal */}
      {activeChapterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="astra-card rounded-3xl max-w-lg w-full p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {activeChapterModal.classGrade} &bull; {activeChapterModal.subject} &bull; Chapter {activeChapterModal.chapter.number}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeChapterModal.chapter.name}
                </h3>
                <span className="text-xs text-slate-400">Unit: {activeChapterModal.chapter.unit}</span>
              </div>
              <button
                onClick={() => setActiveChapterModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Prescribed NCERT Curriculum Topics:
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                {activeChapterModal.chapter.keyTopics.map((topic, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <a
                href="https://ncert.nic.in/textbook.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in NCERT Portal</span>
              </a>

              <button
                onClick={() => {
                  const modal = activeChapterModal;
                  setActiveChapterModal(null);
                  onGenerateNotesForChapter(modal.classGrade, modal.subject, modal.chapter.name);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PenTool className="w-4 h-4" />
                <span>Generate Handwritten Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official 2026-27 Syllabus Reference PDF Viewer */}
      <SyllabusPdfViewerModal
        isOpen={showSyllabusPdfModal}
        onClose={() => setShowSyllabusPdfModal(false)}
        initialClass={selectedClass}
        onGenerateForChapter={onGenerateNotesForChapter}
      />
    </div>
  );
};
