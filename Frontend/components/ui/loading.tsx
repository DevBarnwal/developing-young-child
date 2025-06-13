'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
  text?: string;
}

/**
 * A reusable loading spinner component
 */
export function LoadingSpinner({
  size = 'md',
  className = '',
  fullPage = false,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };
  
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-b-2 border-gray-900 dark:border-white', 
          sizeClasses[size]
        )} 
      />
      {text && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
  
  if (fullPage) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
}

/**
 * A button loading state component
 */
export function ButtonLoading({ className }: { className?: string }) {
  return (
    <div className={cn('animate-spin h-4 w-4 border-2 border-b-transparent rounded-full', className)} />
  );
}

/**
 * A skeleton loading component for content
 */
export function SkeletonLoader({ className, count = 1 }: { className?: string, count?: number }) {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <div 
          key={i}
          className={cn(
            'animate-pulse bg-gray-200 dark:bg-gray-800 rounded',
            className
          )} 
        />
      ))}
    </>
  );
}
