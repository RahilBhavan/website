import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Words of the title that name the finding; they carry the yellow highlighter. Must appear in the title.
    highlight: z.string().optional(),
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
    project: reference('projects').optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // Words of the title that name the finding; they carry the yellow highlighter. Must appear in the title.
    highlight: z.string().optional(),
    // Short line for list views (home, /projects). Aim for under 80 characters.
    tagline: z.string(),
    // Longer summary for <meta name="description"> and the case page header.
    description: z.string(),
    problem: z.string(),
    solution: z.string(),
    // One sentence with the outcome and its numbers; leads list rows and the case page.
    result: z.string(),
    // proposal: a plan or pitch. prototype: built and run on historical, synthetic or own data.
    // shipped: live, delivered to a client, or used by real people.
    status: z.enum(['proposal', 'prototype', 'shipped']),
    verification: z.string(),
    next: z.string().optional(),
    figure: z
      .object({ src: z.string(), alt: z.string(), caption: z.string() })
      .optional(),
    // Which recruiting track the work speaks to; drives the topic filters on /projects and /writing.
    track: z.enum(['crypto', 'ai', 'product', 'hardware']),
    // Short label shown next to the status, e.g. "consulting", "hardware", "risk model".
    kind: z.string().optional(),
    // Shown under Selected work on the homepage.
    featured: z.boolean().default(false),
    demoUrl: z.url().optional(),
    // Allow empty string; treat as undefined so optional URL validation passes
    githubUrl: z
      .union([z.url(), z.literal('')])
      .optional()
      .transform((s) => (s === '' ? undefined : s)),
    completedDate: z.coerce.date(),
    // Absolute URL of a project-hosted 1280x640 social card; otherwise scripts/og/render.mjs makes one.
    ogImage: z.url().optional(),
  }),
});

export const collections = { blog, projects };
