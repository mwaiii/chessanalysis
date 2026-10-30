import { useEffect, useMemo, useRef, useState } from 'react'
import Board from './Board.jsx'
import { analyse } from './engine.js'
import { parseGame, judge, winPct, LABEL } from './analysis.js'

const ICON = { best: '★', good: '✓', ok: '•', inacc: '?!', mistake: '?', blunder: '??' }
const colorOf = (cls) => `var(--c-${cls})`
const DEPTH = 11

function evText(cp) {
  if (Math.abs(cp) >= 9000) return cp > 0 ? 'Mate' : '-Mate'
  const v = (cp / 100).toFixed(1)
  return (cp > 0 ? '+' : '') + v
}

export default function Review({ game, go }) {
  const parsed = useMemo(() => {
    try { return parseGame(game.pgn) } catch { return null }
  }, [game.pgn])

  const startSide = useMemo(() => {
    if (!parsed || !game.user) return 'w'
    return (parsed.headers.Black || '').toLowerCase() === game.user.toLowerCase() ? 'b' : 'w'
  }, [parsed, game.user])

  const [me, setMe] = useState(startSide)
  const [cur, setCur] = useState(0)
  const [ev, setEv] = useState([])
  const [done, setDone] = useState(false)
  const [showBest, setShowBest] = useState(false)
  const strip = useRef(null)

  useEffect(() => {
    if (!parsed) return
    let stop = false
    ;(async () => {
      for (let i = 0; i < parsed.fens.length; i++) {
        const r = await analyse(parsed.fens[i], DEPTH)
        if (stop) return
        setEv((prev) => { const n = prev.slice(); n[i] = r; return n })
      }
      if (!stop) setDone(true)
    })()
    return () => { stop = true }
  }, [parsed])

  useEffect(() => {
    const el = strip.current && strip.current.querySelector('.chip.sel')
    if (el) strip.current.scrollTo({ left: el.offsetLeft - strip.current.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
  }, [cur])

  if (!parsed) {
    return (
      <section>
        <h1>Game review</h1>
        <div className="card">That game couldn’t be read. Go back and try another one.</div>
        <button onClick={() => go('home')}>Back</button>
      </section>
    )
  }

  const n = parsed.moves.length
  const judged = parsed.moves.map((_, i) => judge(parsed, ev, i))
  const analysed = ev.filter(Boolean).length
  const idx = cur - 1
  const mv = idx >= 0 ? parsed.moves[idx] : null
  const j = idx >= 0 ? judged[idx] : null
  const marks = {}
  if (mv) {
    const sqs = showBest && j ? [j.bestUci.slice(0, 2), j.bestUci.slice(2, 4)] : [mv.from, mv.to]
    sqs.forEach((s) => { marks[s] = 'hl' })
  }
  const cp = ev[cur] ? ev[cur].cp : 0
  const wp = ev[cur] ? winPct(cp) : 50
  const mySide = (i) => parsed.moves[i].color === me
  const mine = judged.map((x, i) => (x && mySide(i) ? x : null)).filter(Boolean)
  const count = (c) => mine.filter((x) => x.cls === c).length
  const accuracy = mine.length ? Math.round(mine.reduce((s, x) => s + x.accuracy, 0) / mine.length) : null
  const bad = judged.map((x, i) => (x && mySide(i) && (x.cls === 'mistake' || x.cls === 'blunder') ? i : -1)).filter((i) => i >= 0)

  const move = (c) => { setCur(Math.max(0, Math.min(n, c))); setShowBest(false) }
  const nextBad = () => {
    if (!bad.length) return
    const after = bad.find((i) => i + 1 > cur)
    move((after ?? bad[0]) + 1)
  }
  const san = (i) => `${Math.floor(i / 2) + 1}${i % 2 ? '…' : '.'} ${parsed.moves[i].san}`
  const h = parsed.headers
  const player = (side) => {
    const name = side === 'w' ? h.White : h.Black
    const elo = side === 'w' ? h.WhiteElo : h.BlackElo
    return (
      <div className="pl">
        <span className={'dotc ' + side} />
        <span>{name || (side === 'w' ? 'White' : 'Black')}</span>
        {elo && elo !== '?' && <span className="elo">({elo})</span>}
        <span className="sp" />
        {side === me && <span className="pill">You</span>}
      </div>
    )
  }
  const top = me === 'w' ? 'b' : 'w'

  return (
    <section>
      <div className="top">
        <h1 style={{ margin: 0 }}>Review</h1>
        <div className="seg" style={{ margin: 0, width: 190 }}>
          <button className={me === 'w' ? 'on' : ''} onClick={() => setMe('w')}>White</button>
          <button className={me === 'b' ? 'on' : ''} onClick={() => setMe('b')}>Black</button>
        </div>
      </div>
      {!done && (
        <div className="prog" role="status">
          <div className="prog-bar"><i style={{ width: (analysed / (n + 1)) * 100 + '%' }} /></div>
          <span className="mute">Analysing the game… {analysed} of {n + 1}</span>
        </div>
      )}

      {player(top)}
      <div className="bleed">
        <Board fen={parsed.fens[cur]} marks={marks} flip={me === 'b'} />
      </div>
      {player(me)}
      <div className="evrow">
        <div className="evbar" role="img" aria-label="Evaluation bar"><i style={{ width: wp + '%' }} /></div>
        <span className="evnum">{ev[cur] ? evText(cp) : '…'}</span>
      </div>

      <div className="fbk" style={{ '--c': j ? colorOf(j.cls) : '#C9B99A' }}>
        <div className="big-ic">{j ? ICON[j.cls] : '♟'}</div>
        <div>
          {!mv && <p>Start of the game. Tap ▸ to step through.</p>}
          {mv && !j && <p>{san(idx)} · analysing…</p>}
          {mv && j && (
            <>
              <h3>{san(idx)} · {LABEL[j.cls]}{mySide(idx) ? '' : ' (opponent)'}</h3>
              <p>{j.text}</p>
            </>
          )}
        </div>
      </div>

      <div className="ctl">
        <button aria-label="Start" disabled={cur === 0} onClick={() => move(0)}>«</button>
        <button aria-label="Back" disabled={cur === 0} onClick={() => move(cur - 1)}>‹</button>
        <button aria-label="Next" className="pri" disabled={cur === n} onClick={() => move(cur + 1)}>›</button>
        <button aria-label="End" disabled={cur === n} onClick={() => move(n)}>»</button>
      </div>
      <div className="ctl2">
        <button disabled={!j || j.cls === 'best'} onClick={() => setShowBest(!showBest)}>{showBest ? 'Show played' : 'Show best move'}</button>
        <button disabled={!bad.length} onClick={nextBad}>Next mistake</button>
      </div>

      <div className="strip" ref={strip}>
        {parsed.moves.map((m, i) => (
          <button key={i} className={'chip' + (i === idx ? ' sel' : '')} style={{ '--c': judged[i] ? colorOf(judged[i].cls) : undefined }} onClick={() => move(i + 1)}>
            <i />
            {i % 2 === 0 && <span className="n">{i / 2 + 1}.</span>}
            {m.san}
          </button>
        ))}
      </div>

      {done && (
        <div className="stats three" style={{ marginTop: 6 }}>
          <div className="stat"><span className="mute">Accuracy</span><b>{accuracy ?? '–'}%</b></div>
          <div className="stat"><span className="mute">Mistakes</span><b>{count('mistake')}</b></div>
          <div className="stat"><span className="mute">Blunders</span><b>{count('blunder')}</b></div>
        </div>
      )}
      <button style={{ width: '100%', marginTop: 12 }} onClick={() => go('share')}>Share this review</button>
      <p className="note">Analysis runs on your device with Stockfish. Longer games take a little while on a phone.</p>
    </section>
  )
}
