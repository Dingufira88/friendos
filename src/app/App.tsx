import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { demoFriends } from '../friend/demoFriends'
import { createFriendIdentity } from '../friend/identity'
import { executeResearchMission, type AgentSource } from '../agents/provider'
import { createDemoReport, type ResearchReport } from '../missions/demoAgent'
import { executionSteps, missions, researchMission } from '../missions/definitions'
import { evolutionFromLevel, initialProgress, levelFromXp, useProgressionStore, type MissionRecord } from '../progression/store'
import { useWallet } from '../wallet/useWallet'
import { skillCatalog } from '../skills/catalog'

type Overlay = 'none' | 'working' | 'result'

export function App() {
  const demoIdentities = useMemo(() => demoFriends.map(createFriendIdentity), [])
  const [selectedId, setSelectedId] = useState(demoIdentities[0].tokenId)
  const [showFriends, setShowFriends] = useState(false)
  const [selectedMission, setSelectedMission] = useState('research')
  const [request, setRequest] = useState('')
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [step, setStep] = useState(0)
  const [agentReady, setAgentReady] = useState(false)
  const [agentSource, setAgentSource] = useState<AgentSource>('fallback')
  const [report, setReport] = useState<ResearchReport>(() => createDemoReport('Rare Friends'))
  const [receipt, setReceipt] = useState<MissionRecord | null>(null)
  const activityRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const wallet = useWallet()
  const friendsProgress = useProgressionStore((state) => state.friends)
  const completeMission = useProgressionStore((state) => state.completeMission)
  const installSkill = useProgressionStore((state) => state.installSkill)
  const identities = useMemo(() => wallet.ownedFriends.length ? wallet.ownedFriends.map(createFriendIdentity) : demoIdentities, [demoIdentities, wallet.ownedFriends])
  const friend = identities.find((item) => item.tokenId === selectedId) ?? identities[0]
  const progress = { ...initialProgress(), ...friendsProgress[friend.tokenId] }
  const level = levelFromXp(progress.xp)
  const evolution = evolutionFromLevel(level.level)
  const activeMission = missions.find((mission) => mission.id === selectedMission) ?? researchMission
  const canLaunch = activeMission.available && request.trim().length > 2 && progress.balance >= activeMission.rfCost

  useEffect(() => {
    if (!identities.some((item) => item.tokenId === selectedId)) setSelectedId(identities[0].tokenId)
  }, [identities, selectedId])

  useEffect(() => {
    if (overlay !== 'working') return
    if (step >= executionSteps.length - 1 && agentReady) {
      const timer = window.setTimeout(() => {
        setReceipt(completeMission(friend.tokenId, request))
        setOverlay('result')
      }, 700)
      return () => window.clearTimeout(timer)
    }
    if (step < executionSteps.length - 1) {
      const timer = window.setTimeout(() => setStep((current) => current + 1), 650)
      return () => window.clearTimeout(timer)
    }
  }, [agentReady, completeMission, friend.tokenId, overlay, request, step])

  function launchMission() {
    if (!canLaunch) return
    setStep(0); setAgentReady(false); setReceipt(null); setOverlay('working')
    void executeResearchMission(request, friend).then((result) => {
      setReport(result.report); setAgentSource(result.source); setAgentReady(true)
    })
  }

  return <div className="site" style={{ '--friend-accent': friend.color } as React.CSSProperties}>
    <header className="topbar">
      <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Spark />friend<span>OS</span><i>BETA</i></button>
      <nav><button className="active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Workspace</button><button onClick={() => activityRef.current?.scrollIntoView({ behavior: 'smooth' })}>Activity</button><button onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}>About</button></nav>
      <div className="top-actions"><span className="network"><b className={wallet.isRobinhood ? '' : 'off'} /> {wallet.isRobinhood ? 'Robinhood network' : 'Wallet offline'}</span><button className="signin" disabled={wallet.connecting} onClick={wallet.status === 'wrong-network' ? wallet.switchNetwork : wallet.connect}>{wallet.connecting ? 'Connecting…' : wallet.account ? `${wallet.account.slice(0, 6)}…${wallet.account.slice(-4)}` : 'Connect wallet ↗'}</button></div>
    </header>
    <main>
      <section className="hero"><p className="kicker"><span /> YOUR FRIEND, AT WORK <span /></p><div className="hero-grid"><div><h1>Meet your new <em>operator.</em></h1><p>Give your Friend a mission. Watch them get to work. Every move has a story, and every RF has a purpose.</p></div><aside><strong>01 / THE WORKSPACE</strong><span>Your Friend can think, work, and spend.</span></aside></div></section>
      <div className="section-labels"><span><b>01</b> YOUR FRIEND</span><span><b>02</b> MISSION CONTROL</span></div>
      <section className="workspace">
        <div className="friend-column">
          <article className={`friend-profile evolution-${level.level}`}><div className="profile-top"><span>GENERATIONS / #{friend.tokenId}</span><b><i /> {evolution}</b></div><div className="portrait"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><PixelFriend friend={friend} /><Spark /><Spark /><span className="evolution-mark">LV.{level.level}</span></div><div className="identity"><span>YOUR OPERATOR · {friend.familyName ?? `GEN ${friend.generation}`}</span><h2>{friend.name}<Spark /></h2><strong>The {friend.traits[0]} {friend.archetype}</strong><p>{friend.traits.join(', ')}, and delightfully thorough</p><i>#{friend.tokenId}</i></div><div className="evolution-track"><span style={{ width: `${Math.max(3, level.percent)}%` }} /><small>{level.nextCeiling - progress.xp} XP TO NEXT EVOLUTION</small></div><div className="profile-stats"><Stat label="MISSIONS" value={String(progress.missionCount)} /><Stat label="REPUTATION" value={`${progress.xp} XP`} /><Stat label="SKILLS" value={String(progress.installedSkills.length)} /></div></article>
          <button className="switcher" onClick={() => setShowFriends((value) => !value)}>◇ &nbsp; Switch Friend <span>{showFriends ? '×' : '⌄'}</span></button>
          <AnimatePresence>{showFriends && <motion.div className="friend-options" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{identities.map((item) => <button key={item.tokenId} onClick={() => { setSelectedId(item.tokenId); setShowFriends(false) }}><b style={{ background: item.color }}><PixelFriend friend={item} compact /></b><span>{item.name}<small>Gen {item.generation} · {item.archetype} · #{item.tokenId}</small></span></button>)}</motion.div>}</AnimatePresence>
          {wallet.error && <p className="wallet-note">{wallet.error}</p>}{wallet.loadingFriends && <p className="wallet-note">READING YOUR FRIENDS ONCHAIN…</p>}
        </div>
        <article className="mission-control"><p className="micro">WHAT WILL {friend.name.toUpperCase()} DO TODAY?</p><h2>Put your Friend to work<em>.</em></h2><Spark /><div className="mission-choices">{missions.slice(0, 4).map((mission) => <button key={mission.id} className={selectedMission === mission.id ? 'selected' : ''} disabled={!mission.available} onClick={() => setSelectedMission(mission.id)}><i>{mission.id === 'research' ? '⌕' : '✦'}</i><span><strong>{mission.name}</strong><small>{mission.description}</small></span><b>{mission.rfCost} RF</b></button>)}</div><div className="brief-title"><strong>THE BRIEF</strong><span>{request.length} / 500</span></div><textarea aria-label="Tell your Friend what you need" maxLength={500} value={request} onChange={(event) => setRequest(event.target.value)} placeholder={`What would you like ${friend.name} to research?`} /><p className="hint">✳ Be specific. Your Friend does the rest.</p><div className="suggestions"><span>NEED A START?</span>{['Research the future of onchain games', 'Write a launch announcement', 'Plan my next creative project'].map((idea) => <button key={idea} onClick={() => setRequest(idea)}>{idea} ↗</button>)}</div><div className="launch-row"><div><span>MISSION COST<strong>{activeMission.rfCost} RF</strong></span><b>→</b><span>AFTER MISSION<strong>{progress.balance - activeMission.rfCost} RF</strong></span></div><button disabled={!canLaunch} onClick={launchMission}>Launch mission ↗</button></div></article>
      </section>
      <p className="friend-promise">✦ Every mission is completed by your Friend, not a generic assistant.</p>
      <section className="skills-market"><div className="section-rule"><b>03</b> SKILL MARKETPLACE <span /></div><div className="skills-heading"><div><small>EXPAND WHAT YOUR FRIEND CAN DO</small><h2>New abilities, built by anyone<em>.</em></h2></div><p>Skills belong to this operator. Install a community-built ability and it stays with their profile as they evolve.</p></div><div className="skill-grid">{skillCatalog.map((skill) => { const installed = progress.installedSkills.includes(skill.id); return <article key={skill.id}><div><i>{skill.icon}</i><span>{skill.category}</span></div><h3>{skill.name}</h3><p>{skill.description}</p><small>{skill.developer}</small><button disabled={installed || progress.balance < skill.price} onClick={() => installSkill(friend.tokenId, skill.id, skill.price)}>{installed ? 'INSTALLED ✓' : skill.price ? `INSTALL · ${skill.price} RF` : 'INSTALL FREE'}</button></article> })}</div><div className="developer-callout"><span>BUILD FOR FRIENDOS</span><p>External developers can publish skills with a name, capability, price, and execution endpoint.</p><button onClick={() => (document.getElementById('skill-spec') as HTMLDialogElement)?.showModal()}>View developer spec ↗</button></div></section>
      <section className="economy" ref={activityRef}><div className="section-rule"><b>03</b> THE ECONOMY OF DOING <span /></div><div className="economy-heading"><div><small>EVERY RF TELLS A STORY</small><h2>Work, not just words<em>.</em></h2></div><p>Real output. Visible cost. A growing record of what your Friend has done.</p></div><div className="economy-cards"><EconomyCard label="AVAILABLE BALANCE" value={progress.balance} note="Operating budget" icon="◇" /><EconomyCard label="LIFETIME RF SPENT" value={progress.rfSpent} note="Invested in useful work" icon="✳" /><EconomyCard label="LIFETIME RF BURNED" value={progress.rfBurned} note="Removed from circulation" icon="♨" /></div><div className="history-head"><h3>◷ Mission history <b>{String(progress.missionCount).padStart(2, '0')}</b></h3><span>ALL ACTIVITY / FRIEND #{friend.tokenId}</span></div><div className="history-list">{progress.history.length ? progress.history.map((item) => <article key={item.receiptId}><Spark /><div><strong>{item.missionName}</strong><p>{item.request}</p><small>{new Date(item.completedAt).toLocaleString()}</small></div><aside><b>-{item.rfSpent} RF</b><span>+{item.xpEarned} XP · +{item.credEarned} CRED</span><small>{item.receiptId}</small></aside></article>) : <article className="empty"><Spark /><div><strong>No missions yet for {friend.name}.</strong><p>Your Friend’s completed work and receipts will live here.</p></div><span>↘</span></article>}</div></section>
      <section className="about" ref={aboutRef}><Spark /><p>FriendOS gives Rare Friends useful work, visible costs, and a memory that grows with every mission.</p><div><span>LEVEL {String(level.level).padStart(2, '0')}</span><b>{progress.xp} XP</b><i style={{ width: `${Math.max(3, level.percent)}%` }} /></div></section>
    </main>
    <footer><div className="brand"><Spark />friend<span>OS</span></div><p>THE OPERATING SYSTEM FOR YOUR FRIEND</p><strong>Your Friend can think, work, and spend.</strong><small>VIBEATHON PROTOTYPE · RF SPENDING AND BURNS ARE SIMULATED</small></footer>
    <MissionOverlay overlay={overlay} friendName={friend.name} friendGlyph={friend.glyph} step={step} report={report} receipt={receipt} agentSource={agentSource} onClose={() => setOverlay('none')} />
    <dialog id="skill-spec" className="skill-dialog"><button onClick={() => (document.getElementById('skill-spec') as HTMLDialogElement)?.close()}>×</button><span>FRIENDOS SKILL STANDARD / V0.1</span><h2>Give every Friend a new ability.</h2><p>Register a unique skill ID, developer identity, capability description, install price, per-use RF cost, and a secure execution endpoint. Installed skill IDs are stored against each NFT operator profile.</p><code>{`{ id, name, developer, category, installPrice, usageCost, endpoint }`}</code></dialog>
  </div>
}

function Spark() { return <i className="spark" aria-hidden="true">✦</i> }
function PixelFriend({ friend, compact = false }: { friend: ReturnType<typeof createFriendIdentity>; compact?: boolean }) { return friend.spriteRows ? <span className={`pixel-friend ${compact ? 'compact' : ''}`} aria-label={`${friend.name} onchain sprite`}>{friend.spriteRows.flatMap((row, y) => [...row].map((pixel, x) => pixel === '#' ? <i key={`${x}-${y}`} style={{ gridColumn: x + 1, gridRow: y + 1 }} /> : null))}</span> : <span className="portrait-friend">{friend.glyph}</span> }
function Stat({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div> }
function EconomyCard({ label, value, note, icon }: { label: string; value: number; note: string; icon: string }) { return <article><span>{label}</span><i>{icon}</i><strong>{value}<small> RF</small></strong><p>{note}</p></article> }
function MissionOverlay({ overlay, friendName, friendGlyph, step, report, receipt, agentSource, onClose }: { overlay: Overlay; friendName: string; friendGlyph: string; step: number; report: ResearchReport; receipt: MissionRecord | null; agentSource: AgentSource; onClose: () => void }) { return <AnimatePresence>{overlay !== 'none' && <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>{overlay === 'working' ? <><button className="overlay-close" onClick={onClose}>×</button><div className="working-avatar">{friendGlyph}<span /></div><p className="micro">MISSION IN PROGRESS</p><h2>{friendName} is on it<em>.</em></h2><div className="steps">{executionSteps.map((item, index) => <p key={item} className={index < step ? 'done' : index === step ? 'active' : ''}><span>{index < step ? '✓' : index === step ? '●' : '○'}</span>{item}</p>)}</div></> : <><button className="overlay-close" onClick={onClose}>×</button><p className="micro">{receipt?.receiptId} / COMPLETE</p><h2>Here’s what {friendName} found<em>.</em></h2><div className="report"><article><h3>Executive summary</h3><p>{report.summary}</p><ReportList title="Key findings" items={report.findings} /><ReportList title="Opportunities" items={report.opportunities} /><ReportList title="Next actions" items={report.nextActions} /></article><aside><strong>MISSION RECEIPT</strong><dl><div><dt>RF spent</dt><dd>{receipt?.rfSpent} RF</dd></div><div><dt>RF burned</dt><dd>{receipt?.rfBurned} RF</dd></div><div><dt>XP</dt><dd>+{receipt?.xpEarned}</dd></div><div><dt>CRED</dt><dd>+{receipt?.credEarned}</dd></div></dl><small>{agentSource === 'openai' ? 'AI REPORT' : 'OFFLINE REPORT'}</small></aside></div><button className="done-button" onClick={onClose}>Return to workspace ↗</button></>}</motion.section></motion.div>}</AnimatePresence> }
function ReportList({ title, items }: { title: string; items: string[] }) { return <section><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section> }
