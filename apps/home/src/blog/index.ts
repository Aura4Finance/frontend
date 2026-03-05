import type { BlogPost } from "./types";
import keyManagement from "./posts/key-management-infrastructure";

/**
 * Registry of all blog posts.
 * Add new posts here — they'll automatically appear on /blogs
 * and be routable at /blogs/:slug.
 */
export const blogPosts: BlogPost[] = [keyManagement];

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
