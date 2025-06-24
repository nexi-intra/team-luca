'use client';

import React from 'react';
import { useAuth } from '@monorepo/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { withDevOverlay } from '@/lib/dev/with-dev-overlay';

function AuthStatusBase() {
  const { isAuthenticated, isLoading, user, signOut, authSource } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse h-10 w-32 bg-gray-200 rounded" />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getSourceBadgeVariant = () => {
    switch (authSource) {
      case 'entraid':
        return 'default';
      case 'magic':
        return 'secondary';
      case 'sso':
        return 'outline';
      case 'custom':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="max-w-[150px] truncate">{user.name}</span>
          <Badge variant={getSourceBadgeVariant()} className="text-xs">
            {authSource?.toUpperCase() || 'AUTH'}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{user.name}</div>
          <div className="text-muted-foreground">{user.email}</div>
        </div>
        {/* Roles are not implemented in the current auth system */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const AuthStatus = withDevOverlay(AuthStatusBase, "AuthStatus");