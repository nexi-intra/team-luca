'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
// Flexible user type that works with all auth implementations
interface UserLike {
  id?: string;
  email?: string;
  name?: string;
  displayName?: string;
  picture?: string | null;
}

interface UserAvatarProps {
  user: UserLike | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };
  
  const displayName = user?.displayName || user?.name || 'Unknown User';

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      {user?.picture && (
        <AvatarImage src={user.picture} alt={displayName} />
      )}
      <AvatarFallback>
        {user ? (
          getInitials(displayName)
        ) : (
          <User className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
        )}
      </AvatarFallback>
    </Avatar>
  );
}