export interface SettingsData {
  profile: ProfileSettings
  dashboard: DashboardSettings
  integrations: IntegrationSettings
  subagents: SubagentSettings
  notifications: NotificationSettings
  advanced: AdvancedSettings
}

export interface ProfileSettings {
  name: string
  email: string
  avatar?: string
  timezone: string
  theme: 'dark' | 'light'
}

export interface DashboardSettings {
  autoRefreshInterval: number // in seconds
  defaultView: 'dashboard' | 'projects' | 'agents' | 'review'
  notifications: {
    browserErrors: boolean
    browserCompletions: boolean
  }
}

export interface IntegrationSettings {
  supabase: {
    connected: boolean
    url?: string
    anonKey?: string
  }
  apiKeys: {
    openai?: string
    anthropic?: string
    github?: string
    vercel?: string
  }
  github: {
    connected: boolean
    username?: string
  }
  vercel: {
    connected: boolean
    projectId?: string
    webhookUrl?: string
  }
}

export interface SubagentSettings {
  defaultModel: string
  defaultTimeout: number // in seconds
  costLimits: {
    dailyLimit: number
    warningThreshold: number
  }
}

export interface NotificationSettings {
  email: {
    enabled: boolean
    address?: string
  }
  browser: {
    enabled: boolean
  }
  webhooks: {
    slack?: string
    discord?: string
  }
}

export interface AdvancedSettings {
  database: {
    url?: string
    connected: boolean
  }
}

// Default settings
export const defaultSettings: SettingsData = {
  profile: {
    name: 'Sage Admin',
    email: 'admin@example.com',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme: 'dark'
  },
  dashboard: {
    autoRefreshInterval: 30,
    defaultView: 'dashboard',
    notifications: {
      browserErrors: true,
      browserCompletions: true
    }
  },
  integrations: {
    supabase: {
      connected: false
    },
    apiKeys: {},
    github: {
      connected: false
    },
    vercel: {
      connected: false
    }
  },
  subagents: {
    defaultModel: 'anthropic/claude-sonnet-4-5',
    defaultTimeout: 300,
    costLimits: {
      dailyLimit: 100,
      warningThreshold: 80
    }
  },
  notifications: {
    email: {
      enabled: false
    },
    browser: {
      enabled: true
    },
    webhooks: {}
  },
  advanced: {
    database: {
      connected: false
    }
  }
}

// Settings storage utilities
export const SETTINGS_STORAGE_KEY = 'sage-dashboard-settings'

export function loadSettings(): SettingsData {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to ensure all fields exist
      return {
        ...defaultSettings,
        ...parsed,
        profile: { ...defaultSettings.profile, ...parsed.profile },
        dashboard: { ...defaultSettings.dashboard, ...parsed.dashboard },
        integrations: { ...defaultSettings.integrations, ...parsed.integrations },
        subagents: { ...defaultSettings.subagents, ...parsed.subagents },
        notifications: { ...defaultSettings.notifications, ...parsed.notifications },
        advanced: { ...defaultSettings.advanced, ...parsed.advanced }
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return defaultSettings
}

export function saveSettings(settings: SettingsData): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export function resetSettings(): SettingsData {
  localStorage.removeItem(SETTINGS_STORAGE_KEY)
  return defaultSettings
}