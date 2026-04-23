import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'

/* ─────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────── */
const cardVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 90 : -90,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.38, ease: [0.32, 0.72, 0, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -90 : 90,
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
  }),
}

/* ─────────────────────────────────────────────
   Safe icon getter — falls back to Circle
───────────────────────────────────────────── */
function DynIcon({ name, className }) {
  const Comp = Icons[name] ?? Icons.Circle
  return <Comp className={className} />
}

/* ─────────────────────────────────────────────
   TEXT / EMAIL input
───────────────────────────────────────────── */
function TextInput({ question, answer, onAnswer }) {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [question.id])

  return (
    <div className="w-full max-w-md">
      <input
        ref={ref}
        type={question.type}
        value={answer ?? ''}
        placeholder={question.placeholder}
        onChange={(e) => onAnswer(question.id, e.target.value)}
        className="
          w-full bg-[#111C2E] border-2 border-slate-700 rounded-2xl
          px-5 py-4 text-white text-lg placeholder-slate-600
          focus:outline-none focus:border-orange-500/80 focus:ring-4 focus:ring-orange-500/10
          transition-all duration-200 hover:border-slate-600
        "
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   RADIO (Yes / No style)
───────────────────────────────────────────── */
function RadioInput({ question, answer, onAnswer }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
      {question.options.map((opt) => {
        const active = answer === opt.value
        return (
          <motion.button
            key={opt.value}
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(question.id, opt.value)}
            className={`
              flex-1 p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
              ${active
                ? 'border-orange-500 bg-gradient-to-br from-orange-500/15 to-orange-600/5 card-glow-orange'
                : 'border-slate-700 bg-[#111C2E] hover:border-slate-600 hover:bg-[#162133]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* Radio bubble */}
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                ${active ? 'border-orange-500 bg-orange-500' : 'border-slate-600'}
              `}>
                {active && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`font-medium text-sm leading-tight ${active ? 'text-white' : 'text-slate-300'}`}>
                {opt.label}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   CARD SELECT (single or multi)
───────────────────────────────────────────── */
function CardSelect({ question, answer, onAnswer }) {
  const { single, exclusive, options } = question

  const selected = single
    ? (answer ? [answer] : [])
    : (Array.isArray(answer) ? answer : [])

  const isSelected = (val) => selected.includes(val)

  const toggle = (val) => {
    if (single) {
      onAnswer(question.id, val)
      return
    }
    let next
    if (exclusive?.includes(val)) {
      next = isSelected(val) ? [] : [val]
    } else {
      const withoutExcl = selected.filter((v) => !exclusive?.includes(v))
      next = isSelected(val)
        ? withoutExcl.filter((v) => v !== val)
        : [...withoutExcl, val]
    }
    onAnswer(question.id, next)
  }

  const colClass =
    options.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
    options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
    options.length === 4 ? 'grid-cols-2' :
    'grid-cols-2 sm:grid-cols-3'

  return (
    <div className={`grid ${colClass} gap-3 w-full max-w-2xl`}>
      {options.map((opt, idx) => {
        const active = isSelected(opt.value)
        return (
          <motion.button
            key={opt.value}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(opt.value)}
            className={`
              relative p-4 rounded-2xl border-2 text-left cursor-pointer
              transition-all duration-200 group
              ${active
                ? 'border-orange-500 bg-gradient-to-br from-orange-500/15 to-purple-600/5 card-glow-orange text-white'
                : 'border-slate-700 bg-[#111C2E] text-slate-300 hover:border-slate-500/80 hover:bg-[#162133] hover:card-glow-purple'
              }
            `}
          >
            {/* Multi-select checkbox */}
            {!single && (
              <motion.div
                animate={active ? { scale: 1 } : { scale: 0.9 }}
                className={`
                  absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center
                  transition-all duration-150
                  ${active ? 'border-orange-500 bg-orange-500' : 'border-slate-600 group-hover:border-slate-400'}
                `}
              >
                {active && <Icons.Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </motion.div>
            )}

            {/* Single-select indicator */}
            {single && active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"
              >
                <Icons.Check className="w-3 h-3 text-white" strokeWidth={3} />
              </motion.div>
            )}

            <div className="flex flex-col gap-2.5">
              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                ${active
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-slate-800 text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-700/60'
                }
              `}>
                <DynIcon name={opt.icon} className="w-5 h-5" />
              </div>

              {/* Labels */}
              <div>
                <div className={`font-semibold text-sm leading-tight ${active ? 'text-white' : 'text-slate-200'}`}>
                  {opt.label}
                </div>
                {opt.description && (
                  <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
                )}
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   RANGE SLIDER
───────────────────────────────────────────── */
function RangeSlider({ question, answer, onAnswer }) {
  const value = answer ?? question.defaultValue
  const pct   = ((value - question.min) / (question.max - question.min)) * 100

  return (
    <div className="w-full max-w-xl">
      {/* Big value display */}
      <div className="text-center mb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: -8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 8,   scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className="text-6xl font-extrabold text-gradient-brand leading-none"
          >
            {question.formatValue(value)}
          </motion.div>
        </AnimatePresence>
        <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-wider">
          {question.unit}
        </p>
      </div>

      {/* Slider track + thumb */}
      <div className="relative h-12 flex items-center">
        {/* Background track */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-slate-800" />

        {/* Filled track */}
        <motion.div
          className="absolute left-0 h-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-500"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.08 }}
        />

        {/* Glow on filled track */}
        <div
          className="absolute left-0 h-2 rounded-full bg-gradient-to-r from-orange-500/40 to-purple-500/40 blur-sm"
          style={{ width: `${pct}%` }}
        />

        {/* Custom thumb */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-white border-[3px] border-orange-400
                     shadow-[0_0_16px_rgba(255,102,0,0.6)] pointer-events-none z-10"
          animate={{ left: `calc(${pct}% - 12px)` }}
          transition={{ duration: 0.08 }}
        />

        {/* Invisible native range for interaction */}
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.sliderStep}
          value={value}
          onChange={(e) => onAnswer(question.id, Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-20 h-full"
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between mt-3 text-slate-600 text-xs font-medium">
        <span>{question.formatValue(question.min)}</span>
        <span>{question.formatValue(question.max)}</span>
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-1 px-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-px h-1.5 bg-slate-700 rounded-full" />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   QUESTION CARD (main export)
───────────────────────────────────────────── */
export default function QuestionCard({
  question,
  answer,
  onAnswer,
  onNext,
  onBack,
  canGoBack,
  isLast,
  direction,
}) {
  const [showError, setShowError] = useState(false)
  const [shake, setShake]         = useState(false)

  const hasAnswer = answer !== undefined && answer !== null && answer !== '' &&
    (!Array.isArray(answer) || answer.length > 0)

  const canProceed = !question.required || hasAnswer

  const handleNext = () => {
    if (!canProceed) {
      setShowError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setTimeout(() => setShowError(false), 3000)
      return
    }
    onNext()
  }

  // Auto-advance on single card-select pick (not multi)
  const handleAnswer = (id, val) => {
    onAnswer(id, val)
    if (question.type === 'radio' || (question.type === 'card-select' && question.single)) {
      setTimeout(() => onNext(), 280)
    }
  }

  return (
    <motion.div
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className={`w-full max-w-2xl ${shake ? 'animate-shake' : ''}`}
    >
      {/* Category badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-5"
      >
        <span className="
          inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest
          text-orange-400/90 bg-orange-400/10 border border-orange-400/20
          px-3 py-1 rounded-full
        ">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          {question.category}
        </span>
      </motion.div>

      {/* Question headline */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2"
      >
        {question.question}
      </motion.h2>

      {/* Subtitle */}
      {question.subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="text-slate-400 text-sm mb-7"
        >
          {question.subtitle}
        </motion.p>
      )}

      {!question.subtitle && <div className="mb-7" />}

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        {(question.type === 'text' || question.type === 'email') && (
          <TextInput question={question} answer={answer} onAnswer={onAnswer} />
        )}
        {question.type === 'radio' && (
          <RadioInput question={question} answer={answer} onAnswer={handleAnswer} />
        )}
        {question.type === 'card-select' && (
          <CardSelect question={question} answer={answer} onAnswer={handleAnswer} />
        )}
        {question.type === 'range-slider' && (
          <RangeSlider question={question} answer={answer} onAnswer={onAnswer} />
        )}
      </motion.div>

      {/* Validation error */}
      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-400 text-sm mt-4"
          >
            <Icons.AlertCircle className="w-4 h-4" />
            Please answer this question to continue.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Navigation footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.28 }}
        className="flex items-center justify-between mt-9"
      >
        {/* Back */}
        {canGoBack ? (
          <motion.button
            type="button"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 transition-colors px-3 py-2 rounded-xl hover:bg-white/5 text-sm font-medium"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        ) : (
          <div />
        )}

        {/* Next / Submit
            Rules:
            - single card-select & radio → auto-advance on pick, no button needed
            - multi-select card-select   → always show Continue (required = must have ≥1, optional = can skip)
            - text / email / range-slider → always show Continue
        */}
        {(() => {
          const isAutoAdvance = question.type === 'radio' ||
            (question.type === 'card-select' && question.single)
          const isMultiSelect = question.type === 'card-select' && !question.single
          const needsButton   = !isAutoAdvance // text, email, range-slider, multi-select

          if (!needsButton) return null

          // Optional multi-select with nothing chosen → show Skip instead
          if (isMultiSelect && !question.required && !hasAnswer) {
            return (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNext}
                className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-sm font-medium transition-all"
              >
                Skip
                <Icons.ChevronRight className="w-4 h-4" />
              </motion.button>
            )
          }

          return (
            <motion.button
              type="button"
              whileHover={canProceed ? { scale: 1.04, y: -1 } : {}}
              whileTap={canProceed ? { scale: 0.97 } : {}}
              onClick={handleNext}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm
                transition-all duration-200
                ${canProceed
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_0_24px_rgba(255,102,0,0.35)] hover:shadow-[0_0_36px_rgba(255,102,0,0.5)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }
              `}
            >
              {isLast ? (
                <>
                  <Icons.Sparkles className="w-4 h-4" />
                  Generate Report
                </>
              ) : (
                <>
                  Continue
                  <Icons.ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          )
        })()}
      </motion.div>
    </motion.div>
  )
}
