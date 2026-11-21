import katex from 'katex';

function normalizeAndCleanTeX(raw, forceDisplay = false) {
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

const testCases = [
  { name: 'Display with \\[ \\]', input: '\\[ I = \\frac{Q}{t} \\]' },
  { name: 'Display without spaces', input: '\\[I = \\frac{Q}{t}\\]' },
  { name: 'Inline with \\( \\)', input: '\\( Q = n \\cdot e \\)' },
  { name: 'Dollar display', input: '$$ R = \\rho \\frac{L}{A} $$' },
  { name: 'Dollar inline', input: '$ A = \\pi r^2 = \\frac{\\pi d^2}{4} $' },
  { name: 'Bold wrapped LaTeX', input: '**I = \\frac{Q}{t}, Q = n \\cdot e**' },
  { name: 'Pure LaTeX without delimiters', input: 'R = \\rho \\frac{L}{A}, A = \\pi r^2 = \\frac{\\pi d^2}{4}' },
  { name: 'Aligned environment', input: '\\begin{aligned} I &= \\frac{Q}{t} \\\\ Q &= n \\cdot e \\end{aligned}' }
];

console.log('Testing normalizeAndCleanTeX:');
testCases.forEach((tc) => {
  const { tex, display } = normalizeAndCleanTeX(tc.input);
  try {
    const html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      strict: false,
      output: 'htmlAndMathml'
    });
    console.log(`[PASS] ${tc.name}: cleaned -> "${tex}" | display: ${display} | html: ${html.slice(0, 30)}...`);
  } catch (err) {
    console.error(`[FAIL] ${tc.name}: error -> ${err.message}`);
  }
});
