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
    series: z.object({
      name: z.string(),
      part: z.number(),
    }).optional(),
    readingTime: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Short line for list views (home, /projects). Aim for under 80 characters.
    tagline: z.string(),
    // Longer summary for <meta name="description"> and the case page header.
    description: z.string(),
    problem: z.string(),
    solution: z.string(),
    // Mono label shown next to the title, e.g. "consulting", "hardware", "proposal".
    kind: z.string().optional(),
    // Shown in the Building list on the homepage.
    featured: z.boolean().default(false),
    demoUrl: z.string().url().optional(),
    // Allow empty string; treat as undefined so optional URL validation passes
    githubUrl: z
      .union([z.string().url(), z.literal('')])
      .optional()
      .transform((s) => (s === '' ? undefined : s)),
    completedDate: z.coerce.date(),
  }),
});

export const collections = { blog, projects };
