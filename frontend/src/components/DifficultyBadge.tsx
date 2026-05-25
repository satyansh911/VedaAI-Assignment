import { Difficulty } from '@/types/assignment';

const styles: Record<Difficulty, string> = {
  easy: 'bg-difficulty-easyBg text-difficulty-easy ring-difficulty-easy/30',
  moderate: 'bg-difficulty-moderateBg text-difficulty-moderate ring-difficulty-moderate/30',
  hard: 'bg-difficulty-hardBg text-difficulty-hard ring-difficulty-hard/30',
};

const labels: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Challenging',
};

interface Props {
  difficulty: Difficulty;
  compact?: boolean;
}

export function DifficultyBadge({ difficulty, compact = false }: Props) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold rounded-md ring-1 ring-inset ${styles[difficulty]}`}
      >
        [{labels[difficulty]}]
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${styles[difficulty]}`}
    >
      {labels[difficulty]}
    </span>
  );
}
