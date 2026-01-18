---
title: "The Magic Behind My Books Page"
description: "How I built a distributed system that aggregates book data from multiple sources - Goodreads, Audible, Spotify, and my physical bookshelf."
publishDate: 2025-01-18
tags: ["technical", "projects", "architecture"]
draft: false
---

**TL;DR:** I pull in everything I read across different mediums - Goodreads, Audible, Spotify, and my physical bookshelf. This builds a live, unified view of it all without me having to track anything manually.

I like to call these "airplane projects" because they are the fun & easy things to build without LLMs and brings me back to why I love to code.

## More like a Dyson Sphere than a Dewey Decimal System

At its core, this is a distributed system that aggregates and normalizes book data from multiple sources in real-time. The architecture consists of four independent data collectors (Goodreads, Audible, Spotify, and a physical bookshelf scanner) that feed into a central processing pipeline. Each collector operates on its own schedule, with the physical scanner running continuously and the API-based collectors executing frequent self-regulated syncs.

The integration layer processes this data through a series of transformations: first building relationships between entries using fuzzy matching, then applying normalization rules, and finally resolving any conflicts in metadata. This data/pipeline isn't just used for the site, but for some of the other projects I am working on.

All of this feeds into **[my books page](/books)**, which displays the unified view of my reading habits across platforms. The page itself is statically generated, but the underlying data pipeline ensures it's always up to date with minimal manual intervention.

## The Technical Architecture

### 1. Goodreads Integration

When Goodreads shut down their API, I had to build a custom scraper. There were two hurdles here: avoiding rate limits and parsing their notoriously inconsistent data.

**The Rate Limit Solution**: Modern Web Application Firewalls (WAF) are aggressive at blocking bots. I solved this by making my scraper act "polite." It uses a jittered exponential backoff strategy: if it gets blocked, it waits, then waits X amount of time longer, adding a customized random "jitter" duration to appear more human and desynchronize from pattern-detection algorithms.

**The Data Solution**: Handling inconsistent formatting was the fun part. Some books use "Last, First" author names, others "First Last," and cover URLs vary wildly. This was especially true for Goodreads, where some books use "Last, First" author names, others "First Last," and cover URLs vary very (18 different formats!) wildly. I ended up building a fuzzy matching system (which I talk about later) to normalize these entities.

```python
async def polite_fetch(url, retries=5):
    for i in range(retries):
        try:
            # load the page with playwright (or something)
            content = await browser.get(url)
            return parse_reading_shelf(content)
        except RateLimitError:
            # Wait 2^i seconds + some random milliseconds
            wait_time = (2 ** i) + random.random()
            print(f"Rate limited. Waiting {wait_time}s...")
            await asyncio.sleep(wait_time)
            
    return None # fallback to cached data
```

### 2. Audible is a lot like Nike

Audible's data is locked behind some pretty sophisticated anti-bot techniques- almost identical to the Kasada system used by Nike.com (and Footlocker) that I saw when I used to build sneaker bots. After looking at their firewalls, I found they use client-side virtualization obfuscation. Instead of running standard JavaScript, the site runs a custom Virtual Machine (VM) inside your browser, hiding the real logic inside an unreadable blob of bytecode.

To solve this, I applied devirtualization techniques I originally picked up from sneaker drops. I built a disassembler to track the "instruction pointer" through the VM's opcodes, eventually finding the hidden pipes that handle library syncs. I actually ended up reusing code I wrote in 2020 for my sneaker bot to handle the bytecode interpretation.

```python
def run_virtual_stepper(bytecode, state):
    # A simplified view of how I traced the obfuscated logic
    while state.running:
        # 1. Fetch the next command from the unreadable bytecode
        instruction = bytecode[state.ptr]
        state.ptr += 1
        
        # 2. Execute the custom "Opcode" (like ADD, JUMP, or FETCH_TOKEN)
        if instruction == OP_AUTH_CALL:
            # We found the hidden pipe!
            state.registers[2] = call_proprietary_endpoint(state.token)
        elif instruction == OP_JUMP_IF_BOT:
            # Bypassing the security check
            state.ptr = state.bypass_ptr
            
    return state.result
```

(Former sneaker bot dev Umasi did a much better, more visual job of explaining this process, definitely read his writeup on Kasada)

### 3. Bookshelf Scanner

This is by far the most "over-engineered" part of the project: a Raspberry Pi 4 I picked up on eBay, paired with a camera module mounted directly across from my bookshelf. Every hour, it wakes up, snaps a high-resolution photo of my library, and uses computer vision to track which physical books are actually on the shelf.

Because the camera is mounted at a slight angle, and because I'm constantly moving the setup between Minnesota, North Carolina, and San Francisco, the raw images end up full of hard-to-estimate distortions. The book spines look skewed and tilted in ways that make them difficult to interpret. To fix this, I apply perspective correction to "flatten" the image so the bookshelf, using markers I placed on either side, appears perfectly front-facing. This (plus other preprocessing steps) makes OCR a LOT (like 5x) more reliable when reading the spine text.

```python
def straighten_bookshelf(raw_image):
    # 1. Find the four corners of the shelf
    corners = detect_shelf_outline(raw_image)
    
    # 2. Map those corners to a perfect rectangle
    # This "stretches" the image to look flat
    flat_view = cv2.warpPerspective(raw_image, corners, (3000, 1200))
    
    # 3. Clean up the lighting so text pops
    processed = cv2.apply_lighting_correction(flat_view)
    return processed
```

### 4. Solving Data Collisions (Integration Layer)

When you pull data from four different places, you're going to get "collisions" (the same book appearing slightly differently in each source). I fuzzy match them to bridge the gap. Instead of checking if the titles are _exactly_ the same, it calculates a similarity score. Like if "Slaughterhouse Five" and "Slaughterhouse-Five (Anniversary Edition)" are 95% similar (notice how it might not account for the characters directly, this is intentional), the system knows they're the same book and merges them.

```python
def resolve_book_clash(new_book, library):
    for existing in library:
        # Check for similarity in titles
        # 1.0 = exact match, 0.0 = no match
        similarity = calculate_similarity(new_book.title, existing.title)
        
        if similarity > 0.92:
            # Probably the same book
            return merge_book_details(existing, new_book)
            
    # No match found, treat it as a new book
    return add_to_library(new_book)
```

The system runs automatically, quietly keeping track of my reading habits across all platforms. While it's definitely overkill, it's been running reliably for months with minimal intervention - exactly how I like my side projects.
