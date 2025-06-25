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
import { Badge } from "@/components/ui/badge";
import {
  Grid,
  List,
  TreePine,
  Eye,
  FileCode,
  GitBranch,
  Folder,
  ChevronRight,
  ChevronDown,
  Play,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScriptPreview } from "./ScriptPreview";

interface ParsedScript {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  category: string;
  source: "folder" | "git";
  repository?: any;
  frontMatter: Record<string, any>;
  markdown: string;
  rawContent: string;
  parameters: any[];
}

interface TreeNode {
  type: "category" | "folder";
  name: string;
  source?: string;
  repository?: any;
  children: Record<string, TreeNode>;
  scripts: ParsedScript[];
}

interface ScriptViewerProps {
  onRunScript?: (script: ParsedScript) => void;
}

export function ScriptViewer({ onRunScript }: ScriptViewerProps) {
  const [scripts, setScripts] = useState<ParsedScript[]>([]);
  const [tree, setTree] = useState<Record<string, TreeNode>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<
    "tree" | "cards" | "table" | "gallery"
  >("cards");
  const [selectedScript, setSelectedScript] = useState<ParsedScript | null>(
    null,
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const fetchScripts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/scripts/all");
      if (!response.ok) throw new Error("Failed to fetch scripts");

      const data = await response.json();
      setScripts(data.scripts);
      setTree(data.tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const filteredScripts = scripts.filter(
    (script) =>
      script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.frontMatter.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (
    node: TreeNode,
    nodeId: string,
    level = 0,
  ): React.ReactNode => {
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren =
      Object.keys(node.children).length > 0 || node.scripts.length > 0;

    return (
      <div key={nodeId} className="select-none">
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-muted/50 cursor-pointer rounded-sm`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
          {!hasChildren && <div className="w-4" />}

          {node.type === "category" ? (
            node.source === "git" ? (
              <GitBranch className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500" />
            )
          ) : (
            <Folder className="h-4 w-4 text-gray-500" />
          )}

          <span className="text-sm font-medium">{node.name}</span>

          {node.source === "git" && (
            <Badge variant="outline" className="text-xs">
              Git
            </Badge>
          )}
        </div>

        {isExpanded && (
          <div>
            {/* Render child folders */}
            {Object.entries(node.children).map(([childName, childNode]) =>
              renderTreeNode(childNode, `${nodeId}/${childName}`, level + 1),
            )}

            {/* Render scripts */}
            {node.scripts.map((script) => (
              <div
                key={script.id}
                className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 cursor-pointer rounded-sm"
                style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
                onClick={() => setSelectedScript(script)}
              >
                <div className="w-4" />
                <FileCode className="h-4 w-4 text-purple-500" />
                <span className="text-sm">{script.name}.ps1</span>
                {script.frontMatter.description && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {script.frontMatter.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredScripts.map((script) => (
        <Card
          key={script.id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                {script.name}.ps1
              </CardTitle>
              <Badge
                variant={script.source === "git" ? "default" : "secondary"}
              >
                {script.source === "git" ? "Git" : "Local"}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {script.frontMatter.description || "No description available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Category: {script.category}</span>
              {script.parameters.length > 0 && (
                <span>
                  {script.parameters.length} parameter
                  {script.parameters.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedScript(script)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              {onRunScript && (
                <Button size="sm" onClick={() => onRunScript(script)}>
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Category</th>
            <th className="text-left p-3 font-medium">Source</th>
            <th className="text-left p-3 font-medium">Parameters</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredScripts.map((script) => (
            <tr key={script.id} className="border-b hover:bg-muted/50">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  <span className="font-medium">{script.name}.ps1</span>
                </div>
                {script.frontMatter.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {script.frontMatter.description}
                  </div>
                )}
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {script.source === "git" ? (
                    <GitBranch className="h-3 w-3 text-blue-500" />
                  ) : (
                    <Folder className="h-3 w-3 text-yellow-500" />
                  )}
                  {script.category}
                </div>
              </td>
              <td className="p-3">
                <Badge
                  variant={script.source === "git" ? "default" : "secondary"}
                >
                  {script.source === "git" ? "Git" : "Local"}
                </Badge>
              </td>
              <td className="p-3 text-center">
                {script.parameters.length || "-"}
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedScript(script)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  {onRunScript && (
                    <Button size="sm" onClick={() => onRunScript(script)}>
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGallery = () => (
    <div className="grid gap-6 md:grid-cols-2">
      {filteredScripts.map((script) => (
        <Card key={script.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                {script.name}.ps1
              </CardTitle>
              <Badge
                variant={script.source === "git" ? "default" : "secondary"}
              >
                {script.source === "git" ? "Git" : "Local"}
              </Badge>
            </div>
            <CardDescription>
              {script.frontMatter.description || "No description available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono mb-4 max-h-32 overflow-hidden">
              <pre className="whitespace-pre-wrap text-xs">
                {script.rawContent.substring(0, 200)}
                {script.rawContent.length > 200 && "..."}
              </pre>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Category: {script.category}</span>
              {script.parameters.length > 0 && (
                <span>
                  {script.parameters.length} parameter
                  {script.parameters.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedScript(script)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              {onRunScript && (
                <Button size="sm" onClick={() => onRunScript(script)}>
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Loading scripts...</div>;
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/10">
        <CardContent className="pt-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchScripts} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Scripts</h2>
          <p className="text-muted-foreground">
            {scripts.length} scripts found across all repositories and folders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            value={viewMode}
            onValueChange={(value: any) => setViewMode(value)}
          >
            <TabsList>
              <TabsTrigger value="tree" className="gap-2">
                <TreePine className="h-4 w-4" />
                Tree
              </TabsTrigger>
              <TabsTrigger value="cards" className="gap-2">
                <Grid className="h-4 w-4" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <List className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <Eye className="h-4 w-4" />
                Gallery
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={fetchScripts} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {viewMode === "tree" && (
            <div className="border rounded-lg p-4">
              <ScrollArea className="h-[600px]">
                {Object.entries(tree).map(([categoryName, categoryNode]) =>
                  renderTreeNode(categoryNode, categoryName),
                )}
              </ScrollArea>
            </div>
          )}

          {viewMode === "cards" && renderCards()}
          {viewMode === "table" && renderTable()}
          {viewMode === "gallery" && renderGallery()}
        </div>

        {selectedScript && (
          <div className="w-1/2">
            <ScriptPreview
              script={selectedScript}
              onClose={() => setSelectedScript(null)}
              onRun={
                onRunScript ? () => onRunScript(selectedScript) : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
