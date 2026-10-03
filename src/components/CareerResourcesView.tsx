import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, FileText, Code2, Users } from 'lucide-react';

interface CareerResourcesViewProps {
  onNavigate: (view: string) => void;
}

export const CareerResourcesView: React.FC<CareerResourcesViewProps> = ({ onNavigate }) => {
  const articles = [
    {
      id: 'res-1',
      title: 'Cracking Software Engineering Internships in 2027',
      category: 'Interview Preparation',
      readTime: '6 min read',
      excerpt: 'A comprehensive guide to Data Structures, System Design, and behavioral rounds for summer internships at Google, Microsoft, and Amazon.',
      bullets: ['DSA mastery roadmap', 'CoderPad & live coding best practices', 'Stipends & timeline comparison']
    },
    {
      id: 'res-2',
      title: 'FastAPI & PostgreSQL: Building Production Microservices',
      category: 'Backend Architecture',
      readTime: '8 min read',
      excerpt: 'How leading Indian tech unicorns scale their payment engines, connection pools, and asynchronous event queues.',
      bullets: ['Async SQLAlchemy 2.0 best practices', 'Pydantic v2 validation speedups', 'Database indexing for sub-10ms queries']
    },
    {
      id: 'res-3',
      title: 'ATS-Proof Resumes: What Technical Recruiters Look For',
      category: 'Resume Strategy',
      readTime: '5 min read',
      excerpt: 'Why clean formatting, metrics-driven bullet points, and verified project links consistently outperform buzzword-heavy templates.',
      bullets: ['The XYZ formula for achievements', 'Structuring GitHub & open-source proof', 'AI resume parser optimization']
    },
    {
      id: 'res-4',
      title: 'Negotiating Technical Compensation in India & Remote Global Roles',
      category: 'Career Growth',
      readTime: '7 min read',
      excerpt: 'Understanding base salary, ESOPs/RSUs, signing bonuses, and USD remote contracts for software engineers.',
      bullets: ['Fixed vs variable CTC breakdowns', 'Tax considerations for foreign remote contracts', 'Evaluating startup equity packages']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-[#E5E5E5] pb-6">
        <span className="text-[10px] font-bold tracking-widest text-[#8C9285] uppercase">
          KNOWLEDGE & GUIDANCE
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F1F1F] tracking-tight mt-1">
          Career resources<span className="text-[#F4C430]">.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-xl">
          Practical engineering guides, verified interview frameworks, and compensation insights to navigate your technical career.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((item) => (
          <article
            key={item.id}
            className="border border-[#E5E5E5] p-6 bg-white hover:border-[#B18A08] transition-colors space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#82877C]">
                <span className="font-bold text-[#745800] bg-[#FFF4CC] px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <span>{item.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold text-[#1F1F1F] tracking-tight hover:text-[#B18A08] transition-colors">
                {item.title}
              </h2>
              <p className="text-xs text-[#666666] leading-relaxed">
                {item.excerpt}
              </p>
              <ul className="text-xs text-[#53594F] space-y-1 pt-2">
                {item.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-[#B18A08] font-bold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-[#ECE7D8] flex items-center justify-between">
              <span className="text-[11px] text-[#82877C]">Curated by openroles editorial</span>
              <button
                onClick={() => onNavigate('home')}
                className="text-xs font-bold text-[#745800] hover:text-[#1F1F1F] flex items-center gap-1 cursor-pointer"
              >
                <span>Browse matching jobs</span>
                <span>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
