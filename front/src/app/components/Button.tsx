import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-full transition-all duration-300 font-medium flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-[#3FA9F5] text-white hover:bg-[#1F6FEB] shadow-lg hover:shadow-xl hover:scale-105',
    secondary: 'bg-[#1F6FEB] text-white hover:bg-[#3FA9F5] shadow-lg hover:shadow-xl hover:scale-105',
    outline: 'border-2 border-[#3FA9F5] text-[#3FA9F5] hover:bg-[#3FA9F5] hover:text-white',
    glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30'
  };
  
  const sizes = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
