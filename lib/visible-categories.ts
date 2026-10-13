/**
 * Product categories hidden from the storefront UI (navigation, category
 * bars, home page). Their data, admin pages and direct URLs keep working;
 * remove a slug here to show that category again.
 */
export const HIDDEN_CATEGORY_SLUGS: readonly string[] = ["jewellers"];

export const isCategoryHidden = (slug: string) =>
  HIDDEN_CATEGORY_SLUGS.includes(slug);

type CategoryLike = { id: string; slug: string; parent_id: string | null };

/** Drops hidden categories and everything nested under them. */
export function filterVisibleCategories<T extends CategoryLike>(
  categories: T[],
): T[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const isVisible = (cat: T): boolean => {
    for (let cur: T | undefined = cat; cur; ) {
      if (isCategoryHidden(cur.slug)) return false;
      cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
    }
    return true;
  };
  return categories.filter(isVisible);
}
