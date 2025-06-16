export const Ratings = ["K", "T", "M"] as const;
export type Rating = (typeof Ratings)[number];

export const CompletionStatus = ["All", "Yes", "No"] as const;
export type CompletionStatusType = (typeof CompletionStatus)[number];
