import { PIECES } from './pieces.js'

// marks: { e4: 'hl' | 'sel' | 'dot' | 'cap' | 'ok' | 'no' }
export default function Board({ fen, marks = {}, onSquare, flip = false }) {
  const rows = fen.split(' ')[0].split('/')
  let cells = []
  const push = (r, f, ch) => {
    const file = 'abcdefgh'[f]
    const rank = 8 - r
    const sq = file + rank
    const light = (r + f) % 2 === 0
    const showFile = flip ? r === 0 : r === 7
    const showRank = flip ? f === 7 : f === 0
    cells.push(
      <div
        key={sq}
        className={'sq ' + (light ? 'lt' : 'dk') + (marks[sq] ? ' ' + marks[sq] : '')}
        onClick={() => onSquare && onSquare(sq)}
      >
        {ch && (
          <div
            className="pc"
            style={{ backgroundImage: `url("${PIECES[(ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase()]}")` }}
          />
        )}
        {showRank && <span className="co rk">{rank}</span>}
        {showFile && <span className="co fl">{file}</span>}
      </div>
    )
  }
  rows.forEach((row, r) => {
    let f = 0
    for (const ch of row) {
      if (/\d/.test(ch)) for (let k = 0; k < +ch; k++) push(r, f++, '')
      else push(r, f++, ch)
    }
  })
  if (flip) cells = cells.reverse()
  return <div className="board">{cells}</div>
}
