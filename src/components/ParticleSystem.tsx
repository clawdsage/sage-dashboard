import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

interface ParticleSystemProps {
  particleCount?: number
  particleTypes?: 'floating' | 'sparkles' | 'confetti' | 'ambient'
  intensity?: 'low' | 'medium' | 'high'
  colors?: string[]
  interactive?: boolean
  className?: string
}

const ParticleSystem = ({
  particleCount = 30,
  particleTypes = 'ambient',
  intensity = 'medium',
  colors = ['#3a9d3a', '#56b856', '#2d7d2d', '#4ade80', '#22c55e'],
  interactive = true,
  className = ''
}: ParticleSystemProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const [isActive, setIsActive] = useState(true)

  // Initialize particles based on type
  const initParticles = () => {
    const canvas = canvasRef.current
    if (!canvas) return []

    const ctx = canvas.getContext('2d')
    if (!ctx) return []

    const particles: Particle[] = []
    const width = canvas.width
    const height = canvas.height

    const getParticleConfig = () => {
      switch (particleTypes) {
        case 'floating':
          return {
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.3 + 0.1,
            life: Infinity,
            maxLife: Infinity
          }
        case 'sparkles':
          return {
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            opacity: Math.random() * 0.8 + 0.2,
            life: Math.random() * 60 + 30,
            maxLife: Math.random() * 60 + 30
          }
        case 'confetti':
          return {
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 3,
            speedY: Math.random() * 2 + 1,
            opacity: Math.random() * 0.9 + 0.1,
            life: Math.random() * 120 + 60,
            maxLife: Math.random() * 120 + 60
          }
        case 'ambient':
        default:
          return {
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.8,
            speedY: (Math.random() - 0.5) * 0.8,
            opacity: Math.random() * 0.2 + 0.05,
            life: Infinity,
            maxLife: Infinity
          }
      }
    }

    for (let i = 0; i < particleCount; i++) {
      const config = getParticleConfig()
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: config.size,
        speedX: config.speedX,
        speedY: config.speedY,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: config.opacity,
        life: config.life,
        maxLife: config.maxLife
      })
    }

    return particles
  }

  // Draw particles
  const drawParticles = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with fade effect for trailing particles
    ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    particlesRef.current.forEach((particle) => {
      // Update particle position
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Boundary checking with wrap-around
      if (particle.x > canvas.width) particle.x = 0
      if (particle.x < 0) particle.x = canvas.width
      if (particle.y > canvas.height) particle.y = 0
      if (particle.y < 0) particle.y = canvas.height

      // Update life for temporary particles
      if (particle.life < particle.maxLife) {
        particle.life--
        particle.opacity = (particle.life / particle.maxLife) * particle.opacity
      }

      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      
      // Add glow effect for certain particle types
      if (particleTypes === 'sparkles' || particleTypes === 'confetti') {
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        )
        gradient.addColorStop(0, `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, `${particle.color}00`)
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`
      }
      
      ctx.fill()

      // Add connection lines between nearby particles (for ambient type)
      if (particleTypes === 'ambient' || particleTypes === 'floating') {
        particlesRef.current.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100 && distance > 0) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `${particle.color}${Math.floor((1 - distance / 100) * particle.opacity * 50).toString(16).padStart(2, '0')}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      }
    })

    // Remove dead particles and respawn
    particlesRef.current = particlesRef.current.filter(particle => {
      if (particle.life <= 0 && particle.life !== Infinity) {
        // Respawn particle
        const canvas = canvasRef.current
        if (!canvas) return false

        const config = getParticleConfig()
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: config.size,
          speedX: config.speedX,
          speedY: config.speedY,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: config.opacity,
          life: config.life,
          maxLife: config.maxLife
        }
      }
      return true
    })

    // Maintain particle count
    while (particlesRef.current.length < particleCount) {
      const canvas = canvasRef.current
      if (!canvas) break

      const config = getParticleConfig()
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: config.size,
        speedX: config.speedX,
        speedY: config.speedY,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: config.opacity,
        life: config.life,
        maxLife: config.maxLife
      })
    }
  }

  // Animation loop
  const animate = () => {
    if (!isActive) return

    drawParticles()
    animationRef.current = requestAnimationFrame(animate)
  }

  // Handle mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Repel particles from mouse
    particlesRef.current.forEach((particle) => {
      const dx = particle.x - mouseX
      const dy = particle.y - mouseY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        const force = (100 - distance) / 100
        particle.speedX += (dx / distance) * force * 0.5
        particle.speedY += (dy / distance) * force * 0.5
      }
    })
  }

  // Handle click for sparkle burst
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Add sparkle burst
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: clickX,
        y: clickY,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.8 + 0.2,
        life: Math.random() * 60 + 30,
        maxLife: Math.random() * 60 + 30
      })
    }
  }

  // Handle resize
  const handleResize = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    // Reinitialize particles for new canvas size
    particlesRef.current = initParticles()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    handleResize()

    // Initialize particles
    particlesRef.current = initParticles()

    // Start animation
    animate()

    // Add event listeners
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [particleCount, particleTypes, intensity, colors])

  useEffect(() => {
    if (!isActive && animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    } else if (isActive) {
      animate()
    }
  }, [isActive])

  const getParticleConfig = () => {
    switch (particleTypes) {
      case 'floating':
        return {
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          life: Infinity,
          maxLife: Infinity
        }
      case 'sparkles':
        return {
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          opacity: Math.random() * 0.8 + 0.2,
          life: Math.random() * 60 + 30,
          maxLife: Math.random() * 60 + 30
        }
      case 'confetti':
        return {
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 3,
          speedY: Math.random() * 2 + 1,
          opacity: Math.random() * 0.9 + 0.1,
          life: Math.random() * 120 + 60,
          maxLife: Math.random() * 120 + 60
        }
      case 'ambient':
      default:
        return {
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          opacity: Math.random() * 0.2 + 0.05,
          life: Infinity,
          maxLife: Infinity
        }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="w-full h-full"
      />
      
      {/* Controls (optional) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className="px-3 py-1 text-xs bg-slate-800/50 backdrop-blur-sm rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          {isActive ? 'Pause' : 'Play'} Particles
        </button>
      </div>
    </div>
  )
}

export default ParticleSystem