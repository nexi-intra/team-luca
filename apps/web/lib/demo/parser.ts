import { DemoScript, DemoStep } from "./types";

export function parseMarkdownScript(markdown: string): DemoScript {
  const lines = markdown.split("\n");
  const script: DemoScript = {
    id: "",
    title: "",
    description: "",
    steps: [],
    metadata: {},
  };

  let currentSection = "";
  let stepBuffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Parse frontmatter
    if (trimmed.startsWith("# ")) {
      script.title = trimmed.substring(2);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      currentSection = trimmed.substring(3).toLowerCase();
      continue;
    }

    // Parse metadata
    if (currentSection === "metadata") {
      const match = trimmed.match(/^- (\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        if (key === "id") script.id = value;
        else if (key === "tags")
          script.metadata!.tags = value.split(",").map((t) => t.trim());
        else (script.metadata as any)[key] = value;
      }
    }

    // Parse description
    if (currentSection === "description" && trimmed) {
      script.description += (script.description ? " " : "") + trimmed;
    }

    // Parse steps
    if (currentSection === "steps") {
      if (trimmed.startsWith("```")) {
        if (stepBuffer.length > 0) {
          const step = parseStepBlock(stepBuffer.join("\n"));
          if (step) script.steps.push(step);
          stepBuffer = [];
        }
      } else if (trimmed) {
        stepBuffer.push(trimmed);
      }
    }
  }

  // Handle last step if any
  if (stepBuffer.length > 0) {
    const step = parseStepBlock(stepBuffer.join("\n"));
    if (step) script.steps.push(step);
  }

  // Generate ID if not provided
  if (!script.id) {
    script.id = script.title.toLowerCase().replace(/\s+/g, "-");
  }

  return script;
}

function parseStepBlock(block: string): DemoStep | null {
  const lines = block.split("\n");
  const step: Partial<DemoStep> = {
    id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Parse step type and basic info
    const typeMatch = trimmed.match(
      /^(click|type|wait|navigate|assert|highlight|scroll|hover)\s*(.*)$/i,
    );
    if (typeMatch) {
      const [, type, rest] = typeMatch;
      step.type = type.toLowerCase() as DemoStep["type"];

      // Parse inline target/value
      if (rest) {
        if (type === "wait") {
          step.delay = parseInt(rest) || 1000;
        } else if (type === "type" || type === "navigate") {
          const parts = rest.split(" in ");
          if (parts.length === 2) {
            step.value = parts[0].replace(/^["']|["']$/g, "");
            step.target = parts[1].replace(/^["']|["']$/g, "");
          } else {
            step.value = rest.replace(/^["']|["']$/g, "");
          }
        } else {
          step.target = rest.replace(/^["']|["']$/g, "");
        }
      }
      continue;
    }

    // Parse properties
    const propMatch = trimmed.match(/^(\w+):\s*(.+)$/);
    if (propMatch) {
      const [, key, value] = propMatch;
      if (key === "target") step.target = value.replace(/^["']|["']$/g, "");
      else if (key === "value") step.value = value.replace(/^["']|["']$/g, "");
      else if (key === "delay") step.delay = parseInt(value) || 0;
      else if (key === "description") step.description = value;
    }
  }

  return step.type ? (step as DemoStep) : null;
}

export function generateMarkdownScript(script: DemoScript): string {
  let markdown = `# ${script.title}\n\n`;

  // Add metadata
  if (Object.keys(script.metadata || {}).length > 0 || script.id) {
    markdown += "## Metadata\n\n";
    markdown += `- id: ${script.id}\n`;
    if (script.metadata?.author)
      markdown += `- author: ${script.metadata.author}\n`;
    if (script.metadata?.version)
      markdown += `- version: ${script.metadata.version}\n`;
    if (script.metadata?.tags)
      markdown += `- tags: ${script.metadata.tags.join(", ")}\n`;
    markdown += "\n";
  }

  // Add description
  if (script.description) {
    markdown += `## Description\n\n${script.description}\n\n`;
  }

  // Add steps
  markdown += "## Steps\n\n";
  for (const step of script.steps) {
    markdown += "```\n";
    markdown += `${step.type}`;

    if (step.type === "wait" && step.delay) {
      markdown += ` ${step.delay}`;
    } else if (step.type === "type" && step.value && step.target) {
      markdown += ` "${step.value}" in "${step.target}"`;
    } else if (step.type === "navigate" && step.value) {
      markdown += ` "${step.value}"`;
    } else if (step.target) {
      markdown += ` "${step.target}"`;
    }

    markdown += "\n";

    if (step.description) {
      markdown += `description: ${step.description}\n`;
    }

    markdown += "```\n\n";
  }

  return markdown;
}
