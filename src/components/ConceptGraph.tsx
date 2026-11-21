'use client';

import React, { useState } from 'react';
import { Concept, ConceptMastery } from '@/types/mastery';
import { CONCEPTS } from '@/data/concepts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Target,
  Plus,
  Minus,
  RotateCcw,
  HelpCircle,
  Clock,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

interface ConceptGraphProps {
  masteryMap: Record<string, ConceptMastery>;
  onSelectConcept?: (conceptId: string) => void;
  selectedConceptId?: string | null;
  className?: string;
}

// Clean 2D DAG layout for all 9 concepts
const NODE_POSITIONS: Record<string, { x: number; y: number; level: number }> = {
  C01: { x: 100, y: 110, level: 1 }, // Electric Charge & Current
  C02: { x: 100, y: 270, level: 1 }, // Potential Difference
  C03: { x: 260, y: 190, level: 2 }, // Circuit Diagrams & Symbols
  C04: { x: 420, y: 190, level: 3 }, // Ohm's Law
  C05: { x: 580, y: 190, level: 4 }, // Resistivity
  C06: { x: 740, y: 110, level: 5 }, // Resistors in Series
  C07: { x: 740, y: 270, level: 5 }, // Resistors in Parallel
  C08: { x: 900, y: 110, level: 6 }, // Heating Effect of Current
  C09: { x: 900, y: 270, level: 6 }  // Electric Power
};

export const ConceptGraph: React.FC<ConceptGraphProps> = ({
  masteryMap,
  onSelectConcept,
  selectedConceptId,
  className = ''
}) => {
  const [hoveredConceptId, setHoveredConceptId] = useState<string | null>(null);
  const [activeModalConcept, setActiveModalConcept] = useState<Concept | null>(null);
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning' | 'atRisk'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Status badge & color resolver
  const getStatusColor = (mastery?: ConceptMastery) => {
    if (!mastery || mastery.status === 'unassessed' || mastery.evidenceCount === 0 || mastery.score === null) {
      return {
        bg: 'fill-surface-elevated',
        stroke: '#565E71',
        text: 'text-mastery-unassessed',
        glow: 'rgba(86, 94, 113, 0.2)',
        label: 'Unassessed'
      };
    }
    if (mastery.status === 'atRisk') {
      return {
        bg: 'fill-[#251016]',
        stroke: '#FF657A',
        text: 'text-mastery-atRisk',
        glow: 'rgba(255, 101, 122, 0.35)',
        label: 'At Risk (<50%)'
      };
    }
    if (mastery.status === 'learning') {
      return {
        bg: 'fill-[#241c10]',
        stroke: '#F3B94F',
        text: 'text-mastery-learning',
        glow: 'rgba(243, 185, 79, 0.35)',
        label: 'Learning (50–79%)'
      };
    }
    return {
      bg: 'fill-[#0e241c]',
      stroke: '#38D99A',
      text: 'text-mastery-mastered',
      glow: 'rgba(56, 217, 154, 0.4)',
      label: 'Mastered (≥80%)'
    };
  };

  const handleNodeClick = (concept: Concept) => {
    if (onSelectConcept) {
      onSelectConcept(concept.id);
    }
    setActiveModalConcept(concept);
  };

  // Node visibility by filter
  const isNodeVisible = (conceptId: string) => {
    if (filter === 'all') return true;
    const m = masteryMap[conceptId];
    if (!m || m.evidenceCount === 0 || m.score === null) return false;
    return m.status === filter;
  };

  return (
    <div className={`relative rounded-3xl bg-surface border border-outline-variant/40 p-4 lg:p-6 shadow-2xl overflow-hidden ${className}`}>
      {/* Topology Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-outline-variant/30 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-primary" />
            <h3 className="font-heading font-semibold text-lg text-text-primary">
              Electricity Knowledge Topology
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-primary/15 border border-accent-primary/30 text-accent-primary font-bold">
              9 Connected Concepts
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Prerequisite DAG with live learner mastery telemetry. Click any node to open the concept intelligence drawer.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-text-secondary mr-1">Filter:</span>
          {(['all', 'mastered', 'learning', 'atRisk'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === mode
                  ? 'bg-accent-primaryContainer text-white font-bold shadow-neonPrimary'
                  : 'bg-surface-elevated hover:bg-surface-higher text-text-secondary border border-outline-variant/30'
              }`}
            >
              {mode === 'all'
                ? 'All Nodes'
                : mode === 'atRisk'
                ? 'At Risk (<50%)'
                : mode === 'learning'
                ? 'Learning (50-79%)'
                : 'Mastered (80%+)'}
            </button>
          ))}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 ml-2 bg-surface-elevated p-1 rounded-xl border border-outline-variant/30">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 hover:text-white text-text-secondary rounded"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1 hover:text-white text-text-secondary rounded"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:text-white text-text-secondary rounded"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Canvas Area */}
      <div className="relative w-full aspect-[16/7] min-h-[380px] bg-surface-deep/80 rounded-2xl border border-outline-variant/30 p-2 overflow-x-auto">
        <svg
          viewBox="0 0 1020 380"
          className="w-full h-full min-w-[800px] select-none transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            <marker
              id="edge-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="10"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#494454" />
            </marker>
            <marker
              id="edge-arrow-highlight"
              markerWidth="8"
              markerHeight="6"
              refX="10"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#d0bcff" />
            </marker>

            <pattern id="topology-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width="1020" height="380" fill="url(#topology-grid)" />

          {/* Prerequisite Edges */}
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

              const dx = targetPos.x - sourcePos.x;
              const controlX1 = sourcePos.x + dx * 0.5;
              const controlY1 = sourcePos.y;
              const controlX2 = sourcePos.x + dx * 0.5;
              const controlY2 = targetPos.y;

              const pathD = `M ${sourcePos.x + 36} ${sourcePos.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetPos.x - 36} ${targetPos.y}`;

              return (
                <path
                  key={`${prereqId}->${concept.id}`}
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? '#d0bcff' : '#494454'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={isHighlighted ? 'none' : '4,3'}
                  markerEnd={isHighlighted ? 'url(#edge-arrow-highlight)' : 'url(#edge-arrow)'}
                  className="transition-colors duration-300"
                />
              );
            });
          })}

          {/* 9 Concept Nodes */}
          {CONCEPTS.map((concept) => {
            const pos = NODE_POSITIONS[concept.id];
            const mastery = masteryMap[concept.id];
            const color = getStatusColor(mastery);
            const isHovered = hoveredConceptId === concept.id;
            const isSelected = selectedConceptId === concept.id;
            const isVisible = isNodeVisible(concept.id);

            return (
              <g
                key={concept.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => handleNodeClick(concept)}
                onMouseEnter={() => setHoveredConceptId(concept.id)}
                onMouseLeave={() => setHoveredConceptId(null)}
                className={`cursor-pointer group transition-opacity duration-300 ${
                  isVisible ? 'opacity-100' : 'opacity-25'
                }`}
              >
                {/* Glow Halo */}
                <circle
                  r={isHovered || isSelected ? 44 : 36}
                  fill={color.glow}
                  className="transition-all duration-300"
                />

                {/* Node Circle */}
                <circle
                  r="34"
                  className={`${color.bg} transition-all duration-300 group-hover:scale-105`}
                  stroke={isSelected ? '#d0bcff' : color.stroke}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.8}
                  style={{
                    filter: isHovered || isSelected ? `drop-shadow(0 0 10px ${color.stroke})` : 'none'
                  }}
                />

                {/* Concept Code */}
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
                  className="text-[11px] font-semibold fill-text-secondary pointer-events-none"
                >
                  {mastery && mastery.status !== 'unassessed' && mastery.score !== null
                    ? `${mastery.score}%`
                    : '---'}
                </text>

                {/* Node Label Below */}
                <text
                  textAnchor="middle"
                  dy="52"
                  className={`text-[10px] font-medium tracking-tight fill-text-secondary transition-colors duration-200 ${
                    isHovered ? 'fill-white font-semibold' : ''
                  }`}
                  style={{ maxWidth: '110px' }}
                >
                  {concept.name.length > 20
                    ? `${concept.name.slice(0, 18)}...`
                    : concept.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Preview */}
        {hoveredConceptId && (
          <div className="absolute bottom-3 left-3 bg-surface-elevated/95 border border-outline-variant/60 backdrop-blur-md rounded-xl p-3 shadow-glass max-w-xs pointer-events-none transition-all">
            {(() => {
              const c = CONCEPTS.find((item) => item.id === hoveredConceptId);
              const m = masteryMap[hoveredConceptId];
              const st = getStatusColor(m);
              if (!c) return null;
              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-accent-primary">{c.code}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border border-current ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-text-primary">{c.name}</h4>
                  <p className="text-[11px] text-text-secondary line-clamp-2">{c.description}</p>
                  <p className="text-[10px] text-accent-secondary pt-1 font-mono flex items-center gap-1">
                    Click to open concept detail drawer <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Concept Detail Drawer / Dialog */}
      <AnimatePresence>
        {activeModalConcept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-elevated border border-outline-variant rounded-3xl p-6 lg:p-7 max-w-xl w-full shadow-2xl max-h-[88vh] overflow-y-auto space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-outline-variant/30 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-accent-primary/20 border border-accent-primary/40 text-accent-primary font-mono text-xs font-bold">
                      {activeModalConcept.code}
                    </span>
                    <span className="text-xs text-text-secondary">
                      Difficulty Level {activeModalConcept.difficulty} of 3
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-text-primary mt-1">
                    {activeModalConcept.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalConcept(null)}
                  className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-surface"
                >
                  ✕
                </button>
              </div>

              {/* Learner Telemetry Status */}
              <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-text-secondary block">
                    Learner Mastery Status
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-heading text-2xl font-bold text-text-primary">
                      {masteryMap[activeModalConcept.id]?.score !== null && masteryMap[activeModalConcept.id]?.score !== undefined
                        ? `${masteryMap[activeModalConcept.id]?.score}%`
                        : 'Unassessed'}
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
                  <span className="text-[11px] font-mono uppercase text-text-secondary block">
                    Evidence Count
                  </span>
                  <span className="text-xs font-semibold text-text-primary">
                    {masteryMap[activeModalConcept.id]?.evidenceCount || 0} evaluated attempts
                  </span>
                </div>
              </div>

              {/* Historical Mastery Progression Curve */}
              {masteryMap[activeModalConcept.id]?.history && masteryMap[activeModalConcept.id]!.history.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-surface border border-outline-variant/30 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-accent-primary font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Historical Score Trajectory
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {masteryMap[activeModalConcept.id]!.history.map((h, i) => (
                      <div key={i} className="p-2 rounded-lg bg-surface-deep border border-outline-variant/20 text-center shrink-0">
                        <span className="text-[10px] text-text-secondary font-mono block">Attempt {i + 1}</span>
                        <span className="text-xs font-bold text-text-primary">{h.score}%</span>
                        <span className={`text-[9px] font-mono block ${h.change >= 0 ? 'text-mastery-mastered' : 'text-mastery-atRisk'}`}>
                          {h.change >= 0 ? `+${h.change}` : h.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overview & Prerequisite Readiness */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-accent-secondary" /> Concept Overview & Prerequisites
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {activeModalConcept.description}
                </p>
                <div className="text-[11px] font-mono text-accent-primary pt-1">
                  <strong>Prerequisite Concept IDs:</strong>{' '}
                  {activeModalConcept.prerequisiteIds.join(', ') || 'None (Foundational Entry Concept)'}
                </div>
              </div>

              {/* Key Formulas */}
              {activeModalConcept.formulas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-mastery-learning" /> Key Governing Formulas
                  </h4>
                  <div className="grid gap-2">
                    {activeModalConcept.formulas.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-surface-deep border border-outline-variant/30 flex items-center justify-between text-xs"
                      >
                        <code className="font-mono text-xs text-accent-secondary font-bold bg-surface px-2 py-1 rounded">
                          {f.latex}
                        </code>
                        <span className="text-text-secondary text-[11px]">{f.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Misconceptions */}
              {activeModalConcept.commonMisconceptions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-mastery-atRisk flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-mastery-atRisk" /> Known Cognitive Misconceptions
                  </h4>
                  <div className="space-y-2">
                    {activeModalConcept.commonMisconceptions.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-mastery-atRisk/10 border border-mastery-atRisk/30 text-xs space-y-1"
                      >
                        <div className="font-semibold text-mastery-atRisk">
                          ⚠️ {m.title}
                        </div>
                        <p className="text-text-secondary">{m.description}</p>
                        <p className="text-mastery-mastered font-medium pt-1">
                          <strong>Scientific Truth:</strong> {m.correction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drawer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  onClick={() => setActiveModalConcept(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-elevated transition-colors"
                >
                  Close
                </button>
                {onSelectConcept && (
                  <button
                    onClick={() => {
                      onSelectConcept(activeModalConcept.id);
                      setActiveModalConcept(null);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer shadow-neonPrimary hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    <span>Practice in Learning Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
