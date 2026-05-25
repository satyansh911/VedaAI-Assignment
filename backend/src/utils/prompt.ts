import { IAssignment } from '../models/Assignment';

export function buildGenerationPrompt(assignment: IAssignment): {
  system: string;
  user: string;
} {
  const totalMarks = assignment.questionTypes.reduce(
    (sum, t) => sum + t.count * t.marksPerQuestion,
    0,
  );

  const questionTypeLines = assignment.questionTypes
    .map(
      (t, i) =>
        `  ${i + 1}. ${t.count} × "${t.type}" question(s) worth ${t.marksPerQuestion} mark(s) each (= ${
          t.count * t.marksPerQuestion
        } marks)`,
    )
    .join('\n');

  const sourceBlock = assignment.sourceText
    ? `\n\nSOURCE MATERIAL (use this as the primary basis for questions; do not invent facts not implied here):\n"""\n${assignment.sourceText.slice(0, 12000)}\n"""`
    : '';

  const extra = assignment.additionalInstructions
    ? `\n\nADDITIONAL INSTRUCTIONS FROM TEACHER:\n${assignment.additionalInstructions}`
    : '';

  const system = `You are an expert teacher and exam-paper designer. Your ONLY task is to generate a valid JSON object.

CRITICAL INSTRUCTIONS:
1. Output ONLY raw JSON - no markdown, code fences, prose, or explanations
2. The JSON must have these exact top-level fields: title, subject, totalMarks, durationMinutes, sections
3. Each section must have: title, instruction, questions (array)
4. Each question must have: number, text, difficulty, marks
5. Ensure totalMarks equals the sum of all question marks
6. Do not explain or comment - just output the JSON`;

  const user = `Generate an examination paper.

ASSIGNMENT DETAILS
- Title: ${assignment.title}
- Subject: ${assignment.subject ?? 'General'}
- Grade level: ${assignment.gradeLevel ?? 'Not specified'}
- Total marks (must equal sum of question marks): ${totalMarks}

REQUIRED QUESTION COMPOSITION:
${questionTypeLines}${extra}${sourceBlock}

RULES
1. Group questions into logical sections (e.g., "Section A — Multiple Choice", "Section B — Short Answer").
   Group by question type when possible; otherwise group by difficulty.
2. Each section must have an "instruction" line (e.g., "Attempt all questions.").
3. Difficulty for each question MUST be one of: "easy", "moderate", "hard".
   Distribute roughly: 40% easy, 40% moderate, 20% hard — unless the teacher's instructions say otherwise.
4. Question text must be clear, self-contained, and grade-appropriate.
5. For MULTIPLE-CHOICE questions, ALWAYS include 4 options (A, B, C, D) inline in the text.
   Format: "Question here? A) option1 B) option2 C) option3 D) option4"
   Mark the correct answer in the "answer" field as "X) correct_option_text"
6. For SHORT-ANSWER/ESSAY questions, just ask the question. Provide the expected answer in "answer" field.
7. Number questions sequentially within each section starting at 1.
8. The sum of marks across every question must EXACTLY equal ${totalMarks}.
9. EVERY question MUST have an "answer" field with the correct answer or expected response.

RESPONSE FORMAT — return ONLY this JSON object, nothing else:
{
  "title": string,
  "subject": string,
  "totalMarks": number,
  "durationMinutes": number,
  "sections": [
    {
      "title": string,
      "instruction": string,
      "questions": [
        {
          "number": number,
          "text": string,
          "difficulty": "easy" | "moderate" | "hard",
          "marks": number,
          "answer": string
        }
      ]
    }
  ]
}

EXAMPLE MCQ QUESTION:
{
  "number": 1,
  "text": "What is the capital of France? A) London B) Paris C) Berlin D) Madrid",
  "difficulty": "easy",
  "marks": 2,
  "answer": "B) Paris"
}

EXAMPLE SHORT ANSWER QUESTION:
{
  "number": 2,
  "text": "Explain the process of photosynthesis.",
  "difficulty": "moderate",
  "marks": 5,
  "answer": "Photosynthesis is the process by which plants convert light energy into chemical energy..."
}`;

  return { system, user };
}
