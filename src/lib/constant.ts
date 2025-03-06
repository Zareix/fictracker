export const UserRoles = ["user"] as const;
export type UserRole = (typeof UserRoles)[number];
