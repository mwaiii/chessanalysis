import { useState } from 'react'
import './styles.css'
import Home from './Home.jsx'
import Review from './Review.jsx'
import Puzzles from './Puzzles.jsx'
import Insights from './Insights.jsx'
import Share from './Share.jsx'
import { SAMPLE } from './samples.js'

const ICONS = {
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  review: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4M8 11h6M11 8v6" /></>,
  puzzles: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  insights: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
}
const TABS = [
  ['home', 'Home'],
  ['review', 'Review'],
  ['puzzles', 'Puzzles'],
  ['insights', 'Insights'],
]

export default function App() {
  const [screen, setScreen] = useState('home')
  const [game, setGame] = useState(SAMPLE)
  const go = (s) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }
  const openGame = (g) => {
    setGame(g)
    go('review')
  }
  return (
    <div className="app">
      <main>
        {screen === 'home' && <Home go={go} openGame={openGame} />}
        {screen === 'review' && <Review key={game.pgn} game={game} go={go} />}
        {screen === 'puzzles' && <Puzzles />}
        {screen === 'insights' && <Insights go={go} />}
        {screen === 'share' && <Share go={go} />}
      </main>
      <nav>
        <div>
          {TABS.map(([id, label]) => (
            <button key={id} className={screen === id ? 'on' : ''} onClick={() => go(id)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[id]}</svg>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
