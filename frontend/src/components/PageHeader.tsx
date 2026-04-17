import { LucideIcon } from "lucide-react";

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

export function PageHeader({
  title,
  subtitle,
  actionButton,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={`px-8 py-6 luxury-header-gradient border-b border-gray-100 ${className || ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight luxury-text-cream">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-0.5 luxury-text-cream">{subtitle}</p>
          )}
        </div>

        {actionButton && (
          <button
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
            className={`luxury-button-premium ${actionButton.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            title={
              actionButton.disabled
                ? "Solo administradores pueden realizar esta acción"
                : undefined
            }
          >
            {actionButton.icon && (
              <actionButton.icon className="w-5 h-5 relative top-[1px]" />
            )}
            {actionButton.label}
          </button>
        )}
      </div>
    </div>
  );
}
