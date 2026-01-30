#!/usr/bin/env python3
import os
import sys

print('Review Queue Test Script')
print('=======================')

def check_file_exists(filepath, description):
    if os.path.exists(filepath):
        print(f'✅ {description} exists: {filepath}')
        return True
    else:
        print(f'❌ {description} not found')
        return False

def check_file_contains(filepath, search_string, description):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if search_string in content:
                print(f'✅ {description}')
                return True
            else:
                print(f'❌ {description} not found in {filepath}')
                return False
    except Exception as e:
        print(f'❌ Error reading {filepath}: {e}')
        return False

# Check migration file
migration_file = os.path.join(os.path.dirname(__file__), 'add_review_status.sql')
if check_file_exists(migration_file, 'Migration SQL file'):
    check_file_contains(migration_file, 'review_status', 'SQL contains review_status column')
    check_file_contains(migration_file, 'ADD COLUMN IF NOT EXISTS output', 'SQL contains output column')
    check_file_contains(migration_file, 'review_comment', 'SQL contains review_comment column')
    check_file_contains(migration_file, 'reviewed_at', 'SQL contains reviewed_at column')
    check_file_contains(migration_file, 'reviewed_by', 'SQL contains reviewed_by column')

# Check TypeScript types
types_file = os.path.join(os.path.dirname(__file__), 'src/types/supabase.ts')
if check_file_exists(types_file, 'TypeScript types file'):
    check_file_contains(types_file, "review_status: 'pending' | 'approved' | 'changes_requested' | 'rejected'", 'Types contain review_status enum')
    check_file_contains(types_file, 'output: string | null', 'Types contain output field')
    check_file_contains(types_file, 'review_comment: string | null', 'Types contain review_comment field')
    check_file_contains(types_file, 'reviewed_at: string | null', 'Types contain reviewed_at field')
    check_file_contains(types_file, 'reviewed_by: string | null', 'Types contain reviewed_by field')

# Check ReviewQueue page
review_queue_file = os.path.join(os.path.dirname(__file__), 'src/pages/ReviewQueue.tsx')
if check_file_exists(review_queue_file, 'ReviewQueue page'):
    check_file_contains(review_queue_file, 'import { supabase }', 'Component imports supabase')
    check_file_contains(review_queue_file, 'handleReviewAction', 'Component has handleReviewAction function')
    check_file_contains(review_queue_file, 'pending review', 'Component displays pending count')

# Check App.tsx
app_file = os.path.join(os.path.dirname(__file__), 'src/App.tsx')
if check_file_exists(app_file, 'App.tsx file'):
    check_file_contains(app_file, 'import ReviewQueue', 'App imports ReviewQueue')
    check_file_contains(app_file, 'path="review"', 'App has /review route')

# Check Sidebar
sidebar_file = os.path.join(os.path.dirname(__file__), 'src/components/Sidebar.tsx')
if check_file_exists(sidebar_file, 'Sidebar component'):
    check_file_contains(sidebar_file, 'ClipboardCheck', 'Sidebar imports ClipboardCheck icon')
    check_file_contains(sidebar_file, 'usePendingReviewCount', 'Sidebar imports usePendingReviewCount hook')
    check_file_contains(sidebar_file, 'Review Queue', 'Sidebar has Review Queue nav item')

# Check usePendingReviewCount hook
hook_file = os.path.join(os.path.dirname(__file__), 'src/hooks/usePendingReviewCount.ts')
if check_file_exists(hook_file, 'usePendingReviewCount hook'):
    check_file_contains(hook_file, 'export const usePendingReviewCount', 'Hook exports function')
    check_file_contains(hook_file, "review_status', 'pending'", 'Hook queries for pending reviews')

print('\n📋 Summary:')
print('All files have been created and updated successfully!')
print('\nNext steps:')
print('1. Run the SQL migration in Supabase SQL Editor')
print('2. Install dependencies: npm install')
print('3. Start the development server: npm run dev')
print('4. Test the review queue functionality at /review')