import { test, expect, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

describe("getLabel", () => {
  // str_replace_editor commands
  test("returns 'Creating {filename}' for create command", () => {
    expect(getLabel("str_replace_editor", { command: "create", path: "/src/App.jsx" })).toBe("Creating App.jsx");
  });

  test("returns 'Editing {filename}' for str_replace command", () => {
    expect(getLabel("str_replace_editor", { command: "str_replace", path: "/src/App.jsx" })).toBe("Editing App.jsx");
  });

  test("returns 'Editing {filename}' for insert command", () => {
    expect(getLabel("str_replace_editor", { command: "insert", path: "/src/App.jsx" })).toBe("Editing App.jsx");
  });

  test("returns 'Viewing {filename}' for view command", () => {
    expect(getLabel("str_replace_editor", { command: "view", path: "/src/index.ts" })).toBe("Viewing index.ts");
  });

  test("returns 'Undoing edit to {filename}' for undo_edit command", () => {
    expect(getLabel("str_replace_editor", { command: "undo_edit", path: "/src/App.jsx" })).toBe("Undoing edit to App.jsx");
  });

  test("returns verb + 'file' when path is missing", () => {
    expect(getLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
  });

  test("returns raw tool name for unknown str_replace_editor command", () => {
    expect(getLabel("str_replace_editor", { command: "unknown_cmd", path: "/a.ts" })).toBe("str_replace_editor");
  });

  // file_manager commands
  test("returns 'Renaming {filename}' for rename command", () => {
    expect(getLabel("file_manager", { command: "rename", path: "/src/old.tsx" })).toBe("Renaming old.tsx");
  });

  test("returns 'Deleting {filename}' for delete command", () => {
    expect(getLabel("file_manager", { command: "delete", path: "/src/trash.tsx" })).toBe("Deleting trash.tsx");
  });

  test("returns 'Renaming file' when path is missing for rename", () => {
    expect(getLabel("file_manager", { command: "rename" })).toBe("Renaming file");
  });

  test("returns 'Deleting file' when path is missing for delete", () => {
    expect(getLabel("file_manager", { command: "delete" })).toBe("Deleting file");
  });

  test("returns raw tool name for unknown file_manager command", () => {
    expect(getLabel("file_manager", { command: "unknown_cmd", path: "/a.ts" })).toBe("file_manager");
  });

  // Edge cases
  test("returns raw tool name for unknown tool", () => {
    expect(getLabel("custom_tool", { command: "do_something" })).toBe("custom_tool");
  });

  test("returns raw tool name when args is empty object", () => {
    expect(getLabel("str_replace_editor", {})).toBe("str_replace_editor");
  });
});

describe("ToolCallBadge component", () => {
  test("renders green dot when state is result", () => {
    const { container } = render(
      <ToolCallBadge
        toolInvocation={{
          toolCallId: "tc-1",
          toolName: "str_replace_editor",
          args: { command: "create", path: "/App.jsx" },
          state: "result",
          result: "ok",
        }}
      />
    );
    expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  test("renders spinner when state is not result", () => {
    const { container } = render(
      <ToolCallBadge
        toolInvocation={{
          toolCallId: "tc-1",
          toolName: "str_replace_editor",
          args: { command: "create", path: "/App.jsx" },
          state: "call",
        }}
      />
    );
    expect(container.querySelector(".animate-spin")).not.toBeNull();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("renders human-readable label", () => {
    render(
      <ToolCallBadge
        toolInvocation={{
          toolCallId: "tc-1",
          toolName: "str_replace_editor",
          args: { command: "str_replace", path: "/src/Button.tsx" },
          state: "result",
          result: "ok",
        }}
      />
    );
    expect(screen.getByText("Editing Button.tsx")).toBeDefined();
  });

  test("renders raw tool name for unknown tool", () => {
    render(
      <ToolCallBadge
        toolInvocation={{
          toolCallId: "tc-1",
          toolName: "some_other_tool",
          args: {},
          state: "result",
          result: "ok",
        }}
      />
    );
    expect(screen.getByText("some_other_tool")).toBeDefined();
  });
});
