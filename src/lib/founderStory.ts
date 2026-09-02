import type { FounderStory } from "@/components/sections/ImpactAtGlanceClient";

/**
 * Shared shape and slug rule for the founders-story cards.
 *
 * THIS IS A PLAIN MODULE, NOT A CLIENT ONE, and that is the point. `storySlug`
 * used to live in FoundersStoryGrid, which is `"use client"` — importing it
 * into a server component hands back a client REFERENCE rather than the
 * function, so calling it there throws and the page 500s. The featured band is
 * a server component and needs the same rule as the grid, so the rule lives
 * somewhere both can genuinely call it.
 */
export interface FounderStoryCard extends FounderStory {
  /** Which internal page this card opens. Optional — see storySlug. */
  storySlug?: string;
  /** Marks the story that fills the band at the top of /foundersstory. */
  featured?: boolean;
}

export interface FoundersStoryGridData {
  heading?: string;
  browseLabel?: string;
  browseHref?: string;
  gridHeading?: string;
  ctaLabel?: string;
  stories?: FounderStoryCard[];
}

/**
 * Where a card links.
 *
 * AN EXPLICIT `storySlug` WINS. The slug used to be derived from the company
 * name in the role, which is a guess: right for "Mamaearth", wrong the moment
 * a role is worded differently or a story's slug does not match its company
 * name — and a wrong guess lands on the "not published yet" page rather than
 * failing visibly. The derived value stays as the fallback so nothing has to be
 * re-entered, but an editor can now say exactly which story a card opens.
 */
export function storySlug(story: FounderStoryCard): string {
  if (story.storySlug?.trim()) {
    return story.storySlug.trim().replace(/^\/+|\/+$/g, "");
  }
  const role = story.role || "";
  const company = role.includes(",") ? role.split(",").pop()!.trim() : story.name;
  return company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
