# Supabase Setup for Sage Dashboard

This guide will help you set up Supabase as the backend for your Sage Dashboard.

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in/create an account
2. Click "New Project"
3. Enter project details:
   - **Name:** `sage-dashboard` (or your preferred name)
   - **Database Password:** Create a strong password and save it securely
   - **Region:** Choose the region closest to your users
   - **Pricing Plan:** Start with the Free tier

4. Click "Create new project" (this may take a few minutes)

## Step 2: Get Your API Keys

Once your project is created:

1. Go to **Project Settings** (gear icon in the sidebar)
2. Click on **API** in the left menu
3. Copy the following values:
   - **Project URL** (under "Configuration" → "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Set Up Database Schema

Run the following SQL in the Supabase SQL Editor:

1. Go to **SQL Editor** in the sidebar
2. Click "New query"
3. Copy and paste the SQL below:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create tables
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'review', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS subagent_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'completed', 'error')),
  task_description TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  tokens_used INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('agent_started', 'agent_completed', 'project_created', 'task_created', 'task_completed', 'error')),
  message TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  subagent_run_id UUID REFERENCES subagent_runs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_subagent_runs_status ON subagent_runs(status);
CREATE INDEX IF NOT EXISTS idx_subagent_runs_project_id ON subagent_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subagent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
CREATE POLICY "Allow public read access to projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to subagent_runs" ON subagent_runs
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to activity_log" ON activity_log
  FOR SELECT USING (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE subagent_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subagent_runs_updated_at BEFORE UPDATE ON subagent_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click "Run" to execute the SQL

## Step 4: Add Sample Data (Optional)

Run this SQL to add sample data:

```sql
-- Insert sample projects
INSERT INTO projects (name, description, status, priority) VALUES
  ('Website Redesign', 'Complete overhaul of company website', 'in-progress', 'high'),
  ('Marketing Campaign', 'Q2 social media marketing campaign', 'planning', 'medium'),
  ('API Integration', 'Integrate with third-party payment processor', 'review', 'critical'),
  ('Mobile App', 'New iOS and Android application', 'in-progress', 'high');

-- Insert sample tasks
INSERT INTO tasks (project_id, title, description, status, priority) VALUES
  ((SELECT id FROM projects WHERE name = 'Website Redesign'), 'Design homepage', 'Create new homepage layout', 'completed', 'high'),
  ((SELECT id FROM projects WHERE name = 'Website Redesign'), 'Implement contact form', 'Add contact form with validation', 'in-progress', 'medium'),
  ((SELECT id FROM projects WHERE name = 'Marketing Campaign'), 'Create social media posts', 'Design posts for Instagram and Twitter', 'pending', 'low');

-- Insert sample subagent runs
INSERT INTO subagent_runs (project_id, task_id, name, status, progress, tokens_used, cost) VALUES
  ((SELECT id FROM projects WHERE name = 'Website Redesign'), (SELECT id FROM tasks WHERE title = 'Design homepage'), 'Design Agent', 'completed', 100, 1250, 0.25),
  ((SELECT id FROM projects WHERE name = 'Website Redesign'), (SELECT id FROM tasks WHERE title = 'Implement contact form'), 'Code Agent', 'active', 65, 850, 0.17);

-- Insert sample activity
INSERT INTO activity_log (type, message, project_id) VALUES
  ('project_created', 'Website Redesign project created', (SELECT id FROM projects WHERE name = 'Website Redesign')),
  ('agent_started', 'Design Agent started working on homepage', (SELECT id FROM projects WHERE name = 'Website Redesign')),
  ('agent_completed', 'Design Agent completed homepage design', (SELECT id FROM projects WHERE name = 'Website Redesign'));
```

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 6: Deploy to Vercel (Optional)

If deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the same variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Redeploy your application

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`
3. The dashboard should now display real data from Supabase
4. Any changes made in the Supabase database will automatically update in the dashboard

## Troubleshooting

### Realtime not working?
- Ensure you've enabled Realtime for your tables (Step 3 SQL includes this)
- Check that your tables are included in the `supabase_realtime` publication

### Authentication errors?
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check that Row Level Security policies allow public read access

### Database connection issues?
- Ensure your Supabase project is running (check project status)
- Verify network connectivity to Supabase

## Next Steps

- Implement authentication for user-specific data
- Add write operations (create/update/delete)
- Set up database backups
- Monitor usage and upgrade plan if needed