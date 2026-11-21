import { parseMathAndMarkdown, renderKatex } from '../src/lib/mathTypesetter.ts';

const cases = [
  { name: 'Test A: Inline I=Q/t', input: '\\(I = \\frac{Q}{t}\\)' },
  { name: 'Test B: Inline Q=n*e', input: '\\(Q = n \\cdot e\\)' },
  { name: 'Test C: Display R=rho L/A', input: '\\[R = \\rho \\frac{L}{A}\\]' },
  { name: 'Test D: Display A=pi r^2', input: '\\[A = \\pi r^2 = \\frac{\\pi d^2}{4}\\]' },
  { name: 'Test E: Paragraph with inline', input: 'The current is calculated using \\(I = \\frac{Q}{t}\\), where Q is charge.' },
  { name: 'Test F: Aligned environment', input: '$$\\begin{aligned} I &= \\frac{Q}{t} \\\\ Q &= n \\cdot e \\end{aligned}$$' },
  { name: 'Bug 1: Bold with LaTeX', input: 'Formula: **I = \\frac{Q}{t}, Q = n \\cdot e**' },
  { name: 'Bug 2: Raw comma-separated formulas', input: 'R = \\rho \\frac{L}{A}, A = \\pi r^2 = \\frac{\\pi d^2}{4}' },
  { name: 'Bug 3: C01 concept description', input: 'Fundamentals of quantization of charge (Q = n·e), drift of charge carriers, rate of flow of charge (I = Q/t), and measurement using ammeters.' }
];

console.log('--- RUNNING DIAGNOSTIC CASES ---');
cases.forEach((c) => {
  const result = parseMathAndMarkdown(c.input);
  const hasKatex = result.includes('class="katex"');
  const hasRawLatex = result.includes('\\frac') || result.includes('\\rho') || result.includes('\\cdot');
  console.log(`[${c.name}]`);
  console.log(`  Input: ${c.input}`);
  console.log(`  Has KaTeX HTML: ${hasKatex} | Has Raw LaTeX Leaks: ${hasRawLatex}`);
  if (hasRawLatex || !hasKatex) {
    console.log(`  -> RESULT: ${result}`);
  }
});
