import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealtime() {
  console.log('🧪 Testing realtime updates...')
  console.log('👀 Watch your dashboard - new activity should appear!')
  
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('name', 'Sage Dashboard')
    .single()

  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      type: 'agent_started',
      message: '🧪 Testing realtime updates - can you see this?',
      project_id: project.id
    })
    .select()

  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Activity added! Should appear on your dashboard NOW!')
  }
}

testRealtime()
