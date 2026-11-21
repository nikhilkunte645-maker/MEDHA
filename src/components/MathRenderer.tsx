'use client';

import React, { useMemo } from 'react';
import { renderKatex, parseMathAndMarkdown } from '@/lib/mathTypesetter';

interface FormulaProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Formula Component: Renders a pure LaTeX formula directly into KaTeX typography.
 */
export const Formula: React.FC<FormulaProps> = ({
  latex,
  displayMode = false,
  className = ''
}) => {
  const html = useMemo(() => renderKatex(latex, displayMode), [latex, displayMode]);

  return (
    <span
      className={`inline-math-container font-normal text-text-primary ${displayMode ? 'block my-2 overflow-x-auto text-center' : 'inline-block align-baseline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'div' | 'p' | 'span';
}

/**
 * MathText Component: Takes prose/markdown containing mathematical delimiters (\(...\), $...$, \[...\], $$...$$)
 * and formats math alongside bold, italics, and code blocks.
 */
export const MathText: React.FC<MathTextProps> = ({
  text,
  className = '',
  as = 'span'
}) => {
  const html = useMemo(() => parseMathAndMarkdown(text), [text]);

  const Component = as;

  return (
    <Component
      className={`math-rendered-prose leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
