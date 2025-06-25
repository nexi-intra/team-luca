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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Play,
  FileCode,
  Info,
  GitBranch,
  Calendar,
  User,
  Tag,
  Settings,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  parameters: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    default?: any;
  }>;
}

interface ScriptPreviewProps {
  script: ParsedScript;
  onClose: () => void;
  onRun?: () => void;
}

export function ScriptPreview({ script, onClose, onRun }: ScriptPreviewProps) {
  const [activeTab, setActiveTab] = useState("preview");

  const formatFrontMatterValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderMarkdownWithSyntaxHighlighting = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "powershell";

            return match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1">
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted pl-4 italic mb-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              {script.name}.ps1
              <Badge
                variant={script.source === "git" ? "default" : "secondary"}
              >
                {script.source === "git" ? "Git" : "Local"}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {script.frontMatter.description || "No description available"}
            </CardDescription>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <span>Category: {script.category}</span>
              {script.parameters.length > 0 && (
                <span>
                  {script.parameters.length} parameter
                  {script.parameters.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRun && (
              <Button size="sm" onClick={onRun}>
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview" className="gap-2">
                <FileCode className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="raw" className="gap-2">
                <FileCode className="h-4 w-4" />
                Raw Code
              </TabsTrigger>
              <TabsTrigger value="metadata" className="gap-2">
                <Info className="h-4 w-4" />
                Metadata
              </TabsTrigger>
              <TabsTrigger value="parameters" className="gap-2">
                <Settings className="h-4 w-4" />
                Parameters
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px]">
            <TabsContent value="preview" className="p-6 mt-0">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {script.markdown ? (
                  renderMarkdownWithSyntaxHighlighting(script.markdown)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No formatted content available. View raw code instead.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="raw" className="p-0 mt-0">
              <SyntaxHighlighter
                language="powershell"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  background: "hsl(var(--muted))",
                }}
                showLineNumbers
              >
                {script.rawContent}
              </SyntaxHighlighter>
            </TabsContent>

            <TabsContent value="metadata" className="p-6 mt-0">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File Name:</span>
                      <p className="text-muted-foreground">{script.name}.ps1</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="text-muted-foreground">{script.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Source:</span>
                      <p className="text-muted-foreground flex items-center gap-1">
                        {script.source === "git" ? (
                          <>
                            <GitBranch className="h-3 w-3" />
                            Git Repository
                          </>
                        ) : (
                          "Local Folder"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Path:</span>
                      <p className="text-muted-foreground text-xs break-all">
                        {script.relativePath}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Repository Information */}
                {script.repository && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Repository Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Repository:</span>
                        <p className="text-muted-foreground">
                          {script.repository.name}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Branch:</span>
                        <p className="text-muted-foreground">
                          {script.repository.branch}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">URL:</span>
                        <p className="text-muted-foreground text-xs break-all">
                          {script.repository.url}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Front Matter */}
                {Object.keys(script.frontMatter).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Front Matter
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(script.frontMatter).map(
                        ([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <div className="text-muted-foreground mt-1 whitespace-pre-wrap">
                              {formatFrontMatterValue(value)}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="p-6 mt-0">
              {script.parameters.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Script Parameters
                  </h3>
                  {script.parameters.map((param, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">${param.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{param.type}</Badge>
                            {param.required && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                          </div>
                        </div>
                        {param.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {param.description}
                          </p>
                        )}
                        {param.default && (
                          <p className="text-xs text-muted-foreground">
                            Default:{" "}
                            <code className="bg-muted px-1 py-0.5 rounded">
                              {param.default}
                            </code>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>This script doesn&apos;t have any parameters.</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
