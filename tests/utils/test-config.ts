/**
 * Test Configuration
 * Centralized configuration for all test suites
 */

export interface TestConfig {
    // Hardhat Configuration - Emulating Base Mainnet (Forking)
    hardhat: {
        network: 'hardhat' // Hardhat network forking Base Mainnet
        rpcUrl: string // Hardhat local RPC (http://127.0.0.1:8545)
        forkUrl: string // Base Mainnet RPC to fork from
        chainId: number // 8453 (Base Mainnet chain ID)
        accounts: string[]
        useForking: boolean // true = Hardhat forks Base Mainnet (emulates Base)
    }
    
    // Database Configuration
    database: {
        url: string
        resetBetweenTests: boolean
    }
    
    // Evaluation Configuration
    evaluation: {
        grokApiKey: string
        deterministicMode: boolean
        maxRetries: number
    }
    
    // Test Execution
    execution: {
        parallel: boolean
        timeout: number
        retries: number
    }
    
    // Reporting
    reporting: {
        outputDir: string
        format: 'json' | 'html' | 'both'
        includeScreenshots: boolean
    }
    
    // Security Testing
    security: {
        maxConcurrentRequests: number
        attackVectorCount: number
        loadTestDuration: number // seconds
    }
}

export const defaultTestConfig: TestConfig = {
    hardhat: {
        // HARDHAT EMULATING BASE MAINNET (Forking)
        // Hardhat forks Base Mainnet to emulate Base for testing
        network: 'hardhat', // Always use Hardhat network
        rpcUrl: 'http://127.0.0.1:8545', // Hardhat local RPC
        forkUrl: process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org', // Base Mainnet to fork
        chainId: 8453, // Base Mainnet chain ID (Hardhat emulates this)
        accounts: [], // Hardhat default accounts (will be populated)
        useForking: true, // Hardhat forks Base Mainnet (emulates Base)
    },
    database: {
        // VERCEL SERVER DATABASE - Uses Vercel environment variables
        url: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
        resetBetweenTests: false, // Set to true for isolated tests
    },
    evaluation: {
        grokApiKey: process.env.NEXT_PUBLIC_GROK_API_KEY || '',
        deterministicMode: true,
        maxRetries: 3,
    },
    execution: {
        parallel: false,
        timeout: 300000, // 5 minutes
        retries: 1,
    },
    reporting: {
        // VERCEL SERVER REPORTS - Stored in /tmp on Vercel (writable directory)
        outputDir: process.env.VERCEL ? '/tmp/tests/reports' : './tests/reports',
        format: 'both',
        includeScreenshots: true,
    },
    security: {
        maxConcurrentRequests: 100,
        attackVectorCount: 50,
        loadTestDuration: 60, // 1 minute
    },
}

export function getTestConfig(): TestConfig {
    return defaultTestConfig
}

