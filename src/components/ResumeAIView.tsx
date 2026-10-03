import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Check,
  RefreshCw,
  ExternalLink,
  Code2
} from 'lucide-react';
import { ResumeAnalysis, UserProfile } from '../types/job';
import { SAMPLE_RESUMES } from '../data/mockJobs';
import { analyzeResumeWithAI } from '../services/geminiService';
import { api } from '../services/api';

interface ResumeAIViewProps {
  user: UserProfile;
  onUpdateAnalysis: (analysis: ResumeAnalysis, fileName: string) => void;
  onNavigateToMatches: () => void;
}

export const ResumeAIView: React.FC<ResumeAIViewProps> = ({
  user,
  onUpdateAnalysis,
  onNavigateToMatches
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [persistenceNotice, setPersistenceNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processingSteps = [
    'Reading resume format and text content...',
    'Extracting work history and professional experience...',
    'Identifying technical skills and competencies...',
    'Understanding career trajectory and profile...',
    'Finding and ranking matching job opportunities...'
  ];

  const handleStartAnalysis = async (content: string, name: string) => {
    setIsProcessing(true);
    setPersistenceNotice(null);
    setUploadFileName(name);
    setProcessingStep(0);

    // Simulate clean sequential progress steps
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < processingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    try {
      const analysis = await analyzeResumeWithAI(content, name);
      try {
        await api.saveResumeAnalysis(name, analysis);
      } catch (saveError) {
        console.error('[Resume Storage] Analysis completed but was not saved:', saveError);
        const message = saveError instanceof Error ? saveError.message : 'Storage is unavailable.';
        setPersistenceNotice(`Analysis completed, but it was not saved to your account: ${message}`);
      }
      clearInterval(stepInterval);
      setProcessingStep(processingSteps.length - 1);
      setTimeout(() => {
        setIsProcessing(false);
        onUpdateAnalysis(analysis, name);
      }, 500);
    } catch (analysisError) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      const message = analysisError instanceof Error ? analysisError.message : 'Resume analysis failed.';
      setPersistenceNotice(message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      handleStartAnalysis(text || file.name, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        handleStartAnalysis(text || file.name, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = (sample: (typeof SAMPLE_RESUMES)[0]) => {
    setRawText(sample.text);
    handleStartAnalysis(sample.text, `${sample.candidateName.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  const analysis = user.resumeAnalysis;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Analyze Your Resume
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload your resume to discover jobs that match your skills and experience with high compatibility.
        </p>
      </div>

      {/* Upload Zone & Quick Sample Resumes */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-green-600 bg-green-50/50'
              : 'border-slate-300 hover:border-green-500 bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Drag & Drop your resume here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-green-700 hover:underline font-semibold"
            >
              Browse files
            </button>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supported formats: PDF, DOCX, TXT (Maximum file size: 10 MB)
          </p>

          {/* Quick Upload action button */}
          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              Upload Resume
            </button>
          </div>
        </div>

        {/* 1-Click Test Sample Resumes Row */}
        <div>
          <span className="text-xs font-semibold text-slate-600 block mb-2.5">
            Or test instantly with pre-loaded professional sample resumes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SAMPLE_RESUMES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample)}
                className="text-left p-3 border border-slate-200 hover:border-green-600 rounded-lg hover:bg-green-50/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-green-700">
                    {sample.candidateName}
                  </span>
                  <span className="text-[10px] text-green-700 font-semibold bg-green-100 px-1.5 py-0.5 rounded">
                    Test
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">{sample.role}</div>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                  {sample.summary}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {persistenceNotice && (
        <div role="alert" className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-sm text-amber-900">
          {persistenceNotice}
        </div>
      )}

      {/* Section 13: Processing State Indicator */}
      {isProcessing && (
        <div className="bg-white border border-green-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-green-600 animate-spin" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Processing {uploadFileName || 'Resume'}
              </h3>
              <p className="text-xs text-slate-500">
                Analyzing resume structure and cross-referencing market skills
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {processingSteps.map((step, idx) => {
              const isDone = idx < processingStep;
              const isCurrent = idx === processingStep;
              return (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      isDone
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`${
                      isDone
                        ? 'text-slate-800 font-medium'
                        : isCurrent
                        ? 'text-green-800 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections 14 & 15: Analysis Results Display */}
      {analysis && !isProcessing && (
        <div className="space-y-6">
          {/* Top Banner with Action to Matches */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Analysis Complete for {analysis.candidateName}
                </span>
                <span className="text-xs text-slate-600 ml-1">
                  ({analysis.allSkills.length} skills extracted)
                </span>
              </div>
            </div>
            <button
              onClick={onNavigateToMatches}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Matching Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 14: Resume Overview Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{analysis.candidateName}</h2>
                <p className="text-sm font-semibold text-green-700 mt-0.5">{analysis.currentRole}</p>
                <p className="text-xs text-slate-500 mt-0.5">{analysis.location} • {analysis.yearsOfExperience}+ Years Experience</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Experience Level</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded capitalize mt-1 inline-block">
                  {analysis.experienceLevel} Level
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Professional Summary</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {analysis.summary}
              </p>
            </div>
          </div>

          {/* Section 15: Resume Insights Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-bold text-slate-900">Resume Insights & Completeness</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Profile Completeness:</span>
                <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  {analysis.insights.completenessScore}%
                </span>
              </div>
            </div>

            {/* Completeness Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-600 h-full rounded-full transition-all"
                style={{ width: `${analysis.insights.completenessScore}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Key Strengths
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.insights.strongSkills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-green-50 text-green-800 border border-green-200 rounded font-medium">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  High-Demand Market Gaps
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.insights.missingSkills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
                      • {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions to improve */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1.5">
                Profile Recommendations:
              </span>
              <ul className="space-y-1 text-slate-600">
                {analysis.insights.suggestions.map((sug, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 14: Categorized Skills Tags */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-green-600" />
              Extracted Technical Skills
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Programming Languages
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills.programmingLanguages.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Backend Frameworks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills.backend.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Databases & Caching
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills.databases.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Cloud & Infrastructure
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills.cloudAndDevOps.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Frontend & UI
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills.frontend.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Developer Tools & Testing
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills.toolsAndFrameworks.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 14: Recommended Roles */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Recommended Target Roles
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.recommendedRoles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-900 font-semibold text-xs rounded-md"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Section 14: Work Experience Timeline */}
          {analysis.experience.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-green-600" />
                Work Experience Timeline
              </h3>
              <div className="divide-y divide-slate-100 space-y-4">
                {analysis.experience.map((exp, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{exp.role}</h4>
                      <span className="text-xs text-slate-500 font-medium">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{exp.company} • {exp.location || 'India'}</p>
                    <ul className="space-y-1 mt-2">
                      {exp.description.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 14: Projects */}
          {analysis.projects.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-green-600" />
                Key Projects & Architectures
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysis.projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t) => (
                        <span key={t} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
