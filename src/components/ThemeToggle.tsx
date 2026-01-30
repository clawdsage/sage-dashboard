import { useState, useEffect } from 'react'
import { Sun, Moon, Palette } from 'lucide-react'

type Theme = 'dark' | 'light' | 'auto'
type ColorScheme = 'sage' | 'blue' | 'purple' | 'amber'

interface ThemeToggleProps {
  className?: string
}

const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<Theme>('dark')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('sage')
  const [showPalette, setShowPalette] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme

    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme('auto')
      applyTheme(prefersDark ? 'dark' : 'light')
    }

    if (savedColorScheme) {
      setColorScheme(savedColorScheme)
      applyColorScheme(savedColorScheme)
    }
  }, [])

  // Apply theme to document
  const applyTheme = (themeToApply: Theme) => {
    const root = document.documentElement
    
    if (themeToApply === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('dark', themeToApply === 'dark')
      root.classList.toggle('light', themeToApply === 'light')
    }
  }

  // Apply color scheme
  const applyColorScheme = (scheme: ColorScheme) => {
    const root = document.documentElement
    
    // Remove all color scheme classes
    root.classList.remove('color-scheme-sage', 'color-scheme-blue', 'color-scheme-purple', 'color-scheme-amber')
    
    // Add new color scheme class
    root.classList.add(`color-scheme-${scheme}`)
    
    // Update CSS variables
    const colors = getColorScheme(scheme)
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }

  // Get color scheme values
  const getColorScheme = (scheme: ColorScheme) => {
    const schemes = {
      sage: {
        'primary': '#3a9d3a',
        'primary-dark': '#2d7d2d',
        'primary-light': '#56b856',
        'accent': '#4ade80',
        'accent-dark': '#22c55e',
        'accent-light': '#86efac'
      },
      blue: {
        'primary': '#3b82f6',
        'primary-dark': '#1d4ed8',
        'primary-light': '#60a5fa',
        'accent': '#0ea5e9',
        'accent-dark': '#0284c7',
        'accent-light': '#38bdf8'
      },
      purple: {
        'primary': '#8b5cf6',
        'primary-dark': '#7c3aed',
        'primary-light': '#a78bfa',
        'accent': '#d946ef',
        'accent-dark': '#c026d3',
        'accent-light': '#e879f9'
      },
      amber: {
        'primary': '#f59e0b',
        'primary-dark': '#d97706',
        'primary-light': '#fbbf24',
        'accent': '#f97316',
        'accent-dark': '#ea580c',
        'accent-light': '#fb923c'
      }
    }
    
    return schemes[scheme]
  }

  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  // Handle color scheme change
  const handleColorSchemeChange = (newScheme: ColorScheme) => {
    setColorScheme(newScheme)
    applyColorScheme(newScheme)
    localStorage.setItem('colorScheme', newScheme)
  }

  // Get current theme icon
  const getThemeIcon = () => {
    if (theme === 'auto') {
      return (
        <div className="relative w-5 h-5">
          <Sun className="absolute w-3 h-3 top-0 left-0" />
          <Moon className="absolute w-3 h-3 bottom-0 right-0" />
        </div>
      )
    }
    return theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />
  }

  // Get current theme label
  const getThemeLabel = () => {
    if (theme === 'auto') return 'Auto'
    return theme === 'dark' ? 'Dark' : 'Light'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main theme toggle button */}
      <button
        onClick={() => handleThemeChange(theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark')}
        className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-300 group relative overflow-hidden"
        title={`Theme: ${getThemeLabel()}`}
      >
        {getThemeIcon()}
        
        {/* Theme transition animation */}
        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        
        {/* Active indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-all duration-300" />
      </button>

      {/* Color palette button */}
      <button
        onClick={() => setShowPalette(!showPalette)}
        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all duration-300"
        title="Color scheme"
      >
        <Palette className="w-3 h-3" />
      </button>

      {/* Color palette dropdown */}
      {showPalette && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl p-3 animate-slide-up">
          <div className="text-sm font-medium text-white mb-3">Color Scheme</div>
          
          <div className="grid grid-cols-2 gap-2">
            {(['sage', 'blue', 'purple', 'amber'] as ColorScheme[]).map((scheme) => (
              <button
                key={scheme}
                onClick={() => handleColorSchemeChange(scheme)}
                className={`p-3 rounded-lg transition-all duration-300 flex flex-col items-center gap-2 ${
                  colorScheme === scheme
                    ? 'bg-primary/20 ring-2 ring-primary/30'
                    : 'bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: getColorScheme(scheme).primary }}
                />
                <span className="text-xs font-medium capitalize text-white">
                  {scheme}
                </span>
              </button>
            ))}
          </div>

          {/* Current theme info */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Theme</span>
              <span className="font-medium text-white">{getThemeLabel()}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-400">Colors</span>
              <span className="font-medium text-white capitalize">{colorScheme}</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual theme indicator */}
      <div className="absolute -bottom-1 left-0 right-0 h-1 overflow-hidden rounded-b-xl">
        <div 
          className="h-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${getColorScheme(colorScheme).primary}, transparent)`
          }}
        />
      </div>
    </div>
  )
}

export default ThemeToggle