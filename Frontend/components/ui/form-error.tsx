'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormErrors } from '@/lib/utils/validation';

interface FormErrorProps {
  error?: string;
  className?: string;
}

/**
 * Component to display a single form error message
 */
export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;
  
  return (
    <div className={cn(
      "flex items-center text-sm text-red-500 dark:text-red-400 mt-1", 
      className
    )}>
      <AlertCircle className="h-4 w-4 mr-1" />
      <span>{error}</span>
    </div>
  );
}

interface FormErrorSummaryProps<T extends Record<string, any>> {
  errors: FormErrors<T>;
  className?: string;
}

/**
 * Component to display a summary of form errors
 */
export function FormErrorSummary<T extends Record<string, any>>({ 
  errors, 
  className 
}: FormErrorSummaryProps<T>) {
  const errorMessages = Object.values(errors).filter(Boolean);
  
  if (!errorMessages.length) return null;
  
  return (
    <div className={cn(
      "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4",
      className
    )}>
      <div className="flex items-center mb-2">
        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
        <h5 className="text-red-500 dark:text-red-400 font-medium">Please fix the following errors:</h5>
      </div>
      <ul className="list-disc pl-10 space-y-1 text-sm text-red-500 dark:text-red-400">
        {errorMessages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
