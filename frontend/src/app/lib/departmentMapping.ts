export const CASE_CATEGORIES = [
  "Administrative",
  "Transport",
  "Revenue",
  "Taxation",
  "Education",
  "Health",
  "Infrastructure",
  "Environment",
  "Police",
  "Labor",
  "Public Welfare",
  "Land & Property",
  "Utilities",
] as const;

export type CaseCategory = (typeof CASE_CATEGORIES)[number];

// Keep the old name used across the UI, but align options with the admin upload list.
export const DEPARTMENTS = CASE_CATEGORIES;

export type Department = CaseCategory;

const normalize = (value: string | null | undefined) =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");

const CANONICAL_BY_NORMALIZED: Record<string, Department> = {
  administrative: "Administrative",
  transport: "Transport",
  revenue: "Revenue",
  taxation: "Taxation",
  education: "Education",
  health: "Health",
  infrastructure: "Infrastructure",
  environment: "Environment",
  police: "Police",
  labor: "Labor",
  "public welfare": "Public Welfare",
  "land and property": "Land & Property",
  utilities: "Utilities",
  // legacy
  pwd: "Infrastructure",
  legal: "Administrative",
};

export function mapCategoryToDepartment(category: string): Department {
  const c = normalize(category);
  return CANONICAL_BY_NORMALIZED[c] ?? "Administrative";
}

// Backward-compatible matching for already-stored case documents.
// (Older records may have used different department names.)
export function getDepartmentAliases(department: string): string[] {
  const canonical = mapCategoryToDepartment(department);

  const aliases = new Set<string>([canonical]);

  if (canonical === "Infrastructure") aliases.add("PWD");
  if (canonical === "Administrative") aliases.add("Legal");

  // Older versions merged taxation into revenue; include both for matching.
  if (canonical === "Revenue") aliases.add("Taxation");
  if (canonical === "Taxation") aliases.add("Revenue");

  return Array.from(aliases);
}
