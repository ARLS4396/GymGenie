export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPassword = (password: string): boolean => {
  return password.trim().length >= 8;
};

export const isNonEmpty = (value: string): boolean => value.trim().length > 0;
