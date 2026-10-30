import { Chess } from 'chess.js'

// Runs Stockfish (lite, single-threaded) in a background worker.
// analyse() returns the evaluation from WHITE's point of view (in centipawns)
// and the engine's best move in UCI form, e.g. "e2e4".
const ENGINE_URL = '/stockfish/stockfish-19-lite-single.js'
let worker = null
let queue = Promise.resolve()

function init() {
  if (worker) return
  worker = new Worker(ENGINE_URL)
  worker.postMessage('uci')
  worker.postMessage('setoption name Hash value 16')
  worker.postMessage('isready')
}

const MATE = 10000

export function analyse(fen, depth = 11) {
  const board = new Chess(fen)
  if (board.isGameOver()) {
    // The game is over here, so there is nothing for the engine to search.
    let cp = 0
    if (board.isCheckmate()) cp = board.turn() === 'w' ? -MATE : MATE
    return Promise.resolve({ cp, best: null })
  }
  const whiteToMove = board.turn() === 'w'
  init()
  const run = () =>
    new Promise((resolve) => {
      let score = null
      const onMsg = (e) => {
        const line = typeof e.data === 'string' ? e.data : ''
        if (line.startsWith('info') && line.includes(' score ') && line.includes(' pv ')) {
          const m = line.match(/score (cp|mate) (-?\d+)/)
          if (m) {
            const v = parseInt(m[2], 10)
            score = m[1] === 'mate' ? Math.sign(v || 1) * (MATE - Math.min(Math.abs(v), 99) * 50) : v
          }
        }
        if (line.startsWith('bestmove')) {
          worker.removeEventListener('message', onMsg)
          const best = line.split(' ')[1]
          const sideCp = score === null ? 0 : score
          resolve({ cp: whiteToMove ? sideCp : -sideCp, best: best === '(none)' ? null : best })
        }
      }
      worker.addEventListener('message', onMsg)
      worker.postMessage('position fen ' + fen)
      worker.postMessage('go depth ' + depth)
    })
  queue = queue.then(run, run)
  return queue
}
