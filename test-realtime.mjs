import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kunkqedkkpwaspsucytj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bmtxZWRra3B3YXNwc3VjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Mzg4MTgsImV4cCI6MjA4NTMxNDgxOH0.gLXr1NCOSaLKGySozsDKJucOhtEDrm1OOfmbj7Z7-1o'

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
