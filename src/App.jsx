import React, { useState, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ProgressPulse from './components/ProgressPulse'
import QuestionCard  from './components/QuestionCard'
import SubmitScreen  from './components/SubmitScreen'

/* ═══════════════════════════════════════════════════
   QUESTION SCHEMA
   skipIf(answers) → true means the question is hidden
═══════════════════════════════════════════════════ */
const QUESTIONS = [
  /* ── Basic Info ── */
  {
    id: 'name',
    category: 'Basic Info',
    type: 'text',
    question: "What's your name?",
    placeholder: 'Jane Smith',
    required: true,
  },
  {
    id: 'email',
    category: 'Basic Info',
    type: 'email',
    question: "What's your work email?",
    placeholder: 'jane@company.com',
    required: true,
  },
  {
    id: 'company',
    category: 'Basic Info',
    type: 'text',
    question: 'Which company do you work for?',
    placeholder: 'Acme Corp',
    required: true,
  },
  {
    id: 'role',
    category: 'Basic Info',
    type: 'card-select',
    single: true,
    question: "What's your role?",
    required: true,
    options: [
      { value: 'developer', label: 'Developer',    icon: 'Code2',          description: 'Frontend / Backend' },
      { value: 'qa',        label: 'QA Engineer',  icon: 'FlaskConical',   description: 'Manual or automation' },
      { value: 'devops',    label: 'DevOps',        icon: 'GitBranch',      description: 'CI/CD & infra' },
      { value: 'manager',   label: 'Eng Manager',   icon: 'Users',          description: 'Leading a team' },
      { value: 'cto',       label: 'CTO / VP Eng',  icon: 'Building2',      description: 'Engineering leader' },
      { value: 'other',     label: 'Other',          icon: 'MoreHorizontal', description: 'Something else' },
    ],
  },

  /* ── Intent ── */
  {
    id: 'intent',
    category: 'Intent',
    type: 'card-select',
    single: false,
    question: 'What are you looking to solve with BrowserStack?',
    subtitle: 'Select all that apply',
    required: true,
    options: [
      { value: 'cross-browser', label: 'Cross-Browser Testing', icon: 'Globe',       description: 'Desktop & mobile web' },
      { value: 'mobile',        label: 'Mobile App Testing',    icon: 'Smartphone',  description: 'iOS & Android native' },
      { value: 'automated',     label: 'Automated Testing',     icon: 'Bot',         description: 'CI-triggered suites' },
      { value: 'manual',        label: 'Manual Testing',        icon: 'MousePointer',description: 'Exploratory QA' },
      { value: 'performance',   label: 'Performance Testing',   icon: 'Zap',         description: 'Speed & load' },
      { value: 'visual',        label: 'Visual Regression',     icon: 'ScanEye',     description: 'Screenshot diffs' },
    ],
  },

  /* ── Infrastructure ── */
  {
    id: 'uses_ci',
    category: 'Infrastructure',
    type: 'radio',
    question: 'Do you utilize Continuous Integration?',
    required: true,
    options: [
      { value: 'yes', label: 'Yes — CI is part of our workflow' },
      { value: 'no',  label: 'No — we deploy manually'         },
    ],
  },
  {
    id: 'ci_tools',
    category: 'Infrastructure',
    type: 'card-select',
    single: false,
    question: 'Which CI/CD tools does your team use?',
    subtitle: 'Select all that apply',
    required: false,
    /* SKIP if user chose "No" to CI */
    skipIf: (a) => a.uses_ci !== 'yes',
    options: [
      { value: 'jenkins',        label: 'Jenkins',        icon: 'Server'    },
      { value: 'github-actions', label: 'GitHub Actions', icon: 'Github'    },
      { value: 'gitlab',         label: 'GitLab CI',      icon: 'Gitlab'    },
      { value: 'circleci',       label: 'CircleCI',       icon: 'CircleDot' },
      { value: 'azure',          label: 'Azure DevOps',   icon: 'Cloud'     },
      { value: 'bamboo',         label: 'Bamboo',         icon: 'Layers'    },
    ],
  },
  {
    id: 'device_preference',
    category: 'Infrastructure',
    type: 'card-select',
    single: true,
    question: "What's your device testing preference?",
    required: true,
    options: [
      { value: 'emulators', label: 'Emulators / Simulators', icon: 'MonitorSmartphone', description: 'Fast & cost-effective' },
      { value: 'real',      label: 'Real Devices',           icon: 'Smartphone',        description: 'Maximum accuracy'     },
      { value: 'both',      label: 'Both',                   icon: 'Layers',            description: 'Best of both worlds'  },
    ],
  },
  {
    id: 'app_distribution',
    category: 'Infrastructure',
    type: 'card-select',
    single: false,
    question: 'How do you distribute your apps?',
    subtitle: 'Select all that apply',
    required: false,
    options: [
      { value: 'app-store',  label: 'App Store',           icon: 'Apple'       },
      { value: 'google-play',label: 'Google Play',         icon: 'Play'        },
      { value: 'firebase',   label: 'Firebase',            icon: 'Flame'       },
      { value: 'internal',   label: 'Internal Distribution', icon: 'Lock'      },
      { value: 'testflight', label: 'TestFlight',          icon: 'PlaneTakeoff'},
    ],
  },

  /* ── Tech Stack ── */
  {
    id: 'frameworks',
    category: 'Tech Stack',
    type: 'card-select',
    single: false,
    question: 'Which automated frameworks do you use?',
    subtitle: 'Select all that apply — choose "None" to skip automation questions',
    required: false,
    exclusive: ['none'],
    options: [
      { value: 'appium',     label: 'Appium',     icon: 'Smartphone'   },
      { value: 'espresso',   label: 'Espresso',   icon: 'Coffee'       },
      { value: 'xcuitest',   label: 'XCUITest',   icon: 'Apple'        },
      { value: 'detox',      label: 'Detox',      icon: 'FlaskConical' },
      { value: 'selenium',   label: 'Selenium',   icon: 'Globe'        },
      { value: 'playwright', label: 'Playwright', icon: 'Theater'      },
      { value: 'none',       label: 'None',       icon: 'X'            },
    ],
  },
  {
    id: 'languages',
    category: 'Tech Stack',
    type: 'card-select',
    single: false,
    question: 'Which programming languages do you use?',
    subtitle: 'Select all that apply',
    required: false,
    /* SKIP if "None" was selected for frameworks */
    skipIf: (a) => Array.isArray(a.frameworks) && a.frameworks.includes('none'),
    options: [
      { value: 'java',       label: 'Java',       icon: 'Coffee'  },
      { value: 'python',     label: 'Python',     icon: 'Code2'   },
      { value: 'javascript', label: 'JavaScript', icon: 'Braces'  },
      { value: 'ruby',       label: 'Ruby',       icon: 'Gem'     },
      { value: 'csharp',     label: 'C#',         icon: 'Hash'    },
      { value: 'swift',      label: 'Swift',      icon: 'Wind'    },
      { value: 'kotlin',     label: 'Kotlin',     icon: 'Triangle'},
    ],
  },

  /* ── Performance Metrics ── */
  {
    id: 'test_count',
    category: 'Performance',
    type: 'range-slider',
    question: 'How many automated tests do you run per cycle?',
    required: false,
    min: 0,
    max: 10000,
    sliderStep: 100,
    defaultValue: 500,
    formatValue: (v) => v >= 10000 ? '10,000+' : v.toLocaleString(),
    unit: 'tests per run',
  },
  {
    id: 'build_time',
    category: 'Performance',
    type: 'range-slider',
    question: 'How long do you want your builds to take?',
    subtitle: 'Target build duration',
    required: false,
    min: 5,
    max: 120,
    sliderStep: 5,
    defaultValue: 30,
    formatValue: (v) => `${v} min`,
    unit: 'target duration',
  },
  {
    id: 'parallelism',
    category: 'Performance',
    type: 'range-slider',
    question: 'What are your parallelism goals?',
    subtitle: 'Concurrent test sessions you need',
    required: false,
    /* SKIP if frameworks = None */
    skipIf: (a) => Array.isArray(a.frameworks) && a.frameworks.includes('none'),
    min: 1,
    max: 100,
    sliderStep: 1,
    defaultValue: 5,
    formatValue: (v) => String(v),
    unit: 'concurrent sessions',
  },

  /* ── Coverage ── */
  {
    id: 'os_devices',
    category: 'Coverage',
    type: 'card-select',
    single: false,
    question: 'Which platforms do you need to cover?',
    subtitle: 'Select all that apply',
    required: false,
    options: [
      { value: 'ios',     label: 'iOS',     icon: 'Smartphone', description: 'iPhone & iPad'   },
      { value: 'android', label: 'Android', icon: 'Smartphone', description: 'Phone & Tablet'  },
      { value: 'windows', label: 'Windows', icon: 'Monitor',    description: 'Desktop browsers' },
      { value: 'macos',   label: 'macOS',   icon: 'Laptop',     description: 'Safari & Chrome' },
      { value: 'linux',   label: 'Linux',   icon: 'Terminal',   description: 'CLI & Headless'  },
    ],
  },
  {
    id: 'os_versions',
    category: 'Coverage',
    type: 'card-select',
    single: true,
    question: 'Which OS / browser versions matter most?',
    required: false,
    options: [
      { value: 'latest', label: 'Latest Only',    icon: 'Star',    description: 'Cutting edge'   },
      { value: 'last-2', label: 'Last 2 Versions',icon: 'Layers',  description: 'Most users'     },
      { value: 'last-3', label: 'Last 3 Versions',icon: 'Archive', description: 'Broad coverage' },
      { value: 'all',    label: 'All Versions',   icon: 'Database',description: 'Max coverage'   },
    ],
  },
]

/* ═══════════════════════════════════════════════════
   BACKGROUND DECORATION
═══════════════════════════════════════════════════ */
function BackgroundFx() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A1628] via-[#080E1A] to-[#0D0B1E] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_10%,rgba(255,102,0,0.07)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_90%,rgba(123,97,255,0.07)_0%,transparent_70%)] pointer-events-none" />
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </>
  )
}

/* ═══════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════ */
export default function App() {
  const [currentIdx,   setCurrentIdx]   = useState(0)
  const [answers,      setAnswers]      = useState({})
  const [direction,    setDirection]    = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Re-evaluate visible questions whenever answers change */
  const visible = useMemo(
    () => QUESTIONS.filter((q) => !q.skipIf || !q.skipIf(answers)),
    [answers],
  )

  const current = visible[currentIdx]
  const isLast  = currentIdx === visible.length - 1
  const progress = ((currentIdx + 1) / (visible.length + 1)) * 100

  const handleAnswer = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleNext = useCallback(() => {
    if (isLast) {
      setIsSubmitting(true)
    } else {
      setDirection(1)
      setCurrentIdx((i) => i + 1)
    }
  }, [isLast])

  const handleBack = useCallback(() => {
    if (currentIdx > 0) {
      setDirection(-1)
      setCurrentIdx((i) => i - 1)
    }
  }, [currentIdx])

  if (isSubmitting) return <SubmitScreen answers={answers} />

  return (
    <div className="min-h-screen text-white flex flex-col overflow-x-hidden">
      <BackgroundFx />

      {/* Sticky progress header */}
      <ProgressPulse
        progress={progress}
        current={currentIdx + 1}
        total={visible.length}
        category={current?.category}
      />

      {/* Question area */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-10 md:py-16 min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          {current && (
            <QuestionCard
              key={current.id}
              question={current}
              answer={answers[current.id]}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              canGoBack={currentIdx > 0}
              isLast={isLast}
              direction={direction}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative pb-6 text-center"
      >
        <p className="text-slate-700 text-xs">
          🔒 Your data is encrypted and never shared with third parties.
        </p>
      </motion.div>
    </div>
  )
}
