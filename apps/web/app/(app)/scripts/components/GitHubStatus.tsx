"use client";

import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Github, Link2, LinkOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GitHubStatus() {
  const { authenticated, user, loading, error, connect, disconnect } =
    useGitHubAuth();

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!authenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Github className="h-5 w-5" />
            GitHub Connection
          </CardTitle>
          <CardDescription>
            Connect your GitHub account to clone private repositories and use
            authenticated Git operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connect} className="w-full">
            <Link2 className="h-4 w-4 mr-2" />
            Connect GitHub Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Github className="h-5 w-5" />
          GitHub Connection
        </CardTitle>
        <CardDescription>
          Your GitHub account is connected for Git operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar_url} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0) || "G"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">@{user?.login}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-600">
            Connected
          </Badge>
        </div>
        <Button onClick={disconnect} variant="outline" className="w-full mt-4">
          <LinkOff className="h-4 w-4 mr-2" />
          Disconnect GitHub
        </Button>
      </CardContent>
    </Card>
  );
}
