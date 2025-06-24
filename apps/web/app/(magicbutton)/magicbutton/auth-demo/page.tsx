'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { Copy, ExternalLink, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AuthDemoPage() {
  const { isAuthenticated, user, signIn, signOut, error, authSource } = useAuth();
  const loginWithPopup = signIn; // Alias for compatibility
  const logout = signOut; // Alias for compatibility
  const [sampleToken, setSampleToken] = useState('');
  const [magicLink, setMagicLink] = useState('');

  // Generate a sample JWT token for demo
  const generateSampleToken = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: '12345',
      email: 'demo@magicbutton.cloud',
      name: 'Demo User',
      roles: ['user', 'admin'],
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = btoa('demo-signature');
    const token = `${header}.${payload}.${signature}`;
    setSampleToken(token);
    
    // Generate magic link
    const baseUrl = window.location.origin;
    const link = `${baseUrl}?magicauth=true&token=${token}&route=/magicbutton`;
    setMagicLink(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#233862] dark:text-white mb-2">
          Authentication Demo
        </h1>
        <p className="text-gray-600">
          Test popup authentication with Microsoft Entra ID and Magic Auth
        </p>
      </div>

      {/* Current Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status:</p>
                <p className="font-medium">
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </p>
              </div>
              {isAuthenticated && <AuthStatus />}
            </div>
            
            {user && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">User ID:</p>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Auth Source:</p>
                  <p className="font-medium">{authSource?.toUpperCase() || 'CUSTOM'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Display Name:</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                {/* Roles are not implemented in the current auth system */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Authentication Methods */}
      <Tabs defaultValue="entraid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entraid">Entra ID</TabsTrigger>
          <TabsTrigger value="magic">Magic Auth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entraid">
          <Card>
            <CardHeader>
              <CardTitle>Entra ID Authentication</CardTitle>
              <CardDescription>
                Sign in using Microsoft Entra ID (formerly Azure AD)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  This uses popup authentication with Microsoft Entra ID. 
                  User roles and metadata are extracted from the ID token.
                </AlertDescription>
              </Alert>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error: {error.message}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Button 
                  onClick={() => loginWithPopup()}
                  disabled={isAuthenticated}
                  className="w-full"
                >
                  Sign in with Entra ID (Popup)
                </Button>
                {isAuthenticated && (
                  <Button 
                    onClick={() => logout()}
                    variant="outline"
                    className="w-full"
                  >
                    Sign out
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="magic">
          <Card>
            <CardHeader>
              <CardTitle>Magic Link Authentication</CardTitle>
              <CardDescription>
                Test authentication using JWT tokens via magic links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Generate Demo Token</Label>
                <Button onClick={generateSampleToken} variant="outline" className="w-full">
                  Generate Sample JWT Token
                </Button>
              </div>

              {sampleToken && (
                <>
                  <div className="space-y-2">
                    <Label>JWT Token</Label>
                    <div className="relative">
                      <Input 
                        value={sampleToken} 
                        readOnly 
                        className="pr-10 font-mono text-xs"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-7 w-7"
                        onClick={() => copyToClipboard(sampleToken)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Magic Link</Label>
                    <div className="relative">
                      <Input 
                        value={magicLink} 
                        readOnly 
                        className="pr-20 text-xs"
                      />
                      <div className="absolute right-1 top-1 flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(magicLink)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => window.open(magicLink, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Open the magic link in a new browser tab to test authentication. 
                      The token contains user info and will authenticate as &quot;Demo User&quot;.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}