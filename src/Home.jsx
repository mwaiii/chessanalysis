import { useState } from 'react'
import { Chess } from 'chess.js'
import { SAMPLE } from './samples.js'

const RESULT = { '1-0': 'White won', '0-1': 'Black won', '1/2-1/2': 'Draw', '*': 'Unfinished' }

function splitPgns(text) {
  return text.trim().split(/\n\n(?=\[Event )/).filter(Boolean)
}

async function fromChessCom(name) {
  const user = name.toLowerCase()
  const ar = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(user)}/games/archives`)
  if (ar.status === 404) throw new Error('No Chess.com user with that name.')
  if (!ar.ok) throw new Error('Chess.com did not answer. Try again in a minute, or paste a game instead.')
  const { archives } = await ar.json()
  const out = []
  for (const url of [...archives].reverse().slice(0, 3)) {
    const r = await fetch(url)
    if (!r.ok) continue
    const { games } = await r.json()
    for (const g of [...games].reverse()) {
      if (g.rules !== 'chess' || !g.pgn) continue
      out.push({
        pgn: g.pgn,
        white: g.white.username,
        black: g.black.username,
        result: g.white.result === 'win' ? '1-0' : g.black.result === 'win' ? '0-1' : '1/2-1/2',
        date: new Date(g.end_time * 1000).toISOString().slice(0, 10),
        speed: g.time_class,
      })
      if (out.length >= 10) return out
    }
  }
  return out
}

export default function Home({ go, openGame }) {
  const [mode, setMode] = useState('lichess')
  const [user, setUser] = useState('')
  const [pgn, setPgn] = useState('')
  const [games, setGames] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const pick = (m) => { setMode(m); setGames([]); setErr('') }

  const find = async () => {
    const name = user.trim()
    if (!name) return
    setBusy(true); setErr(''); setGames([])
    try {
      if (mode === 'chesscom') {
        const list = await fromChessCom(name)
        if (!list.length) throw new Error('No games found for that user.')
        setGames(list)
        setBusy(false)
        return
      }
      const res = await fetch(
        `https://lichess.org/api/games/user/${encodeURIComponent(name)}?max=10&moves=true`,
        { headers: { Accept: 'application/x-chess-pgn' } }
      )
      if (res.status === 404) throw new Error('No Lichess user with that name.')
      if (!res.ok) throw new Error('Lichess did not answer. Try again in a minute.')
      const list = splitPgns(await res.text()).map((p) => {
        const c = new Chess()
        try { c.loadPgn(p) } catch { return null }
        const h = c.header()
        return { pgn: p, white: h.White, black: h.Black, result: h.Result, date: h.UTCDate || h.Date, speed: h.Event }
      }).filter(Boolean)
      if (!list.length) throw new Error('No games found for that user.')
      setGames(list)
    } catch (e) {
      setErr(e instanceof TypeError ? 'Couldn’t reach the site from your browser. Check your connection, or paste a game instead.' : e.message || 'Something went wrong.')
    }
    setBusy(false)
  }

  const reviewPgn = () => {
    setErr('')
    const c = new Chess()
    try {
      c.loadPgn(pgn.trim())
      if (!c.history().length) throw new Error('empty')
    } catch {
      setErr('That doesn’t look like a valid PGN. Copy the full game text, including the moves.')
      return
    }
    openGame({ pgn: pgn.trim(), user: '' })
  }

  return (
    <section>
      <h1>Chess trainer</h1>
      <p className="mute">Review your games and train on what you miss. No limits.</p>
      <div className="card">
        <h2>Load a game</h2>
        <div className="seg">
          <button className={mode === 'lichess' ? 'on' : ''} onClick={() => pick('lichess')}>Lichess</button>
          <button className={mode === 'chesscom' ? 'on' : ''} onClick={() => pick('chesscom')}>Chess.com</button>
          <button className={mode === 'pgn' ? 'on' : ''} onClick={() => pick('pgn')}>Paste</button>
        </div>
        {mode !== 'pgn' ? (
          <>
            <input
              type="text"
              placeholder={mode === 'chesscom' ? 'Your Chess.com username' : 'Your Lichess username'}
              aria-label="Username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && find()}
            />
            <button className="pri" style={{ width: '100%', marginTop: 10 }} onClick={find} disabled={busy}>
              {busy ? 'Looking…' : 'Find my games'}
            </button>
          </>
        ) : (
          <>
            <textarea
              placeholder="Paste a PGN here. Chess.com: open a game, tap Share, then copy the PGN."
              aria-label="PGN"
              value={pgn}
              onChange={(e) => setPgn(e.target.value)}
            />
            <button className="pri" style={{ width: '100%', marginTop: 10 }} onClick={reviewPgn}>
              Review this game
            </button>
          </>
        )}
        {err && <p className="err">{err}</p>}
        {games.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {games.map((g, i) => (
              <button key={i} className="row" onClick={() => openGame({ pgn: g.pgn, user: user.trim() })}>
                <span className="grow">
                  <b>{g.white} vs. {g.black}</b>
                  <br />
                  <span className="mute">{g.date} · {g.speed}</span>
                </span>
                <span className="pill">{RESULT[g.result] || g.result}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="big">
        <button className="pri" onClick={() => openGame(SAMPLE)}>
          Try a sample<small>A quick example game</small>
        </button>
        <button onClick={() => go('puzzles')}>
          Puzzles<small>Unlimited, by theme</small>
        </button>
      </div>
      <p className="note">Engine: Stockfish (GPL). Pieces: Maestro by sadsnake1 (CC BY-NC-SA 4.0).</p>
    </section>
  )
}
