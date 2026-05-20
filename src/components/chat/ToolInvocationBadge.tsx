"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function basename(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

export function getToolMessage(
  toolName: string,
  args: Record<string, unknown>,
  isDone: boolean
): string {
  const filename = args?.path ? basename(String(args.path)) : null;
  const command = args?.command as string | undefined;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return isDone
          ? `Created ${filename}, genius.`
          : `Creating ${filename}... ya doofus!`;
      case "str_replace":
        return isDone
          ? `Updated ${filename}, you're welcome.`
          : `Editing ${filename}... hold on, dummy!`;
      case "view":
        return isDone
          ? `Viewed ${filename}, smartypants.`
          : `Peeking at ${filename}... nosy!`;
      case "insert":
        return isDone
          ? `Inserted into ${filename}, obviously.`
          : `Inserting into ${filename}... ya muppet!`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        return isDone
          ? `Renamed ${filename}, finally.`
          : `Renaming ${filename}... ya scatterbrain!`;
      case "delete":
        return isDone
          ? `Deleted ${filename}, gone forever.`
          : `Deleting ${filename}... you monster!`;
    }
  }

  return isDone ? "Done." : `Running ${toolName}...`;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = toolInvocation as any;
  const isDone = inv.state === "result" && inv.result != null;
  const message = getToolMessage(
    inv.toolName,
    (inv.args as Record<string, unknown>) ?? {},
    isDone
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
