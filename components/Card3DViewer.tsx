"use client"

import { useState, useRef, useEffect } from "react"
import ChainCard from "@/components/ChainCard"
import type { CardStats } from "@/types"

interface Card3DViewerProps {
  card: CardStats
}

export default function Card3DViewer({ card }: Card3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotX, setRotX] = useState(0)
  const [rotY, setRotY] = useState(0)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    setRotY(prev => prev + dx * 0.2)
    setRotX(prev => prev - dy * 0.2)
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  const onMouseUp = () => {
    isDragging.current = false
  }

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true
    const touch = e.touches[0]
    lastPos.current = { x: touch.clientX, y: touch.clientY }
  }
  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - lastPos.current.x
    const dy = touch.clientY - lastPos.current.y
    setRotY(prev => prev + dx * 0.2)
    setRotX(prev => prev - dy * 0.2)
    lastPos.current = { x: touch.clientX, y: touch.clientY }
  }
  const onTouchEnd = () => {
    isDragging.current = false
  }

  useEffect(() => {
    const win = window
    win.addEventListener('mousemove', onMouseMove)
    win.addEventListener('mouseup', onMouseUp)
    win.addEventListener('touchmove', onTouchMove)
    win.addEventListener('touchend', onTouchEnd)
    return () => {
      win.removeEventListener('mousemove', onMouseMove)
      win.removeEventListener('mouseup', onMouseUp)
      win.removeEventListener('touchmove', onTouchMove)
      win.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto cursor-grab active:cursor-grabbing"
      style={{ perspective: '1200px' }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
      >
        {/* Front side */}
        <div style={{ position: 'absolute', width: '100%', backfaceVisibility: 'hidden' }}>
          <ChainCard card={card} />
        </div>
        {/* Back side */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'rgba(13,17,23,0.85)',
            borderRadius: '1.5rem',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
          }}
        >
          {/* Placeholder for back design */}
        </div>
      </div>
    </div>
  )
}
