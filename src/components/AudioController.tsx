import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Music, Bell, Zap, Settings } from 'lucide-react'

interface SoundEffect {
  id: string
  name: string
  icon: React.ReactNode
  audioUrl?: string
  oscillatorType?: OscillatorType
  frequency?: number
  duration?: number
}

interface AudioControllerProps {
  enabled?: boolean
  onToggle?: (enabled: boolean) => void
  className?: string
}

const AudioController = ({
  enabled: externalEnabled = true,
  onToggle,
  className = ''
}: AudioControllerProps) => {
  const [enabled, setEnabled] = useState(externalEnabled)
  const [volume, setVolume] = useState(0.5)
  const [ambientEnabled, setAmbientEnabled] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const soundEffects: SoundEffect[] = [
    {
      id: 'completion',
      name: 'Task Complete',
      icon: <Bell className="w-4 h-4" />,
      oscillatorType: 'sine',
      frequency: 880,
      duration: 0.3
    },
    {
      id: 'transition',
      name: 'Transition',
      icon: <Zap className="w-4 h-4" />,
      oscillatorType: 'triangle',
      frequency: 440,
      duration: 0.2
    },
    {
      id: 'notification',
      name: 'Notification',
      icon: <Bell className="w-4 h-4" />,
      oscillatorType: 'square',
      frequency: 660,
      duration: 0.1
    },
    {
      id: 'success',
      name: 'Success',
      icon: <Bell className="w-4 h-4" />,
      oscillatorType: 'sine',
      frequency: 523.25,
      duration: 0.5
    }
  ]

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      gainNodeRef.current.gain.value = volume
    }
  }

  // Play a sound effect
  const playSound = (effect: SoundEffect) => {
    if (!enabled || !audioContextRef.current || !gainNodeRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.type = effect.oscillatorType || 'sine'
    oscillator.frequency.setValueAtTime(effect.frequency || 440, audioContextRef.current.currentTime)
    
    // Create envelope
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + (effect.duration || 0.3))

    oscillator.connect(gainNode)
    gainNode.connect(gainNodeRef.current)

    oscillator.start()
    oscillator.stop(audioContextRef.current.currentTime + (effect.duration || 0.3))
  }

  // Start/stop ambient music
  const toggleAmbientMusic = async () => {
    if (!enabled || !audioContextRef.current) return

    if (ambientEnabled && ambientSourceRef.current) {
      ambientSourceRef.current.stop()
      ambientSourceRef.current = null
      setAmbientEnabled(false)
      return
    }

    try {
      // Create ambient sound using Web Audio API
      const oscillator1 = audioContextRef.current.createOscillator()
      const oscillator2 = audioContextRef.current.createGain()
      const lfo = audioContextRef.current.createOscillator()
      const lfoGain = audioContextRef.current.createGain()

      oscillator1.type = 'sine'
      oscillator1.frequency.setValueAtTime(164.81, audioContextRef.current.currentTime) // E3

      lfo.type = 'sine'
      lfo.frequency.setValueAtTime(0.1, audioContextRef.current.currentTime)
      lfoGain.gain.setValueAtTime(1.2, audioContextRef.current.currentTime)

      lfo.connect(lfoGain)
      oscillator1.connect(oscillator2)
      lfoGain.connect(oscillator1.frequency)
      oscillator2.connect(gainNodeRef.current!)

      oscillator2.gain.setValueAtTime(volume * 0.1, audioContextRef.current.currentTime)

      oscillator1.start()
      lfo.start()

      ambientSourceRef.current = oscillator1 as any

      setAmbientEnabled(true)
    } catch (error) {
      console.error('Error playing ambient music:', error)
    }
  }

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume
    }
  }

  // Toggle audio enabled state
  const handleToggleEnabled = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    onToggle?.(newEnabled)

    if (!newEnabled) {
      // Stop ambient music if disabling
      if (ambientSourceRef.current) {
        ambientSourceRef.current.stop()
        ambientSourceRef.current = null
        setAmbientEnabled(false)
      }
    } else {
      initAudioContext()
    }
  }

  // Initialize on mount
  useEffect(() => {
    if (enabled) {
      initAudioContext()
    }

    return () => {
      if (ambientSourceRef.current) {
        ambientSourceRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Sync with external enabled prop
  useEffect(() => {
    setEnabled(externalEnabled)
  }, [externalEnabled])

  return (
    <div className={`relative ${className}`}>
      {/* Main control button */}
      <button
        onClick={handleToggleEnabled}
        className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
          enabled
            ? 'bg-primary/20 text-primary hover:bg-primary/30'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}
        title={enabled ? 'Disable sounds' : 'Enable sounds'}
      >
        {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* Settings panel */}
      {showSettings && enabled && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Audio Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Volume control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Volume</span>
              <span className="text-sm text-primary font-medium">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>

          {/* Ambient music toggle */}
          <div className="flex items-center justify-between mb-6 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Music className="w-4 h-4 text-primary" />
              <div>
                <div className="text-sm font-medium text-white">Ambient Music</div>
                <div className="text-xs text-slate-400">Relaxing background tones</div>
              </div>
            </div>
            <button
              onClick={toggleAmbientMusic}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                ambientEnabled ? 'bg-primary' : 'bg-slate-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  ambientEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound effects */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300 mb-2">Sound Effects</div>
            {soundEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => playSound(effect)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary">{effect.icon}</div>
                  <span className="text-sm text-white">{effect.name}</span>
                </div>
                <div className="text-xs text-slate-400 group-hover:text-primary transition-colors">
                  Test
                </div>
              </button>
            ))}
          </div>

          {/* Audio status */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Audio Status</span>
              <span className={`font-medium ${enabled ? 'text-green-500' : 'text-red-500'}`}>
                {enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Settings button (only when enabled) */}
      {enabled && (
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all duration-300 ${
            showSettings ? 'rotate-90 bg-primary/20 text-primary' : ''
          }`}
          title="Audio settings"
        >
          <Settings className="w-3 h-3" />
        </button>
      )}

      {/* Visual feedback for audio activity */}
      {enabled && (
        <div className="absolute -bottom-1 -left-1 -right-1 h-1 overflow-hidden rounded-b-xl">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-gradient-shift"
            style={{ animationDuration: '2s' }}
          />
        </div>
      )}
    </div>
  )
}

export default AudioController