# Tiptap Visual Pagination Editor

A WYSIWYG document editor built with Tiptap and Next.js that simulates US Letter (8.5" x 11") pages with real-time visual pagination and print-ready output.

## Implementation Details

The application is built using:
*   **Framework**: Next.js 15 (App Router)
*   **Editor Engine**: Tiptap (ProseMirror under the hood)
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React

### Key Features
*   **Real-time Pagination**: Visual page breaks appear automatically as you type.
*   **Print-ready**: Hitting `Ctrl+P` produces a clean, paginated document with standard margins.
*   **Rich Text Formatting**: Bold, Italic, Underline, Highlight, Color, Lists, and Headings, etc.
*   **Page Info**: Total page count indicator in the footer.
*   **Persistence**: Auto-saves content to `localStorage` to prevent data loss.

---

## Approach to Calculating Page Breaks

The core logic resides in a custom ProseMirror extension (`PaginationExtension.ts`).

1.  **Visual Decorations over Node Splitting**:
    Instead of physically splitting the document nodes (which creates complex state management issues for paragraphs spanning pages), we use **ProseMirror Decorations**. The document remains a single continuous stream of data, but we inject "widgets" (visual elements) at specific coordinates.

2.  **The Calculation Loop**:
    *   We define a **Page Height** (11 inches) and **Content Height** (~1030px).
    *   On every document update, we iterate through the content's pixel height.
    *   We use `view.posAtCoords` to find the exact document position at the bottom of each page boundary.
    *   We insert a `Decoration.widget` at that position.

3.  **The "Gap" Widget**:
    *   **On Screen**: The widget has a height of ~200px (margins + gap) and displays a gray "PAGE BREAK" pill.
    *   **On Print**: The widget becomes invisible (`height: 0`, `display: none` for the pill) but retains the CSS property `break-before: page`. This forces the printer to start a new sheet exactly where the visual break was.

---

## Trade-offs and Limitations

### 1. Screen vs. Print Precision (The "Gap" Problem)
Browsers do not render text on screen exactly the same way they render it for print.
*   **The Issue**: A line of text might take up 20px on screen but only 18px on paper.
*   **The Trade-off**: If we strictly enforced the mathematical limit (9 inches = 864px), the screen would show a large empty gap at the bottom, because the printer could actually fit more text.
*   **The Solution**: "tuned" the content height to **1030px** (approx 10.7 inches of screen pixels). This trick fills the visual gap on the printed page, making it look professional, at the risk of slight discrepancies if the user has a very unusual non-standard font setup.

### 2. Performance
*   Calculating `posAtCoords` for every page on every keystroke (`update` loop) is computationally expensive for extremely long documents (100+ pages).
*   **Optimizations Added**: We implemented `requestAnimationFrame` debouncing and a "diff check" to only update the DOM when the page break positions actually change.

### 3. Complex Content Reflow
*   Currently, the break logic is optimized for text. Large images or complex tables that strictly cannot be split might need additional logic to push the entire element to the next page ("block avoidance"), which is partially handled by the widget insertion logic but could be more robust.

---

## Future Improvements

With more time, I would improve:

1.  **Off-screen Measurement**:
    Instead of guessing the "1030px" tuning value, I would render the content into a hidden `<iframe>` with media type forced to `print`, measure the *exact* physical height the browser assigns to the text, and feed that back to the editor. This would guarantee 100% 1:1 fidelity.

2.  **Virtualization**:
    For documents with hundreds of pages, rendering all ProseMirror decorations at once can be slow. Implementing a viewport-based virtualization (only calculating pages currently in view) would significantly boost performance.

3.  **Header/Footer Support**:
    While we have page numbers, full support for custom headers and footers (editable areas repeated on every page) would make this a complete word processor replacement."

**AI tools used**: Antigravity, Cursor, Claude, ChatGPT
