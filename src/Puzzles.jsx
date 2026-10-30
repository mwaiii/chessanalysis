import { useState } from 'react'
import { Chess } from 'chess.js'
import Board from './Board.jsx'

// One sample puzzle: White to play, find the knight fork.
const START = '3qk2r/ppp3pp/8/4N3/2B5/8/PPP2PPP/R3K3 w - - 0 1'
const SOLUTION = 'e5f7'
const INTRO = 'White to move. Tap a piece to see where it can go.'

export default function Puzzles() {
  const [fen, setFen] = useState(START)
  const [sel, setSel] = useState(null)
  const [msg, setMsg] = useState(INTRO)
  const [state, setState] = useState('idle') // idle | wrong | right
  const [marks, setMarks] = useState({})
  const [hints, setHints] = useState(0)

  const reset = () => {
    setFen(START); setSel(null); setMarks({}); setHints(0); setState('idle'); setMsg(INTRO)
  }

  const select = (c, sq) => {
    const targets = c.moves({ square: sq, verbose: true })
    const m = { [sq]: 'sel' }
    targets.forEach((t) => { m[t.to] = t.captured ? 'cap' : 'dot' })
    setSel(sq); setMarks(m)
  }

  const tap = (sq) => {
    if (state === 'right') return
    const c = new Chess(fen)
    const piece = c.get(sq)
    if (piece && piece.color === 'w') {
      if (sq === sel) { setSel(null); setMarks({}); return }
      select(c, sq)
      setState('idle')
      return
    }
    if (!sel) return
    let move = null
    try { move = c.move({ from: sel, to: sq }) } catch { move = null }
    if (!move) { setSel(null); setMarks({}); return }
    if (move.from + move.to === SOLUTION) {
      setFen(c.fen()); setMarks({ [move.from]: 'hl', [move.to]: 'ok' }); setState('right')
      setMsg('Correct! Nf7 forks the queen and rook, and your bishop protects the knight.')
    } else {
      setMarks({ [sel]: 'sel', [sq]: 'no' }); setState('wrong')
      setMsg('Not quite. Try another move, or tap Hint.')
    }
  }

  const hint = () => {
    const n = hints + 1
    setHints(n)
    if (n === 1) setMsg('Hint: look for a square where your knight attacks two pieces at once.')
    else { setMarks({ e5: 'sel' }); setMsg('Hint: move the highlighted knight.') }
  }

  const color = state === 'right' ? 'var(--c-best)' : state === 'wrong' ? 'var(--c-blunder)' : '#C9B99A'
  const icon = state === 'right' ? '✓' : state === 'wrong' ? '✗' : '♞'

  return (
    <section>
      <div className="top">
        <h1 style={{ margin: 0 }}>Puzzle</h1>
        <span><span className="pill">Rating 1240</span> <span className="pill">Fork</span></span>
      </div>
      <div className="bleed" style={{ marginTop: 10 }}>
        <Board fen={fen} marks={marks} onSquare={tap} />
      </div>
      <div className="fbk" style={{ '--c': color }}>
        <div className="big-ic">{icon}</div>
        <p style={{ alignSelf: 'center' }}>{msg}</p>
      </div>
      <div className="ctl2">
        <button onClick={hint} disabled={state === 'right'}>Hint</button>
        <button className="pri" onClick={reset}>Next puzzle</button>
      </div>
      <p className="note">One sample puzzle for now. Thousands of Lichess puzzles come next.</p>
    </section>
  )
}
