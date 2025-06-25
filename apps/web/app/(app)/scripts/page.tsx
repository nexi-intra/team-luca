"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Folder,
  FileCode,
  Play,
  RefreshCw,
  GitBranch,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { GitRepoManager } from "./components/GitRepoManager";
import { ScriptViewer } from "./components/ScriptViewer";
import { GitHubStatus } from "./components/GitHubStatus";

interface ScriptFolder {
  name: string;
  path: string;
  scripts: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  isGitRepo?: boolean;
  gitRepo?: {
    name: string;
    url: string;
    branch: string;
    lastUpdated?: string;
    status: string;
    description?: string;
  };
}

export default function ScriptsNavigatorPage() {
  const [folders, setFolders] = useState<ScriptFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGitManager, setShowGitManager] = useState(false);
  const [viewMode, setViewMode] = useState<"navigator" | "viewer">("navigator");

  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/scripts/folders");
      if (!response.ok) throw new Error("Failed to fetch script folders");

      const data = await response.json();
      setFolders(data.folders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">PowerShell Scripts</h1>
          <p className="text-muted-foreground mt-2">
            Browse and execute PowerShell scripts organized by category
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">PowerShell Scripts</h1>
          <p className="text-muted-foreground mt-2">
            Browse and execute PowerShell scripts organized by category
          </p>
        </div>

        <Card className="border-red-500/20 bg-red-500/10">
          <CardHeader>
            <CardTitle className="text-red-600">
              Error Loading Scripts
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchFolders} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">PowerShell Scripts</h1>
          <p className="text-muted-foreground mt-2">
            Browse and execute PowerShell scripts organized by category
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              setViewMode(viewMode === "navigator" ? "viewer" : "navigator")
            }
            variant="outline"
            size="sm"
          >
            {viewMode === "navigator" ? "View All Scripts" : "Folder Navigator"}
          </Button>
          <Button
            onClick={() => setShowGitManager(true)}
            variant="outline"
            size="sm"
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Manage Repos
          </Button>
          <Button onClick={fetchFolders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GitHubStatus />
        </div>
      </div>

      {viewMode === "viewer" ? (
        <ScriptViewer />
      ) : folders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No script folders found. Create folders in the .scripts directory
              to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Card
              key={folder.name}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {folder.isGitRepo ? (
                    <GitBranch className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Folder className="h-5 w-5" />
                  )}
                  {folder.name.charAt(0).toUpperCase() + folder.name.slice(1)}
                  {folder.isGitRepo && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Git
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {folder.scripts.length} script
                  {folder.scripts.length !== 1 ? "s" : ""} available
                  {folder.isGitRepo && folder.gitRepo && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Branch: {folder.gitRepo.branch} • Status:{" "}
                      {folder.gitRepo.status}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-3">
                    {folder.scripts.slice(0, 3).map((script) => (
                      <div key={script.id} className="flex items-center gap-1">
                        <FileCode className="h-3 w-3" />
                        {script.name}
                      </div>
                    ))}
                    {folder.scripts.length > 3 && (
                      <div className="text-xs">
                        ...and {folder.scripts.length - 3} more
                      </div>
                    )}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/scripts/${folder.name}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Open Folder
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8 border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Managing Scripts
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            Scripts are organized in folders within the{" "}
            <code className="bg-muted px-1 py-0.5 rounded">.scripts</code>{" "}
            directory:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Create folders to organize scripts by category</li>
            <li>
              Add <code>.ps1</code> files to folders to make them available
            </li>
            <li>
              Use comments like <code># Description: ...</code> to add
              descriptions
            </li>
            <li>
              Scripts can include parameters in a <code>param()</code> block
            </li>
          </ul>
        </CardContent>
      </Card>

      {showGitManager && (
        <GitRepoManager
          onClose={() => setShowGitManager(false)}
          onRepoAdded={fetchFolders}
          onRepoRemoved={fetchFolders}
          onRepoUpdated={fetchFolders}
        />
      )}
    </div>
  );
}
