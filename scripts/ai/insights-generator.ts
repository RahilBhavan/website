/**
 * AI-powered insights generator
 * Analyzes reading patterns and generates recommendations using LLM
 */

import OpenAI from 'openai';
import type { NormalizedBook } from '../collectors/types.js';

interface ReadingInsights {
  readingVelocity: {
    booksPerMonth: number;
    booksPerYear: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  genrePreferences: {
    topGenres: Array<{ genre: string; count: number; percentage: number }>;
    genreEvolution: string;
  };
  authorDiversity: {
    uniqueAuthors: number;
    topAuthors: Array<{ author: string; count: number }>;
    diversityScore: number; // 0-1 scale
  };
  readingStreak: {
    currentStreak: number; // days
    longestStreak: number;
    consistency: 'high' | 'medium' | 'low';
  };
  recommendations: Array<{
    title: string;
    author: string;
    reason: string;
  }>;
  summary: string; // AI-generated summary of reading patterns
  generatedAt: string;
}

/**
 * Calculate basic statistics from books
 */
function calculateBasicStats(books: NormalizedBook[]): {
  totalBooks: number;
  booksByYear: Map<number, number>;
  booksByMonth: Map<string, number>;
  genres: Map<string, number>;
  authors: Map<string, number>;
  ratings: number[];
} {
  const stats = {
    totalBooks: books.length,
    booksByYear: new Map<number, number>(),
    booksByMonth: new Map<string, number>(),
    genres: new Map<string, number>(),
    authors: new Map<string, number>(),
    ratings: [] as number[],
  };

  books.forEach(book => {
    // Count by year
    if (book.completedDate) {
      const year = new Date(book.completedDate).getFullYear();
      stats.booksByYear.set(year, (stats.booksByYear.get(year) || 0) + 1);

      const month = new Date(book.completedDate).toISOString().slice(0, 7); // YYYY-MM
      stats.booksByMonth.set(month, (stats.booksByMonth.get(month) || 0) + 1);
    }

    // Count genres/tags
    book.tags?.forEach(tag => {
      stats.genres.set(tag, (stats.genres.get(tag) || 0) + 1);
    });

    // Count authors
    stats.authors.set(book.author, (stats.authors.get(book.author) || 0) + 1);

    // Collect ratings
    if (book.rating) {
      stats.ratings.push(book.rating);
    }
  });

  return stats;
}

/**
 * Generate AI insights using OpenAI
 */
async function generateAIInsights(
  books: NormalizedBook[],
  stats: ReturnType<typeof calculateBasicStats>
): Promise<Partial<ReadingInsights>> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('   ⚠ OPENAI_API_KEY not set, skipping AI insights');
    return {};
  }

  try {
    const openai = new OpenAI({ apiKey });

    // Prepare book data for analysis
    const recentBooks = books
      .filter(b => b.completedDate)
      .sort((a, b) => {
        const dateA = a.completedDate?.valueOf() || 0;
        const dateB = b.completedDate?.valueOf() || 0;
        return dateB - dateA;
      })
      .slice(0, 50) // Last 50 books for analysis
      .map(b => ({
        title: b.title,
        author: b.author,
        tags: b.tags || [],
        rating: b.rating,
        completedDate: b.completedDate?.toISOString(),
      }));

    const prompt = `Analyze this reading history and provide insights:

Books read: ${stats.totalBooks}
Recent books (last 50):
${JSON.stringify(recentBooks, null, 2)}

Top genres: ${Array.from(stats.genres.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([genre, count]) => `${genre} (${count})`)
  .join(', ')}

Top authors: ${Array.from(stats.authors.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([author, count]) => `${author} (${count})`)
  .join(', ')}

Provide a JSON response with:
1. genreEvolution: A brief analysis of how reading preferences have evolved
2. recommendations: 5 book recommendations based on reading history (title, author, reason)
3. summary: A 2-3 sentence summary of reading patterns and insights

Return only valid JSON in this format:
{
  "genreEvolution": "...",
  "recommendations": [
    {"title": "...", "author": "...", "reason": "..."}
  ],
  "summary": "..."
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are a reading analyst. Provide insightful, concise analysis of reading patterns. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }

    return {};
  } catch (error: any) {
    console.warn('   ⚠ AI insights generation failed:', error.message);
    return {};
  }
}

/**
 * Generate comprehensive reading insights
 */
export async function generateInsights(
  books: NormalizedBook[]
): Promise<ReadingInsights> {
  console.log('   → Analyzing reading patterns...');

  const stats = calculateBasicStats(books);

  // Calculate reading velocity
  const currentYear = new Date().getFullYear();
  const thisYearBooks = stats.booksByYear.get(currentYear) || 0;
  const lastYearBooks = stats.booksByYear.get(currentYear - 1) || 0;
  
  const monthsWithBooks = Array.from(stats.booksByMonth.keys())
    .filter(m => m.startsWith(currentYear.toString()))
    .length || 1;
  const booksPerMonth = thisYearBooks / monthsWithBooks;
  const booksPerYear = thisYearBooks;

  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (thisYearBooks > lastYearBooks * 1.1) {
    trend = 'increasing';
  } else if (thisYearBooks < lastYearBooks * 0.9) {
    trend = 'decreasing';
  }

  // Top genres
  const genreEntries = Array.from(stats.genres.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topGenres = genreEntries.map(([genre, count]) => ({
    genre,
    count,
    percentage: Math.round((count / stats.totalBooks) * 100),
  }));

  // Top authors
  const authorEntries = Array.from(stats.authors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topAuthors = authorEntries.map(([author, count]) => ({
    author,
    count,
  }));

  // Author diversity (unique authors / total books)
  const uniqueAuthors = stats.authors.size;
  const diversityScore = stats.totalBooks > 0 
    ? Math.min(uniqueAuthors / stats.totalBooks, 1)
    : 0;

  // Reading streak (simplified - days between books)
  const completedBooks = books
    .filter(b => b.completedDate)
    .sort((a, b) => {
      const dateA = a.completedDate?.valueOf() || 0;
      const dateB = b.completedDate?.valueOf() || 0;
      return dateB - dateA;
    });

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < completedBooks.length - 1; i++) {
    const date1 = new Date(completedBooks[i].completedDate!);
    const date2 = new Date(completedBooks[i + 1].completedDate!);
    const daysDiff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 30) {
      // Books within 30 days count as a streak
      tempStreak++;
      if (i === 0) currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const consistency = currentStreak >= 3 ? 'high' : currentStreak >= 1 ? 'medium' : 'low';

  // Generate AI insights
  const aiInsights = await generateAIInsights(books, stats);

  // Combine all insights
  const insights: ReadingInsights = {
    readingVelocity: {
      booksPerMonth: Math.round(booksPerMonth * 10) / 10,
      booksPerYear,
      trend,
    },
    genrePreferences: {
      topGenres,
      genreEvolution: aiInsights.genreEvolution || 'Reading preferences are evolving.',
    },
    authorDiversity: {
      uniqueAuthors,
      topAuthors,
      diversityScore: Math.round(diversityScore * 100) / 100,
    },
    readingStreak: {
      currentStreak,
      longestStreak,
      consistency,
    },
    recommendations: aiInsights.recommendations || [],
    summary: aiInsights.summary || `You've read ${stats.totalBooks} books with a diverse range of authors and genres.`,
    generatedAt: new Date().toISOString(),
  };

  return insights;
}
