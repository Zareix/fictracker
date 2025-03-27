import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function preprocessStringToNumber(val: unknown) {
  if (!val) {
    return undefined;
  }

  if (typeof val === "string" && !isNaN(Number(val))) {
    return Number(val);
  }

  return val;
}

export function preprocessStringToDate(val: unknown) {
  if (!val) {
    return undefined;
  }

  if (typeof val === "string") {
    return new Date(val);
  }

  return val;
}
