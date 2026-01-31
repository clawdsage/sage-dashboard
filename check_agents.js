import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntoityjqxvhfpmtfpdwc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50b2l0eWpxeHZoZnBtdGZwZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MTgyNTEsImV4cCI6MjA1Mzk5NDI1MX0.uhnL5jNiZ0N4-eOL2b6mWo-E9xgq_Z4KMdQYGt8u7wI'
)

const { data, error } = await supabase
  .from('subagent_runs')
  .select('id, name, status, started_at')
  .order('started_at', { ascending: false })

if (error) {
  console.error('Error:', error)
} else {
  console.log('Total agents in DB:', data.length)
  console.log('\nAgents:')
  data.forEach((agent, i) => {
    console.log(`${i+1}. ${agent.name} - ${agent.status} - ${agent.started_at}`)
  })
}
