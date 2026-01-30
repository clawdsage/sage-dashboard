#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * Run this after setting up your .env.local file to verify everything is configured correctly
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔍 Supabase Setup Verification\n')

// Try to load .env.local
let envContent = ''
try {
  envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8')
} catch (error) {
  console.error('❌ .env.local file not found!')
  console.log('\n📝 To fix this:')
  console.log('   1. Copy .env.example to .env.local')
  console.log('   2. Add your Supabase credentials')
  console.log('   3. Run this script again\n')
  process.exit(1)
}

// Parse environment variables
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY

// Check if credentials are set
if (!supabaseUrl || supabaseUrl.includes('your_supabase_project_url_here')) {
  console.error('❌ VITE_SUPABASE_URL is not set or still contains placeholder')
  console.log('\n📝 To fix this:')
  console.log('   1. Go to supabase.com and create/open your project')
  console.log('   2. Copy your Project URL from Settings > API')
  console.log('   3. Update VITE_SUPABASE_URL in .env.local\n')
  process.exit(1)
}

if (!supabaseKey || supabaseKey.includes('your_supabase_anon_key_here')) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set or still contains placeholder')
  console.log('\n📝 To fix this:')
  console.log('   1. Go to supabase.com and open your project')
  console.log('   2. Copy your anon key from Settings > API')
  console.log('   3. Update VITE_SUPABASE_ANON_KEY in .env.local\n')
  process.exit(1)
}

console.log('✅ Environment variables configured')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`)

// Test connection
console.log('🔌 Testing connection to Supabase...')

const supabase = createClient(supabaseUrl, supabaseKey)

try {
  // Try to query projects table
  const { data, error, count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('❌ Connection error:', error.message)
    console.log('\n📝 Possible issues:')
    console.log('   - Database schema not set up (run SQL from SUPABASE_SETUP.md)')
    console.log('   - Incorrect credentials')
    console.log('   - Network connectivity issue\n')
    process.exit(1)
  }

  console.log('✅ Successfully connected to Supabase')
  console.log(`   Found ${count} projects in database\n`)

  // Check other tables
  console.log('📊 Checking database tables...')
  
  const tables = ['projects', 'tasks', 'subagent_runs', 'activity_log']
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`   ❌ ${table}: Error (${error.message})`)
    } else {
      console.log(`   ✅ ${table}: ${count} records`)
    }
  }

  console.log('\n🎉 Setup verification complete!')
  console.log('\n📋 Next steps:')
  console.log('   1. Run: npm run dev')
  console.log('   2. Open: http://localhost:5173')
  console.log('   3. Your dashboard should now display real data!\n')

} catch (error) {
  console.error('❌ Unexpected error:', error.message)
  console.log('\n📝 Please check:')
  console.log('   - Your internet connection')
  console.log('   - Supabase project is running')
  console.log('   - Credentials are correct\n')
  process.exit(1)
}
