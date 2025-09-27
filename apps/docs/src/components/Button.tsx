'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  target,
  rel,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out relative overflow-hidden group';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-slate-800 to-teal-600 text-white rounded-lg
      hover:from-slate-900 hover:to-teal-700 hover:shadow-lg hover:scale-105
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent 
      before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
      shadow-md hover:shadow-xl
    `,
    secondary: `
      bg-fd-background border-2 border-fd-border text-fd-foreground rounded-lg
      hover:bg-fd-muted hover:border-teal-300 hover:shadow-md hover:scale-105
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-teal-50/50 before:to-slate-50/50
      before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
    `,
    ghost: `
      text-teal-600 rounded-lg hover:bg-teal-50 hover:text-teal-700
      hover:shadow-sm hover:scale-105
      before:absolute before:inset-0 before:bg-teal-100/50
      before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
    `,
  };
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  
  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="transition-transform duration-200 group-hover:scale-110">{icon}</span>}
        {children}
      </span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      )}
    </>
  );
  
  if (href) {
    if (href.startsWith('http')) {
      return (
        <a href={href} target={target} rel={rel} className={classes}>
          {content}
        </a>
      );
    }
    
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  
  return (
    <button className={classes}>
      {content}
    </button>
  );
}