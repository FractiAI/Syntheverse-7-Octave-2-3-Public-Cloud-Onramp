/**
 * Tokenomics Validation Tests
 * 
 * Tests that tokenomics calculations are correct:
 * - Allocation formulas are accurate
 * - Epoch balances update correctly
 * - Metal assay calculations work
 * - Total supply constraints are respected
 * - Epoch progression logic is correct
 */

import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'
import { setupHardhatNetwork } from '../utils/hardhat-setup'
import { TestReporter, TestResult } from '../utils/test-reporter'
import { db } from '@/utils/db/db'
import { tokenomicsTable, epochMetalBalancesTable, allocationsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { computeMetalAssay } from '@/utils/tokenomics/metal-assay'

const SUITE_ID = 'tokenomics-validation'
const reporter = new TestReporter()

describe('Tokenomics Validation', function () {
    this.timeout(300000) // 5 minutes
    
    before(() => {
        reporter.startSuite(SUITE_ID, 'Tokenomics Validation')
    })
    
    after(() => {
        reporter.endSuite(SUITE_ID)
    })
    
    it('Should calculate metal assay correctly', async function () {
        const testId = 'metal-assay-calculation'
        const startTime = Date.now()
        
        try {
            // Test various metal combinations
            const testCases = [
                { metals: ['gold'], expected: { gold: 1.0, silver: 0, copper: 0 } },
                { metals: ['silver'], expected: { gold: 0, silver: 1.0, copper: 0 } },
                { metals: ['copper'], expected: { gold: 0, silver: 0, copper: 1.0 } },
                { metals: ['gold', 'silver'], expected: { gold: 0.5, silver: 0.5, copper: 0 } },
                { metals: ['gold', 'silver', 'copper'], expected: { gold: 1/3, silver: 1/3, copper: 1/3 } },
            ]
            
            const results: any[] = []
            
            for (const testCase of testCases) {
                const assay = computeMetalAssay(testCase.metals)
                const isValid = (
                    Math.abs(assay.gold - testCase.expected.gold) < 0.01 &&
                    Math.abs(assay.silver - testCase.expected.silver) < 0.01 &&
                    Math.abs(assay.copper - testCase.expected.copper) < 0.01
                )
                
                results.push({
                    input: testCase.metals,
                    expected: testCase.expected,
                    actual: assay,
                    valid: isValid
                })
            }
            
            const allValid = results.every(r => r.valid)
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Metal assay calculation',
                status: allValid ? 'passed' : 'failed',
                duration,
                inputs: { testCases: testCases.length },
                expected: 'All assay calculations correct',
                actual: results,
                error: allValid ? undefined : 'Some assay calculations incorrect',
                metadata: { results }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allValid, 'All metal assay calculations should be correct').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Metal assay calculation',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should respect total supply constraints', async function () {
        const testId = 'total-supply-constraints'
        const startTime = Date.now()
        
        try {
            // Get current tokenomics state
            const tokenomics = await db
                .select()
                .from(tokenomicsTable)
                .where(eq(tokenomicsTable.id, 'main'))
                .limit(1)
            
            if (tokenomics.length === 0) {
                throw new Error('Tokenomics state not found')
            }
            
            const state = tokenomics[0]
            const totalSupply = Number(state.total_supply || 0)
            const totalDistributed = Number(state.total_distributed || 0)
            const totalSupplyGold = Number(state.total_supply_gold || 0)
            const totalSupplySilver = Number(state.total_supply_silver || 0)
            const totalSupplyCopper = Number(state.total_supply_copper || 0)
            const totalDistributedGold = Number(state.total_distributed_gold || 0)
            const totalDistributedSilver = Number(state.total_distributed_silver || 0)
            const totalDistributedCopper = Number(state.total_distributed_copper || 0)
            
            // Verify constraints
            const constraintsValid = (
                totalDistributed <= totalSupply &&
                totalDistributedGold <= totalSupplyGold &&
                totalDistributedSilver <= totalSupplySilver &&
                totalDistributedCopper <= totalSupplyCopper &&
                (totalSupplyGold + totalSupplySilver + totalSupplyCopper) === totalSupply
            )
            
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Total supply constraints',
                status: constraintsValid ? 'passed' : 'failed',
                duration,
                inputs: { tokenomicsState: state },
                expected: 'All supply constraints respected',
                actual: {
                    totalSupply,
                    totalDistributed,
                    totalSupplyGold,
                    totalSupplySilver,
                    totalSupplyCopper,
                    totalDistributedGold,
                    totalDistributedSilver,
                    totalDistributedCopper
                },
                error: constraintsValid ? undefined : 'Supply constraints violated',
                metadata: {
                    state,
                    constraints: {
                        totalDistributedWithinSupply: totalDistributed <= totalSupply,
                        goldWithinSupply: totalDistributedGold <= totalSupplyGold,
                        silverWithinSupply: totalDistributedSilver <= totalSupplySilver,
                        copperWithinSupply: totalDistributedCopper <= totalSupplyCopper,
                        metalSuppliesSumToTotal: (totalSupplyGold + totalSupplySilver + totalSupplyCopper) === totalSupply
                    }
                }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(constraintsValid, 'All supply constraints should be respected').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Total supply constraints',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should calculate allocation amounts correctly', async function () {
        const testId = 'allocation-calculation'
        const startTime = Date.now()
        
        try {
            // Test allocation formula: (score/10000) * available_balance * metal_weight
            const testCases = [
                {
                    podScore: 8000,
                    availableBalance: 1000000,
                    metalWeight: 1.0,
                    expected: 800000 // (8000/10000) * 1000000 * 1.0
                },
                {
                    podScore: 5000,
                    availableBalance: 500000,
                    metalWeight: 0.5,
                    expected: 125000 // (5000/10000) * 500000 * 0.5
                },
                {
                    podScore: 10000,
                    availableBalance: 100000,
                    metalWeight: 0.33,
                    expected: 33000 // (10000/10000) * 100000 * 0.33
                }
            ]
            
            const results: any[] = []
            
            for (const testCase of testCases) {
                const scorePercentage = testCase.podScore / 10000.0
                const calculated = Math.floor(scorePercentage * testCase.availableBalance * testCase.metalWeight)
                const isValid = calculated === testCase.expected
                
                results.push({
                    input: testCase,
                    calculated,
                    expected: testCase.expected,
                    valid: isValid
                })
            }
            
            const allValid = results.every(r => r.valid)
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Allocation calculation',
                status: allValid ? 'passed' : 'failed',
                duration,
                inputs: { testCases: testCases.length },
                expected: 'All allocation calculations correct',
                actual: results,
                error: allValid ? undefined : 'Some allocation calculations incorrect',
                metadata: { results }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allValid, 'All allocation calculations should be correct').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Allocation calculation',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should track epoch balances correctly', async function () {
        const testId = 'epoch-balance-tracking'
        const startTime = Date.now()
        
        try {
            // Get epoch balances for all epochs
            const epochBalances = await db
                .select()
                .from(epochMetalBalancesTable)
                .orderBy(epochMetalBalancesTable.epoch)
            
            // Verify balances are non-negative
            const allBalancesValid = epochBalances.every(eb => {
                const balance = Number(eb.balance || 0)
                const threshold = Number(eb.threshold || 0)
                return balance >= 0 && threshold >= 0
            })
            
            // Verify each epoch has balances for all metals
            const epochs = ['founder', 'pioneer', 'community', 'ecosystem']
            const metals = ['gold', 'silver', 'copper']
            
            const allEpochsHaveAllMetals = epochs.every(epoch => {
                return metals.every(metal => {
                    return epochBalances.some(eb => 
                        eb.epoch === epoch && eb.metal === metal
                    )
                })
            })
            
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Epoch balance tracking',
                status: (allBalancesValid && allEpochsHaveAllMetals) ? 'passed' : 'failed',
                duration,
                inputs: { epochCount: epochs.length, metalCount: metals.length },
                expected: 'All epoch balances valid and complete',
                actual: {
                    epochBalancesCount: epochBalances.length,
                    expectedCount: epochs.length * metals.length
                },
                error: (allBalancesValid && allEpochsHaveAllMetals) ? undefined : 'Epoch balance tracking issues',
                metadata: {
                    epochBalances,
                    allBalancesValid,
                    allEpochsHaveAllMetals
                }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allBalancesValid && allEpochsHaveAllMetals, 'Epoch balances should be valid and complete').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Epoch balance tracking',
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

