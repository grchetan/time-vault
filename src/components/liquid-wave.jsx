import { useState, useRef } from 'react'

/**
 * PremiumHover Wrapper Component (renamed LiquidWave for compatibility)
 * 
 * Replaces the complex liquid warp distortion system with a minimalist, modern
 * SaaS interaction system inspired by Linear, Stripe, Notion, and Vercel.
 * Provides micro-interactions:
 * 1. Dampened 3D Perspective Tilt (restricted to max 1.5 degrees for calm physical feedback).
 * 2. Premium Spotlight Glow (a soft, semi-transparent purple cursor tracking reflection).
 * 3. Micro-Elevation & Shadows (translates up 2px, updates borders, and shifts to premium shadows).
 * 
 * @param {React.ReactNode} children The inner element to wrap.
 * @param {string} className Tailwind/CSS classes for the outer container.
 */
export function LiquidWave({ children, className = '' }) {
  const containerRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const handleMouseMove = (e) => {
    const el = containerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left // px relative to element left
    const y = e.clientY - rect.top  // px relative to element top
    setCoords({ x, y })

    // Normalize from -0.5 (left/top) to 0.5 (right/bottom)
    const nx = (x / rect.width) - 0.5
    const ny = (y / rect.height) - 0.5
    setTilt({ rx: nx, ry: ny })
  }

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ rx: 0, ry: 0 })
  }

  const containerStyle = {
    '--mouse-x': `${coords.x}px`,
    '--mouse-y': `${coords.y}px`,
    // Dampened 3D Tilt: max 1.5 degrees
    transform: hovered
      ? `perspective(1000px) rotateX(${tilt.ry * -3.0}deg) rotateY(${tilt.rx * 3.0}deg) translateY(-2px) scale(1.006)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
    transition: hovered
      ? 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease'
      : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease, box-shadow 0.5s ease',
    willChange: 'transform',
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={containerStyle}
      className={`relative ${className} group/hover-premium overflow-hidden`}
    >
      {/* 🔮 Calm SaaS Spotlight reflection layer */}
      <div
        className="absolute inset-0 pointer-events-none z-30 rounded-[inherit] transition-opacity duration-500 opacity-0 group-hover/hover-premium:opacity-100"
        style={{
          background: `radial-gradient(circle 180px at var(--mouse-x) var(--mouse-y), oklch(0.58 0.18 290 / 0.035) 0%, transparent 80%)`,
        }}
      />

      {children}
    </div>
  )
}
