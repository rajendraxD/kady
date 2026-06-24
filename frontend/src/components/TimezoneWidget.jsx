import React, { useEffect, useState } from 'react'
import { Chip } from '@mui/material'
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'

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
        const p = parts.find(part => part.type === 'timeZoneName')
        if (p) code = p.value
      } catch {
        // ignore
      }

      setMeta({ zone, utc: utcString, code, error: null })
    } catch {
      setMeta({ zone: null, utc: null, code: null, error: 'Timezone unavailable' })
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (meta.error) {
    return <Chip size="small" icon={<PublicRoundedIcon />} label="Timezone unavailable" variant="outlined" />
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

  const get = type => parts.find(p => p.type === type)?.value || ''
  const formatted = `${get('day')} ${get('month')} ${get('year')}, ${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod')}`
  const displayCode = meta.code || (meta.zone ? meta.zone.split('/').pop().replace(/_/g, ' ') : 'Local')

  return (
    <Chip
      size="small"
      icon={<PublicRoundedIcon />}
      label={`${displayCode} · ${meta.utc} · ${formatted}`}
      variant="outlined"
      title={meta.zone ? `Your device timezone: ${meta.zone}` : 'Your device timezone'}
      sx={{ fontWeight: 500 }}
    />
  )
}
