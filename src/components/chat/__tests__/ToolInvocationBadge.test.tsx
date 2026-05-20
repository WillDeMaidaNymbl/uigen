import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolMessage } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- getToolMessage unit tests ---

test("getToolMessage: str_replace_editor create loading", () => {
  expect(getToolMessage("str_replace_editor", { command: "create", path: "/src/App.jsx" }, false)).toBe(
    "Creating App.jsx... ya doofus!"
  );
});

test("getToolMessage: str_replace_editor create done", () => {
  expect(getToolMessage("str_replace_editor", { command: "create", path: "/src/App.jsx" }, true)).toBe(
    "Created App.jsx, genius."
  );
});

test("getToolMessage: str_replace_editor str_replace loading", () => {
  expect(getToolMessage("str_replace_editor", { command: "str_replace", path: "/src/App.jsx" }, false)).toBe(
    "Editing App.jsx... hold on, dummy!"
  );
});

test("getToolMessage: str_replace_editor str_replace done", () => {
  expect(getToolMessage("str_replace_editor", { command: "str_replace", path: "/src/App.jsx" }, true)).toBe(
    "Updated App.jsx, you're welcome."
  );
});

test("getToolMessage: str_replace_editor view loading", () => {
  expect(getToolMessage("str_replace_editor", { command: "view", path: "/src/App.jsx" }, false)).toBe(
    "Peeking at App.jsx... nosy!"
  );
});

test("getToolMessage: str_replace_editor view done", () => {
  expect(getToolMessage("str_replace_editor", { command: "view", path: "/src/App.jsx" }, true)).toBe(
    "Viewed App.jsx, smartypants."
  );
});

test("getToolMessage: str_replace_editor insert loading", () => {
  expect(getToolMessage("str_replace_editor", { command: "insert", path: "/src/App.jsx" }, false)).toBe(
    "Inserting into App.jsx... ya muppet!"
  );
});

test("getToolMessage: str_replace_editor insert done", () => {
  expect(getToolMessage("str_replace_editor", { command: "insert", path: "/src/App.jsx" }, true)).toBe(
    "Inserted into App.jsx, obviously."
  );
});

test("getToolMessage: file_manager delete loading", () => {
  expect(getToolMessage("file_manager", { command: "delete", path: "/src/index.ts" }, false)).toBe(
    "Deleting index.ts... you monster!"
  );
});

test("getToolMessage: file_manager delete done", () => {
  expect(getToolMessage("file_manager", { command: "delete", path: "/src/index.ts" }, true)).toBe(
    "Deleted index.ts, gone forever."
  );
});

test("getToolMessage: file_manager rename loading", () => {
  expect(getToolMessage("file_manager", { command: "rename", path: "/src/oldName.tsx" }, false)).toBe(
    "Renaming oldName.tsx... ya scatterbrain!"
  );
});

test("getToolMessage: file_manager rename done", () => {
  expect(getToolMessage("file_manager", { command: "rename", path: "/src/oldName.tsx" }, true)).toBe(
    "Renamed oldName.tsx, finally."
  );
});

test("getToolMessage: unknown tool falls back", () => {
  expect(getToolMessage("some_other_tool", {}, false)).toBe("Running some_other_tool...");
  expect(getToolMessage("some_other_tool", {}, true)).toBe("Done.");
});

test("getToolMessage: basename strips Windows-style path", () => {
  expect(getToolMessage("str_replace_editor", { command: "create", path: "C:\\src\\Button.tsx" }, true)).toBe(
    "Created Button.tsx, genius."
  );
});

// --- ToolInvocationBadge component tests ---

test("ToolInvocationBadge shows friendly message and green dot when done", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/App.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Created App.jsx, genius.")).toBeDefined();
  // Green dot present, no spinner
  const badge = screen.getByText("Created App.jsx, genius.").closest("div");
  expect(badge?.parentElement?.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolInvocationBadge shows loading message and spinner when in progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/src/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing App.jsx... hold on, dummy!")).toBeDefined();
});

test("ToolInvocationBadge shows file_manager delete message", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "3",
        toolName: "file_manager",
        args: { command: "delete", path: "/src/index.ts" },
        state: "result",
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Deleted index.ts, gone forever.")).toBeDefined();
});

test("ToolInvocationBadge shows fallback for unknown tool", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "4",
        toolName: "unknown_tool",
        args: {},
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Running unknown_tool...")).toBeDefined();
});
