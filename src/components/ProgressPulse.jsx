import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORY_GRADIENTS = {
  'Basic Info':     'from-blue-500 to-cyan-400',
  'Intent':         'from-violet-500 to-purple-400',
  'Infrastructure': 'from-orange-500 to-amber-400',
  'Tech Stack':     'from-emerald-500 to-teal-400',
  'Performance':    'from-pink-500 to-rose-400',
  'Coverage':       'from-indigo-500 to-blue-400',
}

const CATEGORY_DOT_COLOR = {
  'Basic Info':     'bg-cyan-400',
  'Intent':         'bg-purple-400',
  'Infrastructure': 'bg-orange-400',
  'Tech Stack':     'bg-emerald-400',
  'Performance':    'bg-pink-400',
  'Coverage':       'bg-indigo-400',
}

export default function ProgressPulse({ progress, current, total, category }) {
  const gradient   = CATEGORY_GRADIENTS[category] ?? 'from-orange-500 to-purple-400'
  const activeDot  = CATEGORY_DOT_COLOR[category]  ?? 'bg-orange-400'
  const dotCount   = Math.min(total, 10)

  return (
    <div className="sticky top-0 z-50 bg-glass border-b border-slate-800/60">
      {/* Animated progress bar */}
      <div className="h-[2px] w-full bg-slate-800 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${gradient} relative`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-white/30"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-[0_0_10px_rgba(255,102,0,0.4)]">
            <span className="text-white text-[10px] font-black tracking-tight">BS</span>
          </div>
          <span className="text-slate-300 font-semibold text-sm hidden sm:block">
            Discovery Tool
          </span>
        </div>

        {/* Right side: category + dots + counter */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.span
              key={category}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="text-slate-500 text-xs hidden sm:block"
            >
              {category}
            </motion.span>
          </AnimatePresence>

          {/* Pulse dots */}
          <div className="flex items-center gap-[5px]">
            {Array.from({ length: dotCount }).map((_, i) => {
              const isCompleted = i < current - 1
              const isActive    = i === current - 1
              const isPending   = i >= current
              return (
                <motion.div
                  key={i}
                  animate={isActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={isActive ? { duration: 1.4, repeat: Infinity } : {}}
                  className={[
                    'rounded-full transition-all duration-300',
                    isCompleted ? `w-2 h-2 ${activeDot} opacity-60`  : '',
                    isActive    ? `w-2.5 h-2.5 ${activeDot} shadow-[0_0_6px_rgba(255,165,0,0.7)]` : '',
                    isPending   ? 'w-1.5 h-1.5 bg-slate-700' : '',
                  ].join(' ')}
                />
              )
            })}
          </div>

          {/* Numeric counter */}
          <div className="flex items-center gap-1 text-xs bg-slate-800/70 border border-slate-700/50 rounded-full px-2.5 py-0.5">
            <motion.span
              key={current}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-bold"
            >
              {current}
            </motion.span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
