import { Groq } from 'groq-sdk';
import { z } from 'zod';
import { env } from '../config/env';
import { IAssignment, IGeneratedPaper } from '../models/Assignment';
import { buildGenerationPrompt } from '../utils/prompt';

const client = new Groq({ apiKey: env.groq.apiKey });

const QuestionSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(1),
  difficulty: z.string().transform((val) => {
    const normalized = val.toLowerCase();
    if (normalized === 'medium') return 'moderate';
    if (['easy', 'moderate', 'hard'].includes(normalized)) return normalized;
    throw new Error(`Invalid difficulty: ${val}`);
  }).pipe(z.enum(['easy', 'moderate', 'hard'])),
  marks: z.number().positive(),
  answer: z.string().optional(),
});

const SectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

const PaperSchema = z.object({
  title: z.string().min(1),
  subject: z.string().optional(),
  totalMarks: z.number().positive(),
  durationMinutes: z.number().positive().optional(),
  sections: z.array(SectionSchema).min(1),
});

function stripCodeFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function extractJson(raw: string): unknown {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('LLM response did not contain a JSON object');
    }
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

export async function generatePaper(assignment: IAssignment): Promise<IGeneratedPaper> {
  if (!env.groq.apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const { system, user } = buildGenerationPrompt(assignment);

  const completion = await client.chat.completions.create({
    model: env.groq.model,
    temperature: 0.7,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  if (!raw) throw new Error('Empty response from LLM');

  let parsed: unknown;
  try {
    parsed = extractJson(raw);
  } catch (err) {
    console.error('[llm] Failed to extract JSON from response:', raw.slice(0, 500));
    throw err;
  }

  let paper: z.infer<typeof PaperSchema>;
  try {
    paper = PaperSchema.parse(parsed);
  } catch (err) {
    console.error('[llm] Schema validation failed. Parsed object:', JSON.stringify(parsed).slice(0, 500));
    throw err;
  }

  let counter = 1;
  for (const section of paper.sections) {
    section.questions = section.questions.map((q) => ({ ...q, number: counter++ }));
  }

  return paper as IGeneratedPaper;
}
