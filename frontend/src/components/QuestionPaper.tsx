import { forwardRef } from 'react';
import { Assignment } from '@/types/assignment';
import { DifficultyBadge } from './DifficultyBadge';

interface Props {
  assignment: Assignment;
  showBadges?: boolean;
}

export const QuestionPaper = forwardRef<HTMLDivElement, Props>(function QuestionPaper(
  { assignment, showBadges = true },
  ref,
) {
  const paper = assignment.paper;
  if (!paper) return null;

  return (
    <div
      ref={ref}
      className="bg-surface rounded-3xl p-8 md:p-12 text-ink-900"
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* School / title */}
      <header className="text-center mb-6">
        <h1 className="text-[20px] md:text-[24px] font-extrabold tracking-tight">
          Delhi Public School, Sector-4, Bokaro
        </h1>
        <p className="mt-3 text-[15px] font-semibold">
          Subject: {paper.subject ?? assignment.subject ?? 'General'}
        </p>
        <p className="text-[15px] font-semibold">
          Class: {assignment.gradeLevel ?? '5th'}
        </p>
      </header>

      {/* Time + marks row */}
      <div className="flex flex-wrap justify-between gap-y-1 text-[14px] font-semibold mt-6">
        <p>Time Allowed: {paper.durationMinutes ?? 45} minutes</p>
        <p>Maximum Marks: {paper.totalMarks}</p>
      </div>

      <p className="mt-4 text-[14px] font-semibold">
        All questions are compulsory unless stated otherwise.
      </p>

      {/* Student info */}
      <div className="mt-5 space-y-2 text-[14px] font-semibold">
        <p>
          Name: <span className="exam-line" />
        </p>
        <p>
          Roll Number: <span className="exam-line" />
        </p>
        <p>
          Class: {assignment.gradeLevel ?? '5th'} &nbsp; Section:{' '}
          <span className="exam-line" style={{ minWidth: '90px' }} />
        </p>
      </div>

      {/* Sections */}
      <div className="mt-8 space-y-8">
        {paper.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-center text-[16px] font-extrabold mb-4">
              {section.title}
            </h2>

            <h3 className="text-[14px] font-bold">
              {extractSubtitle(section.title) || 'Questions'}
            </h3>
            <p className="text-[13px] italic text-ink-700 mb-3">{section.instruction}</p>

            <ol className="space-y-3">
              {section.questions.map((q) => (
                <li key={q.number} className="flex gap-2 text-[14px] leading-relaxed">
                  <span className="font-semibold min-w-[1.75rem]">{q.number}.</span>
                  <div className="flex-1">
                    <span className="whitespace-pre-line">
                      {showBadges && (
                        <span className="mr-1 inline-block align-middle">
                          <DifficultyBadge difficulty={q.difficulty} compact />
                        </span>
                      )}
                      {q.text}
                      <span className="ml-1 text-ink-700">[{q.marks} Marks]</span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className="mt-10 text-[14px] font-bold">End of Question Paper</p>

      {/* Answer Key */}
      {paper.sections.some(s => s.questions.some(q => q.answer)) && (
        <div className="mt-12 pt-8 border-t-2 border-ink-200">
          <h2 className="text-[16px] font-extrabold mb-4">Answer Key</h2>
          <div className="space-y-4">
            {paper.sections.map((section, sIdx) => (
              section.questions.some(q => q.answer) && (
                <div key={sIdx}>
                  <h3 className="text-[14px] font-bold mb-2">{section.title}</h3>
                  <ol className="space-y-2 ml-4">
                    {section.questions.map((q) => (
                      q.answer && (
                        <li key={q.number} className="text-[13px]">
                          <span className="font-semibold">{q.number}. </span>
                          {q.answer}
                        </li>
                      )
                    ))}
                  </ol>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

function extractSubtitle(title: string): string {
  // "Section A — Short Answer Questions" -> "Short Answer Questions"
  const dashIdx = title.search(/[—\-–:]/);
  return dashIdx >= 0 ? title.slice(dashIdx + 1).trim() : '';
}
