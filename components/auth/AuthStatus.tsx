'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, ShieldCheck } from 'lucide-react';
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
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse h-10 w-32 bg-gray-200 rounded" />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getSourceBadgeVariant = () => {
    switch (user?.source) {
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
          <span className="max-w-[150px] truncate">{user.displayName}</span>
          <Badge variant={getSourceBadgeVariant()} className="text-xs">
            {user?.source?.toUpperCase() || 'AUTH'}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{user.displayName}</div>
          <div className="text-muted-foreground">{user.email}</div>
        </div>
        {user.roles && user.roles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <ShieldCheck className="h-3 w-3" />
                Roles
              </div>
              <div className="flex flex-wrap gap-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const AuthStatus = withDevOverlay(AuthStatusBase, "AuthStatus");