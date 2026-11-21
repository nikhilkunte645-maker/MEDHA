'use client';

import React, { useState } from 'react';
import { Concept, ConceptMastery } from '@/types/mastery';
import { CONCEPTS } from '@/data/concepts';
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
  ShieldAlert,
  X,
  Sparkles
} from 'lucide-react';

interface ConceptGraphProps {
  masteryMap: Record<string, ConceptMastery>;
  onSelectConcept?: (conceptId: string) => void;
  selectedConceptId?: string | null;
  className?: string;
}

// Crisp 2D DAG layout for all 9 concepts
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

  // Status color resolver for the Studio aesthetic
  const getStatusColor = (mastery?: ConceptMastery) => {
    if (!mastery || mastery.status === 'unassessed' || mastery.evidenceCount === 0 || mastery.score === null) {
      return {
        fill: '#FFFFFF',
        stroke: '#CBD5E1',
        text: 'text-text-muted',
        border: 'border-outline-variant',
        badge: 'bg-surface-secondary text-text-muted',
        label: 'Unassessed'
      };
    }
    if (mastery.status === 'atRisk') {
      return {
        fill: '#FEF2F2',
        stroke: '#EF4444',
        text: 'text-mastery-atRisk',
        border: 'border-mastery-atRisk/30',
        badge: 'bg-mastery-atRiskLight text-mastery-atRisk',
        label: 'At Risk (<50%)'
      };
    }
    if (mastery.status === 'learning') {
      return {
        fill: '#FFFBEB',
        stroke: '#F59E0B',
        text: 'text-mastery-learning',
        border: 'border-mastery-learning/30',
        badge: 'bg-mastery-learningLight text-mastery-learning',
        label: 'Developing (50–79%)'
      };
    }
    return {
      fill: '#ECFDF5',
      stroke: '#10B981',
      text: 'text-mastery-mastered',
      border: 'border-mastery-mastered/30',
      badge: 'bg-mastery-masteredLight text-mastery-mastered',
      label: 'Mastered (≥80%)'
    };
  };

  const handleNodeClick = (concept: Concept) => {
    setActiveModalConcept(concept);
  };

  return (
    <div className={`relative rounded-3xl bg-surface border border-outline-variant p-6 shadow-card overflow-hidden ${className}`}>
      {/* Topology Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-primary" />
            <h3 className="font-heading font-bold text-lg text-text-primary">
              Electricity Knowledge Topology
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-primaryLight text-accent-primary font-bold">
              9 Connected Concepts
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Prerequisite DAG with live mastery telemetry. Click any node to inspect concept details and formulas.
          </p>
        </div>

        {/* Filter Pills & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-text-secondary mr-1">Filter:</span>
          {(['all', 'mastered', 'learning', 'atRisk'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${filter === mode
                  ? 'bg-accent-primary text-white font-semibold shadow-sm'
                  : 'bg-surface-secondary hover:bg-outline-variant/60 text-text-secondary border border-outline-variant'
                }`}
            >
              {mode === 'all'
                ? 'All Nodes'
                : mode === 'atRisk'
                  ? 'At Risk (<50%)'
                  : mode === 'learning'
                    ? 'Developing'
                    : 'Mastered'}
            </button>
          ))}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 ml-2 bg-surface-secondary p-1 rounded-xl border border-outline-variant">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 hover:text-text-primary text-text-secondary rounded"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1 hover:text-text-primary text-text-secondary rounded"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:text-text-primary text-text-secondary rounded"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Canvas Area */}
      <div className="relative w-full aspect-[16/7] min-h-[380px] bg-canvas rounded-2xl border border-outline-variant p-2 overflow-x-auto">
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
              <polygon points="0 0, 8 3, 0 6" fill="#CBD5E1" />
            </marker>
            <marker
              id="edge-arrow-highlight"
              markerWidth="8"
              markerHeight="6"
              refX="10"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#435FE8" />
            </marker>

            {/* Subtle Studio Architectural Grid */}
            <pattern id="topology-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
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
                selectedConceptId === concept.id ||
                activeModalConcept?.id === concept.id;

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
                  stroke={isHighlighted ? '#435FE8' : '#D1D5DB'}
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
            if (!pos) return null;

            const isHovered = hoveredConceptId === concept.id;
            const isSelected = selectedConceptId === concept.id || activeModalConcept?.id === concept.id;
            const style = getStatusColor(mastery);
            const scoreDisplay = mastery && mastery.score !== null ? `${mastery.score}%` : '—';

            return (
              <g
                key={concept.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredConceptId(concept.id)}
                onMouseLeave={() => setHoveredConceptId(null)}
                onClick={() => handleNodeClick(concept)}
              >
                {/* Node Outer Halo for Active/Selected */}
                {(isHovered || isSelected) && (
                  <circle
                    r="42"
                    fill="none"
                    stroke="#435FE8"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.6"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Base Node Circle */}
                <circle
                  r="34"
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Concept ID */}
                <text
                  textAnchor="middle"
                  dy="-6"
                  className="font-mono text-xs font-black fill-text-primary select-none"
                >
                  {concept.id}
                </text>

                {/* Mastery Score */}
                <text
                  textAnchor="middle"
                  dy="12"
                  className="font-mono text-[11px] font-bold fill-text-secondary select-none"
                >
                  {scoreDisplay}
                </text>

                {/* Concept Name Label below node */}
                <text
                  textAnchor="middle"
                  dy="52"
                  className="font-sans text-[11px] font-semibold fill-text-primary select-none max-w-[120px]"
                >
                  {concept.name.length > 18 ? `${concept.name.substring(0, 16)}...` : concept.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Inspection Drawer / Modal */}
      {activeModalConcept && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 max-w-lg w-full shadow-float space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-outline-variant pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded">
                    {activeModalConcept.id}
                  </span>
                  <span className="text-xs font-mono text-text-muted">
                    Level {NODE_POSITIONS[activeModalConcept.id]?.level || 1}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
                  {activeModalConcept.name}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalConcept(null)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-text-secondary leading-relaxed">
              {activeModalConcept.description}
            </p>

            {/* Formula Box */}
            <div className="p-4 rounded-xl bg-canvas border border-outline-variant flex items-center justify-between text-xs font-mono">
              <span className="text-text-secondary font-medium">Mathematical Formula:</span>
              <span className="font-bold text-text-primary text-sm">
                {activeModalConcept.formulas.join(', ')}
              </span>
            </div>

            {/* Prerequisites & Dependents */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-mono text-text-muted block mb-1.5 uppercase tracking-wide">
                  Foundational Prerequisites:
                </span>
                {activeModalConcept.prerequisiteIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalConcept.prerequisiteIds.map((pId) => (
                      <span
                        key={pId}
                        className="px-2.5 py-1 rounded-lg bg-surface-secondary text-text-primary font-mono text-[11px] font-medium border border-outline-variant"
                      >
                        {pId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-text-muted text-[11px] italic">Foundational entry concept (zero prerequisites)</span>
                )}
              </div>
            </div>

            {/* Mastery Telemetry */}
            <div className="p-4 rounded-xl bg-surface-secondary/70 border border-outline-variant/60 flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium">Mastery Status:</span>
              <span
                className={`font-mono font-bold px-2.5 py-0.5 rounded ${getStatusColor(masteryMap[activeModalConcept.id]).badge
                  }`}
              >
                {getStatusColor(masteryMap[activeModalConcept.id]).label}
              </span>
            </div>

            {/* Action CTA */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  const cId = activeModalConcept.id;
                  setActiveModalConcept(null);
                  if (onSelectConcept) onSelectConcept(cId);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Practice {activeModalConcept.id} in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};