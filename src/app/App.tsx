import { useEffect, useMemo, useState } from 'react'
import { demoFriends } from '../friend/demoFriends'
import { createFriendIdentity } from '../friend/identity'
import type { FriendIdentity } from '../friend/types'
import { createDemoReport } from '../missions/demoAgent'
import { executionSteps, missions, researchMission } from '../missions/definitions'
import { initialProgress, levelFromXp, useProgressionStore, type MissionRecord } from '../progression/store'

type Screen = 'boot' | 'selection' | 'profile' | 'command' | 'missions' | 'review' | 'execution' | 'result' | 'activity'

export function App() {
  const [screen, setScreen] = useState<Screen>('boot')
  const [selectedId, setSelectedId] = useState(demoFriends[0].tokenId)
  const [request, setRequest] = useState('Research Rare Friends and explain the best opportunities for developers.')
  const [step, setStep] = useState(0)
  const [activeReceipt, setActiveReceipt] = useState<MissionRecord | null>(null)
  const friendsProgress = useProgressionStore((state) => state.friends)
  const completeMission = useProgressionStore((state) => state.completeMission)
  const resetFriend = useProgressionStore((state) => state.resetFriend)
  const identities = useMemo(() => demoFriends.map(createFriendIdentity), [])
  const selected = identities.find((friend) => friend.tokenId === selectedId) ?? identities[0]
  const progress = friendsProgress[selected.tokenId] ?? initialProgress()
  const level = levelFromXp(progress.xp)
  const report = useMemo(() => createDemoReport(request), [request])

  useEffect(() => {
    if (screen !== 'execution') return
    if (step >= executionSteps.length - 1) {
      const completeTimer = window.setTimeout(() => {
        const receipt = completeMission(selected.tokenId, request)
        setActiveReceipt(receipt)
        setScreen('result')
      }, 900)
      return () => window.clearTimeout(completeTimer)
    }
    const timer = window.setTimeout(() => setStep((current) => current + 1), 760)
    return () => window.clearTimeout(timer)
  }, [completeMission, request, screen, selected.tokenId, step])

  function startMission() {
    setStep(0)
    setActiveReceipt(null)
    setScreen('execution')
  }

  return (
    <main className="boot-shell">
      <div className="grid" aria-hidden="true" />
      {screen === 'boot' && (
        <section className="boot-panel">
          <p className="eyebrow">RARE FRIENDS // OPERATOR SYSTEM</p>
          <h1>FRIEND<span>OS</span></h1>
          <p className="tagline">Your Friend can think.<br />Your Friend can work.<br />Your Friend can spend.</p>
          <button type="button" onClick={() => setScreen('selection')}>ENTER DEMO MODE</button>
          <small>Simulated economy · No on-chain transactions</small>
        </section>
      )}

      {screen === 'selection' && (
        <section className="selection-panel">
          <header>
            <p className="eyebrow">IDENTITY HANDSHAKE // DEMO MODE</p>
            <h2>CHOOSE YOUR OPERATOR</h2>
            <p>Each token produces the same identity every time.</p>
          </header>
          <div className="friend-grid">
            {identities.map((friend) => (
              <FriendCard
                key={friend.tokenId}
                friend={friend}
                active={friend.tokenId === selectedId}
                onSelect={() => setSelectedId(friend.tokenId)}
              />
            ))}
          </div>
          <div className="selection-actions">
            <button className="secondary" type="button" onClick={() => setScreen('boot')}>BACK</button>
            <button type="button" onClick={() => setScreen('profile')}>INITIALIZE {selected.name.toUpperCase()}</button>
          </div>
        </section>
      )}

      {screen === 'profile' && (
        <section className="profile-panel">
          <div className="operator-mark" style={{ '--operator-color': selected.color } as React.CSSProperties}>
            <span>{selected.glyph}</span>
          </div>
          <p className="eyebrow">OPERATOR ONLINE // GEN {selected.generation}</p>
          <h2>{selected.name} <em>#{selected.tokenId}</em></h2>
          <p className="archetype">{selected.archetype}</p>
          <div className="trait-row">
            {selected.traits.map((trait) => <span key={trait}>{trait}</span>)}
          </div>
          <dl>
            <div><dt>Primary skill</dt><dd>{selected.primarySkill}</dd></div>
            <div><dt>Secondary skill</dt><dd>{selected.secondarySkill}</dd></div>
            <div><dt>RF balance</dt><dd>{progress.balance} RF <small>SIMULATED</small></dd></div>
          </dl>
          <button type="button" onClick={() => setScreen('command')}>ENTER COMMAND CENTER</button>
          <button className="text-button" type="button" onClick={() => setScreen('selection')}>Choose another operator</button>
        </section>
      )}

      {screen === 'command' && (
        <section className="command-panel" style={{ '--operator-color': selected.color } as React.CSSProperties}>
          <header className="command-header">
            <div>
              <p className="eyebrow">FRIENDOS // COMMAND CENTER</p>
              <strong>{selected.name} <span>#{selected.tokenId}</span></strong>
            </div>
            <div className="status"><i /> OPERATOR ONLINE</div>
          </header>

          <div className="command-layout">
            <aside className="stat-stack">
              <Stat label="Level" value={String(level.level).padStart(2, '0')} detail={`${progress.xp} / ${level.nextCeiling} XP`} />
              <Stat label="CRED" value={String(progress.cred)} detail="Reputation" />
              <Stat label="Missions" value={String(progress.missionCount)} detail="Completed" />
            </aside>

            <div className="operator-bay">
              <div className="scan-ring"><div className="operator-mark"><span>{selected.glyph}</span></div></div>
              <p>{selected.archetype} // {selected.primarySkill}</p>
              <div className="xp-track"><span style={{ width: `${Math.max(4, level.percent)}%` }} /></div>
            </div>

            <aside className="wallet-card">
              <p>OPERATING BUDGET</p>
              <strong>{progress.balance} <small>RF</small></strong>
              <span>SIMULATED BALANCE</span>
              <hr />
              <dl>
                <div><dt>Spent</dt><dd>{progress.rfSpent} RF</dd></div>
                <div><dt>Burned</dt><dd>{progress.rfBurned} RF</dd></div>
              </dl>
            </aside>
          </div>

          <nav className="module-grid" aria-label="FriendOS modules">
            <button type="button" onClick={() => setScreen('missions')}><span>01</span><strong>MISSIONS</strong><small>Assign useful work</small></button>
            <button type="button" disabled><span>02</span><strong>SKILLS</strong><small>Coming soon</small></button>
            <button type="button" onClick={() => setScreen('activity')}><span>03</span><strong>ACTIVITY</strong><small>Mission ledger</small></button>
            <button type="button" onClick={() => setScreen('profile')}><span>04</span><strong>PROFILE</strong><small>Identity core</small></button>
          </nav>

          <footer className="command-footer">
            <span>DEMO MODE // NO ON-CHAIN TRANSACTIONS</span>
            <button className="text-button" type="button" onClick={() => setScreen('selection')}>Switch operator</button>
          </footer>
        </section>
      )}

      {screen === 'activity' && (
        <section className="mission-panel activity-panel" style={{ '--operator-color': selected.color } as React.CSSProperties}>
          <PanelHeader eyebrow="PERSISTENT MEMORY // LOCAL" title="ACTIVITY LEDGER" onBack={() => setScreen('command')} />
          <div className="ledger-summary">
            <Stat label="Lifetime spent" value={`${progress.rfSpent} RF`} detail={`${progress.missionCount} missions`} />
            <Stat label="Lifetime burned" value={`${progress.rfBurned} RF`} detail="50% allocation" />
            <Stat label="CRED earned" value={String(progress.cred)} detail="Non-transferable" />
          </div>
          {progress.history.length === 0 ? (
            <div className="empty-ledger"><strong>NO MISSIONS RECORDED</strong><p>Complete a Research Mission to create this Friend’s first permanent receipt.</p></div>
          ) : (
            <div className="ledger-list">
              {progress.history.map((record) => (
                <article key={record.receiptId}>
                  <div><strong>{record.missionName}</strong><span>{record.receiptId}</span></div>
                  <p>{record.request}</p>
                  <div><span>{new Date(record.completedAt).toLocaleString()}</span><strong>-{record.rfSpent} RF · +{record.xpEarned} XP · +{record.credEarned} CRED</strong></div>
                </article>
              ))}
            </div>
          )}
          <button className="danger-button" type="button" onClick={() => {
            if (window.confirm(`Reset all local FriendOS progress for ${selected.name} #${selected.tokenId}?`)) {
              resetFriend(selected.tokenId)
              setActiveReceipt(null)
            }
          }}>RESET THIS FRIEND’S DEMO DATA</button>
        </section>
      )}

      {screen === 'missions' && (
        <section className="mission-panel" style={{ '--operator-color': selected.color } as React.CSSProperties}>
          <PanelHeader eyebrow="MISSION DIRECTORY // DEMO MODE" title="ASSIGN USEFUL WORK" onBack={() => setScreen('command')} />
          <div className="mission-list">
            {missions.map((mission) => (
              <button key={mission.id} type="button" disabled={!mission.available} onClick={() => setScreen('review')}>
                <span className="mission-code">{mission.id.slice(0, 3).toUpperCase()}</span>
                <span><strong>{mission.name}</strong><small>{mission.description}</small></span>
                <span className="mission-price">{mission.rfCost} RF<small>{mission.available ? `+${mission.xpReward} XP · +${mission.credReward} CRED` : 'COMING SOON'}</small></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {screen === 'review' && (
        <section className="mission-panel review-panel" style={{ '--operator-color': selected.color } as React.CSSProperties}>
          <PanelHeader eyebrow="RESEARCH MISSION // INPUT" title="WHAT SHOULD YOUR FRIEND INVESTIGATE?" onBack={() => setScreen('missions')} />
          <label htmlFor="research-request">Mission brief</label>
          <textarea id="research-request" value={request} onChange={(event) => setRequest(event.target.value)} maxLength={500} />
          <div className="cost-review">
            <div><span>Operator</span><strong>{selected.name} #{selected.tokenId}</strong></div>
            <div><span>Mission cost</span><strong>5 RF</strong></div>
            <div><span>Proposed burn</span><strong>2.5 RF</strong></div>
            <div><span>Rewards</span><strong>+50 XP · +3 CRED</strong></div>
          </div>
          <p className="disclosure">{progress.balance < researchMission.rfCost ? 'INSUFFICIENT SIMULATED RF — RESET THIS FRIEND FROM THE ACTIVITY LEDGER.' : 'SIMULATED ECONOMY — NO ON-CHAIN TRANSACTION WILL OCCUR.'}</p>
          <button type="button" onClick={startMission} disabled={!request.trim() || progress.balance < researchMission.rfCost}>AUTHORIZE 5 RF &amp; BEGIN</button>
        </section>
      )}

      {screen === 'execution' && (
        <section className="execution-panel" style={{ '--operator-color': selected.color } as React.CSSProperties}>
          <p className="eyebrow">MISSION ACTIVE // RESEARCH</p>
          <div className="working-operator"><div className="operator-mark"><span>{selected.glyph}</span></div><i /></div>
          <h2>{selected.name} IS WORKING</h2>
          <div className="execution-list">
            {executionSteps.map((label, index) => (
              <div key={label} className={index < step ? 'done' : index === step ? 'active' : ''}>
                <span>{index < step ? '✓' : index === step ? '●' : '○'}</span>{label}
              </div>
            ))}
          </div>
          <small>Please keep FriendOS open while the operator completes this mission.</small>
        </section>
      )}

      {screen === 'result' && (
        <section className="result-panel" style={{ '--operator-color': selected.color } as React.CSSProperties}>
          <PanelHeader eyebrow="MISSION 00001 // COMPLETE" title="RESEARCH REPORT" onBack={() => setScreen('command')} />
          <div className="result-layout">
            <article>
              <h3>Executive summary</h3><p>{report.summary}</p>
              <ReportList title="Key findings" items={report.findings} />
              <ReportList title="Opportunities" items={report.opportunities} />
              <ReportList title="Recommended next actions" items={report.nextActions} />
            </article>
            <aside className="receipt">
              <p>FRIENDOS MISSION RECEIPT</p>
              <strong>{selected.name} #{selected.tokenId}</strong>
              <dl>
                <div><dt>RF spent</dt><dd>5 RF</dd></div>
                <div><dt>RF burned</dt><dd>2.5 RF</dd></div>
                <div><dt>Compute</dt><dd>2 RF</dd></div>
                <div><dt>Ecosystem</dt><dd>0.5 RF</dd></div>
                <div><dt>XP</dt><dd>+50</dd></div>
                <div><dt>CRED</dt><dd>+3</dd></div>
              </dl>
              <small>{activeReceipt?.receiptId ?? 'FOS-DEMO'} · SIMULATED · NO ON-CHAIN TRANSACTION</small>
            </aside>
          </div>
        </section>
      )}
    </main>
  )
}

function PanelHeader({ eyebrow, title, onBack }: { eyebrow: string; title: string; onBack: () => void }) {
  return <header className="panel-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><button className="secondary" type="button" onClick={onBack}>BACK</button></header>
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return <section><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
}

function FriendCard({ friend, active, onSelect }: { friend: FriendIdentity; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={`friend-card${active ? ' active' : ''}`}
      style={{ '--operator-color': friend.color } as React.CSSProperties}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
    >
      <span className="friend-avatar">{friend.glyph}</span>
      <strong>{friend.name} <small>#{friend.tokenId}</small></strong>
      <span>GEN {friend.generation} · {friend.archetype}</span>
      <i>{friend.primarySkill} / {friend.secondarySkill}</i>
    </button>
  )
}
