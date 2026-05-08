# Slidev Presentation Design System

This document outlines the visual language and layout specifications for our Slidev presentations, based on the established custom layouts (`title`, `agenda`, and `section`).

## 1. Global Aesthetics & Typography
- **Vibe:** Clean, minimalist, and heavily reliant on typography and whitespace.
- **Backgrounds:** Solid white (`bg-white`).
- **Typography Scale:**
  - **Titles (h1):** Massive and impactful (`text-7xl`). Usually `tracking-tight` with `m-0`.
  - **Subtitles/Paragraphs (p):** Large and airy (`text-3xl`, `font-light`).
- **Color Palette:**
  - **Primary Text:** Dark grays (`text-gray-800` or `text-gray-900`).
  - **Secondary Text:** Medium grays (`text-gray-500`) for subtitles and meta-information.
  - **Google Blue:** `#4285F4` (`text-google-blue`), used for links, accents, and the agenda numbers.
  - **Deep Blue:** `#1558d6`, used specifically for emphasis in Section divider slides.

## 2. Branding (Google Logo)
The Google logo (`/pdf_img-000.png`) is a persistent element across slides, acting as a subtle watermark:
- **Title Slide:** Top-Left (`top-10 left-12`).
- **Inner Slides (Agenda, Section):** Bottom-Right (`bottom-10 right-12`).
- **Size:** Always `h-8` (or occasionally `h-6`).

## 3. Layout Specifications

### Title Layout (`layouts/title.vue`)
- **Alignment:** Left-aligned, vertically centered.
- **Title:** `font-semibold text-gray-900`.
- **Subtitle:** `font-light text-gray-500 mt-6`.
- **Meta-information:** 
  - Speaker details are placed in a pill/badge (`border rounded-full px-6 py-2`) at the bottom-left. Emails and URLs use `text-google-blue`.
  - Date is placed at the bottom-right (`text-gray-600 text-sm`).

### Agenda Layout (`layouts/agenda.vue`)
- **Alignment:** Flex container divided into 1/3 (left) and 2/3 (right) columns.
- **Left Column:** Vertically centered, holding the main slide title (`text-6xl font-medium text-gray-800`).
- **Right Column:** Contains the agenda items.
  - List items are separated by generous spacing (`gap-8`).
  - Format: A bold Google Blue number paired with `text-2xl` text.

### Section Layout (`layouts/section.vue`)
- **Alignment:** Completely centered horizontally and vertically (`justify-center items-center text-center`).
- **Numbering (Optional):** Frontmatter `number` is rendered as a 2-digit padded string (e.g., `01`, `03`) above the title.
  - Styled as `text-2xl font-bold` in deep blue (`#1558d6`).
  - Spaced with `mb-4`.
- **Title:** Normal font weight, deep blue (`#1558d6`).
- **Subtitle:** Constrained to a max width (`max-w-4xl`) to keep text blocks readable when centered.

### Two Columns Layout (`layouts/two-cols.vue`)
- **Alignment:** Top-aligned (`pt-16`), split into equal halves.
- **Left Column:** Clean, document-style typography mimicking academic themes.
  - **Title:** `text-3xl font-semibold text-gray-800`.
  - **Subtitle/Paragraph:** `text-base font-normal text-gray-700`.
  - **Bullet Points:** `text-base` with a dark square (`▪`) bullet indicator. Inline code features light gray background.
  - **Blockquotes:** Styled with a Google Blue (`#4285F4`) left border.
- **Right Column:** Container for code snippets, secondary lists, or images, accessed via the `::right::` slot.
