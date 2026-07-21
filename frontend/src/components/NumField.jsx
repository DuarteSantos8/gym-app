import { useRef, useState } from 'react'

// Numeric input that accepts "," as decimal separator — iOS decimal keypads in many
// locales only offer a comma, and type="number" reports "" for it (value snaps to 0).
// Keeps a local string draft while focused so partial input like "33," survives typing.
export default function NumField({ value, onChange, decimal = true, ...rest }) {
  const [draft, setDraft] = useState(null)
  const committed = useRef(null)
  // external change (e.g. −/+ buttons) while a draft is showing → drop the draft
  if (draft !== null && committed.current !== value) { setDraft(null); committed.current = null }
  const commit = raw => {
    let s = raw.replace(/,/g, '.').replace(/[^0-9.]/g, '')
    const i = s.indexOf('.')
    if (i !== -1) s = decimal ? s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '') : s.slice(0, i)
    const n = s === '' || s === '.' ? 0 : Math.max(0, parseFloat(s))
    committed.current = n
    setDraft(s)
    onChange(n)
  }
  return (
    <input
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      value={draft ?? (value ?? '')}
      onFocus={e => e.target.select()}
      onChange={e => commit(e.target.value)}
      onBlur={() => { setDraft(null); committed.current = null }}
      {...rest}
    />
  )
}
