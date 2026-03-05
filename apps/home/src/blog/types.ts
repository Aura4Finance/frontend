import type { ReactNode } from "react";

export interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  authorRole: string;
  readingTime: string;
  tags: string[];
  coverLabel?: string;
}

export interface BlogPost extends BlogMeta {
  content: () => ReactNode;
}
