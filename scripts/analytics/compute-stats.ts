/**
 * Analytics computation system
 * Calculates reading statistics, trends, and goal progress
 */

import type { NormalizedBook } from '../collectors/types.js';
import type { ReadingInsights } from '../ai/insights-generator.js';

export interface ReadingAnalytics {
  overview: {
    totalBooks: number;
    currentlyReading: number;
    wantToRead: number;
    averageRating: number;
    totalPages: number; // Estimated if available
  };
  timeline: {
    byYear: Array<{ year: number; count: number }>;
    byMonth: Array<{ month: string; count: number }>; // YYYY-MM format
  };
  genres: {
    distribution: Array<{ genre: string; count: number; percentage: number }>;
    evolution: Array<{ year: number; genres: Record<string, number> }>;
  };
  authors: {
    topAuthors: Array<{ author: string; count: number; averageRating: number }>;
    diversity: number; // Unique authors / total books
  };
  ratings: {
    distribution: Array<{ rating: number; count: number }>;
    averageByYear: Array<{ year: number; average: number }>;
  };
  goals: {
    booksThisYear: number;
    targetThisYear: number; // From config or default
    progress: number; // Percentage
    onTrack: boolean;
  };
  insights: ReadingInsights | null;
  generatedAt: string;
}

/**
 * Compute comprehensive reading analytics
 */
export function computeAnalytics(
  books: NormalizedBook[],
  insights: ReadingInsights | null = null
): ReadingAnalytics {
  const readBooks = books.filter(b => b.status === 'read');
  const currentlyReading = books.filter(b => b.status === 'currently-reading');
  const wantToRead = books.filter(b => b.status === 'want-to-read');

  // Overview
  const ratings = readBooks
    .map(b => b.rating)
    .filter((r): r is number => r !== undefined);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  // Timeline
  const byYear = new Map<number, number>();
  const byMonth = new Map<string, number>();

  readBooks.forEach(book => {
    if (book.completedDate) {
      const date = new Date(book.completedDate);
      const year = date.getFullYear();
      const month = date.toISOString().slice(0, 7); // YYYY-MM

      byYear.set(year, (byYear.get(year) || 0) + 1);
      byMonth.set(month, (byMonth.get(month) || 0) + 1);
    }
  });

  const timelineByYear = Array.from(byYear.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  const timelineByMonth = Array.from(byMonth.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Genres
  const genreCounts = new Map<string, number>();
  readBooks.forEach(book => {
    book.tags?.forEach(tag => {
      genreCounts.set(tag, (genreCounts.get(tag) || 0) + 1);
    });
  });

  const genreDistribution = Array.from(genreCounts.entries())
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: Math.round((count / readBooks.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Genre evolution by year
  const genreEvolution = new Map<number, Map<string, number>>();
  readBooks.forEach(book => {
    if (book.completedDate) {
      const year = new Date(book.completedDate).getFullYear();
      if (!genreEvolution.has(year)) {
        genreEvolution.set(year, new Map());
      }
      const yearGenres = genreEvolution.get(year)!;
      book.tags?.forEach(tag => {
        yearGenres.set(tag, (yearGenres.get(tag) || 0) + 1);
      });
    }
  });

  const genreEvolutionArray = Array.from(genreEvolution.entries())
    .map(([year, genres]) => ({
      year,
      genres: Object.fromEntries(genres),
    }))
    .sort((a, b) => a.year - b.year);

  // Authors
  const authorCounts = new Map<string, { count: number; ratings: number[] }>();
  readBooks.forEach(book => {
    const existing = authorCounts.get(book.author) || { count: 0, ratings: [] };
    existing.count++;
    if (book.rating) {
      existing.ratings.push(book.rating);
    }
    authorCounts.set(book.author, existing);
  });

  const topAuthors = Array.from(authorCounts.entries())
    .map(([author, data]) => ({
      author,
      count: data.count,
      averageRating: data.ratings.length > 0
        ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
        : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const uniqueAuthors = authorCounts.size;
  const authorDiversity = readBooks.length > 0
    ? Math.min(uniqueAuthors / readBooks.length, 1)
    : 0;

  // Ratings distribution
  const ratingCounts = new Map<number, number>();
  ratings.forEach(rating => {
    ratingCounts.set(rating, (ratingCounts.get(rating) || 0) + 1);
  });

  const ratingDistribution = Array.from(ratingCounts.entries())
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating);

  // Average rating by year
  const ratingsByYear = new Map<number, number[]>();
  readBooks.forEach(book => {
    if (book.completedDate && book.rating) {
      const year = new Date(book.completedDate).getFullYear();
      const yearRatings = ratingsByYear.get(year) || [];
      yearRatings.push(book.rating);
      ratingsByYear.set(year, yearRatings);
    }
  });

  const averageByYear = Array.from(ratingsByYear.entries())
    .map(([year, yearRatings]) => ({
      year,
      average: yearRatings.reduce((sum, r) => sum + r, 0) / yearRatings.length,
    }))
    .sort((a, b) => a.year - b.year);

  // Goals
  const currentYear = new Date().getFullYear();
  const booksThisYear = byYear.get(currentYear) || 0;
  const targetThisYear = 52; // Default: 1 book per week
  const progress = targetThisYear > 0
    ? Math.min((booksThisYear / targetThisYear) * 100, 100)
    : 0;

  // Check if on track (should have read ~(current month / 12) * target)
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const expectedProgress = (currentMonth / 12) * targetThisYear;
  const onTrack = booksThisYear >= expectedProgress * 0.9; // 90% threshold

  return {
    overview: {
      totalBooks: readBooks.length,
      currentlyReading: currentlyReading.length,
      wantToRead: wantToRead.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalPages: 0, // Would need page count data
    },
    timeline: {
      byYear: timelineByYear,
      byMonth: timelineByMonth,
    },
    genres: {
      distribution: genreDistribution,
      evolution: genreEvolutionArray,
    },
    authors: {
      topAuthors,
      diversity: Math.round(authorDiversity * 100) / 100,
    },
    ratings: {
      distribution: ratingDistribution,
      averageByYear,
    },
    goals: {
      booksThisYear,
      targetThisYear,
      progress: Math.round(progress * 10) / 10,
      onTrack,
    },
    insights,
    generatedAt: new Date().toISOString(),
  };
}
