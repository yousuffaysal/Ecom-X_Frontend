'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, motion, useTransform } from 'framer-motion'

interface CounterProps {
  value: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  className?: string
  style?: React.CSSProperties
}

export default function Counter({
  value,
  duration = 3,
  delay = 0,
  prefix = '',
  suffix = '',
  className = '',
  style = {}
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.001
  })
  
  const displayValue = useTransform(springValue, (latest) => 
    Math.round(latest).toLocaleString()
  )

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(value)
      }, delay * 1000)
      return () => clearTimeout(timeout)
    }
  }, [isInView, value, motionValue, delay])

  return (
    <span className={className} style={{ ...style, fontVariantNumeric: 'tabular-nums' }} ref={ref}>
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  )
}
