# Sage Dashboard

A modern, professional dashboard for tracking and managing AI sub-agent work. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Real-time Monitoring**: Track active sub-agents, their progress, and resource usage
- **Project Management**: Organize AI projects with status tracking and deadlines
- **Review Queue**: Approve, reject, or request changes for sub-agent outputs with feedback
- **Analytics Dashboard**: Visualize performance metrics and costs
- **Team Collaboration**: Manage team members and their access levels
- **Dark Theme**: Professional dark theme optimized for long sessions
- **Mobile Responsive**: Fully responsive design for all devices
- **Performance Optimized**: Fast loading with code splitting and lazy loading
- **Error Resilient**: Robust error handling with retry logic and error boundaries

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Supabase** for backend and real-time database

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (for backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/clawdsage/sage-dashboard.git
   cd sage-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   ```bash
   # Run the SQL schema to create tables
   # Import sage_dashboard_schema.sql to your Supabase project
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verify Setup

To verify your setup is working correctly:

```bash
npm run verify-supabase
```

This will check the connection to Supabase and validate the database schema.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes | - |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes | - |
| `NODE_ENV` | Environment (development/production) | No | `development` |

## Project Structure

```
sage-dashboard/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ErrorBoundary.tsx  # Error handling component
│   │   ├── Layout.tsx         # Main layout with sidebar
│   │   └── ... (other components)
│   ├── pages/         # Page components
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Login.tsx          # Login page
│   │   ├── ProjectDetail.tsx  # Project details
│   │   └── ReviewQueue.tsx    # Review queue
│   ├── hooks/         # Custom React hooks
│   │   ├── useRealtimeProjects.ts    # Projects with realtime
│   │   ├── useRealtimeTasks.ts       # Tasks with realtime
│   │   └── ... (other hooks)
│   ├── lib/           # Utilities and API clients
│   │   ├── supabase.ts        # Supabase client
│   │   └── retry.ts           # Retry logic utilities
│   ├── types/         # TypeScript type definitions
│   │   ├── index.ts           # Application types
│   │   └── supabase.ts        # Generated Supabase types
│   ├── App.tsx        # Main app component with routing
│   ├── main.tsx       # Entry point with error boundary
│   └── index.css      # Global styles with Tailwind
├── public/            # Static assets
├── .env.example       # Example environment variables
├── .env.local         # Local environment variables (gitignored)
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # Tailwind configuration
└── tsconfig.json      # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run verify-supabase` - Verify Supabase connection and setup

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, optimized for production with:
- Code splitting and lazy loading
- Minified JavaScript and CSS
- Tree-shaken imports
- Optimized assets

## Performance Features

### Code Splitting
- Route-based code splitting with React.lazy()
- Dynamic imports for better initial load time
- Suspense fallbacks for smooth loading experience

### Bundle Optimization
- Tree shaking to remove unused code
- Minification and compression
- Chunk splitting for better caching

### Runtime Performance
- React.memo for expensive components
- useCallback for event handlers
- useMemo for computed values
- Virtualized lists for large datasets (recommended)

### Error Handling
- Global error boundary to prevent crashes
- Retry logic with exponential backoff
- User-friendly error messages
- Offline detection and handling

## Database Schema

The application uses the following main tables:

### Projects
- `id` (uuid, primary key)
- `name` (text)
- `description` (text)
- `status` (text: planning/in-progress/review/completed)
- `priority` (text: low/medium/high/critical)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tasks
- `id` (uuid, primary key)
- `project_id` (uuid, foreign key)
- `title` (text)
- `description` (text)
- `status` (text: pending/in-progress/completed)
- `assigned_to` (text)
- `due_date` (timestamp)

### Subagent Runs
- `id` (uuid, primary key)
- `project_id` (uuid, foreign key)
- `task_id` (uuid, foreign key)
- `name` (text)
- `status` (text: pending/active/completed/failed)
- `progress` (integer)
- `output` (text)
- `review_status` (text: pending/approved/rejected/changes_requested)
- `cost` (decimal)
- `tokens_used` (integer)
- `api_calls` (integer)

### Activity Log
- `id` (uuid, primary key)
- `type` (text)
- `message` (text)
- `project_id` (uuid, foreign key)
- `task_id` (uuid, foreign key)
- `subagent_run_id` (uuid, foreign key)
- `created_at` (timestamp)

## Deployment

### Vercel (Recommended)
This project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The application can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

### Environment Variables in Production
Make sure to set these environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Development

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Create custom hooks in `src/hooks/` for business logic
4. Update types in `src/types/` as needed
5. Add tests for new functionality

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Write descriptive component and function names
- Add comments for complex logic

### Testing
See [TESTING.md](./TESTING.md) for comprehensive testing guidelines.

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Errors
**Symptoms**: "Missing Supabase environment variables" error
**Solution**:
```bash
# Check if .env.local exists
ls -la .env.local

# If missing, copy from example
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

#### 2. Database Schema Issues
**Symptoms**: Tables not found or permission errors
**Solution**:
1. Run the SQL schema in Supabase SQL editor
2. Check table permissions in Supabase dashboard
3. Verify RLS (Row Level Security) policies

#### 3. Build Errors
**Symptoms**: npm run build fails
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run lint
```

#### 4. Real-time Updates Not Working
**Symptoms**: Data doesn't update automatically
**Solution**:
1. Check Supabase realtime is enabled for tables
2. Verify WebSocket connection in browser dev tools
3. Check console for subscription errors

### Performance Issues

#### Slow Initial Load
- Check bundle size with `npm run build -- --analyze`
- Implement lazy loading for large components
- Optimize images and assets

#### Slow Real-time Updates
- Reduce frequency of updates if possible
- Implement debouncing for rapid updates
- Check network latency to Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT

## Acknowledgments

- Icons by [Lucide](https://lucide.dev)
- Fonts by [Google Fonts](https://fonts.google.com)
- Design inspired by modern SaaS dashboards
- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

*Last Updated: January 30, 2025*  
*Version: 1.0.0*