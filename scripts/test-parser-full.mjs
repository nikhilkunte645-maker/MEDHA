import katex from 'katex';

export function normalizeAndCleanTeX(raw, forceDisplay = false) {
  if (!raw || typeof raw !== 'string') return { tex: '', display: false };
  let s = raw.trim();
  let isDisplay = forceDisplay;

  // 1. Strip markdown bold if wrapped around math: **...**
  if (s.startsWith('**') && s.endsWith('**') && s.length >= 4) {
    s = s.slice(2, -2).trim();
  }

  // 2. Strip display delimiters \[ ... \] or $$ ... $$
  if ((s.startsWith('\\[') && s.endsWith('\\]')) || (s.startsWith('$$') && s.endsWith('$$'))) {
    s = s.slice(2, -2).trim();
    isDisplay = true;
  }
  // 3. Strip inline delimiters \( ... \)
  else if (s.startsWith('\\(') && s.endsWith('\\)')) {
    s = s.slice(2, -2).trim();
    isDisplay = false;
  }
  // 4. Strip single dollar delimiters $ ... $
  else if (s.startsWith('$') && s.endsWith('$') && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }

  // 5. If it still starts with \[ or \( due to double escaping
  while (s.startsWith('\\[') || s.startsWith('\\(')) {
    s = s.slice(2).trim();
  }
  while (s.endsWith('\\]') || s.endsWith('\\)')) {
    s = s.slice(0, -2).trim();
  }

  return { tex: s, display: isDisplay };
}

export function renderKatex(rawTex, displayMode = false) {
  if (!rawTex || typeof rawTex !== 'string') return '';
  const { tex, display } = normalizeAndCleanTeX(rawTex, displayMode);
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

export function parseMathAndMarkdown(text) {
  if (!text || typeof text !== 'string') return '';

  let out = text;

  // Step 1: Match display math \[ ... \] or $$ ... $$
  // Handles multiline expressions
  out = out.replace(/(?:\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$)/g, (_, p1, p2) => {
    const raw = (p1 !== undefined ? p1 : p2).trim();
    return `<div class="math-display my-3 flex justify-center overflow-x-auto py-1">${renderKatex(raw, true)}</div>`;
  });

  // Step 2: Match inline math \( ... \) or $ ... $
  // Note: we ensure single $ is not immediately followed/preceded by another $ or number
  out = out.replace(/(?:\\\(([\s\S]*?)\\\)|(?<![\$\\\w])\$([^\$\n]+?)\$(?![\$\w]))/g, (_, p1, p2) => {
    const raw = (p1 !== undefined ? p1 : p2).trim();
    return `<span class="math-inline px-0.5 inline-block">${renderKatex(raw, false)}</span>`;
  });

  // Step 3: Match bold wrapped math: **...** where content contains TeX commands
  out = out.replace(/\*\*([^*]+?(?:\\(?:frac|rho|pi|cdot|dots|alpha|beta|theta|mu|Delta|Omega|times|text|sum|int|sqrt|approx|le|ge|ne|pm|infty)|[=^_])[^*]*?)\*\*/g, (_, formula) => {
    return `<span class="math-inline px-0.5 inline-block">${renderKatex(formula.trim(), false)}</span>`;
  });

  // Step 4: Detect standalone raw LaTeX lines or expressions without delimiters
  // E.g. "R = \rho \frac{L}{A}, A = \pi r^2 = \frac{\pi d^2}{4}"
  // Look for sequences containing LaTeX commands like \frac, \rho, \pi, \cdot, etc.
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

const testList = [
  { name: 'Phase 5 Test A', input: '\\(I = \\frac{Q}{t}\\)' },
  { name: 'Phase 5 Test B', input: '\\(Q = n \\cdot e\\)' },
  { name: 'Phase 5 Test C', input: '\\[R = \\rho \\frac{L}{A}\\]' },
  { name: 'Phase 5 Test D', input: '\\[A = \\pi r^2 = \\frac{\\pi d^2}{4}\\]' },
  { name: 'Phase 5 Test E', input: 'The current is calculated using \\(I = \\frac{Q}{t}\\), where Q is charge.' },
  { name: 'Phase 5 Test F', input: '$$\\begin{aligned} I &= \\frac{Q}{t} \\\\ Q &= n \\cdot e \\end{aligned}$$' },
  { name: 'C01 Bold Bug', input: 'Formula: **I = \\frac{Q}{t}, Q = n \\cdot e**' },
  { name: 'Raw LaTeX without delimiters', input: 'R = \\rho \\frac{L}{A}, A = \\pi r^2 = \\frac{\\pi d^2}{4}' },
  { name: 'C01 Multiline Formula Format', input: 'Formula:\n\n\\[\nI = \\frac{Q}{t}\n\\]\n\n\\[\nQ = n \\cdot e\n\\]' }
];

console.log('Testing parseMathAndMarkdown on Phase 5 requirements:');
let allPassed = true;
testList.forEach((t) => {
  const res = parseMathAndMarkdown(t.input);
  const hasKatex = res.includes('class="katex"');
  // Check that no raw LaTeX backslashes leaked outside KaTeX elements
  // We can strip all inner KaTeX HTML and check if \frac or \rho still remain
  const stripped = res.replace(/<span class="katex">[\s\S]*?<\/span><\/span>/g, '');
  const hasLeak = stripped.includes('\\frac') || stripped.includes('\\rho') || stripped.includes('\\pi') || stripped.includes('\\cdot');

  if (hasKatex && !hasLeak) {
    console.log(`[PASS] ${t.name}`);
  } else {
    allPassed = false;
    console.error(`[FAIL] ${t.name}: hasKatex=${hasKatex}, hasLeak=${hasLeak}`);
    console.error(`  Output: ${res}`);
  }
});

console.log('All Phase 5 cases passed:', allPassed);
