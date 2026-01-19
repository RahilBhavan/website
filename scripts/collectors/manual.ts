/**
 * Manual book collector - reads from existing markdown files
 * This serves as a fallback and migration path from the old system
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import type { RawBook } from './types.js';

export async function collectManualBooks(): Promise<RawBook[]> {
  const booksDir = join(process.cwd(), 'src/content/books');
  const files = await readdir(booksDir);
  const markdownFiles = files.filter(f => f.endsWith('.md'));

  const books: RawBook[] = [];

  for (const file of markdownFiles) {
    try {
      const content = await readFile(join(booksDir, file), 'utf-8');
      const frontmatter = parseFrontmatter(content);
      
      if (frontmatter) {
        books.push({
          title: frontmatter.title,
          author: frontmatter.author,
          coverUrl: frontmatter.coverUrl,
          isbn: frontmatter.isbn,
          source: 'manual',
          status: frontmatter.status || 'read',
          startedDate: frontmatter.startedDate ? new Date(frontmatter.startedDate) : undefined,
          completedDate: frontmatter.completedDate ? new Date(frontmatter.completedDate) : undefined,
          rating: frontmatter.rating,
          review: frontmatter.review,
          tags: frontmatter.tags || [],
        });
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  return books;
}

function parseFrontmatter(content: string): Record<string, unknown> | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return null;

  const frontmatterText = match[1];
  const frontmatter: Record<string, unknown> = {};

  for (const line of frontmatterText.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    // Remove quotes if present
    if (typeof value === 'string' && (value.startsWith('"') || value.startsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse arrays
    if (value.toString().startsWith('[')) {
      value = JSON.parse(value.toString());
    }

    // Parse dates
    if (key.includes('Date') && typeof value === 'string') {
      value = new Date(value);
    }

    // Parse numbers
    if (key === 'rating' && typeof value === 'string') {
      value = parseFloat(value);
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}
