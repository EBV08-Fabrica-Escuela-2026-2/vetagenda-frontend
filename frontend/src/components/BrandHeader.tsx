import type { ReactNode } from 'react';
import { Logo } from './Logo';

type BrandHeaderProps = {
  subtitle?: string;
  rightContent?: ReactNode;
  className?: string;
};

export function BrandHeader({ subtitle, rightContent, className = '' }: BrandHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Logo subtitle={subtitle} />

      {rightContent}
    </div>
  );
}
