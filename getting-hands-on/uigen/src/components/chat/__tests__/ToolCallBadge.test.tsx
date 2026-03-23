import { test, expect, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

describe("getToolCallLabel", () => {
  // str_replace_editor commands
  test("returns 'Creating {path}' for create command", () => {
    expect(
      getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" })
    ).toBe("Creating /App.jsx");
  });

  test("returns 'Editing {path}' for str_replace command", () => {
    expect(
      getToolCallLabel("str_replace_editor", {
        command: "str_replace",
        path: "/components/Button.jsx",
      })
    ).toBe("Editing /components/Button.jsx");
  });

  test("returns 'Viewing {path}' for view command", () => {
    expect(
      getToolCallLabel("str_replace_editor", { command: "view", path: "/index.ts" })
    ).toBe("Viewing /index.ts");
  });

  test("returns 'Inserting into {path}' for insert command", () => {
    expect(
      getToolCallLabel("str_replace_editor", { command: "insert", path: "/utils.ts" })
    ).toBe("Inserting into /utils.ts");
  });

  test("returns 'Undoing edit to {path}' for undo_edit command", () => {
    expect(
      getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })
    ).toBe("Undoing edit to /App.jsx");
  });

  test("returns verb + 'file...' when path is missing", () => {
    expect(
      getToolCallLabel("str_replace_editor", { command: "create" })
    ).toBe("Creating file...");
  });

  // file_manager commands
  test("returns 'Renaming {path} to {new_path}' for rename", () => {
    expect(
      getToolCallLabel("file_manager", {
        command: "rename",
        path: "/old.tsx",
        new_path: "/new.tsx",
      })
    ).toBe("Renaming /old.tsx to /new.tsx");
  });

  test("returns 'Renaming {path}' when new_path is missing", () => {
    expect(
      getToolCallLabel("file_manager", { command: "rename", path: "/old.tsx" })
    ).toBe("Renaming /old.tsx");
  });

  test("returns 'Renaming file...' when path and new_path are missing", () => {
    expect(
      getToolCallLabel("file_manager", { command: "rename" })
    ).toBe("Renaming file...");
  });

  test("returns 'Deleting {path}' for delete", () => {
    expect(
      getToolCallLabel("file_manager", { command: "delete", path: "/trash.tsx" })
    ).toBe("Deleting /trash.tsx");
  });

  test("returns 'Deleting file...' when path is missing for delete", () => {
    expect(
      getToolCallLabel("file_manager", { command: "delete" })
    ).toBe("Deleting file...");
  });

  // Edge cases
  test("returns raw tool name for unknown tool", () => {
    expect(
      getToolCallLabel("unknown_tool", { command: "do_something" })
    ).toBe("unknown_tool");
  });

  test("returns raw tool name when args is undefined", () => {
    expect(getToolCallLabel("str_replace_editor", undefined)).toBe(
      "str_replace_editor"
    );
  });

  test("returns raw tool name when args is empty object", () => {
    expect(getToolCallLabel("str_replace_editor", {})).toBe(
      "str_replace_editor"
    );
  });

  test("parses args from JSON string", () => {
    expect(
      getToolCallLabel(
        "str_replace_editor",
        JSON.stringify({ command: "create", path: "/App.jsx" })
      )
    ).toBe("Creating /App.jsx");
  });

  test("returns raw tool name for invalid JSON string", () => {
    expect(getToolCallLabel("str_replace_editor", "not valid json")).toBe(
      "str_replace_editor"
    );
  });

  test("returns raw tool name for unknown str_replace_editor command", () => {
    expect(
      getToolCallLabel("str_replace_editor", { command: "unknown_cmd", path: "/a.ts" })
    ).toBe("str_replace_editor");
  });

  test("returns raw tool name for unknown file_manager command", () => {
    expect(
      getToolCallLabel("file_manager", { command: "unknown_cmd", path: "/a.ts" })
    ).toBe("file_manager");
  });
});

describe("ToolCallBadge component", () => {
  test("renders green dot when state is result", () => {
    const { container } = render(
      <ToolCallBadge
        toolInvocation={{
          toolName: "str_replace_editor",
          args: { command: "create", path: "/App.jsx" },
          state: "result",
          result: "Success",
          toolCallId: "tc-1",
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
          toolName: "str_replace_editor",
          args: { command: "create", path: "/App.jsx" },
          state: "call",
          toolCallId: "tc-1",
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
          toolName: "str_replace_editor",
          args: { command: "str_replace", path: "/Button.tsx" },
          state: "result",
          result: "Success",
          toolCallId: "tc-1",
        }}
      />
    );

    expect(screen.getByText("Editing /Button.tsx")).toBeDefined();
  });

  test("renders raw tool name for unknown tool", () => {
    render(
      <ToolCallBadge
        toolInvocation={{
          toolName: "some_other_tool",
          args: { foo: "bar" },
          state: "result",
          result: "ok",
          toolCallId: "tc-1",
        }}
      />
    );

    expect(screen.getByText("some_other_tool")).toBeDefined();
  });
});
