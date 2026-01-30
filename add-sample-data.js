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

async function addSampleData() {
  console.log('Adding sample data to Sage Dashboard...')

  // Add Sage Dashboard project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: 'Sage Dashboard',
      description: 'AI project management dashboard with realtime updates',
      status: 'in-progress',
      priority: 'high'
    })
    .select()
    .single()

  if (projectError) {
    console.error('Error creating project:', projectError)
    return
  }

  console.log('✅ Project created:', project.name)

  // Add tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .insert([
      {
        project_id: project.id,
        title: 'Build React foundation',
        description: 'Set up Vite, TypeScript, Tailwind',
        status: 'completed',
        priority: 'high',
        assigned_to: 'DeepSeek Coder'
      },
      {
        project_id: project.id,
        title: 'Integrate Supabase',
        description: 'Add realtime subscriptions and database',
        status: 'completed',
        priority: 'high',
        assigned_to: 'DeepSeek Coder'
      },
      {
        project_id: project.id,
        title: 'Add logging module',
        description: 'Create system to track sub-agent work',
        status: 'pending',
        priority: 'medium',
        assigned_to: 'DeepSeek Coder'
      }
    ])
    .select()

  console.log(`✅ ${tasks.length} tasks created`)

  // Add sub-agent runs
  await supabase.from('subagent_runs').insert([
    {
      project_id: project.id,
      task_id: tasks[0].id,
      name: 'dashboard-foundation',
      status: 'completed',
      task_description: 'Build React app with Vite and Tailwind',
      progress: 100,
      tokens_used: 42300,
      api_calls: 1,
      cost: 0.00
    },
    {
      project_id: project.id,
      task_id: tasks[1].id,
      name: 'dashboard-supabase-setup',
      status: 'completed',
      task_description: 'Integrate Supabase with realtime subscriptions',
      progress: 100,
      tokens_used: 48100,
      api_calls: 1,
      cost: 0.00
    }
  ])

  console.log('✅ Sub-agent runs added')

  // Add activity log
  await supabase.from('activity_log').insert([
    {
      type: 'project_created',
      message: 'Sage Dashboard project created',
      project_id: project.id
    },
    {
      type: 'agent_started',
      message: 'DeepSeek Coder started building foundation',
      project_id: project.id,
      task_id: tasks[0].id
    },
    {
      type: 'agent_completed',
      message: 'Foundation complete - deployed to Vercel',
      project_id: project.id,
      task_id: tasks[0].id
    },
    {
      type: 'agent_completed',
      message: 'Supabase integration complete with realtime updates',
      project_id: project.id,
      task_id: tasks[1].id
    }
  ])

  console.log('✅ Activity log populated')
  console.log('\n🎉 Sample data added successfully!')
}

addSampleData()
