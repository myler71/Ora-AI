import { ButtonHTMLAttributes, AnchorHTMLAttributes, MouseEvent } from 'react';
import { Link } from 'react-router';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  to?: string;
  href?: string;
  children?: React.ReactNode;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    to?: never;
    href?: never;
  };

type ButtonAsLink = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    to: string;
  };

type ButtonAsAnchor = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  to,
  href,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles =
    'rounded-full transition-all duration-300 font-medium flex items-center justify-center gap-2 cursor-pointer select-none text-center inline-flex';

  const variants = {
    primary:
      'bg-[#3FA9F5] text-white hover:bg-[#1F6FEB] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
    secondary:
      'bg-[#1F6FEB] text-white hover:bg-[#3FA9F5] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
    outline:
      'border-2 border-[#3FA9F5] text-[#3FA9F5] hover:bg-[#3FA9F5] hover:text-white active:scale-95',
    glass:
      'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 active:scale-95',
  };

  const sizes = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        className={combinedClasses}
        onClick={onClick as (e: MouseEvent<HTMLAnchorElement>) => void}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        onClick={onClick as (e: MouseEvent<HTMLAnchorElement>) => void}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={combinedClasses}
      onClick={onClick as (e: MouseEvent<HTMLButtonElement>) => void}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
