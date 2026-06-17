import React, { useEffect, useState } from 'react'

export default function TimezoneWidget() {
  const [now, setNow] = useState(new Date())
  const [meta, setMeta] = useState({ zone: null, utc: null, code: null, error: null })

  useEffect(() => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || null

      const offset = -new Date().getTimezoneOffset()
      const hours = Math.floor(Math.abs(offset) / 60)
      const mins = Math.abs(offset) % 60
      const sign = offset >= 0 ? '+' : '-'
      const utcString = `UTC ${sign}${hours}:${mins.toString().padStart(2, '0')}`

      let code = null
      try {
        const parts = Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(new Date())
        const p = parts.find(p => p.type === 'timeZoneName')
        if (p) code = p.value
      } catch (e) {
        // ignore
      }

      setMeta({ zone, utc: utcString, code, error: null })
    } catch (err) {
      setMeta({ zone: null, utc: null, code: null, error: 'Timezone unavailable' })
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (meta.error) {
    return (
      <div className="timezone-widget" title={meta.error}>
        Timezone unavailable
      </div>
    )
  }

  const parts = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).formatToParts(now)

  const day = parts.find(p => p.type === 'day')?.value || ''
  const month = parts.find(p => p.type === 'month')?.value || ''
  const year = parts.find(p => p.type === 'year')?.value || ''
  const hour = parts.find(p => p.type === 'hour')?.value || ''
  const minute = parts.find(p => p.type === 'minute')?.value || ''
  const second = parts.find(p => p.type === 'second')?.value || ''
  const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value || ''

  const formatted = `${day} ${month} ${year}, ${hour}:${minute}:${second} ${dayPeriod}`

  const displayCode = meta.code || (meta.zone ? meta.zone.split('/').pop().replace(/_/g, ' ') : 'Local')

  return (
    <div className="timezone-widget" title={meta.zone ? `Your device timezone: ${meta.zone}` : 'Your device timezone'}>
      <div className="tz-row">
        <span className="tz-icon" aria-hidden>🌐</span>
        <span className="tz-main">{displayCode}</span>
        <span className="tz-utc">{meta.utc}</span>
        <span className="tz-time">{formatted}</span>
      </div>
    </div>
  )
}
