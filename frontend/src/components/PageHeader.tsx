import { Button } from './ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
  };
  className?: string;
}

export function PageHeader({ title, subtitle, actionButton, className }: PageHeaderProps) {
  return (
    <div className={`border-b border-border bg-surface px-8 py-6 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-foreground-secondary" style={{ fontSize: '14px' }}>
              {subtitle}
            </p>
          )}
        </div>
        
        {actionButton && (
          <Button
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            title={actionButton.disabled ? 'Solo administradores pueden realizar esta acción' : undefined}
          >
            {actionButton.icon && <actionButton.icon className="w-4 h-4" />}
            {actionButton.label}
          </Button>
        )}
      </div>
    </div>
  );
}
