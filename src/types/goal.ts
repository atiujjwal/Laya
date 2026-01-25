export type AreaType =
  | 'Health'
  | 'Finances'
  | 'Career'
  | 'Personal Growth'
  | 'Relationships';

export interface GoalStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  title: string;
  area: AreaType;
  // We use Date here assuming you transform the API JSON string to a Date object
  // in your fetcher or hook. If using raw JSON, change this to string.
  deadline: Date;
  reward: string;
  imageUrl?: string;
  steps: GoalStep[];
}
