export function getEmptyStateMessage(filter: string): { title: string; description: string } {
  switch (filter) {
    case "public":
      return {
        title: "No public pastes found",
        description: "You haven't created any public pastes yet. Create your first public paste to share with the world.",
      };
    case "private":
      return {
        title: "No private pastes found", 
        description: "You haven't created any private pastes yet. Private pastes are only visible to you.",
      };
    case "unlisted":
      return {
        title: "No unlisted pastes found",
        description: "You haven't created any unlisted pastes yet. Unlisted pastes are hidden from public listings.",
      };
    default:
      return {
        title: "No pastes found",
        description: "You haven't created any pastes yet. Click the button above to create your first paste.",
      };
  }
}

export function formatPastesCount(count: number, filter: string): string {
  const filterText = filter === "all" ? "" : ` ${filter}`;
  return `${count}${filterText} paste${count === 1 ? "" : "s"}`;
}

export function getPaginationRange(current: number, total: number, delta: number = 2): (number | string)[] {
  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (current + delta < total - 1) {
    rangeWithDots.push("...", total);
  } else {
    rangeWithDots.push(total);
  }

  return rangeWithDots.filter((item, index) => rangeWithDots.indexOf(item) === index);
}