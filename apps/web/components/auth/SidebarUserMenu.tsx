"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, Shield, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";
import { Badge } from "@/components/ui/badge";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { AuthLogger } from "@/lib/auth/logger";
import { isAuthConfigured } from "@/lib/auth/custom-auth-config";

const logger = new AuthLogger("SidebarUserMenu");

export function SidebarUserMenu() {
  const auth = useAuth();
  const { isAuthenticated, isLoading, user } = auth;

  useEffect(() => {
    logger.debug("SidebarUserMenu state", {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userName: user?.name,
      userEmail: user?.email,
    });
  }, [isAuthenticated, isLoading, user]);

  // Don't render the user menu if authentication is disabled
  // For now, always show the user menu
  // TODO: Add logic to check if auth provider requires authentication

  if (isLoading) {
    return (
      <SidebarMenuButton className="animate-pulse">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
          <div className="h-2 w-32 bg-gray-200 rounded" />
        </div>
      </SidebarMenuButton>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SidebarMenuButton onClick={() => auth.signIn()}>
        <UserAvatar user={null} size="sm" />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium">Sign in</div>
          <div className="text-xs text-muted-foreground">
            Click to authenticate
          </div>
        </div>
        <LogIn className="h-4 w-4" />
      </SidebarMenuButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          <UserAvatar user={user} size="sm" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]"
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="md" />
            <div className="flex-1 overflow-hidden">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => auth.signOut()}
          className="text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
