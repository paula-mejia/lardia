import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS class names with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 * @param inputs - Class values (strings, arrays, objects, conditionals)
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
