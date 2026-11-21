import katex from 'katex';

export function renderMath(tex, displayMode = false) {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml'
    });
  } catch {
    return tex;
  }
}

export function parseMathAndMarkdown(text) {
  if (!text || typeof text !== 'string') return '';

  // 1. Display math: $$...$$ or \[...\]
  let out = text.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
    const raw = match.startsWith('$$') ? match.slice(2, -2) : match.slice(2, -2);
    return `<div class="math-display my-2 flex justify-center overflow-x-auto py-1">${renderMath(raw.trim(), true)}</div>`;
  });

  // 2. Inline math: \(...\) or $...$
  out = out.replace(/(\\\([\s\S]*?\\\)|(?<![\$\\\w])\$([^\$\n]+?)\$(?![\$\w]))/g, (match, p1, p2) => {
    const raw = p1?.startsWith('\\(') ? p1.slice(2, -2) : (p2 || match.slice(1, -1));
    return `<span class="math-inline px-0.5">${renderMath(raw.trim(), false)}</span>`;
  });

  // 3. Catch raw LaTeX expressions wrapped in markdown bold: **R = \rho \frac{L}{A}...**
  out = out.replace(/\*\*([^*]+?\\(?:frac|rho|pi|cdot|dots|alpha|beta|theta|mu|Delta|Omega|times|text)[^*]+?)\*\*/g, (match, formula) => {
    return `<span class="math-inline font-bold px-0.5">${renderMath(formula.trim(), false)}</span>`;
  });

  // 4. Standard markdown bold, italic, code
  out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-surface-secondary text-accent-primary font-mono text-xs">$1</code>');

  return out;
}

const sample1 = 'The formula is **R = \\rho \\frac{L}{A}, A = \\pi r^2 = \\frac{\\pi d^2}{4}** and inline \\(V = IR\\) and display $$P = VI$$. Also **important note**.';
const rendered = parseMathAndMarkdown(sample1);

console.log('Sample 1 rendered length:', rendered.length);
console.log('Contains KaTeX spans:', rendered.includes('class="katex"'));
console.log('Contains strong tag:', rendered.includes('<strong>important note</strong>'));
