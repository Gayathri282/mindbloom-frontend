'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName || !fullName.trim()) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-10 h-10 text-xs sm:text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} rounded-full border-2 border-sky-500 object-cover shadow-2xs ${className}`}
      />
    );
  }

  // Initials badge fallback when no image exists
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-sky-600 via-cyan-600 to-indigo-700 text-white font-extrabold flex items-center justify-center border-2 border-sky-300 shadow-2xs uppercase tracking-wider shrink-0 ${className}`}
      title={name}
    >
      {initials || <User className={iconSizes[size]} />}
    </div>
  );
};
