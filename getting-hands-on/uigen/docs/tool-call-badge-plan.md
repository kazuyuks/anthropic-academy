# Plan: Replace raw tool names with human-readable labels

## Context

In the UIGen chat UI, when Claude invokes tools (like `str_replace_editor` or `file_manager`), the raw tool name is displayed verbatim in a badge. The user wants this replaced with a friendly description of what the tool is doing, including the file name (e.g., "Creating /App.jsx" instead of "str_replace_editor").

## Approach

Separate label logic from rendering: a pure `getToolCallLabel(toolName, args)` function + a `ToolCallBadge` React component.

## Steps

### 1. Create `src/components/chat/ToolCallBadge.tsx`

- Export `getToolCallLabel(toolName: string, args: Record<string, unknown> | string | undefined): string`
  - Parse `args` if it's a JSON string (handle parse failures gracefully)
  - Map `str_replace_editor` commands: `create` -> "Creating {path}", `str_replace` -> "Editing {path}", `view` -> "Viewing {path}", `insert` -> "Inserting into {path}", `undo_edit` -> "Undoing edit to {path}"
  - Map `file_manager` commands: `rename` -> "Renaming {path} to {new_path}", `delete` -> "Deleting {path}"
  - Unknown tool or missing args -> return raw `toolName`
  - Missing path -> show verb + "file..." (e.g., "Creating file...")
- Export `ToolCallBadge` component that renders the badge (green dot/spinner + label) using `getToolCallLabel`
  - Move the existing badge markup from `MessageList.tsx` lines 83-96 into this component

### 2. Update `src/components/chat/MessageList.tsx`

- Import `ToolCallBadge` from `./ToolCallBadge`
- Replace the `case "tool-invocation"` block (lines 81-97) with `<ToolCallBadge key={partIndex} toolInvocation={part.toolInvocation} />`
- Keep `Loader2` import (still used for the "Generating..." state)

### 3. Create `src/components/chat/__tests__/ToolCallBadge.test.tsx`

Test `getToolCallLabel` directly:
- All str_replace_editor commands with path
- All file_manager commands with path
- rename with and without new_path
- Unknown tool name -> raw name
- Missing/undefined args -> raw tool name
- Args as JSON string -> parses correctly
- Invalid JSON string args -> falls back to tool name
- Missing command in args -> falls back to tool name
- Missing path -> verb + "file..."

Test `ToolCallBadge` component rendering:
- Green dot when state is "result"
- Spinner when state is not "result"
- Human-readable label appears in DOM

### 4. Update `src/components/chat/__tests__/MessageList.test.tsx`

- Update the "renders messages with parts" test (line 56-82): change `args: {}` to `args: { command: "create", path: "/App.jsx" }` and update assertion from `"str_replace_editor"` to `"Creating /App.jsx"`

### 5. Run tests

```bash
cd getting-hands-on/uigen && npx vitest run
```

## Critical Files

- `src/components/chat/ToolCallBadge.tsx` — **new**
- `src/components/chat/__tests__/ToolCallBadge.test.tsx` — **new**
- `src/components/chat/MessageList.tsx` — edit lines 81-97
- `src/components/chat/__tests__/MessageList.test.tsx` — update assertion on line 81
