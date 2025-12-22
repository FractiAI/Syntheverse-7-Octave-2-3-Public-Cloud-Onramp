#!/usr/bin/env node

/**
 * Basic setup verification script for Syntheverse PoC
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Syntheverse PoC - Basic Setup Check\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: Not in project root directory (package.json not found)');
    process.exit(1);
}

// Check package.json
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json found');
    console.log(`   Project: ${packageJson.name}`);
    console.log(`   Version: ${packageJson.version}`);
} catch (error) {
    console.error('❌ Error reading package.json:', error.message);
}

// Check environment files
const envFiles = ['.env.example', '.env.local', '.env'];
const envStatus = envFiles.map(file => ({
    file,
    exists: fs.existsSync(file)
}));

console.log('\n📄 Environment Files:');
envStatus.forEach(({ file, exists }) => {
    if (exists) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`⚠️  ${file} missing`);
    }
});

// Check key directories
const directories = ['app', 'components', 'utils', 'public'];
console.log('\n📁 Key Directories:');
directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/ directory exists`);
    } else {
        console.log(`❌ ${dir}/ directory missing`);
    }
});

// Check node_modules
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules exists (dependencies installed)');
} else {
    console.log('⚠️  node_modules missing - run "npm install"');
}

// Check database schema
const schemaPath = 'utils/db/schema.ts';
if (fs.existsSync(schemaPath)) {
    console.log('✅ Database schema found');
} else {
    console.log('❌ Database schema missing');
}

// Check key app files
const keyFiles = [
    'app/page.tsx',
    'app/layout.tsx',
    'app/dashboard/page.tsx',
    'app/login/page.tsx',
    'app/signup/page.tsx',
    'components/Navigation.tsx',
    'utils/supabase/client.ts'
];

console.log('\n📄 Key Application Files:');
keyFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

console.log('\n🎯 Next Steps:');
console.log('1. Run "npm install" to install dependencies');
console.log('2. Copy .env.example to .env.local and add your API keys');
console.log('3. Run "npm run db:migrate" to set up the database');
console.log('4. Run "npm run dev" to start the development server');
console.log('5. Visit http://localhost:3000 to test the application');

console.log('\n📖 For detailed instructions, see LOCAL_TESTING.md');

