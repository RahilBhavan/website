import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    problem: z.string(),
    solution: z.string(),
    demoUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    completedDate: z.coerce.date(),
  }),
});

const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    coverUrl: z.string().url().optional(),
    isbn: z.string().optional(),
    source: z.enum(['goodreads', 'audible', 'spotify', 'physical', 'manual']).default('manual'),
    status: z.enum(['currently-reading', 'read', 'want-to-read']).default('read'),
    startedDate: z.coerce.date().optional(),
    completedDate: z.coerce.date().optional(),
    rating: z.number().min(0).max(5).optional(),
    review: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, projects, books };
