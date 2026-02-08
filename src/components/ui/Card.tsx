import React from 'react';
import './ui.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ children, className = '', interactive = false, onClick }) => {
  const cardClass = [
    'ui-card',
    interactive ? 'ui-card--interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} onClick={onClick}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ title, description, action, className = '' }) => {
  return (
    <div className={`ui-card__header ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 className="ui-card__title">{title}</h3>
          {description && (
            <p className="ui-card__description">{description}</p>
          )}
        </div>
        {action && (
          <div style={{ marginLeft: '1rem' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`ui-card__content ${className}`}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`ui-card__footer ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;