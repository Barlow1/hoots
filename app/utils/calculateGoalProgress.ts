import type { GoalMilestone } from '@prisma/client';

export const calculateGoalProgress = (milestones?: GoalMilestone[]): number => {
  if (!milestones) {
    return 0;
  }
  const totalCount = milestones.length;
  if (!totalCount) {
    return 0;
  }
  const completedCount = milestones.filter(
    (milestone) => milestone.completed,
  ).length;
  return Math.ceil((completedCount / totalCount) * 100);
};

export default calculateGoalProgress;
