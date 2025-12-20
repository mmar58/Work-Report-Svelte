import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Add generic type that might be used by some components
export type WithElementRef<T extends HTMLElement = HTMLElement> = {
    ref?: T | null;
} & Record<string, unknown>;
