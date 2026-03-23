import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "result",
  result: unknown = "Success"
) {
  return { toolCallId: "test-id", toolName, args, state, result: state === "result" ? result : undefined };
}

// str_replace_editor labels
test("str_replace_editor create shows Creating filename", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.jsx" })} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing filename", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/src/App.jsx" })} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing filename", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/src/App.jsx" })} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor view shows Viewing filename", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/src/App.jsx" })} />);
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows Undoing edit to filename", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "/src/App.jsx" })} />);
  expect(screen.getByText("Undoing edit to App.jsx")).toBeDefined();
});

// file_manager labels
test("file_manager rename shows Renaming filename", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/src/App.jsx" })} />);
  expect(screen.getByText("Renaming App.jsx")).toBeDefined();
});

test("file_manager delete shows Deleting filename", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/src/App.jsx" })} />);
  expect(screen.getByText("Deleting App.jsx")).toBeDefined();
});

// Fallback
test("unknown tool shows tool name as fallback", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("custom_tool", {})} />);
  expect(screen.getByText("custom_tool")).toBeDefined();
});

// States
test("completed state renders green dot", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "result", "ok")} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("in-progress state renders spinner", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
