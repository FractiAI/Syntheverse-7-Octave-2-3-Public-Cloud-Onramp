import { AtomicScorer } from '../utils/scoring/AtomicScorer';

async function verifyRawTransformation() {
    console.log('--- Raw Core Verification ---');

    const input = {
        novelty: 2200,
        density: 2100,
        coherence: 1900,
        alignment: 2000,
        redundancy_overlap_percent: 14.2,
        is_seed_from_ai: true,
        is_edge_from_ai: true,
        toggles: {
            overlap_on: true,
            seed_on: true,
            edge_on: true,
            metal_policy_on: true
        }
    };

    const atomicScore = AtomicScorer.computeScore(input);

    console.log('Final Raw Score:', atomicScore.final);
    console.log('Formula Trace:', atomicScore.trace.formula);

    // Verify no multipliers/bonuses/penalties
    const expected = input.novelty + input.density + input.coherence + input.alignment;
    if (atomicScore.final === expected) {
        console.log('✅ RAW CORE VERIFIED (No bonuses/penalties/multipliers)');
    } else {
        console.log('❌ Logic Error. Expected:', expected, 'Got:', atomicScore.final);
    }
}

verifyRawTransformation().catch(console.error);
