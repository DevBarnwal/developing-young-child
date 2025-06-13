// Form validation utility functions

// Type for generic form error state
export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Validates required fields in a form object
 * @param data Object containing form data
 * @param fields Array of field names that are required
 * @returns Object with validation errors if any
 */
export function validateRequired<T extends Record<string, any>>(
  data: T, 
  fields: Array<keyof T>
): FormErrors<T> {
  const errors: FormErrors<T> = {};
  
  fields.forEach(field => {
    const value = data[field];
    
    // Check if value is empty, null, or undefined
    if (value === undefined || value === null || 
        (typeof value === 'string' && value.trim() === '') || 
        (Array.isArray(value) && value.length === 0)) {
      errors[field] = `${String(field)} is required`;
    }
  });
  
  return errors;
}

/**
 * Validates email format
 * @param email Email string to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates multiple form fields with custom validation rules
 * @param data Object containing form data
 * @param validationRules Object with field names as keys and validation functions as values
 * @returns Object with validation errors if any
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  validationRules: { [K in keyof T]?: (value: T[K]) => string | null }
): FormErrors<T> {
  const errors: FormErrors<T> = {};
  
  Object.entries(validationRules).forEach(([field, validateFn]) => {
    const key = field as keyof T;
    const error = validateFn?.(data[key]);
    if (error) {
      errors[key] = error;
    }
  });
  
  return errors;
}

/**
 * Check if form has any validation errors
 * @param errors Form errors object
 * @returns Boolean indicating if form has errors
 */
export function hasErrors<T>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str String to truncate
 * @param maxLength Maximum length of the string
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
