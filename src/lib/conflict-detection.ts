/**
 * Minute-Level Conflict Detection
 * O(n) algorithm to prevent overlapping task blocks on the timeline
 */

export interface TimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  isLocked?: boolean;
}

/**
 * Detect conflicts between time blocks
 * Time complexity: O(n) where n is the number of blocks
 */
export function detectConflicts(blocks: TimeBlock[]): Array<{
  block1: string;
  block2: string;
  overlapMinutes: number;
}> {
  const conflicts: Array<{
    block1: string;
    block2: string;
    overlapMinutes: number;
  }> = [];

  // Sort blocks by start time for efficient comparison
  const sortedBlocks = [...blocks].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  // Compare each block with subsequent blocks
  for (let i = 0; i < sortedBlocks.length; i++) {
    const block1 = sortedBlocks[i];
    
    // Skip locked blocks from conflict detection (they're fixed)
    if (block1.isLocked) continue;

    for (let j = i + 1; j < sortedBlocks.length; j++) {
      const block2 = sortedBlocks[j];

      // If block2 starts after block1 ends, no need to check further
      if (block2.startTime >= block1.endTime) {
        break;
      }

      // Check for overlap: block1.start < block2.end && block1.end > block2.start
      if (block1.startTime < block2.endTime && block1.endTime > block2.startTime) {
        // Calculate overlap duration
        const overlapStart = block1.startTime > block2.startTime ? block1.startTime : block2.startTime;
        const overlapEnd = block1.endTime < block2.endTime ? block1.endTime : block2.endTime;
        const overlapMinutes = Math.floor(
          (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60)
        );

        conflicts.push({
          block1: block1.id,
          block2: block2.id,
          overlapMinutes,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Check if a new time block would conflict with existing blocks
 */
export function wouldConflict(
  newBlock: TimeBlock,
  existingBlocks: TimeBlock[]
): {
  conflicts: boolean;
  conflictingBlocks: string[];
  overlapMinutes: number;
} {
  const allBlocks = [...existingBlocks, newBlock];
  const detectedConflicts = detectConflicts(allBlocks);

  const conflictingBlocks = detectedConflicts
    .filter((c) => c.block1 === newBlock.id || c.block2 === newBlock.id)
    .map((c) => (c.block1 === newBlock.id ? c.block2 : c.block1));

  const totalOverlap = detectedConflicts
    .filter((c) => c.block1 === newBlock.id || c.block2 === newBlock.id)
    .reduce((sum, c) => sum + c.overlapMinutes, 0);

  return {
    conflicts: conflictingBlocks.length > 0,
    conflictingBlocks,
    overlapMinutes: totalOverlap,
  };
}

/**
 * Suggest non-conflicting time slot for a task
 */
export function suggestTimeSlot(
  task: { duration: number; preferredStart?: Date },
  existingBlocks: TimeBlock[],
  dayStart: Date = new Date()
): Date | null {
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 59);

  // Sort existing blocks by start time
  const sortedBlocks = [...existingBlocks]
    .filter((b) => b.startTime >= dayStart && b.startTime <= dayEnd)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Try preferred start time first
  if (task.preferredStart) {
    const preferredEnd = new Date(task.preferredStart.getTime() + task.duration * 60 * 1000);
    const testBlock: TimeBlock = {
      id: 'test',
      startTime: task.preferredStart,
      endTime: preferredEnd,
    };

    const { conflicts } = wouldConflict(testBlock, existingBlocks);
    if (!conflicts) {
      return task.preferredStart;
    }
  }

  // Find gaps between existing blocks
  let currentTime = new Date(dayStart);
  currentTime.setHours(8, 0, 0, 0); // Start at 8 AM

  for (const block of sortedBlocks) {
    const gapStart = currentTime;
    const gapEnd = block.startTime;
    const gapDuration = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60);

    if (gapDuration >= task.duration) {
      return gapStart;
    }

    // Move to end of this block
    currentTime = new Date(block.endTime);
  }

  // Check if there's time after the last block
  const lastBlock = sortedBlocks[sortedBlocks.length - 1];
  if (lastBlock) {
    const gapStart = lastBlock.endTime;
    const gapEnd = dayEnd;
    const gapDuration = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60);

    if (gapDuration >= task.duration) {
      return gapStart;
    }
  } else {
    // No blocks, return start of day
    return currentTime;
  }

  return null; // No available slot
}
