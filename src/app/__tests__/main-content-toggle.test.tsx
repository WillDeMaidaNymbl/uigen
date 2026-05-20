import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock context providers
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
  useFileSystem: vi.fn(() => ({
    fileSystem: { getAllFiles: () => new Map(), serialize: () => ({}) },
    selectedFile: null,
    setSelectedFile: vi.fn(),
    getAllFiles: () => new Map(),
    refreshTrigger: 0,
    handleToolCall: vi.fn(),
  })),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
  useChat: vi.fn(() => ({
    messages: [],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    status: "idle",
  })),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Actions</div>,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, ...props }: any) => (
    <div data-testid="resizable-group" {...props}>{children}</div>
  ),
  ResizablePanel: ({ children, ...props }: any) => (
    <div data-testid="resizable-panel" {...props}>{children}</div>
  ),
  ResizableHandle: () => <div data-testid="resizable-handle" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders Preview and Code toggle buttons", () => {
  render(<MainContent />);

  expect(screen.getByRole("button", { name: "Preview" })).toBeDefined();
  expect(screen.getByRole("button", { name: "Code" })).toBeDefined();
});

test("shows PreviewFrame when Preview is active (default)", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
  expect(screen.queryByTestId("file-tree")).toBeNull();
});

test("clicking Code button shows code editor", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const codeBtn = screen.getByRole("button", { name: "Code" });
  await user.click(codeBtn);

  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();
});

test("clicking Preview button after Code shows preview again", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByRole("button", { name: "Code" }));
  expect(screen.queryByTestId("preview-frame")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Preview" }));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("toggling multiple times works correctly", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewBtn = screen.getByRole("button", { name: "Preview" });
  const codeBtn = screen.getByRole("button", { name: "Code" });

  // Start: Preview active
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  await user.click(codeBtn);
  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();

  await user.click(previewBtn);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  await user.click(codeBtn);
  expect(screen.queryByTestId("preview-frame")).toBeNull();

  await user.click(previewBtn);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
});
