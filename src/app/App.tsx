import { useMemo, useState } from 'react'
import { demoFriends } from '../friend/demoFriends'
import { createFriendIdentity } from '../friend/identity'
import type { FriendIdentity } from '../friend/types'

type Screen = 'boot' | 'selection' | 'profile'

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
          <button type="button" disabled>COMMAND CENTER // PHASE 2</button>
          <button className="text-button" type="button" onClick={() => setScreen('selection')}>Choose another operator</button>
        </section>
      )}
    </main>
  )
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
