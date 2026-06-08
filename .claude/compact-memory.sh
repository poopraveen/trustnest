#!/bin/bash
# PostCompact hook: saves the compaction summary into CLAUDE.md as persistent context memory.
# Receives JSON on stdin: { "summary": "...", "session_id": "...", ... }

INPUT=$(cat)
SUMMARY=$(echo "$INPUT" | jq -r '.summary // ""' 2>/dev/null)

if [ -z "$SUMMARY" ] || [ "$SUMMARY" = "null" ]; then
  exit 0
fi

PROJECT_ROOT=$(git -C "$(pwd)" rev-parse --show-toplevel 2>/dev/null || pwd)
CLAUDE_FILE="$PROJECT_ROOT/CLAUDE.md"
DATE=$(date '+%Y-%m-%d %H:%M')

# Build the new context memory block
MEMORY_BLOCK="## Context Memory
_Last compacted: ${DATE}_

$SUMMARY"

if [ ! -f "$CLAUDE_FILE" ]; then
  printf "# TrustNest — Project Memory\n\n%s\n" "$MEMORY_BLOCK" > "$CLAUDE_FILE"
  exit 0
fi

if grep -q "^## Context Memory" "$CLAUDE_FILE"; then
  # Remove old Context Memory section (from its heading to the next ## heading or EOF)
  awk '
    /^## Context Memory/ { skip=1; next }
    skip && /^## / { skip=0 }
    !skip { print }
  ' "$CLAUDE_FILE" > /tmp/claude_md_work
  # Append updated section
  printf "\n%s\n" "$MEMORY_BLOCK" >> /tmp/claude_md_work
  mv /tmp/claude_md_work "$CLAUDE_FILE"
else
  # No existing section — append
  printf "\n%s\n" "$MEMORY_BLOCK" >> "$CLAUDE_FILE"
fi
