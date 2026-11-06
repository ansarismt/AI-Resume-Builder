export type PasswordStrength = {
  score: 0 | 1 | 2 | 3;
  label: "Too short" | "Weak" | "Medium" | "Strong";
};

/** Real-time strength estimate used only for guidance; the server still validates. */
export function passwordStrength(password: string): PasswordStrength {
  if (password.length < 8) return { score: 0, label: "Too short" };
  let points = 0;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;
  if (points <= 1) return { score: 1, label: "Weak" };
  if (points <= 2) return { score: 2, label: "Medium" };
  return { score: 3, label: "Strong" };
}
