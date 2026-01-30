import { useEffect, useRef, useState } from 'react'

interface AnimatedProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  animate?: boolean
  glowOnComplete?: boolean
  height?: 'sm' | 'md' | 'lg'
}

const AnimatedProgressBar = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  animate = true,
  glowOnComplete = true,
  height = 'md'
}: AnimatedProgressBarProps) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colorClasses = {
    primary: 'from-primary to-primary-light',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-amber-500 to-yellow-500',
    danger: 'from-red-500 to-rose-500',
    info: 'from-blue-500 to-cyan-500'
  }

  const glowClasses = {
    primary: 'shadow-primary/30',
    success: 'shadow-green-500/30',
    warning: 'shadow-amber-500/30',
    danger: 'shadow-red-500/30',
    info: 'shadow-blue-500/30'
  }

  useEffect(() => {
    if (!animate) {
      setDisplayValue(percentage)
      setIsComplete(percentage >= 100)
      return
    }

    let animationFrame: number
    let startTime: number
    const duration = 800 // ms

    const animateProgress = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = easeOut * percentage

      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateProgress)
      } else {
        setDisplayValue(percentage)
        setIsComplete(percentage >= 100)
        
        // Trigger completion effects
        if (percentage >= 100 && glowOnComplete && containerRef.current) {
          containerRef.current.classList.add('animate-progress-glow')
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.classList.remove('animate-progress-glow')
            }
          }, 2000)
        }
      }
    }

    animationFrame = requestAnimationFrame(animateProgress)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [percentage, animate, glowOnComplete])

  // Create confetti effect on completion
  useEffect(() => {
    if (isComplete && glowOnComplete) {
      const createConfetti = () => {
        if (!containerRef.current) return

        const colors = [
          '#3a9d3a', '#56b856', '#2d7d2d', '#4ade80', '#22c55e'
        ]

        for (let i = 0; i < 15; i++) {
          const confetti = document.createElement('div')
          confetti.className = 'absolute w-2 h-2 rounded-full animate-confetti-fall'
          confetti.style.left = `${Math.random() * 100}%`
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
          confetti.style.animationDelay = `${Math.random() * 0.5}s`
          confetti.style.opacity = '0.7'

          containerRef.current.appendChild(confetti)

          // Remove after animation
          setTimeout(() => {
            confetti.remove()
          }, 5000)
        }
      }

      createConfetti()
    }
  }, [isComplete, glowOnComplete])

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-medium text-slate-300">{label}</span>
          )}
          {showPercentage && (
            <span className={`text-sm font-bold ${
              isComplete ? 'text-green-500 animate-pulse-glow' : 'text-slate-400'
            }`}>
              {Math.round(displayValue)}%
            </span>
          )}
        </div>
      )}

      <div 
        ref={containerRef}
        className={`relative ${heightClasses[height]} bg-slate-800 rounded-full overflow-hidden transition-all duration-300 ${
          isComplete && glowOnComplete ? 'shadow-lg' : ''
        }`}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-800" />
        
        {/* Animated progress bar */}
        <div
          ref={progressRef}
          className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-300 ${
            animate ? 'animate-gradient-shift' : ''
          }`}
          style={{ width: `${displayValue}%` }}
        >
          {/* Progress bar shine effect */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12" />
        </div>

        {/* Completion glow overlay */}
        {isComplete && glowOnComplete && (
          <div className={`absolute inset-0 rounded-full ${glowClasses[color]} blur-md opacity-0 animate-progress-glow`} />
        )}

        {/* Progress indicator dots */}
        <div className="absolute inset-0 flex items-center">
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className={`absolute w-1 h-1 rounded-full transition-all duration-300 ${
                displayValue >= mark ? 'bg-white/50' : 'bg-slate-600'
              }`}
              style={{ left: `${mark}%`, transform: 'translateX(-50%)' }}
            />
          ))}
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">0%</span>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="text-green-500 font-medium flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-glow" />
              Complete
            </span>
          ) : (
            <span className="text-primary font-medium">In Progress</span>
          )}
        </div>
        <span className="text-slate-500">100%</span>
      </div>
    </div>
  )
}

export default AnimatedProgressBar