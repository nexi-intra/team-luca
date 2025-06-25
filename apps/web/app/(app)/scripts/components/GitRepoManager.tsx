"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GitHubStatus } from "./GitHubStatus";

interface GitRepository {
  name: string;
  url: string;
  path: string;
  branch: string;
  lastUpdated?: string;
  status: "clean" | "dirty" | "error";
  description?: string;
}

interface GitRepoManagerProps {
  onClose: () => void;
  onRepoAdded: () => void;
  onRepoRemoved: () => void;
  onRepoUpdated: () => void;
}

export function GitRepoManager({
  onClose,
  onRepoAdded,
  onRepoRemoved,
  onRepoUpdated,
}: GitRepoManagerProps) {
  const [repositories, setRepositories] = useState<GitRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    name: "",
    branch: "",
    depth: 1,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/scripts/git");
      if (!response.ok) throw new Error("Failed to fetch repositories");

      const data = await response.json();
      setRepositories(data.repositories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleAddRepository = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url) {
      setError("Repository URL is required");
      return;
    }

    try {
      setActionLoading("add");
      setError(null);

      const response = await fetch("/api/scripts/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formData.url,
          name: formData.name || undefined,
          branch: formData.branch || undefined,
          depth: formData.depth || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clone repository");
      }

      setFormData({ url: "", name: "", branch: "", depth: 1 });
      setShowAddForm(false);
      await fetchRepositories();
      onRepoAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRepository = async (repoName: string) => {
    try {
      setActionLoading(`update-${repoName}`);
      setError(null);

      const response = await fetch(`/api/scripts/git/${repoName}`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update repository");
      }

      await fetchRepositories();
      onRepoUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveRepository = async (repoName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove repository "${repoName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setActionLoading(`remove-${repoName}`);
      setError(null);

      const response = await fetch(`/api/scripts/git/${repoName}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove repository");
      }

      await fetchRepositories();
      onRepoRemoved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "clean":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "dirty":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "clean":
        return "bg-green-100 text-green-800";
      case "dirty":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Git Repository Manager
          </DialogTitle>
          <DialogDescription>
            Manage Git repositories containing PowerShell scripts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-4">
            <GitHubStatus />
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Repositories</h3>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Repository
            </Button>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Clone Repository</CardTitle>
                <CardDescription>
                  Add a new Git repository containing PowerShell scripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddRepository} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="url">Repository URL *</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) =>
                          setFormData({ ...formData, url: e.target.value })
                        }
                        placeholder="https://github.com/user/repo.git"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Custom Name (optional)</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Auto-detected from URL"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch">Branch (optional)</Label>
                      <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) =>
                          setFormData({ ...formData, branch: e.target.value })
                        }
                        placeholder="main"
                      />
                    </div>
                    <div>
                      <Label htmlFor="depth">Clone Depth</Label>
                      <Input
                        id="depth"
                        type="number"
                        min="1"
                        value={formData.depth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            depth: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={actionLoading === "add"}>
                      {actionLoading === "add"
                        ? "Cloning..."
                        : "Clone Repository"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">Loading repositories...</div>
            ) : repositories.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No repositories found. Clone a repository to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              repositories.map((repo) => (
                <Card key={repo.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          {repo.name}
                          <Badge className={getStatusColor(repo.status)}>
                            {getStatusIcon(repo.status)}
                            {repo.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span>Branch: {repo.branch}</span>
                          {repo.lastUpdated && (
                            <span>
                              Updated:{" "}
                              {new Date(repo.lastUpdated).toLocaleDateString()}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateRepository(repo.name)}
                          disabled={actionLoading === `update-${repo.name}`}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {actionLoading === `update-${repo.name}`
                            ? "Updating..."
                            : "Pull"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(repo.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveRepository(repo.name)}
                          disabled={actionLoading === `remove-${repo.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {repo.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {repo.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {repo.url}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
