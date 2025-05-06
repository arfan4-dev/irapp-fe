export const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { label: "Medium", color: "bg-yellow-500" };
  return { label: "Strong", color: "bg-green-500" };
};
