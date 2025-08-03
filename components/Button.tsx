import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  leftIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  leftIcon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-md shadow-sm transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-accent disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gold-accent text-white',
    secondary: 'bg-dark-text text-white',
    outline: 'bg-transparent border-2 border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
};

export default Button;
