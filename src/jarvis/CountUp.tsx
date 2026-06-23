import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

/**
 * Counts a number up from 0 when it scrolls into view — the "live telemetry"
 * feel for skill percentages and project metrics. Reduced-motion safe
 * (shows the final value immediately).
 */
export function CountUp({
  to,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1100,
}: {
  to: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const [val, setVal] = useState(reduce ? to : 0)

  useEffect(() => {
    if (reduce || !inView) return
    let raf = 0
    let start = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(to * eased)
      if (p < 1) raf = requestAnimationFrame(step)
      else setVal(to)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, reduce])

  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/**
 * Animates the *numeric* portion of a metric string while preserving the
 * surrounding text, e.g. "0.96790" → counts up; "1st place" → counts the 1;
 * "P2P over LAN" → rendered as-is (no leading number).
 */
export function MetricValue({ value }: { value: string }) {
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return <>{value}</>
  const [, prefix, num, suffix] = m
  const decimals = num.includes('.') ? num.split('.')[1].length : 0
  return (
    <CountUp to={parseFloat(num)} prefix={prefix} suffix={suffix} decimals={decimals} />
  )
}
