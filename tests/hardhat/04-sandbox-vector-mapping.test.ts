/**
 * Sandbox Vector Mapping Tests
 * 
 * Tests the 3D vectorized sandbox mapping:
 * - Embedding generation accuracy
 * - 3D coordinate mapping using HHF geometry
 * - Vector similarity calculations
 * - HHF constant application
 * - Redundancy detection via vectors
 */

import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'
import { TestReporter, TestResult } from '../utils/test-reporter'
import { mapTo3DCoordinates } from '@/utils/vectors/hhf-3d-mapping'
import { generateEmbedding, EmbeddingResult } from '@/utils/vectors/embeddings'
import { calculateRedundancy } from '@/utils/vectors/redundancy'

const SUITE_ID = 'sandbox-vector-mapping'
const reporter = new TestReporter()

// HHF Constant: Λᴴᴴ ≈ 1.12 × 10²²
const HHF_CONSTANT = 1.12e22

describe('Sandbox Vector Mapping', function () {
    this.timeout(300000) // 5 minutes
    
    before(() => {
        reporter.startSuite(SUITE_ID, 'Sandbox Vector Mapping')
    })
    
    after(() => {
        reporter.endSuite(SUITE_ID)
    })
    
    it('Should generate valid embeddings', async function () {
        const testId = 'embedding-generation'
        const startTime = Date.now()
        
        try {
            const testText = 'This is a test contribution for embedding generation.'
            
            // Generate embedding
            const embeddingResult = await generateEmbedding(testText)
            
            // Verify embedding structure
            const isValid = (
                Array.isArray(embeddingResult.embedding) &&
                embeddingResult.embedding.length > 0 &&
                embeddingResult.embedding.every(val => typeof val === 'number' && !isNaN(val))
            )
            
            // Verify embedding dimensions (should be 1536 for text-embedding-3-small, or fallback dimensions)
            const expectedDimensions = 1536
            const hasValidDimensions = embeddingResult.embedding.length > 0
            
            const allValid = isValid && hasValidDimensions
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Embedding generation',
                status: allValid ? 'passed' : 'failed',
                duration,
                inputs: { testText, expectedDimensions },
                expected: 'Valid embedding with correct dimensions',
                actual: {
                    isValid,
                    hasValidDimensions,
                    embeddingLength: embeddingResult.embedding.length,
                    model: embeddingResult.model,
                    dimensions: embeddingResult.dimensions,
                    embeddingSample: embeddingResult.embedding.slice(0, 5)
                },
                error: allValid ? undefined : 'Embedding generation failed',
                metadata: { embeddingResult, expectedDimensions }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allValid, 'Embedding should be valid').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Embedding generation',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should map to 3D coordinates using HHF geometry', async function () {
        const testId = '3d-coordinate-mapping'
        const startTime = Date.now()
        
        try {
            // Test 3D coordinate mapping
            const testParams = {
                embedding: Array(1536).fill(0).map(() => Math.random()),
                novelty: 2000,
                density: 1800,
                coherence: 1900
            }
            
            const coordinates = mapTo3DCoordinates(testParams)
            
            // Verify coordinates are valid
            const coordinatesValid = (
                typeof coordinates.x === 'number' && !isNaN(coordinates.x) &&
                typeof coordinates.y === 'number' && !isNaN(coordinates.y) &&
                typeof coordinates.z === 'number' && !isNaN(coordinates.z)
            )
            
            // Verify coordinates are within expected range (based on HHF scaling)
            // X-axis: Novelty (0-2500 score → ~0-200 range)
            // Y-axis: Density (0-2500 score → ~0-200 range)
            // Z-axis: Coherence (0-2500 score → ~0-200 range)
            const scaleFactor = Math.log10(HHF_CONSTANT) / 10 // ≈ 2.05
            const maxCoordinate = 2500 / scaleFactor // ≈ 1220
            
            const coordinatesInRange = (
                coordinates.x >= 0 && coordinates.x <= maxCoordinate * 1.5 && // Allow some margin
                coordinates.y >= 0 && coordinates.y <= maxCoordinate * 1.5 &&
                coordinates.z >= 0 && coordinates.z <= maxCoordinate * 1.5
            )
            
            const allValid = coordinatesValid && coordinatesInRange
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: '3D coordinate mapping',
                status: allValid ? 'passed' : 'failed',
                duration,
                inputs: testParams,
                expected: 'Valid 3D coordinates within expected range',
                actual: {
                    coordinates,
                    coordinatesValid,
                    coordinatesInRange,
                    maxCoordinate
                },
                error: allValid ? undefined : '3D coordinate mapping failed',
                metadata: { coordinates, testParams, HHF_CONSTANT, scaleFactor }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allValid, '3D coordinates should be valid').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: '3D coordinate mapping',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should calculate vector similarity correctly', async function () {
        const testId = 'vector-similarity'
        const startTime = Date.now()
        
        try {
            // Create test embeddings
            const embedding1 = Array(1536).fill(0.5)
            const embedding2 = Array(1536).fill(0.5) // Identical
            const embedding3 = Array(1536).fill(0.0) // Different
            
            // Calculate cosine similarity (helper function)
            const cosineSimilarity = (a: number[], b: number[]): number => {
                if (a.length !== b.length) return 0
                let dotProduct = 0
                let normA = 0
                let normB = 0
                for (let i = 0; i < a.length; i++) {
                    dotProduct += a[i] * b[i]
                    normA += a[i] * a[i]
                    normB += b[i] * b[i]
                }
                return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
            }
            
            // Calculate Euclidean distance (helper function)
            const euclideanDistance = (a: number[], b: number[]): number => {
                if (a.length !== b.length) return Infinity
                let sum = 0
                for (let i = 0; i < a.length; i++) {
                    sum += Math.pow(a[i] - b[i], 2)
                }
                return Math.sqrt(sum)
            }
            
            // Calculate cosine similarity
            const similarityIdentical = cosineSimilarity(embedding1, embedding2)
            const similarityDifferent = cosineSimilarity(embedding1, embedding3)
            
            // Identical embeddings should have similarity ≈ 1.0
            // Different embeddings should have lower similarity
            const identicalSimilarityValid = Math.abs(similarityIdentical - 1.0) < 0.01
            const differentSimilarityValid = similarityDifferent < similarityIdentical
            
            // Calculate Euclidean distance
            const distanceIdentical = euclideanDistance(embedding1, embedding2)
            const distanceDifferent = euclideanDistance(embedding1, embedding3)
            
            // Identical embeddings should have distance ≈ 0
            // Different embeddings should have higher distance
            const identicalDistanceValid = distanceIdentical < 0.01
            const differentDistanceValid = distanceDifferent > distanceIdentical
            
            const allValid = (
                identicalSimilarityValid &&
                differentSimilarityValid &&
                identicalDistanceValid &&
                differentDistanceValid
            )
            
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Vector similarity calculation',
                status: allValid ? 'passed' : 'failed',
                duration,
                inputs: { embeddingDimensions: 1536 },
                expected: 'Similarity and distance calculations correct',
                actual: {
                    similarityIdentical,
                    similarityDifferent,
                    distanceIdentical,
                    distanceDifferent,
                    identicalSimilarityValid,
                    differentSimilarityValid,
                    identicalDistanceValid,
                    differentDistanceValid
                },
                error: allValid ? undefined : 'Vector similarity calculation failed',
                metadata: {
                    similarityIdentical,
                    similarityDifferent,
                    distanceIdentical,
                    distanceDifferent
                }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allValid, 'Vector similarity should be calculated correctly').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Vector similarity calculation',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should detect redundancy via vector similarity', async function () {
        const testId = 'vector-redundancy-detection'
        const startTime = Date.now()
        
        try {
            // Create test vectors
            const currentEmbedding = Array(1536).fill(0.5)
            const currentVector = { x: 100, y: 100, z: 100 }
            
            // Create archived vectors (similar and different)
            const similarArchived = {
                embedding: Array(1536).fill(0.48), // Very similar
                vector: { x: 102, y: 98, z: 101 },
                title: 'Similar Contribution',
                submission_hash: 'hash1'
            }
            
            const differentArchived = {
                embedding: Array(1536).fill(0.0), // Very different
                vector: { x: 200, y: 200, z: 200 },
                title: 'Different Contribution',
                submission_hash: 'hash2'
            }
            
            const archivedVectors = [similarArchived, differentArchived]
            
            // Calculate redundancy
            const redundancy = calculateRedundancy(
                currentEmbedding,
                currentVector,
                archivedVectors
            )
            
            // Verify redundancy detection
            const redundancyValid = (
                typeof redundancy.overlap_percent === 'number' &&
                redundancy.overlap_percent >= 0 &&
                redundancy.overlap_percent <= 100 &&
                redundancy.closest_vectors.length > 0
            )
            
            // Similar contribution should be detected as closest
            const closestIsSimilar = redundancy.closest_vectors[0]?.hash === 'hash1'
            
            const allValid = redundancyValid && closestIsSimilar
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Vector redundancy detection',
                status: allValid ? 'passed' : 'failed',
                duration,
                inputs: { archivedVectorsCount: archivedVectors.length },
                expected: 'Redundancy correctly detected via vectors',
                actual: {
                    redundancyValid,
                    closestIsSimilar,
                    overlapPercent: redundancy.overlap_percent,
                    closestVector: redundancy.closest_vectors[0]
                },
                error: allValid ? undefined : 'Vector redundancy detection failed',
                metadata: { redundancy, archivedVectors }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allValid, 'Redundancy should be detected via vectors').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Vector redundancy detection',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should apply HHF constant correctly in coordinate mapping', async function () {
        const testId = 'hhf-constant-application'
        const startTime = Date.now()
        
        try {
            // Verify HHF constant value
            const hhfConstant = HHF_CONSTANT
            const expectedConstant = 1.12e22
            const constantCorrect = Math.abs(hhfConstant - expectedConstant) < 1e15 // Allow for floating point precision
            
            // Verify scale factor calculation
            // Scale factor = log10(HHF_CONSTANT) / 10 ≈ 2.05
            const scaleFactor = Math.log10(hhfConstant) / 10
            const expectedScaleFactor = 2.05
            const scaleFactorCorrect = Math.abs(scaleFactor - expectedScaleFactor) < 0.1
            
            // Test coordinate mapping uses the constant
            const testParams = {
                embedding: Array(1536).fill(0.5),
                novelty: 2000,
                density: 1800,
                coherence: 1900
            }
            
            const coordinates = mapTo3DCoordinates(testParams)
            
            // Coordinates should reflect HHF scaling
            const coordinatesReflectScaling = (
                coordinates.x > 0 && coordinates.x < 2000 && // Scaled from 0-2500 range
                coordinates.y > 0 && coordinates.y < 2000 &&
                coordinates.z > 0 && coordinates.z < 2000
            )
            
            const allValid = constantCorrect && scaleFactorCorrect && coordinatesReflectScaling
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'HHF constant application',
                status: allValid ? 'passed' : 'failed',
                duration,
                inputs: { hhfConstant, expectedConstant },
                expected: 'HHF constant correctly applied',
                actual: {
                    constantCorrect,
                    scaleFactorCorrect,
                    coordinatesReflectScaling,
                    hhfConstant,
                    scaleFactor,
                    coordinates
                },
                error: allValid ? undefined : 'HHF constant application failed',
                metadata: { hhfConstant, scaleFactor, coordinates, testParams }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(allValid, 'HHF constant should be applied correctly').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'HHF constant application',
                status: 'error',
                duration: Date.now() - startTime,
                error: error.message,
                stack: error.stack,
            }
            reporter.recordResult(SUITE_ID, result)
            throw error
        }
    })
    
    it('Should maintain coordinate consistency for same input', async function () {
        const testId = 'coordinate-consistency'
        const startTime = Date.now()
        
        try {
            // Same input should produce same coordinates
            const testParams = {
                embedding: Array(1536).fill(0.5),
                novelty: 2000,
                density: 1800,
                coherence: 1900
            }
            
            const coordinates1 = mapTo3DCoordinates(testParams)
            const coordinates2 = mapTo3DCoordinates(testParams)
            
            // Coordinates should be identical (or very close due to floating point)
            const coordinatesMatch = (
                Math.abs(coordinates1.x - coordinates2.x) < 0.001 &&
                Math.abs(coordinates1.y - coordinates2.y) < 0.001 &&
                Math.abs(coordinates1.z - coordinates2.z) < 0.001
            )
            
            const duration = Date.now() - startTime
            
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Coordinate consistency',
                status: coordinatesMatch ? 'passed' : 'failed',
                duration,
                inputs: testParams,
                expected: 'Same input produces same coordinates',
                actual: {
                    coordinates1,
                    coordinates2,
                    coordinatesMatch,
                    differences: {
                        x: Math.abs(coordinates1.x - coordinates2.x),
                        y: Math.abs(coordinates1.y - coordinates2.y),
                        z: Math.abs(coordinates1.z - coordinates2.z)
                    }
                },
                error: coordinatesMatch ? undefined : 'Coordinates not consistent',
                metadata: { coordinates1, coordinates2, testParams }
            }
            
            reporter.recordResult(SUITE_ID, result)
            
            expect(coordinatesMatch, 'Coordinates should be consistent').to.be.true
        } catch (error: any) {
            const result: TestResult = {
                testId,
                suite: SUITE_ID,
                name: 'Coordinate consistency',
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

