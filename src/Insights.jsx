import { useState } from 'react'

const SPOTS = [
  ['Forks', 42, 'Practice forks'],
  ['Back-rank mistakes', 31, 'Practice back rank'],
  ['Pins', 24, 'Practice pins'],
  ['Hanging pieces', 18, 'Practice safety checks'],
]

export default function Insights({ go }) {
  const [tab, setTab] = useState('spots')
  return (
    <section>
      <h1>Insights</h1>
      <p className="mute">Sample numbers for now</p>
      <div className="seg">
        {[['spots', 'Weak spots'], ['open', 'Openings'], ['prog', 'Progress']].map(([id, l]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      {tab === 'spots' && SPOTS.map(([name, pct, cta]) => (
        <div className="card" key={name}>
          <b>{name}</b> <span className="mute">missed in {pct}% of chances</span>
          <div className="meter"><i style={{ width: pct + '%' }} /></div>
          <button style={{ width: '100%' }} onClick={() => go('puzzles')}>{cta}</button>
        </div>
      ))}

      {tab === 'open' && (
        <>
          <div className="card">
            <div className="orow"><b>Italian Game</b><span className="pill">White · 8 games</span></div>
            <div className="meter"><i style={{ width: '38%' }} /></div>
            <p className="mute">You score 38%. You usually leave known theory at move 5.</p>
            <button style={{ width: '100%' }} onClick={() => go('puzzles')}>Drill this line</button>
          </div>
          <div className="card">
            <div className="orow"><b>French Defense</b><span className="pill">Black · 5 games</span></div>
            <div className="meter"><i style={{ width: '20%' }} /></div>
            <p className="mute">You score 20%. Your light-squared bishop often gets stuck.</p>
            <button style={{ width: '100%' }} onClick={() => go('puzzles')}>Drill this line</button>
          </div>
          <div className="card">
            <div className="orow"><b>Sicilian Defense</b><span className="pill">Black · 12 games</span></div>
            <div className="meter"><i style={{ width: '58%', background: 'var(--good)' }} /></div>
            <p className="mute">You score 58%. This is working well, so keep playing it.</p>
          </div>
        </>
      )}

      {tab === 'prog' && (
        <>
          <div className="card">
            <h2>Accuracy, last 10 weeks</h2>
            <svg viewBox="0 0 300 120" width="100%" role="img" aria-label="Accuracy rising from 68 to 78 percent">
              <line x1="10" y1="110" x2="290" y2="110" stroke="var(--line)" />
              <polyline points="10,74 41,65 72,69.5 103,51.5 134,56 166,42.5 197,47 228,33.5 259,38 290,29" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx="290" cy="29" r="5" fill="var(--accent)" />
            </svg>
            <div className="orow mute"><span>Week 1</span><span>Now</span></div>
          </div>
          <div className="stats three">
            <div className="stat"><span className="mute">Puzzle rating</span><b>1240</b><span className="up">+85</span></div>
            <div className="stat"><span className="mute">Accuracy</span><b>78%</b><span className="up">+10</span></div>
            <div className="stat"><span className="mute">Blunders</span><b>2.1</b><span className="up">-0.8</span></div>
          </div>
        </>
      )}
    </section>
  )
}
