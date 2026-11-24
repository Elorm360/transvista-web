/** Admin colour theme: follows the device unless the person picks one. */
export type AdminTheme = "system" | "light" | "dark";

export const ADMIN_THEMES: Array<{ value: AdminTheme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match my device" },
];

/** Fired on window when the theme changes, so the shell updates instantly. */
export const ADMIN_THEME_EVENT = "transvista:admin-theme";

export function isAdminTheme(value: unknown): value is AdminTheme {
  return value === "system" || value === "light" || value === "dark";
}
