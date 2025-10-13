'use client';

import { forwardRef } from 'react';

interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({ className = '', children }, ref) => {
  return (
    <div
      ref={ref}
      className={`inline-flex items-center justify-center rounded-full ${className}`}
    >
      {children}
    </div>
  );
});

Avatar.displayName = 'Avatar';

interface AvatarFallbackProps {
  className?: string;
  children?: React.ReactNode;
}

const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(({ className = '', children }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
});

AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarFallback };
