import { NextResponse } from 'next/server';
import { APIError, APIResponse } from '@/types/api';

// Standardized error response creator
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: any
): NextResponse {
  const error: APIError = {
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };

  const response: APIResponse = {
    success: false,
    error,
  };

  return NextResponse.json(response, { status });
}

// Standardized success response creator
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  const response: APIResponse<T> = {
    success: true,
    data,
  };

  return NextResponse.json(response, { status });
}

// Common error responses
export const ErrorResponses = {
  UNAUTHORIZED: () => createErrorResponse('Authentication required', 401, 'AUTH_REQUIRED'),
  FORBIDDEN: () => createErrorResponse('Access denied', 403, 'ACCESS_DENIED'),
  NOT_FOUND: (resource: string = 'Resource') =>
    createErrorResponse(`${resource} not found`, 404, 'NOT_FOUND'),
  BAD_REQUEST: (message: string = 'Invalid request') =>
    createErrorResponse(message, 400, 'BAD_REQUEST'),
  INTERNAL_ERROR: () => createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR'),
  VALIDATION_ERROR: (details: any) =>
    createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', details),
};

// Validation helpers
export function validateRequired(fields: Record<string, any>): string[] {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === '') {
      missing.push(key);
    }
  }

  return missing;
}

// Conditional logging utility
export function logInDevelopment(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data || '');
  }
}

// Safe error logging for production
export function logError(error: any, context?: string): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context: context || 'Unknown',
    message: error?.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
  };

  console.error('API Error:', errorInfo);
}