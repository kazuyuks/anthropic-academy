# ToolCallBadge Component

## Overview

Replace the raw `str_replace_editor` tool name in the chat UI with human-readable labels like **"Creating App.jsx"** or **"Editing Button.tsx"**, extracted from the tool's args. Extracted into a dedicated component with tests.

## Files

| Action | Path |
|---|---|
| Create | `src/components/chat/ToolCallBadge.tsx` |
| Create | `src/components/chat/__tests__/ToolCallBadge.test.tsx` |
| Modify | `src/components/chat/MessageList.tsx` |
| Modify | `src/components/chat/__tests__/MessageList.test.tsx` |

---

## 1. `ToolCallBadge.tsx`

Accept a `toolInvocation` prop (from Vercel AI SDK's `ToolInvocationUIPart["toolInvocation"]`).

### Label mapping

Extract `{filename}` from `args.path` using the last path segment (e.g. `"/src/App.jsx"` → `"App.jsx"`). If `args.path` is absent, omit the filename.

| `toolName` | `args.command` | Label |
|---|---|---|
| `str_replace_editor` | `create` | `Creating {filename}` |
| `str_replace_editor` | `str_replace` | `Editing {filename}` |
| `str_replace_editor` | `insert` | `Editing {filename}` |
| `str_replace_editor` | `view` | `Viewing {filename}` |
| `str_replace_editor` | `undo_edit` | `Undoing edit to {filename}` |
| `file_manager` | `rename` | `Renaming {filename}` |
| `file_manager` | `delete` | `Deleting {filename}` |
| _(fallback)_ | — | `{toolName}` |

### States

- `state !== "result"` → spinning `Loader2` icon (in-progress)
- `state === "result"` → green dot (complete)

Preserve existing container classes:
```
inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200
```

---

## 2. `MessageList.tsx`

Replace the inline `case "tool-invocation":` block:

```tsx
case "tool-invocation":
  return <ToolCallBadge key={partIndex} toolInvocation={part.toolInvocation} />;
```

---

## 3. `ToolCallBadge.test.tsx`

Use Vitest + `@testing-library/react` (same pattern as existing tests under `src/components/chat/__tests__/`).

### Test cases

| Scenario | Input | Expected output |
|---|---|---|
| `str_replace_editor` create | `command: "create", path: "/src/App.jsx"` | `"Creating App.jsx"` |
| `str_replace_editor` str_replace | `command: "str_replace", path: "/src/App.jsx"` | `"Editing App.jsx"` |
| `str_replace_editor` insert | `command: "insert", path: "/src/App.jsx"` | `"Editing App.jsx"` |
| `str_replace_editor` view | `command: "view", path: "/src/App.jsx"` | `"Viewing App.jsx"` |
| `str_replace_editor` undo_edit | `command: "undo_edit", path: "/src/App.jsx"` | `"Undoing edit to App.jsx"` |
| `file_manager` rename | `command: "rename", path: "/src/App.jsx"` | `"Renaming App.jsx"` |
| `file_manager` delete | `command: "delete", path: "/src/App.jsx"` | `"Deleting App.jsx"` |
| Unknown tool | `toolName: "unknown_tool"` | `"unknown_tool"` |
| In-progress state | `state: "call"` | Loader2 spinner rendered |
| Completed state | `state: "result"` | Green dot rendered |

---

## 4. Update `MessageList.test.tsx`

The existing tool-invocation test asserts `"str_replace_editor"`. Update it to pass `args: { command: "create", path: "/App.jsx" }` and assert `"Creating App.jsx"` instead.

---

## Verification

1. `npm run test` — all tests pass
2. Start the dev server (`npm run dev`), send a chat message, confirm the tool call badge shows e.g. **"Creating App.jsx"** instead of `str_replace_editor`
