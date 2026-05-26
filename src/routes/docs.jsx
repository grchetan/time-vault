import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, Lock, Mail, Trash2, Shield, Brain, HelpCircle, 
  Search, ChevronRight, ChevronDown, Copy, Check, ArrowUp, 
  Sparkles, CheckCircle2, ShieldCheck, Key, RefreshCw, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { LiquidWave } from '@/components/liquid-wave'

export const Route = createFileRoute('/docs')({
  component: DocsPage,
})

const SECTIONS = [
  { id: 'welcome', label: 'Welcome to TimeVault', icon: BookOpen },
  { id: 'create-vault', label: 'Create Your First Vault', icon: Lock },
  { id: 'future-mail', label: 'Using Future Mail', icon: Mail },
  { id: 'trash-recovery', label: 'Trash & Recovery System', icon: Trash2 },
  { id: 'security-privacy', label: 'Security & Privacy', icon: Shield },
  { id: 'philosophy', label: 'Productivity Philosophy', icon: Brain },
  { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
]

const FAQS = [
  {
    q: 'Can I unlock my vault early?',
    a: 'Absolutely not. This is a core philosophy of TimeVault. All lock durations are strictly enforced at the database layer using Supabase row-level constraints. No admin override exists, and support cannot bypass your timer. Willpower is built on friction.'
  },
  {
    q: 'What happens if I delete a locked vault?',
    a: 'Deleted items are not wiped immediately; they are sent to the Trash & Recovery system. A locked vault inside Trash remains fully locked and encrypted until its original timer expires, preventing impulse bypasses by simply deleting the item.'
  },
  {
    q: 'Is my vault data encrypted?',
    a: 'Yes. TimeVault utilizes client-side AES-256 style encryption algorithms. Your credentials are fully scrambled before leaving your browser, meaning our database holds only zero-knowledge ciphertexts that can only be decrypted by your account authorization.'
  },
  {
    q: 'Can I restore deleted items?',
    a: 'Yes, both Vault locks and Future Mail letters remain in the Trash & Recovery tab for exactly 30 days. You can instantly restore them to your active dashboard with a single click during this window.'
  },
  {
    q: 'What if I forget my login credentials?',
    a: 'You can restore your password via Firebase Auth recovery processes. However, your individual secret vault keys and credentials remain securely locked beneath their respective countdowns.'
  },
  {
    q: 'Can I edit active locked vaults?',
    a: 'No. Once a vault is locked and active, the parameters (including account name, encrypted contents, and unseal date) cannot be edited or modified. The vault contract is sealed and immutable.'
  }
]

function OnboardingIllustration() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-auto drop-shadow-sm select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" rx="16" fill="var(--color-muted)" fillOpacity="0.2" stroke="var(--color-border)" strokeWidth="1" />
      <g opacity="0.8">
        {/* Connection nodes */}
        <line x1="80" y1="110" x2="200" y2="110" stroke="oklch(0.58 0.18 290)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="200" y1="110" x2="320" y2="110" stroke="oklch(0.58 0.18 290)" strokeWidth="2" strokeDasharray="4 4" />
        
        {/* Onboarding steps visual */}
        <circle cx="80" cy="110" r="28" fill="white" stroke="oklch(0.58 0.18 290)" strokeWidth="2.5" />
        <Lock className="size-6 text-primary" x="68" y="98" />
        
        <circle cx="200" cy="110" r="28" fill="white" stroke="oklch(0.58 0.18 290)" strokeWidth="2.5" />
        <Brain className="size-6 text-primary" x="188" y="98" />
        
        <circle cx="320" cy="110" r="28" fill="white" stroke="oklch(0.58 0.18 290)" strokeWidth="2.5" />
        <ShieldCheck className="size-6 text-primary" x="308" y="98" />
        
        {/* Captions */}
        <text x="80" y="165" textAnchor="middle" className="fill-foreground font-sans font-bold text-xs">1. Seal Vault</text>
        <text x="200" y="165" textAnchor="middle" className="fill-foreground font-sans font-bold text-xs">2. Resist Impulse</text>
        <text x="320" y="165" textAnchor="middle" className="fill-foreground font-sans font-bold text-xs">3. Reclaim Focus</text>
      </g>
    </svg>
  )
}

function SecurityShieldIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="size-36 mx-auto drop-shadow-md select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Soft glowing circles */}
      <circle cx="100" cy="100" r="80" fill="oklch(0.58 0.18 290 / 0.05)" />
      <circle cx="100" cy="100" r="60" fill="oklch(0.58 0.18 290 / 0.08)" />
      
      {/* Outer shield structure */}
      <path d="M100 35 L145 55 V105 C145 138 126 160 100 170 C74 160 55 138 55 105 V55 Z" fill="white" stroke="oklch(0.58 0.18 290)" strokeWidth="3" strokeLinejoin="round" />
      {/* Inner safe checks */}
      <path d="M85 100 L95 110 L115 90" stroke="oklch(0.58 0.18 290)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Floating stars */}
      <circle cx="50" cy="70" r="3" fill="oklch(0.58 0.18 290)" />
      <circle cx="150" cy="130" r="4" fill="oklch(0.58 0.18 290 / 0.5)" />
      <circle cx="140" cy="65" r="2.5" fill="oklch(0.58 0.18 290)" />
    </svg>
  )
}

function EmptyTrashIllustration() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-32 select-none mx-auto opacity-75" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="50" fill="var(--color-muted)" fillOpacity="0.25" />
      {/* Trash bucket outline */}
      <path d="M85 60 L90 115 H110 L115 60" stroke="var(--color-muted-foreground)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="80" y1="52" x2="120" y2="52" stroke="var(--color-muted-foreground)" strokeWidth="3" strokeLinecap="round" />
      <path d="M95 52 V46 C95 44 97 42 100 42 C103 42 105 44 105 46 V52" stroke="var(--color-muted-foreground)" strokeWidth="2" />
      {/* Leaf / clean indicators */}
      <circle cx="100" cy="80" r="3" fill="oklch(0.58 0.18 290)" />
      <circle cx="130" cy="75" r="2.5" fill="oklch(0.58 0.18 290 / 0.4)" />
    </svg>
  )
}

function DocsPage() {
  const [activeSection, setActiveSection] = useState('welcome')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const sectionRefs = useRef({})
  const scrollContainerRef = useRef(null)

  // Track reading progress & floating back to top button
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100)
      }
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // High performance IntersectionObserver for Scrollspy active section highlighting
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // focused view area
      threshold: 0
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [searchQuery])

  // Handle smooth scroll to section
  const scrollTo = (id) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const offset = 80 // offset for sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setActiveSection(id)
    }
  }

  // Copy support email action
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support.timevault@gmail.com')
    setCopiedEmail(true)
    toast.success('Email copied to clipboard', { description: 'support.timevault@gmail.com' })
    setTimeout(() => setCopiedEmail(false), 3000)
  }

  // Filter sections based on search query
  const matchesSearch = (section) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      section.label.toLowerCase().includes(q) ||
      section.id.toLowerCase().includes(q)
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Reading Progress Indicator Bar */}
      <div 
        className="fixed top-[64px] left-0 h-1 bg-gradient-primary z-50 transition-all duration-100" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Floating Background Glow Orbs */}
      <div className="fixed top-24 left-1/4 size-96 rounded-full bg-primary/5 blur-3xl pointer-events-none z-0 select-none animate-pulse" />
      <div className="fixed bottom-24 right-1/4 size-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none z-0 select-none animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 container mx-auto max-w-6xl px-5 py-12">
        {/* Editorial Guide Header */}
        <div className="border-b border-border/40 pb-8 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
              <BookOpen className="size-3.5" />
              Comprehensive Docs
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
              5 Min Read
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold font-mono tracking-wide uppercase shadow-sm">
              1,200 Words
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground font-display leading-tight">
            Documentation & <span className="text-gradient-moving">Guide</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed font-semibold">
            Master the core concepts of server-enforced digital focus. Learn how to encrypt your credentials, configure un-bypassable locked vaults, write letters to your future self, and understand the dopamine detox philosophy.
          </p>

          {/* Quick Search Tool */}
          <div className="mt-8 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5 group-hover:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search topics (e.g. Early unlock, Encryption)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-5 py-6 rounded-full border-border/80 bg-white/70 backdrop-blur-sm hover:border-primary/30 focus-visible:ring-primary shadow-soft w-full transition-all duration-300 font-medium"
            />
          </div>
        </div>

        {/* Collapsible Mobile Section Menu picker (stacks below header on md screens) */}
        <div className="md:hidden sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border border-border/60 rounded-2xl p-3 mb-6 shadow-sm">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-1 text-sm font-bold text-foreground"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              {SECTIONS.find(s => s.id === activeSection)?.label || 'Sections Menu'}
            </span>
            <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {mobileMenuOpen && (
            <div className="mt-3 border-t border-border/30 pt-2 flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                    activeSection === s.id
                      ? 'bg-primary-soft text-primary shadow-[inset_0_1px_2px_rgba(124,58,237,0.05)]'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <s.icon className="size-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Grid: Sticky Sidebar + Content panel */}
        <div className="grid md:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Fixed Sticky Sidebar (Desktop only) */}
          <nav className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-[100px] space-y-1.5 select-none" aria-label="Documentation navigation">
            <h2 className="text-[10px] font-extrabold text-muted-foreground uppercase font-mono tracking-widest pl-4 mb-4">Table of Contents</h2>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left px-4 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 flex items-center gap-3 border border-transparent ${
                  activeSection === s.id
                    ? 'text-primary bg-primary-soft/80 border-primary/10 shadow-sm font-bold pl-5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <s.icon className={`size-4 transition-transform duration-300 ${activeSection === s.id ? 'scale-110 text-primary' : ''}`} />
                {s.label}
              </button>
            ))}

            <div className="h-px bg-border/40 my-6" />

            {/* Quick stats panel inside sidebar */}
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Security Assurance</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal font-semibold">
                TimeVault operates under row-level database promises. No locks can be unsealed ahead of schedule under any circumstances.
              </p>
            </div>
          </nav>

          {/* Right Column: Content documentation panels */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-20">
            
            {/* Section 1: Welcome to TimeVault */}
            {matchesSearch(SECTIONS[0]) && (
              <section id="welcome" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center shadow-sm">
                    <BookOpen className="size-5.5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-foreground">1. Welcome to TimeVault</h2>
                </div>

                <div className="space-y-4 text-muted-foreground text-sm font-medium leading-relaxed">
                  <p>
                    TimeVault is a premium digital self-discipline and detox suite built to save you from digital distractions and instant gratification. In a hyper-connected world, willpower is an exhaustible resource. The most effective way to resist digital temptations is not simple self-motivation; it is the establishment of <strong>absolute, server-enforced friction</strong>.
                  </p>
                  <p>
                    Unlike standard productivity blockers or local browser extensions that can be bypassed in two clicks, TimeVault seals your sensitive credentials, game tokens, and distraction keys within an encrypted environment backed by strict, row-level constraints. Once locked, they remain unsealed until the dynamic countdown timer reaches zero.
                  </p>
                </div>

                {/* Onboarding Step Illustration Card */}
                <div className="my-6">
                  <OnboardingIllustration />
                </div>

                {/* Aesthetic Highlight Card */}
                <div className="card-3d p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-40" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
                      <Sparkles className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm font-display mb-1">Focus Built on Friction</h4>
                      <p className="text-xs text-muted-foreground leading-normal font-semibold">
                        Lock your social media password, game credentials, or entertainment tokens away. The friction guarantees that during periods of low discipline, you physically cannot bypass your focus contract.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Create Your First Vault */}
            {matchesSearch(SECTIONS[1]) && (
              <section id="create-vault" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center shadow-sm">
                    <Lock className="size-5.5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-foreground">2. Create Your First Vault</h2>
                </div>

                <div className="space-y-4 text-muted-foreground text-sm font-medium leading-relaxed">
                  <p>
                    Securing your credentials in a locked vault takes less than two minutes. Follow this visual step-by-step layout to seal your first contract.
                  </p>
                </div>

                {/* Numbered Steps layout */}
                <div className="grid sm:grid-cols-2 gap-5 my-6">
                  {[
                    { step: '1', title: 'Open Dashboard', desc: 'Sign in to your account and click the New Lock shortcut button.' },
                    { step: '2', title: 'Add Accounts', desc: 'Input the name of the app or account (e.g. Discord, Gaming login).' },
                    { step: '3', title: 'Input Password', desc: 'Add one or more credentials. They will be encrypted client-side immediately.' },
                    { step: '4', title: 'Choose Duration', desc: 'Select an unseal timer ranging from 1 Minute to 1 Year.' },
                    { step: '5', title: 'Add Motivation', desc: 'Write a quick reason why you are sealing this lock to remind yourself.' },
                    { step: '6', title: 'Confirm Contract', desc: 'Review the timer. Click confirm. The vault is locked securely.' }
                  ].map((s) => (
                    <div key={s.step} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-hover hover:border-primary/10 transition-all duration-300 flex items-start gap-4">
                      <span className="size-7 rounded-full bg-primary-soft text-primary grid place-items-center text-xs font-black shrink-0 font-mono">
                        {s.step}
                      </span>
                      <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-sm font-display">{s.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic Timeline Graph for Locking process */}
                <h3 className="text-sm font-extrabold text-muted-foreground uppercase font-mono tracking-wider mb-2">Vault Locking Timeline</h3>
                <div className="relative border-l border-border pl-6 ml-4 space-y-6 my-4 select-none">
                  {[
                    { title: 'Client Encryption', desc: 'Scrambles credentials locally using secure zero-knowledge ciphers.', badge: 'Safe' },
                    { title: 'Server Registration', desc: 'Binds dynamic unseal timer triggers on secure database rows.', badge: 'Active' },
                    { title: 'Immutable Seal', desc: 'Row constraints reject early decryptions. Zero early unseals allowed.', badge: 'Locked' }
                  ].map((t, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-9 top-1.5 size-5 rounded-full border-2 border-primary bg-white grid place-items-center group-hover:scale-110 transition-transform">
                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <h4 className="font-bold text-foreground text-xs font-display">{t.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-normal font-semibold mt-0.5">{t.desc}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black font-mono bg-primary-soft text-primary uppercase">{t.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dashboard Card Mockup Preview */}
                <div className="rounded-2xl border border-border bg-white shadow-card p-6 my-8 select-none relative overflow-hidden max-w-md mx-auto">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-amber-500" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 grid place-items-center">
                        <Lock className="size-4.5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-foreground">Playstation Network</div>
                        <div className="text-[10px] text-muted-foreground font-bold font-mono tracking-wide uppercase">30 Days Lock</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black font-mono uppercase bg-amber-50 border border-amber-100 text-amber-700 animate-pulse">
                      24d 18h remaining
                    </span>
                  </div>
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-3.5 py-2 mt-4 text-[11px] text-muted-foreground italic font-medium">
                    "Detoxing from gaming before mid-term exams. Must focus!"
                  </div>
                </div>
              </section>
            )}

            {/* Section 3: Using Future Mail */}
            {matchesSearch(SECTIONS[2]) && (
              <section id="future-mail" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center shadow-sm">
                    <Mail className="size-5.5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-foreground">3. Using Future Mail</h2>
                </div>

                <div className="space-y-4 text-muted-foreground text-sm font-medium leading-relaxed">
                  <p>
                    Future Mail is a delayed motivation system that allows you to draft letters, advice, or critical warnings to your future self. 
                  </p>
                  <p>
                    Whether you are starting a new habit, setting a long-term goal, or committing to a hard detox routine, writing a message today guarantees that when the delivery date arrives, your future self receives the exact emotional guidance needed to stay disciplined.
                  </p>
                </div>

                {/* Delivery Flow Timeline */}
                <h3 className="text-sm font-extrabold text-muted-foreground uppercase font-mono tracking-wider mb-2">Delivery Flow</h3>
                <div className="relative border-l border-border pl-6 ml-4 space-y-6 my-4 select-none">
                  {[
                    { title: 'Draft Letter', desc: 'Compose thoughts in our vintage-styled stationery pad.', icon: BookOpen },
                    { title: 'Temporal Seal', desc: 'Mail is locked and stored. Contents cannot be read prior to delivery.', icon: Lock },
                    { title: 'Email Delivery', desc: 'Delivered directly to your inbox on the exact chosen minute.', icon: Mail }
                  ].map((t, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-9 top-1.5 size-5 rounded-full border-2 border-primary bg-white grid place-items-center">
                        <t.icon className="size-2.5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-xs font-display">{t.title}</h4>
                        <p className="text-[11px] text-muted-foreground leading-normal font-semibold mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Future Mail Stationery Preview Mockup */}
                <div className="rounded-2xl border border-border bg-[#FAF8F5] shadow-card p-6 my-8 select-none max-w-md mx-auto relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="flex items-start justify-between border-b border-border/40 pb-3 mb-4">
                    <div>
                      <span className="text-[9px] font-extrabold tracking-widest text-muted-foreground uppercase font-mono">Unsealed Capsule</span>
                      <h4 className="font-serif font-black text-base text-[#2C241E] mt-0.5">Letter to my 25-Year Old Self</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black font-mono uppercase bg-emerald-50 border border-emerald-100 text-emerald-700">Delivered</span>
                  </div>
                  <p className="font-serif text-xs text-[#4E3F35] leading-relaxed whitespace-pre-wrap">
                    "Remember the goals we set. Don't fall back into old distraction loops. Willpower is key..."
                  </p>
                </div>
              </section>
            )}

            {/* Section 4: Trash & Recovery System */}
            {matchesSearch(SECTIONS[3]) && (
              <section id="trash-recovery" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center shadow-sm">
                    <Trash2 className="size-5.5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-foreground">4. Trash & Recovery</h2>
                </div>

                <div className="space-y-4 text-muted-foreground text-sm font-medium leading-relaxed">
                  <p>
                    Accidentally deleted a locked vault or motive letter? The Trash & Recovery system holds your deleted items for exactly <strong>30 days</strong> before automatic and permanent purge processes execute.
                  </p>
                  <p>
                    While inside Trash, vaults and future mail retain their original locking and unsealing timers. This ensures that users cannot bypass active locked countdowns simply by deleting the vault. Once the original countdown expires, you can permanently delete the row or restore it.
                  </p>
                </div>

                {/* Empty Trash Illustration */}
                <div className="my-6">
                  <EmptyTrashIllustration />
                </div>

                {/* Visual Recoverable Card Mockup */}
                <div className="rounded-2xl border border-red-200/60 bg-red-50/5 shadow-card p-5 my-8 select-none max-w-md mx-auto relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-red-400 to-rose-600" />
                  <div className="flex gap-4 items-start">
                    <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0 border border-primary/10">
                      <Lock className="size-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <h4 className="font-bold text-foreground text-sm truncate font-display">Social Media Block</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold font-mono uppercase tracking-wide mt-0.5">30 Days Lock &middot; Deleted Today</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black font-mono uppercase bg-red-50 border border-red-200 text-red-700 animate-pulse">3d left</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="h-7 px-3 text-[10px] font-bold rounded-full bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                          <RefreshCw className="size-3" /> Restore
                        </button>
                        <button className="h-7 px-3 text-[10px] font-bold rounded-full border border-border hover:bg-red-50 hover:text-red-700 text-muted-foreground">
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 5: Security & Privacy */}
            {matchesSearch(SECTIONS[4]) && (
              <section id="security-privacy" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center shadow-sm">
                    <Shield className="size-5.5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-foreground">5. Security & Privacy</h2>
                </div>

                <div className="space-y-4 text-muted-foreground text-sm font-medium leading-relaxed">
                  <p>
                    Privacy is not an afterthought in TimeVault; it is an absolute technical commitment. We utilize client-side cryptography combined with row-level server constraints.
                  </p>
                </div>

                {/* Custom vector shield */}
                <div className="my-6">
                  <SecurityShieldIllustration />
                </div>

                {/* Security Feature Grid */}
                <div className="grid sm:grid-cols-2 gap-5 my-6">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-card flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 grid place-items-center shrink-0">
                      <Key className="size-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-sm font-display">Client-Side Ciphertexts</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Your credentials are encrypted locally in your browser session using zero-knowledge architectures before transmission.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-card flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 grid place-items-center shrink-0">
                      <ShieldCheck className="size-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-sm font-display">Server-Side RLS Enforcement</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Supabase Row-Level Security rules strictly reject read or decrypt operations until unseal clocks resolve.</p>
                    </div>
                  </div>
                </div>

                {/* Why lock timers cannot be bypassed alert */}
                <div className="rounded-2xl bg-amber-50/50 border border-amber-200 p-5 flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm font-display">Timer Bypass Impossibility</h4>
                    <p className="text-xs text-amber-700 leading-relaxed font-semibold mt-1">
                      Because lock constraints are evaluated as database-enforced row properties, modifying your local system time, altering cookies, or changing browser local storage will have absolutely zero impact on unseal schedules. The unseal event runs entirely under secure server UTC verification.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Section 6: Productivity Philosophy */}
            {matchesSearch(SECTIONS[5]) && (
              <section id="philosophy" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center shadow-sm">
                    <Brain className="size-5.5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-foreground">6. Productivity Philosophy</h2>
                </div>

                <div className="space-y-4 text-muted-foreground text-sm font-medium leading-relaxed">
                  <p>
                    Our mission is rooted in the neuroscience of focus. Distraction is not a lack of intelligence; it is a mismatch between caveman biology and modern dopamine loops. In a world designed to capture your attention for commercial metrics, self-imposed friction is your only natural defense mechanism.
                  </p>
                </div>

                {/* Minimalist Quote Deck */}
                <div className="rounded-2xl border border-dashed border-primary/20 bg-primary-soft/30 p-6 relative overflow-hidden group">
                  <span className="absolute -right-3 -bottom-6 text-8xl font-extrabold text-primary/5 select-none font-serif">“</span>
                  <p className="text-sm font-semibold italic text-foreground/80 leading-relaxed pr-6 relative z-10 font-serif">
                    "Discipline is not a state of mind; it is a state of environment. Design your workspace to reject short-term gratification, and your future self will inevitably yield long-term success."
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 my-6 select-none">
                  {[
                    { val: 'Dopamine Detox', label: 'Reset reward thresholds', color: 'text-violet-600 bg-violet-50 border-violet-100' },
                    { val: 'Delayed Return', label: 'Build long-term self trust', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { val: 'Environmental Friction', label: 'Automate distraction blocks', color: 'text-amber-600 bg-amber-50 border-amber-100' }
                  ].map((p, idx) => (
                    <div key={idx} className={`rounded-xl border p-4 text-center space-y-1 ${p.color}`}>
                      <div className="font-extrabold text-xs uppercase tracking-wider font-mono">{p.val}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold">{p.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 7: Frequently Asked Questions */}
            {matchesSearch(SECTIONS[6]) && (
              <section id="faq" className="scroll-mt-28 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center shadow-sm">
                    <HelpCircle className="size-5.5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-foreground">7. Frequently Asked Questions</h2>
                </div>

                <div className="space-y-4">
                  {FAQS.map((faq, idx) => {
                    const isOpen = openFaq === idx
                    return (
                      <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between px-6 py-4.5 text-left font-bold text-sm text-foreground hover:bg-muted/40 transition-colors"
                        >
                          <span className="pr-4">{faq.q}</span>
                          <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                        </button>
                        
                        {/* Expandable answer panel */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen ? 'max-h-60 border-t border-border/40' : 'max-h-0'
                        }`}>
                          <p className="px-6 py-5 text-xs text-muted-foreground leading-relaxed font-semibold bg-muted/20">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Support Copyable card */}
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
                  <HelpCircle className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm font-display">Need additional support?</h4>
                  <p className="text-xs text-muted-foreground font-semibold">Copy our support address and write to our dev team anytime.</p>
                </div>
              </div>
              
              <button 
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-bold bg-white hover:bg-muted transition-colors relative select-none shrink-0 border-primary/10"
              >
                {copiedEmail ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-mono">support.timevault@gmail.com</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground font-mono">support.timevault@gmail.com</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 size-11 rounded-full bg-gradient-primary text-primary-foreground shadow-glow grid place-items-center z-50 transition-all duration-500 hover:scale-105 border border-primary/20 ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="size-5" />
      </button>
    </div>
  )
}
