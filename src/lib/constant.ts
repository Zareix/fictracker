export const UserRoles = ["user"] as const;
export type UserRole = (typeof UserRoles)[number];

export const Ratings = ["K", "T", "M"] as const;
export type Rating = (typeof Ratings)[number];
