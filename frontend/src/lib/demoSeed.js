// The example profile behind the demo build (see demo.js). Imported dynamically, so it stays
// out of the bundle self-hosters ship.
import { isoOf, uid } from './format.js'
import { starterRoutines } from './starter.js'

// Starting weight and weekly increment per exercise of the starter plan (kg).
// Chest dips are body-weight only here, so they log reps at 0 added weight.
const PROG = {
  '0025': [60, 1.25], '0047': [45, 1], '0426': [20, 0.5], '0334': [10, 0.25], '0241': [25, 0.75], '0251': [0, 0],
  '2330': [50, 1.25], '0027': [50, 1], '1323': [45, 1], '0031': [30, 0.5], '0313': [12, 0.3],
  '0043': [70, 1.5], '0085': [60, 1.25], '0739': [120, 3], '0585': [45, 1], '0586': [40, 1], '0605': [60, 1.5]
}
const WEEKS = 12                       // how much history to fabricate
const BW_FROM = 82.4, BW_TO = 78.3     // body-weight trend across those weeks
const TARGET_W = 77

// Deterministic PRNG — the demo should look the same on every visit and in screenshots.
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const round = (w, step) => Math.round(w / step) * step
const at = (date, h, m) => { const d = new Date(date); d.setHours(h, m, 0, 0); return d.getTime() }

// A full example profile: 12 weeks of Mon/Wed/Fri sessions on the starter plan, with linear
// progression, the odd missed session, and twice-weekly weigh-ins trending toward the goal.
export function buildDemoState() {
  const rnd = rng(20260723)
  const [push, pull, legs] = starterRoutines()
  const byWeekday = { 1: push, 3: pull, 5: legs }

  const nowH = new Date().getHours()
  const today = new Date(); today.setHours(12, 0, 0, 0)
  const start = new Date(today); start.setDate(start.getDate() - WEEKS * 7)

  const workouts = []
  const bodyweight = []
  const exWeights = {}
  const best = {}

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const day = new Date(d)
    const iso = isoOf(day)
    const weekIdx = Math.floor((day - start) / (7 * 86400000))
    const p = Math.min(1, weekIdx / WEEKS)

    // weigh-ins: Monday and Thursday mornings
    if (day.getDay() === 1 || day.getDay() === 4) {
      const w = BW_FROM + (BW_TO - BW_FROM) * p + (rnd() - 0.5) * 0.7
      bodyweight.push({ d: iso, w: Math.round(w * 10) / 10, t: at(day, 7, 30) })
    }

    const routine = byWeekday[day.getDay()]
    if (!routine) continue
    if (rnd() < 0.09) continue                      // life happens — a few missed sessions
    if (iso === isoOf(today) && nowH < 18) continue   // leave today's session to try out, unless it's already evening

    const prs = []
    const entries = routine.ex.map(cfg => {
      const [base, inc] = PROG[cfg.id] || [20, 0.5]
      const step = base >= 40 ? 2.5 : 1.25
      const w = base ? Math.max(step, round(base + inc * weekIdx, step)) : 0
      const sets = []
      for (let i = 0; i < cfg.sets; i++) {
        // last set is where reps usually start slipping
        const drop = i === cfg.sets - 1 && rnd() < 0.55 ? (rnd() < 0.4 ? 2 : 1) : 0
        sets.push({ w, r: Math.max(4, cfg.reps - drop), done: true })
      }
      if (w > (best[cfg.id] || 0)) { best[cfg.id] = w; prs.push(cfg.id) }
      exWeights[cfg.id] = { w: Math.max(w, exWeights[cfg.id]?.w || 0), d: iso }
      return { id: cfg.id, sets, topW: w || null }
    })

    const bw = bodyweight.length ? bodyweight[bodyweight.length - 1].w : BW_FROM
    const startMs = at(day, 18, 5 + Math.floor(rnd() * 25))
    const w = {
      id: uid(), d: iso, start: startMs, end: startMs + (46 + Math.floor(rnd() * 26)) * 60000,
      routineId: routine.id, name: routine.name, bw,
      entries,
      prs: weekIdx === 0 ? [] : prs   // the very first session isn't a PR party
    }
    w.vol = entries.reduce((v, e) => v + e.sets.reduce((n, s) => n + s.w * s.r, 0), 0)
    workouts.push(w)
  }

  // A visitor should always have something to press "Start" on, so if they land on a rest day
  // the next routine in the rotation is moved onto today — which also shows off rescheduling.
  const dayPlan = {}
  const tIso = isoOf(today)
  if (!byWeekday[today.getDay()] && !workouts.some(w => w.d === tIso)) {
    const order = [push, pull, legs]
    const lastName = workouts.length ? workouts[workouts.length - 1].name : legs.name
    dayPlan[tIso] = order[(order.findIndex(r => r.name === lastName) + 1) % order.length].id
  }

  return {
    routines: [push, pull, legs],
    week: { 1: push.id, 3: pull.id, 5: legs.id },
    dayPlan,
    workouts, bodyweight, exWeights,
    targetW: TARGET_W
  }
}
