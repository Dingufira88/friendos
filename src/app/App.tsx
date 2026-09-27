import { useMemo, useState } from 'react'
import { demoFriends } from '../friend/demoFriends'
import { createFriendIdentity } from '../friend/identity'
import type { FriendIdentity } from '../friend/types'

type Screen = 'boot' | 'selection' | 'profile' | 'command'

export function App() {
  const [screen, setScreen] = useState<Screen>('boot')
  const [selectedId, setSelectedId] = useState(demoFriends[0].tokenId)
  const identities = useMemo(() => demoFriends.map(createFriendIdentity), [])
  const selected = identities.find((friend) => friend.tokenId === selectedId) ?? identities[0]

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
            <div><dt>RF balance</dt><dd>100 RF <small>SIMULATED</small></dd></div>
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
              <Stat label="Level" value="01" detail="0 / 100 XP" />
              <Stat label="CRED" value="0" detail="Reputation" />
              <Stat label="Missions" value="0" detail="Completed" />
            </aside>

            <div className="operator-bay">
              <div className="scan-ring"><div className="operator-mark"><span>{selected.glyph}</span></div></div>
              <p>{selected.archetype} // {selected.primarySkill}</p>
              <div className="xp-track"><span /></div>
            </div>

            <aside className="wallet-card">
              <p>OPERATING BUDGET</p>
              <strong>100 <small>RF</small></strong>
              <span>SIMULATED BALANCE</span>
              <hr />
              <dl>
                <div><dt>Spent</dt><dd>0 RF</dd></div>
                <div><dt>Burned</dt><dd>0 RF</dd></div>
              </dl>
            </aside>
          </div>

          <nav className="module-grid" aria-label="FriendOS modules">
            <button type="button"><span>01</span><strong>MISSIONS</strong><small>Assign useful work</small></button>
            <button type="button" disabled><span>02</span><strong>SKILLS</strong><small>Coming soon</small></button>
            <button type="button" disabled><span>03</span><strong>MEMORY</strong><small>Coming soon</small></button>
            <button type="button" onClick={() => setScreen('profile')}><span>04</span><strong>PROFILE</strong><small>Identity core</small></button>
          </nav>

          <footer className="command-footer">
            <span>DEMO MODE // NO ON-CHAIN TRANSACTIONS</span>
            <button className="text-button" type="button" onClick={() => setScreen('selection')}>Switch operator</button>
          </footer>
        </section>
      )}
    </main>
  )
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
