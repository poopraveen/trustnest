#!/bin/bash
# PostToolUse hook: when a new page/route file is written, records it in CLAUDE.md.
# Only triggers for app/**/page.tsx and app/**/layout.tsx (new feature files).

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""' 2>/dev/null)

# Only care about new route pages and layouts
if [[ "$FILE" != *"/app/"*"/page.tsx" ]] && [[ "$FILE" != *"/app/"*"/layout.tsx" ]]; then
  exit 0
fi

# Extract the route path from the file path (strip leading app/[locale] and trailing /page.tsx)
ROUTE=$(echo "$FILE" | sed 's|.*/app/\[locale\]/||; s|/page\.tsx$||; s|/layout\.tsx$||')

PROJECT_ROOT=$(git -C "$(pwd)" rev-parse --show-toplevel 2>/dev/null || pwd)
CLAUDE_FILE="$PROJECT_ROOT/CLAUDE.md"
DATE=$(date '+%Y-%m-%d %H:%M')

[ -f "$CLAUDE_FILE" ] || exit 0

# Append a one-line entry under "## Recent Changes" section (create if missing)
ENTRY="- \`/$ROUTE\` — modified ${DATE}"

if grep -q "^## Recent Changes" "$CLAUDE_FILE"; then
  # Insert after the ## Recent Changes heading
  sed -i "/^## Recent Changes/a $ENTRY" "$CLAUDE_FILE"
else
  printf "\n## Recent Changes\n%s\n" "$ENTRY" >> "$CLAUDE_FILE"
fi
