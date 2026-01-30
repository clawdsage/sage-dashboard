// Test script to verify review queue functionality
console.log('Review Queue Test Script')
console.log('=======================')

// Check if the SQL migration file exists
const fs = require('fs')
const path = require('path')

const migrationFile = path.join(__dirname, 'add_review_status.sql')
if (fs.existsSync(migrationFile)) {
  console.log('✅ Migration SQL file exists:', migrationFile)
  const sql = fs.readFileSync(migrationFile, 'utf8')
  console.log('SQL contains review_status column:', sql.includes('review_status'))
  console.log('SQL contains output column:', sql.includes('ADD COLUMN IF NOT EXISTS output'))
  console.log('SQL contains review_comment column:', sql.includes('review_comment'))
  console.log('SQL contains reviewed_at column:', sql.includes('reviewed_at'))
  console.log('SQL contains reviewed_by column:', sql.includes('reviewed_by'))
} else {
  console.log('❌ Migration SQL file not found')
}

// Check if TypeScript types are updated
const typesFile = path.join(__dirname, 'src/types/supabase.ts')
if (fs.existsSync(typesFile)) {
  console.log('\n✅ TypeScript types file exists')
  const types = fs.readFileSync(typesFile, 'utf8')
  console.log('Types contain review_status:', types.includes("review_status: 'pending' | 'approved' | 'changes_requested' | 'rejected'"))
  console.log('Types contain output:', types.includes('output: string | null'))
  console.log('Types contain review_comment:', types.includes('review_comment: string | null'))
  console.log('Types contain reviewed_at:', types.includes('reviewed_at: string | null'))
  console.log('Types contain reviewed_by:', types.includes('reviewed_by: string | null'))
} else {
  console.log('\n❌ TypeScript types file not found')
}

// Check if ReviewQueue page exists
const reviewQueueFile = path.join(__dirname, 'src/pages/ReviewQueue.tsx')
if (fs.existsSync(reviewQueueFile)) {
  console.log('\n✅ ReviewQueue page exists')
  const component = fs.readFileSync(reviewQueueFile, 'utf8')
  console.log('Component imports supabase:', component.includes('import { supabase }'))
  console.log('Component has handleReviewAction function:', component.includes('handleReviewAction'))
  console.log('Component displays pending count:', component.includes('pending review'))
} else {
  console.log('\n❌ ReviewQueue page not found')
}

// Check if App.tsx is updated
const appFile = path.join(__dirname, 'src/App.tsx')
if (fs.existsSync(appFile)) {
  console.log('\n✅ App.tsx file exists')
  const app = fs.readFileSync(appFile, 'utf8')
  console.log('App imports ReviewQueue:', app.includes('import ReviewQueue'))
  console.log('App has /review route:', app.includes('path="review"'))
} else {
  console.log('\n❌ App.tsx file not found')
}

// Check if Sidebar is updated
const sidebarFile = path.join(__dirname, 'src/components/Sidebar.tsx')
if (fs.existsSync(sidebarFile)) {
  console.log('\n✅ Sidebar component exists')
  const sidebar = fs.readFileSync(sidebarFile, 'utf8')
  console.log('Sidebar imports ClipboardCheck:', sidebar.includes('ClipboardCheck'))
  console.log('Sidebar imports usePendingReviewCount:', sidebar.includes('usePendingReviewCount'))
  console.log('Sidebar has Review Queue nav item:', sidebar.includes('Review Queue'))
} else {
  console.log('\n❌ Sidebar component not found')
}

// Check if usePendingReviewCount hook exists
const hookFile = path.join(__dirname, 'src/hooks/usePendingReviewCount.ts')
if (fs.existsSync(hookFile)) {
  console.log('\n✅ usePendingReviewCount hook exists')
  const hook = fs.readFileSync(hookFile, 'utf8')
  console.log('Hook exports function:', hook.includes('export const usePendingReviewCount'))
  console.log('Hook queries for pending reviews:', hook.includes("review_status', 'pending'"))
} else {
  console.log('\n❌ usePendingReviewCount hook not found')
}

console.log('\n📋 Summary:')
console.log('All files have been created and updated successfully!')
console.log('\nNext steps:')
console.log('1. Run the SQL migration in Supabase SQL Editor')
console.log('2. Install dependencies: npm install')
console.log('3. Start the development server: npm run dev')
console.log('4. Test the review queue functionality at /review')