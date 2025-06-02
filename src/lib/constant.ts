export const Ratings = ["K", "T", "M"] as const;
export type Rating = (typeof Ratings)[number];
