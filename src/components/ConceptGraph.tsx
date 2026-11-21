'use client';

import React, { useState } from 'react';
import { Concept, ConceptMastery } from '@/types/mastery';
import { CONCEPTS } from '@/data/concepts';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, AlertTriangle, ArrowRight, Zap, Target, HelpCircle, Layers } from 'lucide-react';

interface ConceptGraphProps {
  masteryMap: Record<string, ConceptMastery>;
  onSelectConcept?: (conceptId: string) => void;
  selectedConceptId?: string | null;
  className?: string;
}

// 2D Layout coordinates for the 8 Electricity concepts in a clean DAG structure
const NODE_POSITIONS: Record<string, { x: number; y: number; level: number }> = {
  C01: { x: 120, y: 110, level: 1 }, // Charge & Current
  C02: { x: 120, y: 270, level: 1 }, // Potential Difference
  C03: { x: 320, y: 190, level: 2 }, // Circuit & Symbols
  C04: { x: 500, y: 190, level: 3 }, // Ohm's Law
  C05: { x: 680, y: 110, level: 4 }, // Resistance & Factors
  C06: { x: 680, y: 270, level: 4 }, // Series & Parallel
  C07: { x: 860, y: 110, level: 5 }, // Heating Effect
  C08: { x: 860, y: 270, level: 5 }, // Electric Power & Energy
};

export const ConceptGraph: React.FC<ConceptGraphProps> = ({
  masteryMap,
  onSelectConcept,
  selectedConceptId,
  className = ''
}) => {
  const [hoveredConceptId, setHoveredConceptId] = useState<string | null>(null);
  const [activeModalConcept, setActiveModalConcept] = useState<Concept | null>(null);

  // Helper for colors
  const getStatusColor = (mastery?: ConceptMastery) => {
    if (!mastery || mastery.status === 'unassessed' || mastery.evidenceCount === 0) {
      return {
        bg: 'fill-slate-800',
        stroke: '#64748b',
        text: 'text-slate-400',
        glow: 'rgba(100, 116, 139, 0.2)',
        label: 'Unassessed'
      };
    }
    if (mastery.score < 40) {
      return {
        bg: 'fill-red-950/80',
        stroke: '#ef4444',
        text: 'text-red-400',
        glow: 'rgba(239, 68, 68, 0.35)',
        label: 'Needs Attention'
      };
    }
    if (mastery.score < 70) {
      return {
        bg: 'fill-amber-950/80',
        stroke: '#f59e0b',
        text: 'text-amber-400',
        glow: 'rgba(245, 158, 11, 0.35)',
        label: 'Developing'
      };
    }
    if (mastery.score < 85) {
      return {
        bg: 'fill-emerald-950/80',
        stroke: '#10b981',
        text: 'text-emerald-400',
        glow: 'rgba(16, 185, 129, 0.35)',
        label: 'Proficient'
      };
    }
    return {
      bg: 'fill-teal-950/80',
      stroke: '#059669',
      text: 'text-teal-300',
      glow: 'rgba(5, 150, 105, 0.45)',
      label: 'Strong Mastery'
    };
  };

  const handleNodeClick = (concept: Concept) => {
    if (onSelectConcept) {
      onSelectConcept(concept.id);
    }
    setActiveModalConcept(concept);
  };

  return (
    <div className={`relative rounded-2xl bg-surface border border-surface-border p-4 lg:p-6 shadow-2xl overflow-hidden ${className}`}>
      {/* Graph Header / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-surface-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-violet" />
            <h3 className="font-heading font-semibold text-lg text-white">
              Electricity Concept Knowledge Graph
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-violet/20 border border-brand-violet/40 text-brand-violet font-medium">
              Class 10 Physics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prerequisite DAG with live mastery telemetry. Click any node to inspect pedagogical objectives and common misconceptions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span className="text-slate-400">Unassessed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span className="text-red-400">Needs Attention (&lt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
            <span className="text-amber-400">Developing (40-69%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span className="text-emerald-400">Proficient (70-84%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"></span>
            <span className="text-teal-300">Strong (85%+)</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Area */}
      <div className="relative w-full aspect-[16/7] min-h-[380px] bg-background/50 rounded-xl border border-surface-border/40 p-2 overflow-x-auto">
        <svg
          viewBox="0 0 980 380"
          className="w-full h-full min-w-[720px] select-none"
        >
          <defs>
            {/* Arrow marker */}
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="10"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#475569" opacity="0.7" />
            </marker>
            <marker
              id="arrowhead-highlight"
              markerWidth="8"
              markerHeight="6"
              refX="10"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#8b5cf6" />
            </marker>
            {/* Subtle grid pattern */}
            <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width="980" height="380" fill="url(#graph-grid)" />

          {/* Render Prerequisite Edges */}
          {CONCEPTS.map((concept) => {
            const targetPos = NODE_POSITIONS[concept.id];
            if (!targetPos || concept.prerequisiteIds.length === 0) return null;

            return concept.prerequisiteIds.map((prereqId) => {
              const sourcePos = NODE_POSITIONS[prereqId];
              if (!sourcePos) return null;

              const isHighlighted =
                hoveredConceptId === concept.id ||
                hoveredConceptId === prereqId ||
                selectedConceptId === concept.id;

              // Curvature path
              const dx = targetPos.x - sourcePos.x;
              const dy = targetPos.y - sourcePos.y;
              const controlX1 = sourcePos.x + dx * 0.5;
              const controlY1 = sourcePos.y;
              const controlX2 = sourcePos.x + dx * 0.5;
              const controlY2 = targetPos.y;

              const pathD = `M ${sourcePos.x + 38} ${sourcePos.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetPos.x - 38} ${targetPos.y}`;

              return (
                <path
                  key={`${prereqId}->${concept.id}`}
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? '#8b5cf6' : '#334155'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={isHighlighted ? 'none' : '4,3'}
                  markerEnd={isHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
                  className="transition-colors duration-300"
                />
              );
            });
          })}

          {/* Render Concept Nodes */}
          {CONCEPTS.map((concept) => {
            const pos = NODE_POSITIONS[concept.id];
            const mastery = masteryMap[concept.id];
            const color = getStatusColor(mastery);
            const isHovered = hoveredConceptId === concept.id;
            const isSelected = selectedConceptId === concept.id;

            return (
              <g
                key={concept.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => handleNodeClick(concept)}
                onMouseEnter={() => setHoveredConceptId(concept.id)}
                onMouseLeave={() => setHoveredConceptId(null)}
                className="cursor-pointer group"
              >
                {/* Outer Glow Halo */}
                <circle
                  r={isHovered || isSelected ? 44 : 36}
                  fill={color.glow}
                  className="transition-all duration-300"
                />

                {/* Main Node Circle */}
                <circle
                  r="34"
                  className={`${color.bg} transition-all duration-300 group-hover:scale-105`}
                  stroke={isSelected ? '#c084fc' : color.stroke}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.8}
                  style={{
                    filter: isHovered || isSelected ? `drop-shadow(0 0 10px ${color.stroke})` : 'none'
                  }}
                />

                {/* Concept Code Badge */}
                <text
                  textAnchor="middle"
                  dy="-6"
                  className="text-xs font-mono font-bold fill-white tracking-wider pointer-events-none"
                >
                  {concept.code}
                </text>

                {/* Score percentage or Unassessed */}
                <text
                  textAnchor="middle"
                  dy="14"
                  className="text-[11px] font-semibold fill-slate-300 pointer-events-none"
                >
                  {mastery && mastery.status !== 'unassessed' && mastery.evidenceCount > 0
                    ? `${mastery.score}%`
                    : '---'}
                </text>

                {/* Node Title Label under circle */}
                <text
                  textAnchor="middle"
                  dy="52"
                  className={`text-[10px] font-medium tracking-tight fill-slate-300 transition-colors duration-200 ${
                    isHovered ? 'fill-white font-semibold' : ''
                  }`}
                  style={{ maxWidth: '100px' }}
                >
                  {concept.name.length > 22
                    ? `${concept.name.slice(0, 20)}...`
                    : concept.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Preview */}
        {hoveredConceptId && (
          <div className="absolute bottom-3 left-3 bg-surface-elevated/95 border border-surface-border backdrop-blur-md rounded-xl p-3 shadow-xl max-w-sm pointer-events-none transition-all">
            {(() => {
              const c = CONCEPTS.find((item) => item.id === hoveredConceptId);
              const m = masteryMap[hoveredConceptId];
              const st = getStatusColor(m);
              if (!c) return null;
              return (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-brand-violet">{c.code}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border border-current ${st.text}`}>
                      {st.label} ({m ? `${m.score}%` : '0%'})
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1">{c.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{c.description}</p>
                  <p className="text-[10px] text-brand-cyan mt-1.5 font-medium flex items-center gap-1">
                    Click to view formulas & misconceptions <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Modal Dialog for Concept Details */}
      <AnimatePresence>
        {activeModalConcept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-elevated border border-surface-border rounded-2xl p-6 max-w-xl w-full shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-surface-border pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-brand-violet/20 border border-brand-violet/40 text-brand-violet font-mono text-xs font-bold">
                      {activeModalConcept.code}
                    </span>
                    <span className="text-xs text-slate-400">
                      Difficulty Level {activeModalConcept.difficulty} of 3
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white mt-1">
                    {activeModalConcept.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalConcept(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface"
                >
                  ✕
                </button>
              </div>

              {/* Mastery Telemetry Status */}
              <div className="mb-5 p-3.5 rounded-xl bg-background border border-surface-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Learner Mastery</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-heading text-2xl font-bold text-white">
                      {masteryMap[activeModalConcept.id]?.score || 0}%
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        getStatusColor(masteryMap[activeModalConcept.id]).text
                      }`}
                    >
                      {getStatusColor(masteryMap[activeModalConcept.id]).label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Evidence Count</span>
                  <span className="text-sm font-semibold text-slate-300">
                    {masteryMap[activeModalConcept.id]?.evidenceCount || 0} attempts evaluated
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-cyan" /> Concept Overview
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeModalConcept.description}
                </p>
              </div>

              {/* Key Formulas */}
              {activeModalConcept.formulas.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Key Governing Formulas
                  </h4>
                  <div className="grid gap-2">
                    {activeModalConcept.formulas.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-surface border border-surface-border flex items-center justify-between"
                      >
                        <code className="font-mono text-sm text-brand-cyan font-bold bg-background px-2 py-1 rounded">
                          {f.latex}
                        </code>
                        <span className="text-xs text-slate-400">{f.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Objectives */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> Learning Objectives
                </h4>
                <ul className="space-y-1.5">
                  {activeModalConcept.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Misconceptions */}
              {activeModalConcept.commonMisconceptions.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Known Cognitive Misconceptions
                  </h4>
                  <div className="space-y-2.5">
                    {activeModalConcept.commonMisconceptions.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-xs"
                      >
                        <div className="font-semibold text-red-300 mb-1 flex items-center gap-1.5">
                          <span>⚠️ {m.title}</span>
                        </div>
                        <p className="text-slate-400 mb-1.5">{m.description}</p>
                        <p className="text-emerald-400 font-medium">
                          <strong>Correction:</strong> {m.correction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <button
                  onClick={() => setActiveModalConcept(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-surface hover:bg-surface-border transition-colors"
                >
                  Close
                </button>
                {onSelectConcept && (
                  <button
                    onClick={() => {
                      onSelectConcept(activeModalConcept.id);
                      setActiveModalConcept(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-violet hover:bg-brand-violet/90 transition-all flex items-center gap-1.5 shadow-lg shadow-brand-violet/20"
                  >
                    Target in Learning Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
