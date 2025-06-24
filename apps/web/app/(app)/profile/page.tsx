'use client';

import React from 'react';
import { useAuth } from '@monorepo/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { Mail, Key, RefreshCw } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, refreshSession, authSource } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your account information
        </p>
      </div>

      {/* User Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details and authentication status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <UserAvatar user={user} size="lg" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  ID: {user.id}
                </Badge>
                {authSource && (
                  <Badge variant="secondary">
                    {authSource === 'entraid' ? 'Microsoft Entra ID' : authSource.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles are not implemented in the current auth system */}

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Session Information
          </CardTitle>
          <CardDescription>Details about your current authentication session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Session Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Active</span>
              </div>
            </div>
            
            {/* Session expiry is not exposed in the current auth system */}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => refreshSession()} 
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional metadata is not exposed in the current auth system */}
    </div>
  );
}