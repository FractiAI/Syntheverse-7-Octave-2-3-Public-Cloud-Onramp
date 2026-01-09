/**
 * Landing Page - Holographic Hydrogen Fractal Frontier Theme Park Entrance
 * Transformed by Senior UI Designer into immersive entry experience
 */

import { ThemeParkEntrance } from './landing/ThemeParkEntrance';
import { SectionWhy } from './landing/SectionWhy';
import { SectionTechnical } from './landing/SectionTechnical';
import { SectionEngage } from './landing/SectionEngage';

export default function LandingPageOptimized() {
  return (
    <div className="cockpit-bg min-h-screen overflow-hidden">
      {/* 🎢 THEME PARK ENTRANCE - Main immersive experience */}
      <ThemeParkEntrance />

      {/* 🌟 Additional Context Sections (Below the fold) */}
      <div className="bg-gradient-to-b from-transparent to-black/50">
        {/* Why It Matters */}
        <SectionWhy />

        {/* Technical Signals */}
        <SectionTechnical />

        {/* How to Engage */}
        <SectionEngage />
      </div>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}
