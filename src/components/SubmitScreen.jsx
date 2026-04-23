import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, BarChart3, Zap, Sparkles, ArrowRight, Calendar } from 'lucide-react'

const LOADING_STEPS = [
  { icon: '🔍', text: 'Analyzing your testing infrastructure…' },
  { icon: '🧩', text: 'Mapping your tech stack coverage…'      },
  { icon: '📊', text: 'Calculating performance benchmarks…'    },
  { icon: '💡', text: 'Generating personalized recommendations…' },
  { icon: '✨', text: 'Finalizing your custom report…'         },
]

/* Floating particle */
function Particle({ delay, x, y, size }) {
  return (
    <motion.div
      className="absolute rounded-full bg-orange-500/20 pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
      transition={{ duration: 3 + delay, repeat: Infinity, delay }}
    />
  )
}

export default function SubmitScreen({ answers }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [phase,   setPhase]   = useState('loading') // 'loading' | 'success'

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIdx((i) => {
        const next = i + 1
        if (next >= LOADING_STEPS.length) {
          clearInterval(timer)
          setTimeout(() => setPhase('success'), 700)
        }
        return Math.min(next, LOADING_STEPS.length - 1)
      })
    }, 750)
    return () => clearInterval(timer)
  }, [])

  const name    = answers?.name    || 'there'
  const company = answers?.company || 'your team'

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A1628] via-[#080E1A] to-[#0D0B1E]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,102,0,0.07)_0%,transparent_70%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(123,97,255,0.06)_0%,transparent_70%)]" />

      {/* Particles (success only) */}
      {phase === 'success' && [
        { delay: 0,   x: 15, y: 20, size: 8  },
        { delay: 0.5, x: 80, y: 15, size: 5  },
        { delay: 1,   x: 70, y: 75, size: 10 },
        { delay: 0.3, x: 25, y: 70, size: 6  },
        { delay: 0.8, x: 50, y: 85, size: 4  },
        { delay: 1.5, x: 90, y: 50, size: 7  },
      ].map((p, i) => <Particle key={i} {...p} />)}

      <AnimatePresence mode="wait">
        {/* ── LOADING PHASE ── */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.3 } }}
            className="relative text-center max-w-sm w-full"
          >
            {/* Orbiting rings */}
            <div className="relative w-36 h-36 mx-auto mb-10">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-[2px] border-transparent"
                style={{ borderTopColor: '#FF6600', borderRightColor: '#7B61FF' }}
              />
              {/* Mid ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-3 rounded-full border-[2px] border-transparent opacity-70"
                style={{ borderBottomColor: '#FF6600', borderLeftColor: '#7B61FF' }}
              />
              {/* Inner glow */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-6 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center"
              >
                <BarChart3 className="w-10 h-10 text-orange-400" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-1">
              Generating Your Custom
            </h2>
            <h2 className="text-2xl font-extrabold text-gradient-brand mb-2">
              Benchmark Report
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Powered by BrowserStack intelligence
            </p>

            {/* Step list */}
            <div className="space-y-3 text-left">
              {LOADING_STEPS.map((step, i) => {
                const done    = i < stepIdx
                const active  = i === stepIdx
                const pending = i > stepIdx
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: pending ? 0.3 : 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    {/* Status dot */}
                    <div className={`
                      w-5 h-5 rounded-full shrink-0 flex items-center justify-center
                      transition-all duration-300
                      ${done   ? 'bg-green-500'  : ''}
                      ${active ? 'bg-orange-500 animate-pulse' : ''}
                      ${pending ? 'bg-slate-700' : ''}
                    `}>
                      {done && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>

                    <span className={`text-sm transition-colors duration-300 ${
                      done ? 'text-green-400' : active ? 'text-white' : 'text-slate-600'
                    }`}>
                      {step.icon} {step.text}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS PHASE ── */}
        {phase === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="relative text-center max-w-lg w-full"
          >
            {/* Check icon */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full
                bg-gradient-to-br from-green-500/20 to-emerald-500/10
                border-2 border-green-500/40 flex items-center justify-center
                shadow-[0_0_40px_rgba(34,197,94,0.2)]"
            >
              <CheckCircle className="w-12 h-12 text-green-400" />
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">
                  Report Ready
                </span>
                <Sparkles className="w-4 h-4 text-orange-400" />
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2">
                Your BrowserStack
              </h1>
              <h1 className="text-4xl md:text-5xl font-black text-gradient-brand leading-tight mb-6">
                Benchmark Report
              </h1>

              <p className="text-slate-400 text-base mb-2 max-w-md mx-auto">
                {name !== 'there' && (
                  <>Hi <span className="text-white font-semibold">{name}</span>! </>
                )}
                We've analyzed your inputs and crafted a personalized testing
                strategy{company !== 'your team' ? (
                  <> for <span className="text-white font-semibold">{company}</span></>
                ) : ' for your team'}.
              </p>

              {/* Stats row */}
              <div className="flex justify-center gap-6 my-8">
                {[
                  { label: 'Insights Generated', value: '12' },
                  { label: 'Optimizations Found', value: '5'  },
                  { label: 'Est. Time Saved',     value: '3h' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-extrabold text-gradient-brand">{s.value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-7 py-3.5
                    bg-gradient-to-r from-orange-500 to-orange-600
                    hover:from-orange-400 hover:to-orange-500
                    text-white font-semibold rounded-2xl
                    shadow-[0_0_30px_rgba(255,102,0,0.35)]
                    hover:shadow-[0_0_44px_rgba(255,102,0,0.5)]
                    transition-all duration-200"
                >
                  <Zap className="w-5 h-5" />
                  View Your Report
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-7 py-3.5
                    bg-slate-800/80 hover:bg-slate-800
                    border border-slate-700 hover:border-slate-600
                    text-slate-200 hover:text-white font-semibold rounded-2xl
                    transition-all duration-200"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule a Demo
                </motion.button>
              </div>

              <p className="text-slate-600 text-xs mt-6">
                A BrowserStack Solutions Engineer will follow up at{' '}
                <span className="text-slate-400">{answers?.email || 'your email'}</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
