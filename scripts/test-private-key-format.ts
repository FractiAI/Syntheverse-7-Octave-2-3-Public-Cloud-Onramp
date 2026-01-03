/**
 * Test Private Key Format
 * 
 * This script tests if private keys with and without 0x prefix work correctly with ethers.js
 */

import { ethers } from 'ethers'
import { config } from 'dotenv'

config()

async function testPrivateKeyFormat() {
    console.log('🔍 Testing private key format with ethers.js...\n')
    
    // Test private key (without 0x)
    const privateKeyWithout0x = '567ecbca259b95e7768e70eb070806c6cec704573a238527702d63af3d15490d'
    const privateKeyWith0x = '0x567ecbca259b95e7768e70eb070806c6cec704573a238527702d63af3d15490d'
    
    console.log('📝 Testing private key WITHOUT 0x prefix:')
    console.log(`   Key: ${privateKeyWithout0x.substring(0, 20)}...`)
    
    try {
        const wallet1 = new ethers.Wallet(privateKeyWithout0x)
        const address1 = await wallet1.getAddress()
        console.log(`   ✅ Wallet created successfully`)
        console.log(`   Address: ${address1}`)
    } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`)
    }
    
    console.log('\n📝 Testing private key WITH 0x prefix:')
    console.log(`   Key: ${privateKeyWith0x.substring(0, 22)}...`)
    
    try {
        const wallet2 = new ethers.Wallet(privateKeyWith0x)
        const address2 = await wallet2.getAddress()
        console.log(`   ✅ Wallet created successfully`)
        console.log(`   Address: ${address2}`)
    } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`)
    }
    
    // Compare addresses
    try {
        const wallet1 = new ethers.Wallet(privateKeyWithout0x)
        const wallet2 = new ethers.Wallet(privateKeyWith0x)
        const address1 = await wallet1.getAddress()
        const address2 = await wallet2.getAddress()
        
        console.log('\n🔍 Comparison:')
        console.log(`   Without 0x: ${address1}`)
        console.log(`   With 0x:    ${address2}`)
        
        if (address1.toLowerCase() === address2.toLowerCase()) {
            console.log('   ✅ Both formats produce the SAME address')
        } else {
            console.log('   ⚠️  WARNING: Different addresses! This could be the issue.')
        }
        
        // Check against expected owner
        const expectedOwner = '0x3563388d0E1c2D66A004E5E57717dc6D7e568BE3'
        console.log(`\n👤 Expected contract owner: ${expectedOwner}`)
        
        if (address1.toLowerCase() === expectedOwner.toLowerCase()) {
            console.log('   ✅ Address WITHOUT 0x matches contract owner')
        } else if (address2.toLowerCase() === expectedOwner.toLowerCase()) {
            console.log('   ✅ Address WITH 0x matches contract owner')
        } else {
            console.log('   ❌ Neither address matches contract owner!')
            console.log('   ⚠️  This is likely the root cause of require(false) errors')
        }
        
    } catch (error: any) {
        console.log(`   ❌ Error comparing: ${error.message}`)
    }
}

testPrivateKeyFormat()
    .then(() => {
        console.log('\n✅ Test complete')
        process.exit(0)
    })
    .catch(error => {
        console.error('❌ Test failed:', error)
        process.exit(1)
    })

