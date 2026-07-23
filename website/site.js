// Live GitHub numbers in the nav + open-source strip. Fails silently — the site
// works fine without them (unauthenticated API: 60 req/h per IP, cached below).
(async () => {
  const set = (id, v) => document.querySelectorAll('[data-gh="' + id + '"]').forEach(el => { el.textContent = v })
  try {
    let d = null
    const cached = sessionStorage.getItem('gh_repo')
    if (cached) d = JSON.parse(cached)
    else {
      const r = await fetch('https://api.github.com/repos/DuarteSantos8/openGym')
      if (!r.ok) return
      d = await r.json()
      sessionStorage.setItem('gh_repo', JSON.stringify({ stargazers_count: d.stargazers_count, forks_count: d.forks_count, open_issues_count: d.open_issues_count }))
    }
    set('stars', '★ ' + d.stargazers_count)
    set('stars-n', d.stargazers_count)
    set('forks-n', d.forks_count)
    set('issues-n', d.open_issues_count)
  } catch (e) { /* offline / rate-limited — leave placeholders */ }
})()
