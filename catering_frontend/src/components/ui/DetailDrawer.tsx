import React from 'react';

interface DetailDrawerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function DetailDrawer({ title, subtitle, children, actions, className }: DetailDrawerProps) {
  return (
    <div className={`rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
            รายละเอียด
          </p>
          <h3 className="font-display text-2xl text-ink">{title}</h3>
          {subtitle && <p className="text-sm text-ink/70">{subtitle}</p>}
        </div>
        {actions && actions}
      </div>
      {children}
    </div>
  );
}
