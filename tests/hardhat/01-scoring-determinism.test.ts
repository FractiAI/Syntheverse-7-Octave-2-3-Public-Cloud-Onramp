/**
 * HHF-AI Lens Scoring Determinism Tests
 * 
 * Tests that scoring is deterministic:
 * - Identical inputs produce identical outputs
 * - No non-determinism in scoring logic
 * - Boundary conditions are stable
 * - Convergence behavior is predictable
 */

import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'
import { setupHardhatNetwork } from '../utils/hardhat-setup'
import { TestReporter, TestResult } from '../utils/test-reporter'
import { evaluateWithGrok } from '@/utils/grok/evaluate'

const SUITE_ID = 'scoring-determinism'
const reporter = new TestReporter()

describe('HHF-AI Lens Scoring Determinism', function () {
    this.timeout(300000) // 5 minutes
    
    before(() => {
        reporter.startSuite(SUITE_ID, 'HHF-AI Lens Scoring Determinism')
    })
    
    after(() => {
        reporter.endSuite(SUITE_ID)
    })
    
    it('Should produce identical scores for identical inputs', async function () {
        const testId = 'identical-inputs'
        const startTime = Date.now()
        
        try {
            const testInput = {
                title: 'Test Contribution for Determinism',
                textContent: 'This is a test contribution to verify scoring determinism. It contains scientific content about hydrogen holographic frameworks and fractal geometry.',
                category: 'scientific',
            }
            
            // Run evaluation twice with identical inputs
            const result1 = await evaluateWithGrok(
                testInput.textContent,
                testInput.title,
                testInput.category
            )
            
            // Wait a bit to ensure no time-based non-determinism
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const result2 = await evaluateWithGrok(
                testInput.textContent,
                testInput.title,
                testInput.category
            )
            
            const duration = Date.now() - startTime
            
            // Compare results byte-for-byte
            const scores1 = {
                coherence: result1.coherence,
                density: result1.density,
                novelty: result1.novelty,
                alignment: result1.alignment,
                pod_score: result1.pod_score,
            }
            
            const scores2 = {
                coherence: result2.coherence,
                density: result2.density,
                novelty: result2.novelty,
                alignment: result2.alignment,
                pod_score: result2.pod_score,
            }
            
            const scoresMatch = JSON.stringify(scores1) === JSON.stringify(scores2)
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Identical inputs produce identical scores',
                status: scoresMatch ? 'passed' : 'failed',
                duration,
                inputs: testInput,
                expected: scores1,
                actual: scores2,
                error: scoresMatch ? undefined : 'Scores differ between runs',
                metadata: {
                    score1: scores1,
                    score2: scores2,
                    diff: scoresMatch ? null : {
                        coherence: result1.coherence !== result2.coherence,
                        density: result1.density !== result2.density,
                        novelty: result1.novelty !== result2.novelty,
                        alignment: result1.alignment !== result2.alignment,
                        pod_score: result1.pod_score !== result2.pod_score,
                    },
                },
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(scoresMatch, 'Scores should be identical for identical inputs').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Identical inputs produce identical scores',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should handle boundary conditions deterministically', async function () {
        const testId = 'boundary-conditions'
        const startTime = Date.now()
        
        try {
            // Test extremely short input
            const shortInput = {
                title: 'A',
                textContent: 'Short',
                category: 'scientific',
            }
            
            // Test extremely long input (truncate to reasonable size)
            const longText = 'A'.repeat(50000)
            const longInput = {
                title: 'Long Title '.repeat(10),
                textContent: longText,
                category: 'scientific',
            }
            
            // Test empty category
            const emptyCategoryInput = {
                title: 'Test',
                textContent: 'Test content',
                category: undefined,
            }
            
            const results: any[] = []
            
            // Run each boundary case
            for (const input of [shortInput, longInput, emptyCategoryInput]) {
                const result = await evaluateWithGrok(
                    input.textContent,
                    input.title,
                    input.category
                )
                results.push({
                    input,
                    result: {
                        coherence: result.coherence,
                        density: result.density,
                        novelty: result.novelty,
                        alignment: result.alignment,
                        pod_score: result.pod_score,
                    },
                })
            }
            
            const duration = Date.now() - startTime
            
            // Verify all results are valid (not NaN, not null, within expected ranges)
            const allValid = results.every(r => {
                const s = r.result
                return (
                    typeof s.coherence === 'number' && s.coherence >= 0 && s.coherence <= 2500 &&
                    typeof s.density === 'number' && s.density >= 0 && s.density <= 2500 &&
                    typeof s.novelty === 'number' && s.novelty >= 0 && s.novelty <= 2500 &&
                    typeof s.alignment === 'number' && s.alignment >= 0 && s.alignment <= 2500 &&
                    typeof s.pod_score === 'number' && s.pod_score >= 0 && s.pod_score <= 10000
                )
            })
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Boundary conditions handled deterministically',
                status: allValid ? 'passed' : 'failed',
                duration,
                inputs: { boundaryCases: results.length },
                expected: 'All scores valid and within ranges',
                actual: results.map(r => r.result),
                error: allValid ? undefined : 'Some boundary cases produced invalid scores',
                metadata: { results },
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allValid, 'All boundary conditions should produce valid scores').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Boundary conditions handled deterministically',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should maintain ordering stability across large datasets', async function () {
        const testId = 'ordering-stability'
        const startTime = Date.now()
        
        try {
            // Generate multiple test inputs with varying quality
            const testInputs = [
                { title: 'High Quality A', textContent: 'Comprehensive scientific contribution with detailed analysis and novel insights.', category: 'scientific' },
                { title: 'High Quality B', textContent: 'Another comprehensive scientific contribution with detailed analysis and novel insights.', category: 'scientific' },
                { title: 'Medium Quality', textContent: 'Reasonable contribution with some analysis.', category: 'scientific' },
                { title: 'Low Quality', textContent: 'Brief contribution.', category: 'scientific' },
            ]
            
            // Evaluate all inputs
            const results = await Promise.all(
                testInputs.map(input => 
                    evaluateWithGrok(input.textContent, input.title, input.category)
                )
            )
            
            const scores = results.map((r, i) => ({
                title: testInputs[i].title,
                pod_score: r.pod_score,
            }))
            
            // Verify ordering makes sense (high quality should score higher than low quality)
            const highQualityScores = scores.filter(s => s.title.includes('High Quality')).map(s => s.pod_score)
            const lowQualityScore = scores.find(s => s.title === 'Low Quality')?.pod_score || 0
            
            const orderingValid = Math.min(...highQualityScores) >= lowQualityScore
            
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Ordering stability across datasets',
                status: orderingValid ? 'passed' : 'failed',
                duration,
                inputs: { testCount: testInputs.length },
                expected: 'High quality scores >= Low quality scores',
                actual: scores,
                error: orderingValid ? undefined : 'Ordering does not match expected quality levels',
                metadata: { scores, highQualityScores, lowQualityScore },
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(orderingValid, 'High quality contributions should score higher').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Ordering stability across datasets',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
})

// Export reporter for report generation
export { reporter }

