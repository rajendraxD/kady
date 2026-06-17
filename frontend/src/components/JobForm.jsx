import React, { useState } from 'react'

export default function JobForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!title) return
    onAdd({ title, location })
    setTitle('')
    setLocation('')
  }

  return (
    <form onSubmit={submit} className="job-form">
      <input placeholder="Job title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
      <button type="submit">Add job</button>
    </form>
  )
}
