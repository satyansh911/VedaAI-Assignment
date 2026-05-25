import { Groq } from 'groq-sdk';
import { env } from '../config/env';

const client = new Groq({ apiKey: env.groq.apiKey });

export type ToolkitTool = 'lesson_plan' | 'rubric' | 'study_notes';

export interface ToolkitInput {
  tool: ToolkitTool;
  topic: string;
  gradeLevel?: string;
  subject?: string;
  duration?: number;
  notes?: string;
}

interface PromptBundle {
  system: string;
  user: string;
}

function buildPrompt({ tool, topic, gradeLevel, subject, duration, notes }: ToolkitInput): PromptBundle {
  const ctx = [
    subject ? `Subject: ${subject}` : null,
    gradeLevel ? `Grade level: ${gradeLevel}` : null,
    duration ? `Target duration: ${duration} minutes` : null,
    notes ? `Additional notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  if (tool === 'lesson_plan') {
    return {
      system:
        'You are an experienced teacher who designs clear, classroom-ready lesson plans. Write in plain markdown with section headings.',
      user: `Create a complete lesson plan on: "${topic}".
${ctx}

Include these sections (in this order):
## Learning Objectives
## Materials & Resources
## Lesson Outline (with approximate timings)
## Key Concepts & Explanations
## Activities & Engagement
## Assessment / Checks for Understanding
## Homework / Extension`,
    };
  }

  if (tool === 'rubric') {
    return {
      system:
        'You are a teacher who creates clear assessment rubrics. Output a markdown table plus a short scoring guide.',
      user: `Create a 4-level (Excellent / Proficient / Developing / Beginning) rubric for: "${topic}".
${ctx}

Format:
## Rubric
| Criterion | Excellent (4) | Proficient (3) | Developing (2) | Beginning (1) |
| --- | --- | --- | --- | --- |
... 4–6 rows ...

## How to Use
- 2–3 short bullets on how to apply this rubric.`,
    };
  }

  return {
    system:
      'You are a teacher who writes concise, student-friendly study notes. Use plain markdown with headings, bullets, and short paragraphs.',
    user: `Create study notes on: "${topic}".
${ctx}

Include:
## Overview
## Key Concepts (with short explanations)
## Important Definitions / Formulas (if relevant)
## Worked Example or Illustration
## Quick Review (5 bullet recap)
## Practice Questions (3–5 questions, with answers in italics)`,
  };
}

export async function generateToolkitContent(input: ToolkitInput): Promise<string> {
  if (!env.groq.apiKey) throw new Error('GROQ_API_KEY is not configured');

  const { system, user } = buildPrompt(input);

  const completion = await client.chat.completions.create({
    model: env.groq.model,
    temperature: 0.6,
    max_tokens: 2500,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  if (!raw.trim()) throw new Error('Empty response from LLM');
  return raw.trim();
}
