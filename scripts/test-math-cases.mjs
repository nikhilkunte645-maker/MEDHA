import { parseMathAndMarkdown, renderKatex, normalizeAndCleanTeX } from '../src/lib/mathTypesetter.ts';

console.log('================================================================');
console.log('MEDHA MATHEMATICAL RENDERING TEST SUITE (PHASE 5 MANDATORY CASES)');
console.log('================================================================\n');

// Helper to assert that math was rendered via KaTeX and no unrendered LaTeX leaked into outer prose
function checkCleanRender(html, rawCheckCommand) {
  if (!html.includes('class="katex"')) return false;
  // Strip out KaTeX rendered blocks and inspect the remaining HTML text
  const outerText = html.replace(/<span class="katex">[\s\S]*?<\/span><\/span>/g, '');
  if (rawCheckCommand && outerText.includes(rawCheckCommand)) {
    return false;
  }
  return true;
}

const testCases = [
  {
    id: 'TEST_A',
    name: 'Inline Formula I = Q/t',
    input: '\\(I = \\frac{Q}{t}\\)',
    validate: (res) => checkCleanRender(res, '\\frac')
  },
  {
    id: 'TEST_B',
    name: 'Inline Formula Q = n * e',
    input: '\\(Q = n \\cdot e\\)',
    validate: (res) => checkCleanRender(res, '\\cdot')
  },
  {
    id: 'TEST_C',
    name: 'Display Formula R = rho L/A',
    input: '\\[R = \\rho \\frac{L}{A}\\]',
    validate: (res) => checkCleanRender(res, '\\rho')
  },
  {
    id: 'TEST_D',
    name: 'Display Formula A = pi r^2 = pi d^2 / 4',
    input: '\\[A = \\pi r^2 = \\frac{\\pi d^2}{4}\\]',
    validate: (res) => checkCleanRender(res, '\\pi')
  },
  {
    id: 'TEST_E',
    name: 'Inline Formula inside paragraph',
    input: 'The current is calculated using \\(I = \\frac{Q}{t}\\), where Q is charge.',
    validate: (res) => res.includes('The current is calculated using') && checkCleanRender(res, '\\frac') && res.includes('where Q is charge')
  },
  {
    id: 'TEST_F',
    name: 'Aligned multi-line environment',
    input: '$$\\begin{aligned} I &= \\frac{Q}{t} \\\\ Q &= n \\cdot e \\end{aligned}$$',
    validate: (res) => checkCleanRender(res, '\\begin{aligned}')
  },
  {
    id: 'TEST_G',
    name: 'C01 Bold Wrapped Formula',
    input: 'Formula: **I = \\frac{Q}{t}, Q = n \\cdot e**',
    validate: (res) => checkCleanRender(res, '\\frac')
  },
  {
    id: 'TEST_H',
    name: 'Raw LaTeX without delimiters',
    input: 'R = \\rho \\frac{L}{A}, A = \\pi r^2 = \\frac{\\pi d^2}{4}',
    validate: (res) => checkCleanRender(res, '\\rho')
  },
  {
    id: 'TEST_I',
    name: 'Greek Letters Suite',
    input: '\\alpha, \\beta, \\rho, \\theta, \\mu, \\Delta',
    validate: (res) => checkCleanRender(res, '\\alpha')
  },
  {
    id: 'TEST_J',
    name: 'Graceful Fallback on Malformed LaTeX',
    input: '\\frac{unclosed',
    validate: (res) => {
      const parsed = renderKatex('\\frac{unclosed');
      return typeof parsed === 'string' && parsed.length > 0;
    }
  }
];

let allPassed = true;

testCases.forEach((t, idx) => {
  const result = parseMathAndMarkdown(t.input);
  const passed = t.validate(result);
  if (!passed) {
    allPassed = false;
    console.error(`❌ [${t.id}] ${t.name} FAILED!`);
    console.error(`   Input:  ${t.input}`);
    console.error(`   Output: ${result}\n`);
  } else {
    console.log(`✓ [${t.id}] ${t.name}: PASS`);
  }
});

console.log('\n================================================================');
if (allPassed) {
  console.log('ALL PHASE 5 MATHEMATICAL TYPESETTING TESTS PASSED (100% SUCCESS)');
} else {
  console.error('SOME MATHEMATICAL TESTS FAILED');
  process.exit(1);
}
console.log('================================================================');
