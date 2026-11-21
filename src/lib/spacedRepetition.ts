import { MasteryStatus } from '@/types/mastery';

/**
 * Spaced Repetition Scheduling Engine.
 * 
 * Intervals calibrated to concept stability:
 * - At Risk (<50%): 1 day
 * - Learning (50-79%): 3 days
 * - Mastered (>=80%): 7 days
 * - Unassessed: 1 day
 * 
 * Incorporates review count multiplier for progressive spacing.
 */
export function calculateNextReview(
  status: MasteryStatus,
  reviewCount: number,
  baseDateIso?: string
): string {
  const base = baseDateIso ? new Date(baseDateIso) : new Date();

  let days = 1;
  switch (status) {
    case 'atRisk':
      days = 1;
      break;
    case 'learning':
      days = 3;
      break;
    case 'mastered':
      days = 7;
      break;
    case 'unassessed':
    default:
      days = 1;
      break;
  }

  // Slight expansion for repeated successful reviews
  if (reviewCount > 2 && status === 'mastered') {
    days = Math.round(days * 1.5);
  }

  const reviewDate = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  return reviewDate.toISOString();
}

export function isReviewOverdue(nextReviewAt: string | null): boolean {
  if (!nextReviewAt) return false;
  return new Date(nextReviewAt).getTime() <= Date.now();
}

export function formatReviewDueRelative(nextReviewAt: string | null): string {
  if (!nextReviewAt) return 'Not scheduled';
  const diffMs = new Date(nextReviewAt).getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return overdue === 0 ? 'Due today' : `${overdue} day${overdue > 1 ? 's' : ''} overdue`;
  }
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
}
