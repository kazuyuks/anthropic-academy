import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolInvocation: {
    toolName: string;
    args: Record<string, unknown> | string;
    state: string;
    result?: unknown;
    toolCallId: string;
  };
}

function parseArgs(
  args: Record<string, unknown> | string | undefined
): Record<string, unknown> | null {
  if (!args) return null;
  if (typeof args === "object") return args;
  try {
    const parsed = JSON.parse(args);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export function getToolCallLabel(
  toolName: string,
  args: Record<string, unknown> | string | undefined
): string {
  const parsed = parseArgs(args);
  if (!parsed || !parsed.command) return toolName;

  const command = String(parsed.command);
  const path = parsed.path ? String(parsed.path) : null;

  if (toolName === "str_replace_editor") {
    const labels: Record<string, string> = {
      create: "Creating",
      str_replace: "Editing",
      view: "Viewing",
      insert: "Inserting into",
      undo_edit: "Undoing edit to",
    };
    const verb = labels[command];
    if (!verb) return toolName;
    return path ? `${verb} ${path}` : `${verb} file...`;
  }

  if (toolName === "file_manager") {
    if (command === "rename") {
      const newPath = parsed.new_path ? String(parsed.new_path) : null;
      if (path && newPath) return `Renaming ${path} to ${newPath}`;
      if (path) return `Renaming ${path}`;
      return `Renaming file...`;
    }
    if (command === "delete") {
      return path ? `Deleting ${path}` : `Deleting file...`;
    }
    return toolName;
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const label = getToolCallLabel(
    toolInvocation.toolName,
    toolInvocation.args
  );
  const isDone = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
