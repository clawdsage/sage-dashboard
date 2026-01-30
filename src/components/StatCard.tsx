import { LucideIcon, useEffect, useState, useRef } from 'lucide-react'
import { useEffect as ReactEffect, useState as ReactState, useRef as ReactRef } from 'react'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: string
  trend: 'up' | 'down'
  animate?: boolean
}

const StatCard = ({ title, value, change, icon: Icon, color, trend, animate = true }: StatCardProps) => {
  const [prevValue, setPrevValue] = ReactState(value)
  const [isAnimating, setIsAnimating] = ReactState(false)
  const valueRef = ReactRef<HTMLParagraphElement>(null)
  const iconRef = ReactRef<HTMLDivElement>(null)

  ReactEffect(() => {
    if (prevValue !== value && animate) {
      setIsAnimating(true)
      
      // Trigger scale animation on icon
      if (iconRef.current) {
        iconRef.current.classList.add('animate-scale-up')
        setTimeout(() => {
          if (iconRef.current) {
            iconRef.current.classList.remove('animate-scale-up')
          }
        }, 200)
      }

      // Trigger value change animation
      if (valueRef.current) {
        valueRef.current.classList.add('animate-pulse-glow')
        setTimeout(() => {
          if (valueRef.current) {
            valueRef.current.classList.remove('animate-pulse-glow')
          }
          setIsAnimating(false)
        }, 1000)
      }

      setPrevValue(value)
    }
  }, [value, prevValue, animate])

  const getGradientColor = () => {
    switch (color) {
      case 'bg-blue-500':
        return 'from-blue-500 to-cyan-500'
      case 'bg-green-500':
        return 'from-green-500 to-emerald-500'
      case 'bg-purple-500':
        return 'from-purple-500 to-violet-500'
      case 'bg-amber-500':
        return 'from-amber-500 to-yellow-500'
      default:
        return 'from-primary to-primary-light'
    }
  }

  return (
    <div className={`card group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
      isAnimating ? 'ring-2 ring-primary/30' : ''
    }`}>
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColor()} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      
      {/* Floating particles (subtle) */}
      <div className="particle-container">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-slate-400 animate-fade-in truncate">{title}</p>
          <p 
            ref={valueRef}
            className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2 transition-all duration-300 truncate"
          >
            {value}
          </p>
          <div className="flex items-center gap-1 mt-1 sm:mt-2 flex-wrap">
            <span className={`text-xs sm:text-sm font-medium animate-slide-up ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend === 'up' ? '↗' : '↘'} {change}
            </span>
            <span className="text-xs sm:text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              from yesterday
            </span>
          </div>
        </div>
        <div 
          ref={iconRef}
          className={`relative ${color} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0 ml-3 ${
            isAnimating ? 'animate-pulse-glow' : ''
          }`}
        >
          <Icon className="w-6 h-6 text-white" />
          
          {/* Icon glow effect */}
          <div className="absolute inset-0 rounded-xl bg-current opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
        </div>
      </div>

      {/* Progress indicator (subtle) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700 overflow-hidden rounded-b-xl">
        <div 
          className={`h-full bg-gradient-to-r ${getGradientColor()} animate-gradient-shift`}
          style={{ width: trend === 'up' ? '70%' : '30%' }}
        />
      </div>

      {/* Ripple effect on hover */}
      <div className="ripple-effect" />
    </div>
  )
}

export default StatCard