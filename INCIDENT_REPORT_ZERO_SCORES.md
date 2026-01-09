# Incident Report: Zero Scores After 6th Submission

**Incident ID**: INC-2026-01-09-001  
**Date Reported**: January 9, 2026, 09:05 UTC  
**Date Resolved**: January 9, 2026, 15:30 UTC  
**Severity**: High (Service Degradation)  
**Status**: ✅ Root Cause Identified - Pending Fix

---

## Executive Summary

After 6 successful PoC evaluations, all subsequent submissions failed with `null` scores. Investigation revealed the root cause: **Groq API daily token limit exhaustion**. The free tier allows 100,000 tokens per day (TPD), and 6 evaluations consumed 97,651 tokens, causing the 7th submission to hit rate limit errors (HTTP 429).

---

## Timeline of Events

| Time (UTC) | Event | Status | Token Usage |
|------------|-------|--------|-------------|
| 03:57:34 | Submission #1: "Syntheverse" | ✅ Score: 10000 | ~16,000 |
| 05:52:43 | Submission #2: "Syntheverse PoC" | ✅ Score: 8500 | ~16,000 |
| 05:54:27 | Submission #3: "Syntheverse Element 0" | ✅ Score: 9400 | ~16,000 |
| 05:56:00 | Submission #4: "Element 0= Mathematical 0" | ✅ Score: 9000 | ~16,000 |
| 05:57:27 | Submission #5: "Syntheverse Octaves and Integers" | ✅ Score: 9000 | ~16,000 |
| 05:59:30 | Submission #6: "Octaves as Integers" | ✅ Score: 9750 | ~16,000 |
| **06:02:47** | **Submission #7: "Recursive Awareness Interference"** | ❌ **null score** | **97,948/100k** |
| **06:07:04** | **Submission #8: "Syntheverse: A Holographic..."** | ❌ **null score** | **97,651/100k** |

---

## Root Cause Analysis

### Primary Cause: Groq API Daily Token Limit Exceeded

**Error Message**:
```json
{
  "error": {
    "message": "Rate limit reached for model `llama-3.3-70b-versatile` in organization `org_01kc7kanj1ff69tqjc3haj48e1` service tier `on_demand` on tokens per day (TPD): Limit 100000, Used 97651, Requested 5158. Please try again in 40m26.976s.",
    "type": "tokens",
    "code": "rate_limit_exceeded"
  }
}
```

**HTTP Status**: 429 (Too Many Requests)

### Token Budget Breakdown

Each evaluation request consumes approximately **16,000 tokens**:

| Component | Tokens | Source |
|-----------|--------|--------|
| System Prompt | ~2,200 | `utils/grok/system-prompt.ts` (12,000 chars) |
| User Content | ~2,500 | Submission text (truncated to 10,000 chars) |
| Vector Archive Data | ~9,300 | Top 50 archived vectors for redundancy detection |
| AI Response | ~2,000 | Groq's evaluation output (JSON + narrative) |
| **TOTAL** | **~16,000** | **Per evaluation** |

### Daily Limit Math

```
Free Tier Limit:    100,000 tokens/day
Token per eval:      16,000 tokens
Max evaluations:     6.25 evaluations/day
Actual before fail:  6 successful evaluations (96,000 tokens)
7th attempt:         Exceeds limit → RATE_LIMIT_EXCEEDED
```

---

## Investigation Process

### Step 1: Initial Observation
- User reported: "returns 0 scores after the 6th successful submission"
- Vercel logs showed HTTP 200 responses but no error indicators

### Step 2: Database Analysis
Executed SQL queries to inspect `poc_log` and `contributions` tables:

```sql
-- Query revealed 6 successful + 2 failed evaluations
SELECT submission_hash, title, status, metadata->>'pod_score' as pod_score
FROM contributions
WHERE created_at > '2026-01-09 03:00:00'
ORDER BY created_at DESC;
```

**Finding**: Submissions #7 and #8 had `null` pod_scores, not zero.

### Step 3: Error Log Inspection
```sql
-- Retrieved raw Groq API responses
SELECT event_type, log_error, raw_groq_response
FROM poc_log
WHERE submission_hash IN ('41c237...', '9b6c67...')
  AND event_type = 'evaluation_error';
```

**Finding**: Both showed `rate_limit_exceeded` with HTTP 429 errors.

### Step 4: Token Usage Calculation
Manual analysis of system prompt, content, and vector data confirmed ~16,000 tokens per request.

---

## Impact Assessment

### User Impact
- **Affected Users**: 1 (info@fractiai.com - Creator account)
- **Failed Submissions**: 2 out of 8 attempts (25% failure rate after 6 successful)
- **Data Loss**: None (submissions stored, can be re-evaluated)
- **User Experience**: Degraded (received `unqualified` status with no scores)

### System Impact
- **Service Availability**: Partial outage for evaluation service
- **Duration**: ~4 hours (until token limit resets or upgrade)
- **Affected Component**: `/api/evaluate/[hash]` endpoint
- **Database Integrity**: ✅ No corruption (null scores correctly reflect failed evaluation)

### Financial Impact
- **Revenue Impact**: None (free tier usage)
- **Upgrade Required**: ~$0.50-$5/month for Dev tier (depending on usage)

---

## Why Existing Safety Measures Didn't Catch This

### 1. Error Handling Worked Correctly
- Groq API returned proper 429 error
- System logged error to `poc_log` table
- Contribution status set to `unqualified` (safe default)

### 2. But User-Facing Error Was Unclear
- Frontend showed "unqualified" without explanation
- No indication that issue was temporary (rate limit)
- No suggestion to retry after wait period

### 3. No Token Usage Monitoring
- System doesn't track cumulative token usage
- No warning before approaching daily limit
- No graceful degradation when limit approached

---

## Recommended Solutions

### Immediate Actions (0-24 hours)

#### 1. **Upgrade Groq API Tier** (Recommended)
- **Action**: Upgrade from free tier to Dev tier
- **Cost**: $0.50-$5/month (depending on usage)
- **Benefit**: Significantly higher token limits
- **URL**: https://console.groq.com/settings/billing

#### 2. **Add Rate Limit Error Handling**
```typescript
// In utils/grok/evaluate.ts
if (response.status === 429) {
  const retryAfter = response.headers.get('retry-after');
  throw new Error(
    `Groq API rate limit exceeded. Please try again in ${retryAfter} seconds. ` +
    `Consider upgrading at https://console.groq.com/settings/billing`
  );
}
```

#### 3. **User-Facing Error Messages**
Display helpful error when rate limit hit:
```
"⏱️ Daily evaluation limit reached. Your submission is saved and will be 
evaluated automatically when limits reset (usually midnight UTC). 
Alternatively, upgrade to Pro tier for unlimited evaluations."
```

### Short-Term Solutions (1-7 days)

#### 4. **Token Usage Optimization**
Reduce tokens per evaluation from 16,000 to ~10,000:

**System Prompt Optimization** (Save ~1,000 tokens):
- Current: 12,000 chars (~2,200 tokens)
- Optimized: 8,000 chars (~1,500 tokens)
- Remove verbose examples, consolidate instructions

**Vector Archive Data Reduction** (Save ~5,000 tokens):
- Current: Top 50 archived vectors (~9,300 tokens)
- Optimized: Top 20 vectors (~3,800 tokens)
- Still sufficient for redundancy detection

**Result**: ~10,000 tokens per eval = **10 evaluations/day** instead of 6

#### 5. **Token Usage Tracking**
```typescript
// New utility: utils/groq/token-tracker.ts
export async function trackTokenUsage(used: number, requested: number) {
  const dailyLimit = 100000;
  const remaining = dailyLimit - used;
  
  if (remaining < requested * 2) {
    console.warn(`⚠️ Token budget low: ${remaining} tokens remaining`);
  }
  
  // Store in database for monitoring
  await db.insert(tokenUsageLog).values({
    timestamp: new Date(),
    tokens_used: used,
    tokens_remaining: remaining,
    requests_remaining: Math.floor(remaining / 16000)
  });
}
```

#### 6. **Request Queuing System**
```typescript
// New utility: utils/groq/queue.ts
// Queue evaluations when rate limit hit
// Auto-retry after specified wait period
// Notify user via email when complete
```

### Long-Term Solutions (1-4 weeks)

#### 7. **Multi-Provider Fallback**
- Primary: Groq (fast, cheap)
- Fallback: OpenAI GPT-4 (more expensive but reliable)
- Fallback: Anthropic Claude (high quality)

#### 8. **Caching & Similarity Checks**
- Cache evaluations for identical submissions
- Detect near-duplicates, offer cached results
- Reduce redundant API calls

#### 9. **Enterprise Pricing Tier**
- Implement SYNTH token-based evaluation credits
- Users pay in SYNTH for guaranteed evaluation capacity
- Operator/Creator accounts get higher limits

---

## Prevention Measures

### Monitoring & Alerts

**Implement in Next.js Dashboard**:
```typescript
// components/admin/TokenUsageDashboard.tsx
- Real-time token usage gauge
- Daily limit countdown
- Alert when >80% consumed
- Historical usage charts
```

**Vercel Log Alerts**:
```yaml
# vercel.json
"cron": [
  {
    "path": "/api/monitoring/token-usage",
    "schedule": "0 * * * *"  # Hourly check
  }
]
```

**Email Notifications**:
- Alert admins when >90% tokens consumed
- Daily usage report sent to info@fractiai.com
- Weekly trends and forecasts

### Documentation Updates

1. **Update README.md**: Add section on Groq API limits
2. **Update TROUBLESHOOTING.md**: Add rate limit section
3. **Create GROQ_API_LIMITS.md**: Detailed guide on limits and optimization
4. **Update `.env.example`**: Add optional `GROQ_TIER=free|dev|pro`

---

## Lessons Learned

### What Went Well ✅
1. Error logging captured full Groq API response
2. Database integrity maintained (no data corruption)
3. System failed safely (unqualified vs corrupt scores)
4. Diagnostic SQL queries quickly identified root cause
5. Investigation completed in <6 hours

### What Needs Improvement ⚠️
1. No proactive token usage monitoring
2. User-facing errors were unclear
3. No automatic retry mechanism
4. No cost/usage alerts for operators
5. Token optimization not prioritized earlier

### Key Takeaways 💡
1. **Free tiers are risky for production**: Plan for upgrades
2. **Monitor all external API quotas**: Especially usage-based limits
3. **User feedback is critical**: "Zero scores" reported before logs showed issue
4. **Graceful degradation matters**: Better UX when services degrade
5. **Cost transparency helps**: Users understand upgrade value when limits hit

---

## Action Items

| Priority | Action | Owner | Deadline | Status |
|----------|--------|-------|----------|--------|
| 🔴 P0 | Upgrade Groq to Dev tier | DevOps | Jan 10 | ⏳ Pending |
| 🔴 P0 | Add rate limit error handling | Engineering | Jan 10 | ⏳ Pending |
| 🟡 P1 | Optimize system prompt (save 1000 tokens) | Engineering | Jan 12 | ⏳ Pending |
| 🟡 P1 | Reduce vector archive data (save 5000 tokens) | Engineering | Jan 12 | ⏳ Pending |
| 🟡 P1 | Implement token usage tracking | Engineering | Jan 15 | ⏳ Pending |
| 🟢 P2 | Add token usage dashboard | Engineering | Jan 20 | ⏳ Pending |
| 🟢 P2 | Implement request queuing | Engineering | Jan 25 | ⏳ Pending |
| 🟢 P2 | Create GROQ_API_LIMITS.md docs | Documentation | Jan 15 | ⏳ Pending |

---

## Technical Details

### Affected Files
- `utils/grok/evaluate.ts` - Main evaluation logic
- `utils/grok/system-prompt.ts` - System prompt (2,200 tokens)
- `app/api/evaluate/[hash]/route.ts` - Evaluation endpoint
- Database tables: `poc_log`, `contributions`

### Error Codes
- **HTTP 429**: Rate limit exceeded
- **Groq Error Code**: `rate_limit_exceeded`
- **Error Type**: `tokens`

### Environment Details
- **Groq Organization**: `org_01kc7kanj1ff69tqjc3haj48e1`
- **Model**: `llama-3.3-70b-versatile`
- **Service Tier**: `on_demand` (free tier)
- **Daily Limit**: 100,000 TPD
- **Current Usage**: 97,651 tokens (before 7th submission)

---

## References

### Internal Documentation
- `ZERO_SCORES_TROUBLESHOOTING.md` - Initial diagnostic guide
- `GROQ_DEBUG_QUERIES.sql` - SQL queries used in investigation
- `/api/debug/groq-test` - Diagnostic endpoint

### External Resources
- Groq API Limits: https://console.groq.com/docs/rate-limits
- Groq Billing: https://console.groq.com/settings/billing
- Groq Pricing Tiers: https://groq.com/pricing

---

## Appendix A: SQL Investigation Queries

```sql
-- Query 1: Find submissions with null scores
SELECT submission_hash, title, status, metadata->>'pod_score' as pod_score
FROM contributions
WHERE created_at > '2026-01-09 03:00:00'
ORDER BY created_at DESC;

-- Query 2: Get Groq error details
SELECT event_type, error_message, grok_api_response
FROM poc_log
WHERE submission_hash IN (
  '41c2370eddb2dae8217f5e34df6d6bca9ed76e6f68f1862bc4f096c0faffb2a2',
  '9b6c67e0821316f6173d8b5550fae5b9b81093139d01f39ce515350198331728'
)
AND event_type = 'evaluation_error';

-- Query 3: Token usage analysis
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as evaluations,
  COUNT(*) * 16000 as estimated_tokens
FROM poc_log
WHERE event_type = 'evaluation_complete'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## Appendix B: Token Budget Calculation Details

```
System Prompt:
- File: utils/grok/system-prompt.ts
- Characters: 12,000
- Estimated tokens: ~2,200 (using 1 token ≈ 5.5 chars)

User Content:
- Max length: 10,000 chars (truncated)
- Estimated tokens: ~2,500

Vector Archive Data:
- Format: JSON array of 50 vectors with metadata
- Each vector: ~186 tokens (title, hash, similarity, distance)
- Total: 50 × 186 = ~9,300 tokens

AI Response:
- JSON structure: ~800 tokens
- Narrative evaluation: ~1,200 tokens
- Total: ~2,000 tokens

GRAND TOTAL: 2,200 + 2,500 + 9,300 + 2,000 = 16,000 tokens/request
```

---

**Report Prepared By**: Senior Full Stack Engineering Team  
**Date**: January 9, 2026  
**Version**: 1.0  
**Classification**: Internal - Technical Documentation

---

**Status**: ✅ Root cause identified, pending implementation of fixes  
**Next Review**: January 12, 2026 (after optimization deployment)

