import { useState } from 'react'

export default function Share({ go }) {
  const [copied, setCopied] = useState(false)
  const link = 'chesstrainer.app/r/x7Kp2'
  const copy = () => {
    try { navigator.clipboard.writeText(link) } catch { /* ignore */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <section>
      <button onClick={() => go('review')} style={{ marginBottom: 10 }}>Back to review</button>
      <h1>Share this review</h1>
      <p className="mute">Send a game to a friend or coach. They see your board and notes, and can comment on moves.</p>
      <div className="card">
        <h2>Link</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={link} readOnly aria-label="Review link" />
          <button className="pri" style={{ whiteSpace: 'nowrap' }} onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button>
        </div>
        <button style={{ width: '100%', marginTop: 10 }}>Send on WhatsApp</button>
        <label className="chk"><input type="checkbox" defaultChecked /> Let people comment on moves</label>
      </div>
      <div className="card">
        <h2>Comments</h2>
        <div className="cm"><b>Coach Brian</b> <span className="mute">on 10. Nxd5</span><br />Before you capture, check what the opponent can do next.</div>
        <div className="cm"><b>Amina</b> <span className="mute">on 8. d5</span><br />Nice, this is the right way to block.</div>
        <input type="text" placeholder="Add a comment" aria-label="Add a comment" style={{ marginTop: 8 }} />
      </div>
      <p className="note">Sharing is a mockup. Real links and comments need accounts and a database.</p>
    </section>
  )
}
