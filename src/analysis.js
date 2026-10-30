import { Chess } from 'chess.js'

// Chance of winning (0-100) for White, from a centipawn score.
export const winPct = (cp) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1)

const PIECE = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' }

export function parseGame(pgn) {
  const c = new Chess()
  c.loadPgn(pgn)
  const headers = c.header()
  const moves = c.history({ verbose: true })
  const r = headers.FEN ? new Chess(headers.FEN) : new Chess()
  const fens = [r.fen()]
  for (const m of moves) {
    r.move(m.san)
    fens.push(r.fen())
  }
  return { headers, moves, fens }
}

export const LABEL = {
  best: 'Best move',
  good: 'Good move',
  ok: 'Okay',
  inacc: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
}

function uciToSan(fen, uci) {
  if (!uci) return null
  try {
    const m = new Chess(fen).move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
    return m.san
  } catch {
    return null
  }
}

// ev[i] is the analysis of the position BEFORE move i; ev[i+1] is the position after it.
export function judge(game, ev, i) {
  if (!ev[i] || !ev[i + 1]) return null
  const mv = game.moves[i]
  const mover = mv.color
  const wb = winPct(ev[i].cp)
  const wa = winPct(ev[i + 1].cp)
  const before = mover === 'w' ? wb : 100 - wb
  const after = mover === 'w' ? wa : 100 - wa
  const loss = Math.max(0, before - after)
  const played = mv.from + mv.to + (mv.promotion || '')
  let cls
  if (played === ev[i].best) cls = 'best'
  else if (loss >= 30) cls = 'blunder'
  else if (loss >= 20) cls = 'mistake'
  else if (loss >= 10) cls = 'inacc'
  else if (loss >= 4) cls = 'ok'
  else cls = 'good'
  const accuracy = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * loss) - 3.1669))
  const bestSan = uciToSan(game.fens[i], ev[i].best)
  const replySan = uciToSan(game.fens[i + 1], ev[i + 1].best)
  let reply = null
  if (replySan && loss >= 10) {
    try {
      const rm = new Chess(game.fens[i + 1]).move(replySan)
      if (rm.san.includes('#')) reply = `It allows ${rm.san}, which is checkmate.`
      else if (rm.captured) reply = `It allows ${rm.san}, winning a ${PIECE[rm.captured] || 'piece'}.`
      else if (rm.san.includes('+')) reply = `It allows ${rm.san} with check.`
    } catch { /* ignore */ }
  }
  const bestTxt = bestSan ? ` Best was ${bestSan}.` : ''
  const text = {
    best: 'This is the engine’s top choice.',
    good: 'A solid move that keeps your position healthy.',
    ok: `Fine, but not the most accurate.${bestTxt}`,
    inacc: `${reply ? reply + ' ' : 'A slightly weaker move. '}${bestTxt}`.trim(),
    mistake: `${reply || 'This gives away a good part of your advantage.'}${bestTxt}`,
    blunder: `${reply || 'This throws away a big part of your position.'}${bestTxt}`,
  }[cls]
  return { cls, loss, accuracy, text, bestUci: ev[i].best, mover }
}
