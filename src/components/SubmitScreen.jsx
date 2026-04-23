import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, BarChart3, Zap, Sparkles, ArrowRight, Calendar,
  X, Smartphone, Globe, GitBranch, Layers, Clock, Cpu,
  ChevronRight, ExternalLink, Shield, TrendingUp, Target,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const LOADING_STEPS = [
  { icon: '🔍', text: 'Analyzing your testing infrastructure…'    },
  { icon: '🧩', text: 'Mapping your tech stack coverage…'         },
  { icon: '📊', text: 'Calculating performance benchmarks…'       },
  { icon: '💡', text: 'Generating personalized recommendations…'  },
  { icon: '✨', text: 'Finalizing your custom report…'            },
]

/* ─────────────────────────────────────────────
   Helpers — derive readable labels from answers
───────────────────────────────────────────── */
const LABEL = {
  role:        { developer:'Developer', qa:'QA Engineer', devops:'DevOps', manager:'Eng Manager', cto:'CTO / VP Eng', other:'Other' },
  intent:      { 'cross-browser':'Cross-Browser Testing', mobile:'Mobile App Testing', automated:'Automated Testing', manual:'Manual Testing', performance:'Performance Testing', visual:'Visual Regression' },
  ci_tools:    { jenkins:'Jenkins', 'github-actions':'GitHub Actions', gitlab:'GitLab CI', circleci:'CircleCI', azure:'Azure DevOps', bamboo:'Bamboo' },
  device:      { emulators:'Emulators / Simulators', real:'Real Devices', both:'Both' },
  dist:        { 'app-store':'App Store', 'google-play':'Google Play', firebase:'Firebase', internal:'Internal', testflight:'TestFlight' },
  frameworks:  { appium:'Appium', espresso:'Espresso', xcuitest:'XCUITest', detox:'Detox', selenium:'Selenium', playwright:'Playwright', none:'None' },
  languages:   { java:'Java', python:'Python', javascript:'JavaScript', ruby:'Ruby', csharp:'C#', swift:'Swift', kotlin:'Kotlin' },
  platforms:   { ios:'iOS', android:'Android', windows:'Windows', macos:'macOS', linux:'Linux' },
  os_versions: { latest:'Latest Only', 'last-2':'Last 2 Versions', 'last-3':'Last 3 Versions', all:'All Versions' },
}

function labelize(map, val) {
  if (!val) return null
  if (Array.isArray(val)) return val.map(v => map[v] || v).join(', ')
  return map[val] || val
}

/* ─────────────────────────────────────────────
   Recommendation engine — produces 3 tailored
   insight cards from the answers
───────────────────────────────────────────── */
function buildInsights(answers) {
  const insights = []

  // Device preference insight
  if (answers.device_preference === 'real') {
    insights.push({
      icon: Smartphone,
      color: 'text-orange-400',
      bg:   'bg-orange-500/10',
      title: 'Real Device Cloud',
      body:  'Your preference for real devices aligns perfectly with BrowserStack App Live — 3,500+ real devices available instantly, no device lab management.',
    })
  } else if (answers.device_preference === 'emulators') {
    insights.push({
      icon: Cpu,
      color: 'text-blue-400',
      bg:   'bg-blue-500/10',
      title: 'Emulator Acceleration',
      body:  'BrowserStack Automate supports parallel emulator/simulator runs in CI, giving you fast feedback without real-device cost overhead.',
    })
  } else {
    insights.push({
      icon: Layers,
      color: 'text-purple-400',
      bg:   'bg-purple-500/10',
      title: 'Hybrid Device Strategy',
      body:  'Using both emulators and real devices is the gold standard. Run smoke tests on emulators in CI, then gate releases on real-device regression suites.',
    })
  }

  // CI insight
  if (answers.uses_ci === 'yes' && answers.ci_tools?.length) {
    insights.push({
      icon: GitBranch,
      color: 'text-green-400',
      bg:   'bg-green-500/10',
      title: `${labelize(LABEL.ci_tools, answers.ci_tools?.[0])} Integration Ready`,
      body:  `BrowserStack has native plugins for ${labelize(LABEL.ci_tools, answers.ci_tools)}. Tests can trigger automatically on every PR with zero config changes.`,
    })
  } else if (answers.uses_ci === 'no') {
    insights.push({
      icon: TrendingUp,
      color: 'text-yellow-400',
      bg:   'bg-yellow-500/10',
      title: 'CI Adoption Opportunity',
      body:  'Teams that introduce CI with BrowserStack cut release cycles by 40% on average. We can help you set up a starter pipeline in under a day.',
    })
  }

  // Build time insight
  if (answers.build_time !== undefined) {
    const target = answers.build_time
    const sessions = answers.parallelism ?? 5
    const current  = answers.test_count  ?? 500
    const estParallel = Math.max(sessions, Math.ceil(current / (target * 2)))
    insights.push({
      icon: Clock,
      color: 'text-pink-400',
      bg:   'bg-pink-500/10',
      title: `Hit Your ${target}-Minute Build Target`,
      body:  `With ~${estParallel} parallel sessions on BrowserStack, your ${current.toLocaleString()} tests can finish within your ${target}-minute window — no infrastructure provisioning required.`,
    })
  }

  // Framework insight
  if (answers.frameworks?.length && !answers.frameworks.includes('none')) {
    insights.push({
      icon: Globe,
      color: 'text-cyan-400',
      bg:   'bg-cyan-500/10',
      title: `${labelize(LABEL.frameworks, answers.frameworks?.slice(0,1))} on BrowserStack`,
      body:  `Your existing ${labelize(LABEL.frameworks, answers.frameworks)} tests run on BrowserStack with a single config change — no rewrite required.`,
    })
  }

  // Coverage insight
  if (answers.os_devices?.length) {
    insights.push({
      icon: Target,
      color: 'text-violet-400',
      bg:   'bg-violet-500/10',
      title: `Full ${labelize(LABEL.platforms, answers.os_devices)} Coverage`,
      body:  `BrowserStack covers all ${answers.os_devices.length} of your target platforms with ${answers.os_versions ? labelize(LABEL.os_versions, answers.os_versions) + ' support' : 'broad OS version support'} built in.`,
    })
  }

  // Security/reliability catch-all
  insights.push({
    icon: Shield,
    color: 'text-emerald-400',
    bg:   'bg-emerald-500/10',
    title: 'Enterprise-Grade Reliability',
    body:  '99.9% uptime SLA, SOC2 Type II certified, GDPR compliant — BrowserStack scales with your team from day one.',
  })

  return insights.slice(0, 4)
}

/* ─────────────────────────────────────────────
   Report Modal
───────────────────────────────────────────── */
function ReportModal({ answers, onClose }) {
  const name     = answers?.name    || ''
  const company  = answers?.company || ''
  const insights = buildInsights(answers)

  const sections = [
    {
      title: 'Your Profile',
      items: [
        answers.name    && { label: 'Name',    value: answers.name },
        answers.company && { label: 'Company', value: answers.company },
        answers.role    && { label: 'Role',    value: labelize(LABEL.role, answers.role) },
      ].filter(Boolean),
    },
    {
      title: 'Testing Goals',
      items: [
        answers.intent?.length && { label: 'Focus Areas', value: labelize(LABEL.intent, answers.intent) },
      ].filter(Boolean),
    },
    {
      title: 'Infrastructure',
      items: [
        answers.uses_ci          && { label: 'CI / CD',          value: answers.uses_ci === 'yes' ? `Yes — ${labelize(LABEL.ci_tools, answers.ci_tools) || 'configured'}` : 'Not yet' },
        answers.device_preference && { label: 'Device Preference', value: labelize(LABEL.device, answers.device_preference) },
        answers.app_distribution?.length && { label: 'Distribution',      value: labelize(LABEL.dist, answers.app_distribution) },
      ].filter(Boolean),
    },
    {
      title: 'Tech Stack',
      items: [
        answers.frameworks?.length && { label: 'Frameworks', value: labelize(LABEL.frameworks, answers.frameworks) },
        answers.languages?.length  && { label: 'Languages',  value: labelize(LABEL.languages,  answers.languages)  },
      ].filter(Boolean),
    },
    {
      title: 'Performance Targets',
      items: [
        answers.test_count  !== undefined && { label: 'Tests / Run',     value: answers.test_count >= 10000 ? '10,000+' : answers.test_count.toLocaleString() },
        answers.build_time  !== undefined && { label: 'Target Duration', value: `${answers.build_time} min`  },
        answers.parallelism !== undefined && { label: 'Parallelism Goal',value: `${answers.parallelism} sessions` },
      ].filter(Boolean),
    },
    {
      title: 'Coverage',
      items: [
        answers.os_devices?.length  && { label: 'Platforms',  value: labelize(LABEL.platforms,   answers.os_devices)  },
        answers.os_versions         && { label: 'OS Versions', value: labelize(LABEL.os_versions, answers.os_versions) },
      ].filter(Boolean),
    },
  ].filter(s => s.items.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0,  opacity: 1, scale: 1    }}
        exit={{    y: 60, opacity: 0, scale: 0.97  }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh]
                   bg-[#0E1B2E] border border-slate-700/60 rounded-t-3xl sm:rounded-3xl
                   overflow-hidden flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Benchmark Report</p>
              {(name || company) && (
                <p className="text-slate-500 text-xs">{[name, company].filter(Boolean).join(' · ')}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Insights */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400/80 mb-3">
              Personalized Insights
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.map((ins, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`${ins.bg} border border-white/5 rounded-2xl p-4`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <ins.icon className={`w-4 h-4 ${ins.color} shrink-0`} />
                    <span className={`text-xs font-bold ${ins.color}`}>{ins.title}</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{ins.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Survey summary */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              Your Answers
            </p>
            <div className="space-y-4">
              {sections.map((sec) => (
                <div key={sec.title}>
                  <p className="text-slate-400 text-xs font-semibold mb-2">{sec.title}</p>
                  <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/40">
                    {sec.items.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-start justify-between gap-4 px-4 py-3 text-sm ${
                          i < sec.items.length - 1 ? 'border-b border-slate-700/40' : ''
                        }`}
                      >
                        <span className="text-slate-500 shrink-0">{item.label}</span>
                        <span className="text-slate-200 text-right text-xs leading-relaxed">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-slate-800 shrink-0 flex gap-3">
          <motion.a
            href="https://www.browserstack.com/contact#sales"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3
              bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500
              text-white font-semibold text-sm rounded-2xl
              shadow-[0_0_20px_rgba(255,102,0,0.3)] transition-all"
          >
            <Calendar className="w-4 h-4" />
            Schedule a Demo
            <ExternalLink className="w-3 h-3 opacity-70" />
          </motion.a>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700
              text-slate-300 font-semibold text-sm rounded-2xl transition-all"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Floating particle (success bg)
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Main screen
───────────────────────────────────────────── */
export default function SubmitScreen({ answers }) {
  const [stepIdx,     setStepIdx]     = useState(0)
  const [phase,       setPhase]       = useState('loading')
  const [showReport,  setShowReport]  = useState(false)

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
    <>
      <div className="min-h-screen bg-[#080E1A] text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient layers */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#0A1628] via-[#080E1A] to-[#0D0B1E]" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,102,0,0.07)_0%,transparent_70%)]" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(123,97,255,0.06)_0%,transparent_70%)]" />

        {phase === 'success' && [
          { delay: 0,   x: 15, y: 20, size: 8  },
          { delay: 0.5, x: 80, y: 15, size: 5  },
          { delay: 1,   x: 70, y: 75, size: 10 },
          { delay: 0.3, x: 25, y: 70, size: 6  },
          { delay: 0.8, x: 50, y: 85, size: 4  },
          { delay: 1.5, x: 90, y: 50, size: 7  },
        ].map((p, i) => <Particle key={i} {...p} />)}

        <AnimatePresence mode="wait">
          {/* ── LOADING ── */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.3 } }}
              className="relative text-center max-w-sm w-full"
            >
              <div className="relative w-36 h-36 mx-auto mb-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-[2px] border-transparent"
                  style={{ borderTopColor: '#FF6600', borderRightColor: '#7B61FF' }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-3 rounded-full border-[2px] border-transparent opacity-70"
                  style={{ borderBottomColor: '#FF6600', borderLeftColor: '#7B61FF' }}
                />
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-6 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center"
                >
                  <BarChart3 className="w-10 h-10 text-orange-400" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-1">Generating Your Custom</h2>
              <h2 className="text-2xl font-extrabold text-gradient-brand mb-2">Benchmark Report</h2>
              <p className="text-slate-500 text-sm mb-8">Powered by BrowserStack intelligence</p>

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
                      <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all duration-300
                        ${done ? 'bg-green-500' : active ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'}`}>
                        {done && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors duration-300
                        ${done ? 'text-green-400' : active ? 'text-white' : 'text-slate-600'}`}>
                        {step.icon} {step.text}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="relative text-center max-w-lg w-full"
            >
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

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Report Ready</span>
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2">Your BrowserStack</h1>
                <h1 className="text-4xl md:text-5xl font-black text-gradient-brand leading-tight mb-6">Benchmark Report</h1>

                <p className="text-slate-400 text-base mb-2 max-w-md mx-auto">
                  {name !== 'there' && <><span className="text-white font-semibold">{name}</span> — </>}
                  We've crafted a personalized testing strategy
                  {company !== 'your team'
                    ? <> for <span className="text-white font-semibold">{company}</span></>
                    : ' for your team'}.
                </p>

                {/* Stats */}
                <div className="flex justify-center gap-6 my-8">
                  {[
                    { label: 'Insights Generated', value: buildInsights(answers).length },
                    { label: 'Questions Answered', value: Object.keys(answers || {}).length },
                    { label: 'Est. Setup Time',    value: '< 1d' },
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
                    onClick={() => setShowReport(true)}
                    className="flex items-center justify-center gap-2 px-7 py-3.5
                      bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500
                      text-white font-semibold rounded-2xl
                      shadow-[0_0_30px_rgba(255,102,0,0.35)] hover:shadow-[0_0_44px_rgba(255,102,0,0.5)]
                      transition-all duration-200"
                  >
                    <Zap className="w-5 h-5" />
                    View Your Report
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>

                  <motion.a
                    href="https://www.browserstack.com/contact#sales"
                    target="_blank"
                    rel="noopener noreferrer"
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
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </motion.a>
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

      {/* Report modal — rendered outside the scroll container */}
      <AnimatePresence>
        {showReport && <ReportModal answers={answers} onClose={() => setShowReport(false)} />}
      </AnimatePresence>
    </>
  )
}
