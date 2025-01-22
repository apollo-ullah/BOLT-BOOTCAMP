import { VALIDATION } from '../config/constants';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

export const isValidProjectTitle = (title: string): boolean => {
  return title.length > 0 && title.length <= VALIDATION.PROJECT_TITLE_MAX_LENGTH;
};

export const isValidDescription = (description: string): boolean => {
  return description.length > 0 && description.length <= VALIDATION.DESCRIPTION_MAX_LENGTH;
};

export const validateUserInput = (input: string, maxLength: number): string => {
  return input.slice(0, maxLength).trim();
}; 