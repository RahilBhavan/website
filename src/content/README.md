# Content Templates

This directory contains templates for creating new blog posts, projects, and book entries. Each template follows industry best practices for structure, readability, engagement, and SEO.

## Quick Start

### Creating a New Blog Post

1. Copy the template:
   ```bash
   cp src/content/blog/_template.md src/content/blog/my-new-post.md
   ```

2. Edit the frontmatter (the section between `---` at the top):
   - Update `title`, `description`, and `publishDate`
   - Add relevant `tags` (3-5 tags recommended)
   - Set `draft: true` if you want to hide it from published posts

3. Write your content below the frontmatter using Markdown

### Creating a New Project

1. Copy the template:
   ```bash
   cp src/content/projects/_template.md src/content/projects/my-new-project.md
   ```

2. Fill in the frontmatter:
   - `title`: Project name
   - `description`: Brief description
   - `problem`: What problem does it solve?
   - `solution`: How did you solve it?
   - `demoUrl` and `githubUrl`: Optional links
   - `completedDate`: When was it completed?

3. Write your project narrative below

### Creating a New Book Entry

1. Copy the template:
   ```bash
   cp src/content/books/_template.md src/content/books/book-title.md
   ```

2. Fill in the book details in the frontmatter

3. Add your review and thoughts below

**Note:** Books are typically auto-generated from Goodreads, but you can manually add entries using this template.

## Frontmatter Schemas

### Blog Post Schema

```typescript
{
  title: string;              // Required
  description: string;         // Required
  publishDate: Date;          // Required
  updatedDate?: Date;          // Optional
  tags?: string[];            // Optional, defaults to []
  draft?: boolean;            // Optional, defaults to false
}
```

### Project Schema

```typescript
{
  title: string;              // Required
  description: string;        // Required
  problem: string;            // Required
  solution: string;           // Required
  demoUrl?: string;           // Optional (must be valid URL)
  githubUrl?: string;         // Optional (must be valid URL)
  completedDate: Date;        // Required
}
```

### Book Schema

```typescript
{
  title: string;              // Required
  author: string;             // Required
  coverUrl?: string;          // Optional (must be valid URL)
  isbn?: string;              // Optional
  source?: 'goodreads' | 'audible' | 'spotify' | 'physical' | 'manual';  // Defaults to 'manual'
  status?: 'currently-reading' | 'read' | 'want-to-read';  // Defaults to 'read'
  startedDate?: Date;         // Optional
  completedDate?: Date;       // Optional
  rating?: number;            // Optional (0-5)
  review?: string;            // Optional
  tags?: string[];            // Optional, defaults to []
}
```

## File Naming

- Use kebab-case for filenames: `my-blog-post.md`
- The filename (without extension) becomes the URL slug
- Example: `my-blog-post.md` → `/blog/my-blog-post`

## Draft Posts

Set `draft: true` in the frontmatter to hide a post from the published blog listing. Draft posts won't appear on the blog index page but can still be accessed directly via URL.

## Date Formats

Dates in frontmatter can be in several formats:
- `2026-01-20` (ISO format, recommended)
- `2026-01-20T10:30:00` (with time)
- `January 20, 2026` (human-readable)

## Best Practices

### Blog Posts

#### Structure & Organization

- **Introduction (Three-Part Formula):**
  1. **Hook:** Start with a question, story, surprising fact, or bold statement
  2. **Context:** Explain why this topic matters now
  3. **Preview:** Briefly outline what readers will learn

- **Table of Contents:** Include for posts over 1000 words to improve navigation and SEO

- **Section Hierarchy:**
  - Use H2 for main sections
  - Use H3 for subsections
  - Keep each section focused on one main idea
  - Break up long paragraphs (2-3 sentences ideal)

- **Visual Elements:**
  - Include images every 200-300 words
  - Use code blocks for technical examples
  - Add diagrams for complex concepts
  - Always include alt text for images

#### SEO Optimization

- **Title:** 50-60 characters, include primary keyword, be specific
- **Description:** 150-160 characters for meta tags, compelling preview
- **Tags:** 3-5 relevant tags for categorization and discovery
- **Internal Linking:** Link to 2-3 related posts
- **Heading Structure:** Use descriptive headings that include keywords naturally

#### Engagement

- **Call to Action:** Include clear CTAs (comment, share, subscribe, related reading)
- **Related Posts:** Link to complementary content
- **Key Takeaways:** Summarize main points in bullet format
- **Conclusion:** Reinforce core message and provide next steps

#### Content Quality

- **Readability:** Short paragraphs, simple sentences, clear language
- **Scannability:** Use lists, headings, bold text, and white space
- **Examples:** Include real-world examples and case studies
- **Code Examples:** Complete, runnable code with comments explaining the "why"

#### Common Mistakes to Avoid

- ❌ Walls of text without breaks
- ❌ Vague introductions that don't hook readers
- ❌ Missing conclusion or weak call to action
- ❌ No internal links to related content
- ❌ Code without explanation or context
- ❌ Images without alt text
- ❌ Titles that don't match content

### Projects

#### Problem-Solution Narrative

- **Problem Statement:** Be specific and detailed
  - What exactly is the problem?
  - Why does it matter?
  - What existing solutions fall short?
  - What are the constraints?

- **Solution Approach:** Clearly explain your methodology
  - Why this approach?
  - What makes it unique?
  - How does it address the problem?

#### Technical Documentation

- **Technology Stack:** Justify your choices
  - Why these tools?
  - What alternatives did you consider?
  - What trade-offs did you make?

- **Architecture:** Explain design decisions
  - What patterns did you use?
  - Why these architectural choices?
  - How does it scale?

- **Code Examples:** Show key implementations
  - Include comments explaining the "why"
  - Provide context for complex logic
  - Show complete, working examples

#### Results & Impact

- **Quantifiable Metrics:** Include measurable outcomes
  - Performance improvements
  - User metrics (if applicable)
  - Time/cost savings
  - Technical metrics (code quality, test coverage)

- **Visual Proof:** Include screenshots, diagrams, demos
  - Show the final product
  - Demonstrate key features
  - Visualize architecture or flow

#### Reflection & Learning

- **Honest Assessment:** Share what worked and what didn't
- **Specific Learnings:** Concrete insights, not generic statements
- **Future Improvements:** Show forward-thinking

#### Common Mistakes to Avoid

- ❌ Vague problem statements
- ❌ Technology choices without justification
- ❌ No visual proof (screenshots, demos)
- ❌ Missing metrics or quantifiable results
- ❌ Generic learnings without specifics
- ❌ No reflection on challenges or failures

### Book Reviews

#### Review Structure

- **Why I Read It:** Provides context and sets expectations
- **Summary:** Non-spoiler synopsis with main themes
- **Key Takeaways:** Structured format (insights, learnings, actionable ideas)
- **Favorite Quotes:** Well-formatted with page numbers and explanations
- **Analysis:** Balanced critique (strengths and weaknesses)
- **Recommendation:** Clear audience targeting and rating explanation

#### Balanced Critique

- **Strengths:** What the book did well (be specific)
- **Weaknesses:** Where it fell short (be fair and constructive)
- **Writing Style:** Assess clarity, voice, and approach
- **Structure:** Evaluate pacing and organization

#### Personal Touch

- **Personal Reflection:** How it changed your thinking
- **Application:** How it relates to your work/life
- **Authenticity:** Honest opinions, not just praise

#### Recommendation Quality

- **Target Audience:** Who would enjoy this and why
- **Reading Context:** When/why to read it
- **Comparable Books:** Help readers discover similar works
- **Rating Explanation:** Justify your rating clearly

#### Common Mistakes to Avoid

- ❌ Spoilers without warnings
- ❌ Only praise or only criticism (unbalanced)
- ❌ Vague recommendations without audience targeting
- ❌ Quotes without context or explanation
- ❌ Generic takeaways without personal application
- ❌ No connection to related books

## Content Length Recommendations

### Blog Posts

- **Short posts:** 500-800 words (quick tips, brief thoughts)
- **Standard posts:** 1000-2000 words (most blog content)
- **Long-form posts:** 2000+ words (deep dives, comprehensive guides)
  - Include table of contents for posts over 1000 words

### Projects

- **Minimum:** 500 words (brief project overview)
- **Standard:** 1000-1500 words (complete project narrative)
- **Comprehensive:** 2000+ words (detailed case study with technical deep-dives)

### Book Reviews

- **Brief reviews:** 300-500 words (quick impressions)
- **Standard reviews:** 800-1200 words (balanced analysis)
- **Comprehensive reviews:** 1500+ words (deep analysis with extensive quotes)

## Formatting Standards

### Headings

- Use descriptive headings that summarize the section
- Maintain consistent heading hierarchy (H2 for main sections, H3 for subsections)
- Include keywords naturally in headings for SEO

### Lists

- Use numbered lists for step-by-step processes
- Use bullet points for related items
- Keep list items parallel in structure
- Limit lists to 5-7 items when possible

### Code Blocks

- Always specify the language for syntax highlighting
- Include comments explaining complex logic
- Provide context about what the code does
- Show complete, runnable examples when possible

### Images

- Include alt text for all images
- Use descriptive filenames
- Optimize images for web (compressed, appropriate format)
- Add captions when helpful for context

### Links

- Use descriptive link text (not "click here")
- Include both internal and external links
- Verify all links are working before publishing
- Use relative paths for internal links

## SEO Guidelines

### Title Optimization

- Include primary keyword naturally
- Keep under 60 characters for full display
- Make it compelling and specific
- Avoid keyword stuffing

### Description Optimization

- 150-160 characters for meta descriptions
- Include primary keyword
- Write compelling preview text
- Make it actionable or intriguing

### Content Optimization

- Use keywords naturally throughout content
- Include keywords in headings (H2, H3)
- Create internal links to related content
- Use descriptive anchor text for links

### Tag Strategy

- Use 3-5 relevant tags per post
- Be specific (avoid overly broad tags)
- Use consistent tag naming
- Create tag hierarchy when possible

## Accessibility Considerations

- **Alt Text:** Always include descriptive alt text for images
- **Heading Hierarchy:** Use proper H1 → H2 → H3 structure
- **Link Text:** Use descriptive link text, not "click here"
- **Color Contrast:** Ensure sufficient contrast (handled by theme)
- **Code Blocks:** Use syntax highlighting for readability
- **Tables:** Include headers and captions when appropriate

## Writing Tips

### General

- **Write for your audience:** Know who you're writing for
- **Be authentic:** Write in your own voice
- **Show, don't tell:** Use examples and stories
- **Edit ruthlessly:** Cut unnecessary words
- **Proofread:** Check for typos and grammar

### Technical Writing

- **Explain the "why":** Don't just show code, explain decisions
- **Use examples:** Concrete examples beat abstract explanations
- **Break it down:** Complex topics need step-by-step breakdowns
- **Test your code:** Ensure all code examples work
- **Update regularly:** Keep technical content current

### Storytelling

- **Start with a hook:** Grab attention immediately
- **Build narrative:** Create a logical flow
- **Use anecdotes:** Personal stories add authenticity
- **Create tension:** Present problems before solutions
- **End with resolution:** Provide satisfying conclusions

## Common Mistakes

### Blog Posts

- Starting without a clear hook
- Walls of text without breaks
- Missing call to action
- No internal linking
- Weak conclusions

### Projects

- Vague problem statements
- Technology choices without justification
- Missing visual proof
- No metrics or results
- Generic learnings

### Book Reviews

- Spoilers without warnings
- Unbalanced critique (only praise or criticism)
- Vague recommendations
- Quotes without context
- No personal reflection

## Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [Technical Writing Best Practices](https://developers.google.com/tech-writing)
- [SEO Best Practices](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Getting Help

If you need help with:
- **Template structure:** Refer to the template files for examples
- **Frontmatter:** Check the schema definitions above
- **Markdown syntax:** See [Markdown Guide](https://www.markdownguide.org/)
- **Best practices:** Review the sections above for your content type

---

**Remember:** The best content is authentic, well-structured, and provides value to your readers. Use these templates and guidelines as starting points, but don't be afraid to adapt them to your unique voice and style.
