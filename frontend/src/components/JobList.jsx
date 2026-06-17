import React from 'react'

export default function JobList({ jobs }) {
  if (!jobs.length) return <p>No jobs yet.</p>
  return (
    <ul>
      {jobs.map(j => (
        <li key={j.id}>
          <strong>{j.title}</strong> — {j.location}
        </li>
      ))}
    </ul>
  )
}
