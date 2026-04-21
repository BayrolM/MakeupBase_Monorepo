import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
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
  icon: Icon,
  actionButton,
  className,
}: PageHeaderProps) {
  return (
    <div className={`px-8 pt-8 pb-5 ${className || ""}`}>
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <div className="relative px-6 py-8 luxury-header-gradient">
          <div className="relative flex flex-wrap gap-6 justify-between items-center z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight luxury-text-cream">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm mt-0.5 luxury-text-cream opacity-90">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {actionButton && (
              <button
                onClick={actionButton.onClick}
                disabled={actionButton.disabled}
                className={`luxury-button-premium ${
                  actionButton.disabled ? "opacity-50 cursor-not-allowed grayscale" : ""
                }`}
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
      </div>
    </div>
  );
}
