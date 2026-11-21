import katex from 'katex';

/**
 * Normalizes and cleans LaTeX expressions by safely stripping outer delimiters
 * (\[...\], $$...$$, \(...\), $...$) and markdown wrappers (**...**), ensuring
 * KaTeX receives pure, well-formed TeX input without throwing ParseError.
 */
export function normalizeAndCleanTeX(
  raw: string,
  displayMode?: boolean
): { tex: string; display: boolean } {
  if (!raw || typeof raw !== 'string') return { tex: '', display: false };
  let s = raw.trim();
  let isDisplay = displayMode;

  // 1. Strip markdown bold or italic if wrapped around math: **...** or *...*
  if (s.startsWith('**') && s.endsWith('**') && s.length >= 4) {
    s = s.slice(2, -2).trim();
  }
  if (s.startsWith('*') && s.endsWith('*') && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }

  // 2. Strip display delimiters \[ ... \] or $$ ... $$
  if ((s.startsWith('\\[') && s.endsWith('\\]')) || (s.startsWith('$$') && s.endsWith('$$'))) {
    s = s.slice(2, -2).trim();
    if (displayMode === undefined) isDisplay = true;
  }
  // 3. Strip inline delimiters \( ... \)
  else if (s.startsWith('\\(') && s.endsWith('\\)')) {
    s = s.slice(2, -2).trim();
    if (displayMode === undefined) isDisplay = false;
  }
  // 4. Strip single dollar delimiters $ ... $
  else if (s.startsWith('$') && s.endsWith('$') && s.length >= 2) {
    s = s.slice(1, -1).trim();
    if (displayMode === undefined) isDisplay = false;
  }

  // 5. Handle any residual or double-escaped outer delimiters
  while (s.startsWith('\\[') || s.startsWith('\\(')) {
    s = s.slice(2).trim();
  }
  while (s.endsWith('\\]') || s.endsWith('\\)')) {
    s = s.slice(0, -2).trim();
  }

  // If displayMode was explicitly set (true or false), respect it strictly
  if (displayMode !== undefined) {
    isDisplay = displayMode;
  } else if (isDisplay === undefined) {
    isDisplay = false;
  }

  return { tex: s, display: isDisplay };
}

/**
 * Renders a LaTeX expression into high-fidelity KaTeX HTML.
 * Uses throwOnError: false to guarantee crash-proof rendering.
 */
export function renderKatex(rawTex: string, displayMode?: boolean): string {
  if (!rawTex || typeof rawTex !== 'string') return '';
  const { tex, display } = normalizeAndCleanTeX(rawTex, displayMode);
  if (!tex) return '';

  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: 'htmlAndMathml'
    });
  } catch {
    return `<span class="katex-fallback font-mono text-sm">${rawTex}</span>`;
  }
}

/**
 * Unified mathematical typesetting and Markdown parser.
 * Supports:
 * 1. Inline formulas: \( ... \) and $ ... $
 * 2. Display formulas: \[ ... \] and $$ ... $$
 * 3. Aligned equations: \begin{aligned} ... \end{aligned}
 * 4. Greek letters, fractions, subscripts, superscripts, square roots
 * 5. Bold wrapped LaTeX formulas: **Formula: I = \frac{Q}{t}**
 * 6. Standalone raw LaTeX without delimiters: R = \rho \frac{L}{A}, A = \pi r^2 = \frac{\pi d^2}{4}
 * 7. Standard Markdown: bold (**), italic (*), code (`)
 * 8. Multiple equations in the same paragraph
 */
export function parseMathAndMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let out = text;

  // Step 1: Display math blocks \[ ... \] or $$ ... $$
  out = out.replace(/(?:\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$)/g, (_, p1, p2) => {
    const raw = (p1 !== undefined ? p1 : p2).trim();
    return `<div class="math-display my-2 flex justify-center overflow-x-auto py-1">${renderKatex(raw, true)}</div>`;
  });

  // Step 2: Inline math \( ... \) or $ ... $
  out = out.replace(/(?:\\\(([\s\S]*?)\\\)|(?<![\$\\\w])\$([^\$\n]+?)\$(?![\$\w]))/g, (_, p1, p2) => {
    const raw = (p1 !== undefined ? p1 : p2).trim();
    return `<span class="math-inline px-0.5 inline-block">${renderKatex(raw, false)}</span>`;
  });

  // Step 3: Bold wrapped math: **...** where content contains TeX commands
  out = out.replace(/\*\*([^*]+?(?:\\(?:frac|rho|pi|cdot|dots|alpha|beta|theta|mu|Delta|Omega|times|text|sum|int|sqrt|approx|le|ge|ne|pm|infty)|[=^_])[^*]*?)\*\*/g, (_, formula) => {
    return `<span class="math-inline px-0.5 inline-block">${renderKatex(formula.trim(), false)}</span>`;
  });

  // Step 4: Standalone raw LaTeX lines or expressions without delimiters
  out = out.replace(/(?<=^|[\n\r]|Formula:\s*)([A-Za-z0-9_'\s=,.\-\(\)]*?\\(?:frac|rho|pi|cdot|dots|alpha|beta|theta|mu|Delta|Omega|times|sqrt)[A-Za-z0-9_'\s=,.\-\(\)\{\}\^\+\/\\]*?)(?=$|[\n\r]|\.)/g, (match) => {
    const trimmed = match.trim();
    if (!trimmed) return match;
    return `<span class="math-inline px-0.5 inline-block">${renderKatex(trimmed, false)}</span>`;
  });

  // Step 5: Standard markdown bold, italic, code
  out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-surface-secondary text-accent-primary font-mono text-xs">$1</code>');

  return out;
}
