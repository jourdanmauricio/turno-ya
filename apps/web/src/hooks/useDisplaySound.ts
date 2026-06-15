import { useRef, useCallback, useEffect } from 'react'

export function useDisplaySound() {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const resume = () => {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext()
      }
      if (ctxRef.current.state === 'suspended') {
        void ctxRef.current.resume()
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') resume()
    }

    document.addEventListener('click', resume)
    document.addEventListener('keydown', resume)
    document.addEventListener('touchstart', resume)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('click', resume)
      document.removeEventListener('keydown', resume)
      document.removeEventListener('touchstart', resume)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const playBeep = useCallback(async () => {
    if (!ctxRef.current) return
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        return
      }
    }

    function tone(freq: number, startAt: number) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(0.4, startAt + 0.01)
      gain.gain.setValueAtTime(0.4, startAt + 0.07)
      gain.gain.linearRampToValueAtTime(0, startAt + 0.08)
      osc.start(startAt)
      osc.stop(startAt + 0.09)
    }

    const now = ctx.currentTime
    tone(880, now)
    tone(1100, now + 0.14)
  }, [])

  return playBeep
}
