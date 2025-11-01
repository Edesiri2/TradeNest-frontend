import React from 'react';
import { LucideIcon } from 'lucide-react';
import './ui.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'ui-button';
  const variantClass = `ui-button--${variant}`;
  const sizeClass = size !== 'md' ? `ui-button--${size}` : '';
  const loadingClass = loading ? 'ui-button--loading' : '';
  
  const buttonClass = [
    baseClass,
    variantClass,
    sizeClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      {...props}
    >
      {Icon && iconPosition === 'left' && !loading && (
        <Icon size={16} />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={16} />
      )}
      
      {loading && (
        <div className="ui-button__spinner" />
      )}
    </button>
  );
};

export default Button;