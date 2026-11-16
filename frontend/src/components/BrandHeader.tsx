import type { ReactNode } from 'react';
import { Logo } from './Logo';

type BrandHeaderProps = {
  subtitle?: string;
  rightContent?: ReactNode;
  className?: string;
  homePath?: string;
};

export function BrandHeader({ subtitle, rightContent, className = '', homePath = '/' }: BrandHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Logo subtitle={subtitle} to={homePath} />

      {rightContent}
    </div>
  );
}
