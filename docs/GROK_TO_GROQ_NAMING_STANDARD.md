# Grok → Groq Naming Standardization

**Date:** January 8, 2026  
**Status:** Naming Convention Established  
**Priority:** MEDIUM (Reduces confusion)

---

## Background

The codebase has been using inconsistent naming between "Grok" and "Groq":
- **Groq** = The actual AI provider (https://groq.com) using LPUs for ultra-fast inference
- **Grok** = Historical typo/confusion (possibly with Elon Musk's "Grok" AI)

This creates confusion and makes the code harder to maintain.

---

## Naming Convention (FINAL)

### ✅ KEEP AS "grok" (lowercase folder names only)

**Folder Structure:**
- `utils/grok/` - Keep folder name for backwards compatibility
- `utils/grok/evaluate.ts` - Keep file paths
- `utils/grok/system-prompt.ts` - Keep file paths

**Rationale:** 
- Renaming folders breaks imports across 60+ files
- File paths are referenced in documentation and configs
- The comment in evaluate.ts explicitly states: 
  > `"note: 'grok' is folder name, Groq is the API provider"`

###  STANDARDIZE TO "Groq" (Code Variables & Types)

**Variable Names:**
```typescript
// ✅ CORRECT
const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
let groqRequest: any;
let groqResponse: any;
const fullGroqResponse = {...};
const rawGroqAnswer = answer;

// ❌ INCORRECT (needs fixing)
const grokApiKey = ...;
let grokRequest: any;
let grokResponse: any;
```

**Type/Interface Names:**
```typescript
// ✅ CORRECT
interface GroqEvaluationResult { ... }
interface GroqApiResponse { ... }
type GroqMetadata = { ... };

// ❌ INCORRECT
interface GrokEvaluationResult { ... }
```

**Function Names:**
```typescript
// ✅ CORRECT (already correct)
export async function evaluateWithGroq(...) { ... }

// ❌ INCORRECT (if it existed)
export async function evaluateWithGrok(...) { ... }
```

### 🔄 HYBRID (Database Fields & Metadata Keys)

**Database Metadata Fields:**

These are stored in JSONB and changing them would break existing data. We'll use **both** names during transition:

```typescript
// Database writes - support BOTH for backwards compatibility
metadata: {
  groq_evaluation_details: { ... },  // ✅ NEW (preferred)
  grok_evaluation_details: { ... },  // ✅ LEGACY (keep for existing data)
  
  raw_groq_response: "...",  // ✅ NEW (preferred)
  raw_grok_response: "...",  // ✅ LEGACY (keep for existing data)
}

// Database reads - check BOTH
const details = 
  contrib.metadata.groq_evaluation_details || 
  contrib.metadata.grok_evaluation_details;  // Fallback to legacy
```

**SQL Query Names:**
- Keep existing: `get_full_grok_response.sql`
- Add comment: "Historical name - queries Groq API responses"

---

##Implementation Plan

### Phase 1: Code Variables (HIGH PRIORITY) ✅ STARTED

**Files to update:**

1. **API Routes** (`app/api/`)
   - `evaluate/[hash]/route.ts` - Lines 110-112 (grokRequest, grokResponse)
   - `enterprise/evaluate/[hash]/route.ts` - Check for grok variables
   - `submit/route.ts` - Check for grok references

2. **Components** (`components/`)
   - `SubmitContributionForm.tsx` - Lines 901+ (grok_evaluation_details references)
   - `PoCArchive.tsx` - Lines 61+ (grok_evaluation_details type)
   - `FrontierModule.tsx` - Check for grok references
   - `EnterpriseContributionDetail.tsx` - Check for grok references

3. **Database Schema** (`utils/db/schema.ts`)
   - Add comments explaining naming convention
   - Keep JSONB field names as-is (backwards compat)

4. **Test Files** (`tests/`, `scripts/`)
   - Update variable names in test scripts
   - Keep file names unchanged

### Phase 2: Documentation (MEDIUM PRIORITY) 

Update docs to clarify:
- Groq is the provider
- `utils/grok/` folder name is historical
- All new code should use "Groq" for variables

### Phase 3: Legacy Cleanup (LOW PRIORITY - FUTURE)

After 6+ months when all production data uses new names:
- Consider renaming folder `utils/grok/` → `utils/groq/`
- Update all imports (60+ files)
- Remove legacy field name support

---

## Specific Changes Needed

### 1. Update `app/api/evaluate/[hash]/route.ts`

**Current (Lines 110-112):**
```typescript
let grokRequest: any = null;
let grokResponse: any = null;
let evaluation: any = null;
```

**Change to:**
```typescript
let groqRequest: any = null;
let groqResponse: any = null;
let evaluation: any = null;
```

**Impact:** 10 occurrences in file

### 2. Update `app/api/evaluate/[hash]/route.ts` (Log table inserts)

**Current:**
```typescript
grok_api_request: grokRequest,
grok_api_response: grokResponse,
```

**Keep as-is** - Database field names (backwards compat)

###  3. Update Variable Names in Components

**`components/SubmitContributionForm.tsx`:**
- Keep: `evaluation.grok_evaluation_details` (database field)
- Update: Any local `const grokResponse = ...` to `groqResponse`

**`components/PoCArchive.tsx`:**
- Keep: `grok_evaluation_details?: { ... }` (type for database field)
- Add comment: `// Note: "grok" in database for historical reasons, refers to Groq AI provider`

### 4. Add Clarifying Comments

**In `utils/grok/evaluate.ts`:**
```typescript
// NOTE: This folder is named "grok" for historical reasons.
// The actual AI provider is Groq (https://groq.com).
// All variable names in this file use "groq" for clarity.
```

**In `utils/db/schema.ts`:**
```typescript
// Legacy naming: "grok_evaluation_details" in database refers to Groq AI provider
// Folder utils/grok/ uses historical spelling, but provider is Groq
```

---

## Environment Variables (ALREADY FIXED ✅)

```bash
# ✅ PRIMARY (correct spelling)
NEXT_PUBLIC_GROQ_API_KEY=gsk_...

# ✅ LEGACY (backwards compatibility)
NEXT_PUBLIC_GROK_API_KEY=gsk_...
```

Code already checks both:
```typescript
const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_GROK_API_KEY;
```

---

## Testing Checklist

After renaming variables:

- [ ] TypeScript compilation succeeds
- [ ] All API endpoints work
- [ ] Database queries succeed
- [ ] Frontend displays evaluation results
- [ ] No console errors about undefined properties
- [ ] Backwards compatibility maintained (old data still readable)

---

## Migration Safety

**SAFE:**
- ✅ Renaming local variables
- ✅ Renaming function parameters
- ✅ Adding new database fields alongside old ones
- ✅ Updating comments and documentation

**RISKY (avoid for now):**
- ❌ Renaming database field names (breaks existing data)
- ❌ Renaming folder paths (breaks 60+ imports)
- ❌ Removing backwards compatibility checks

---

## Summary

**Action Items:**
1. ✅ Environment variables: Support both GROQ and GROK
2. 🔄 **IN PROGRESS:** Rename code variables from `grok*` to `groq*`
3. ✅ Keep folder names as `utils/grok/` (backwards compat)
4. ✅ Keep database field names as `grok_*` (backwards compat)
5. 📝 Add clarifying comments explaining the naming

**Timeline:**
- Phase 1 (Code Variables): 2-4 hours
- Phase 2 (Documentation): 1 hour
- Phase 3 (Legacy Cleanup): Future (6+ months)

**Risk Level:** LOW (mostly variable renaming, backwards compatible)

---

**Engineer:** AI Senior Full-Stack Engineer  
**Review Status:** Ready for implementation  
**Breaking Changes:** None (fully backwards compatible)

