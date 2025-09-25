export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors?: Record<string, string[]>;
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

// Test-specific validation functions
export function validateTestSubmission(data: {
  answers: any;
  timeSpent: any;
}): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};

  // Validate answers
  if (!data.answers) {
    errors.push('Answers are required');
    fieldErrors.answers = ['Answers are required'];
  } else if (typeof data.answers !== 'object') {
    errors.push('Answers must be an object');
    fieldErrors.answers = ['Answers must be an object'];
  } else if (Object.keys(data.answers).length === 0) {
    errors.push('At least one answer must be provided');
    fieldErrors.answers = ['At least one answer must be provided'];
  } else {
    // Validate answer format
    for (const [questionId, answer] of Object.entries(data.answers)) {
      if (!answer || typeof answer !== 'object') {
        errors.push(`Invalid answer format for question ${questionId}`);
        if (!fieldErrors.answers) fieldErrors.answers = [];
        fieldErrors.answers.push(`Invalid format for question ${questionId}`);
      } else {
        const answerObj = answer as any;
        if (!answerObj.hasOwnProperty('selectedAnswer')) {
          errors.push(`Missing selectedAnswer for question ${questionId}`);
          if (!fieldErrors.answers) fieldErrors.answers = [];
          fieldErrors.answers.push(`Missing selectedAnswer for question ${questionId}`);
        }
      }
    }
  }

  // Validate timeSpent
  if (data.timeSpent === null || data.timeSpent === undefined) {
    errors.push('Time spent is required');
    fieldErrors.timeSpent = ['Time spent is required'];
  } else if (typeof data.timeSpent !== 'number' || data.timeSpent < 0) {
    errors.push('Time spent must be a non-negative number');
    fieldErrors.timeSpent = ['Time spent must be a non-negative number'];
  } else if (data.timeSpent > 24 * 60 * 60) { // More than 24 hours
    errors.push('Time spent cannot exceed 24 hours');
    fieldErrors.timeSpent = ['Time spent cannot exceed 24 hours'];
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
}

export function validateScoreRange(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

export function validateAnswerOption(option: string): boolean {
  return ['A', 'B', 'C', 'D'].includes(option.toUpperCase());
}