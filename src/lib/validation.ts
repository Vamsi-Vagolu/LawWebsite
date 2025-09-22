export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateNote(data: any): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Description validation (optional but if provided, must be valid)
  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  } else if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  // Category validation (optional but if provided, must be valid)
  if (data.category && typeof data.category !== 'string') {
    errors.push('Category must be a string');
  } else if (data.category && data.category.length > 100) {
    errors.push('Category must be less than 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Add this missing function:
export function validateUser(data: any): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Name is required');
  } else if (data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Password validation (for registration)
  if (data.password !== undefined) {
    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    } else if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    } else if (data.password.length > 100) {
      errors.push('Password must be less than 100 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .slice(0, 1000); // Limit length
}