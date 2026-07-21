import { useState } from 'react'
import { imgSrc, gifSrc } from '../lib/exercises.js'
import { t } from '../lib/i18n.js'

// Big autoplaying animation; tap toggles to the still frame. `compact` shrinks it (superset cards).
export default function Media({ ex, id, compact }) {
  const [playing, setPlaying] = useState(true)
  return (
    <div className={'exmedia' + (compact ? ' compact' : '')} id={id} onClick={() => setPlaying(p => !p)}>
      <img decoding="async" src={playing ? gifSrc(ex) : imgSrc(ex)} alt={ex.n} />
      <span className="gifhint">{playing ? '⏸ ' + t('tap to pause') : '▶ ' + t('tap to play')}</span>
    </div>
  )
}

export function Thumb({ ex }) {
  return <img className="thumb" loading="lazy" decoding="async" src={imgSrc(ex)} alt="" />
}
