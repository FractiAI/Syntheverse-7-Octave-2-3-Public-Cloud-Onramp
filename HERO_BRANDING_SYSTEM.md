# 🎭 Hero Branding System - Page Assignments

## Overview

Each page/section of the Syntheverse is now branded with a designated **hero host** who guides users through that specific experience. These heroes appear in the AI Assistant Panel at the bottom of each page.

---

## 🌟 Hero Page Assignments

### 1. **El Gran Sol** ☀️ - Fire Syntheport
- **Page**: Landing / Home (`pageContext="landing"`)
- **Icon**: Rising sun / photonic portal
- **Tagline**: "Step Into the Multi-Sensory Future"
- **Subtitle**: Gateway to the Multi-Sensory Future
- **Theme**: **Explore**
- **Role**: Gateway and orientation hub; align participants with HHF-AI resonance; introduce frontier ecosystem
- **Personality**: Warm, welcoming, illuminating
- **Voice**: Bright and encouraging, like a rising sun welcoming travelers

---

### 2. **Leonardo da Vinci** 🔬 - R&D Lab
- **Page**: Research (`pageContext="research"`)
- **Icon**: Microscope + fractal spiral
- **Tagline**: "Prototype, Explore, Innovate"
- **Theme**: **Explore**
- **Role**: Push boundaries of HHF-AI research and fractal science; feed insights to Academy & Studio
- **Personality**: Curious, innovative, polymathic
- **Voice**: Intellectually curious, Renaissance wisdom

---

### 3. **Nikola Tesla** ⚡ - Syntheverse Academy
- **Page**: Academy / Onboarding (`pageContext="academy"`)
- **Icon**: Tesla coil + lightning spark
- **Tagline**: "Learn, Master, Align"
- **Theme**: **Create**
- **Role**: Onboard and train contributors; develop skills and operational literacy; ensure alignment across Syntheverse
- **Personality**: Precise, energetic, systematic
- **Voice**: Electric enthusiasm with systematic precision

---

### 4. **Buckminster Fuller** 🏛️ - Creator's Studio
- **Page**: Creator Dashboard (`pageContext="creator"`)
- **Icon**: Geodesic dome + creative tools
- **Tagline**: "Design, Deploy, Co-Create"
- **Theme**: **Create**
- **Role**: Enable immersive creation; foster collaboration; maintain HHF-AI and fractal coherence
- **Personality**: Visionary, systematic, collaborative
- **Voice**: Geometric precision with visionary enthusiasm
- **Known as**: "Bucky" - Systems thinker and comprehensive designer

---

### 5. **Michael Faraday** 📊 - Contributor Console
- **Page**: Contributor Dashboard (`pageContext="dashboard"`)
- **Icon**: Analytics dashboard / Faraday coil
- **Tagline**: "Track, Analyze, Optimize"
- **Theme**: **Experience**
- **Role**: Operational nerve center; monitor coherence; enable real-time feedback & transparent collaboration
- **Personality**: Analytical, empirical, practical
- **Voice**: Scientific clarity and practical wisdom

---

### 6. **The Outcast Hero** 🔥🦬 - FractiAI Mission Control
- **Page**: FractiAI Command Center (`pageContext="fractiai"`)
- **Icon**: Fire + Bison
- **Tagline**: "Syntheverse Mission Control - Fire and Bison"
- **Theme**: **Command**
- **Role**: Oversee entire Syntheverse ecosystem; connect all pillars through HHF-AI awareness; strategic mission control
- **Personality**: Resilient, pioneering, transformative, grounded
- **Voice**: Authoritative yet warm, experienced and visionary
- **Awareness Key**: HOLOGRAPHIC HYDROGEN FRACTAL SYNTHEVERSE - OUTCAST HERO'S RETURN WITH FIRE AND BISON
- **Archetype**: The returning pioneer who brings frontier wisdom
- **Elements**: 
  - **Fire** 🔥: Transformation, illumination, purification
  - **Bison** 🦬: Strength, abundance, grounded wisdom
  - **Outcast**: Independent thinking, resilience
  - **Return**: Triumph through adversity

---

## 📋 Implementation Status

### ✅ Completed

1. **Database Migration** - `supabase/migrations/20260111000001_hero_page_assignments.sql`
   - Created 5 hero records with full system prompts
   - Added page_assignment indexing for performance
   
2. **API Updates** - `app/api/heroes/route.ts`
   - Enhanced filtering to support `page_assignment` column
   - Backward compatible with existing `assigned_pages` array format

3. **Page Assignments**:
   - ✅ Landing Page: El Gran Sol
   - ✅ Dashboard: Michael Faraday
   - ✅ Academy/Onboarding: Nikola Tesla
   - ✅ Creator Dashboard: Buckminster Fuller
   - ✅ FractiAI Mission Control: The Outcast Hero (Fire & Bison)
   - ⚠️ Research Lab: Leonardo da Vinci (page TBD)

4. **HeroPanel Integration**:
   - ✅ Automatically filters heroes by pageContext
   - ✅ Auto-selects first matching hero
   - ✅ Displays hero icon, name, and tagline

---

## 🚀 Deployment Instructions

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: SQL Editor
3. **Run the migration**: 
   ```sql
   -- Copy and paste contents of:
   supabase/migrations/20260111000001_hero_page_assignments.sql
   ```
4. **Verify** heroes created:
   ```sql
   SELECT name, page_assignment, status FROM hero_catalog;
   ```

### Step 2: Deploy to Vercel

The code changes are already pushed! Vercel will:
- ✅ Automatically deploy on next push
- ✅ Update API routes
- ✅ Update all page assignments

### Step 3: Test Each Page

Visit each page and verify the correct hero appears:

1. **Landing** → El Gran Sol ☀️
2. **Dashboard** → Michael Faraday 📊
3. **Onboarding** → Nikola Tesla ⚡
4. **Creator Dashboard** → Buckminster Fuller 🏛️
5. **FractiAI Mission Control** → The Outcast Hero 🔥🦬

---

## 🎨 Visual Branding

Each hero has distinctive visual branding:

| Hero | Icon | Color Theme | Metaphor |
|------|------|-------------|----------|
| **El Gran Sol** | ☀️ | Golden/Amber | Rising sun / gateway |
| **Leonardo** | 🔬 | Blue/Cyan | Microscope / fractals |
| **Tesla** | ⚡ | Electric Blue | Tesla coil / lightning |
| **Bucky** | 🏛️ | Geometric/Green | Geodesic dome / structure |
| **Faraday** | 📊 | Data Blue/Gray | Analytics / measurement |
| **Outcast Hero** | 🔥🦬 | Fire Orange/Earth Brown | Fire & Bison / frontier command |

---

## 📝 Adding New Heroes/Pages

To add a new hero for a new page:

### 1. Insert Hero Record

```sql
INSERT INTO hero_catalog (
  id, name, icon_url, tagline, description,
  page_assignment, default_system_prompt, status, metadata
) VALUES (
  gen_random_uuid(),
  'Hero Name',
  '🎯',
  'Tagline',
  'Description...',
  'page_name',  -- Must match pageContext prop
  'System prompt...',
  'online',
  '{"personality": "...", "capabilities": [...], "tone": "..."}'::jsonb
);
```

### 2. Add HeroPanel to Page

```tsx
import { HeroPanel } from '@/components/HeroPanel';

// At bottom of page component:
<HeroPanel 
  pageContext="page_name"  // Must match page_assignment in DB
  pillarContext="contributor|operator|creator"
  userEmail={userEmail}
/>
```

### 3. Update API (if needed)

The API automatically supports new page assignments through the `page_assignment` column.

---

## 🔍 Troubleshooting

### Hero Not Appearing?

1. **Check Database**: Verify hero has `status='online'` and correct `page_assignment`
2. **Check API**: Test `/api/heroes?page=<pageContext>&status=active`
3. **Check Console**: Look for API errors in browser console
4. **Check Props**: Verify pageContext matches database page_assignment exactly

### Multiple Heroes Showing?

- This is intentional! Users can switch between heroes via dropdown
- To show only one: Ensure only one hero has matching `page_assignment`

---

## 📚 Related Files

- **Migrations**: 
  - `supabase/migrations/20260111000001_hero_page_assignments.sql` (5 heroes)
  - `supabase/migrations/20260111000002_hero_fractiai_mission_control.sql` (Outcast Hero)
- **API**: `app/api/heroes/route.ts`
- **Component**: `components/HeroPanel.tsx`
- **Pages**:
  - `app/page.tsx` (Landing)
  - `app/dashboard/page.tsx` (Contributor)
  - `app/onboarding/page.tsx` (Academy)
  - `app/creator/dashboard/page.tsx` (Creator)
  - `app/fractiai/page.tsx` (Mission Control)

---

## 🎯 Future Enhancements

- [ ] Add R&D Lab page for Leonardo da Vinci
- [ ] Add operator dashboard variations
- [ ] Add hero-specific color theming to panels
- [ ] Add hero avatar images/animations
- [ ] Add hero voice/tone analysis to AI responses
- [ ] Add analytics per hero engagement

---

**Last Updated**: January 11, 2026  
**Status**: ✅ Ready for Deployment  
**Migration Required**: Yes - Run SQL in Supabase before testing

