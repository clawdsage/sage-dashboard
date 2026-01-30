# Sage Dashboard

A modern, professional dashboard for tracking and managing AI sub-agent work. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Real-time Monitoring**: Track active sub-agents, their progress, and resource usage
- **Project Management**: Organize AI projects with status tracking and deadlines
- **Analytics Dashboard**: Visualize performance metrics and costs
- **Team Collaboration**: Manage team members and their access levels
- **Dark Theme**: Professional dark theme optimized for long sessions

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

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

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # Utilities and API clients
├── types/         # TypeScript type definitions
├── hooks/         # Custom React hooks
├── App.tsx        # Main app component with routing
├── main.tsx       # Entry point
└── index.css      # Global styles
```

## Color Palette

The dashboard uses a professional dark theme with the following colors:

- **Primary**: Sage green (`#3a9d3a`) for actions and highlights
- **Background**: Deep slate (`#0f172a`) for main background
- **Cards**: Medium slate (`#1e293b`) for card surfaces
- **Sidebar**: Dark slate (`#1a2438`) for sidebar
- **Accent**: Indigo (`#6366f1`) for secondary actions

## Deployment

This project is configured for deployment on Vercel. The live URL will be available after connecting the GitHub repository.

## License

MIT

## Acknowledgments

- Icons by [Lucide](https://lucide.dev)
- Fonts by [Google Fonts](https://fonts.google.com)
- Design inspired by modern SaaS dashboards