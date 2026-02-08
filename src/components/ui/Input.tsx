import React from 'react';
import type { LucideIcon } from 'lucide-react';
import './ui.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
  icon?: LucideIcon;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, help, icon: Icon, required, className = '', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const inputClass = [
      'ui-input',
      error ? 'ui-input--error' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="ui-input-group">
        {label && (
          <label htmlFor={inputId} className="ui-input-label">
            {label}
            {required && <span className="ui-input-required" />}
          </label>
        )}
        
        <div className="ui-input-wrapper">
          {Icon && (
            <Icon size={16} className="ui-input-icon" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClass}
            {...props}
          />
        </div>
        
        {error && (
          <p className="ui-input-error">{error}</p>
        )}
        
        {help && !error && (
          <p className="ui-input-help">{help}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;