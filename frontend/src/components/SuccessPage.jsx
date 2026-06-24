import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'

export default function SuccessPage({ uniqueId, submittedAt, onBackHome }) {
  const [copied, setCopied] = useState(false)
  const appId = uniqueId || ''

  useEffect(() => {
    let t
    if (copied) {
      t = setTimeout(() => setCopied(false), 2000)
    }
    return () => clearTimeout(t)
  }, [copied])

  function copyToClipboard() {
    if (!appId) return
    navigator.clipboard?.writeText(appId)
      .then(() => setCopied(true))
      .catch(() => {})
  }

  function formatSubmitted(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const date = d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    return `${date}, ${time}`
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, md: 6 } }}>
      <Paper
        elevation={0}
        className="kady-fade-in"
        sx={{
          maxWidth: 520,
          width: '100%',
          p: { xs: 3, md: 5 },
          textAlign: 'center',
          border: '1px solid rgba(15,23,42,0.06)'
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 84, color: 'success.main' }} />
        <Typography variant="h4" sx={{ mt: 1 }}>
          Application Submitted!
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Thank you for applying. Our team will review your application and get back to you soon.
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            bgcolor: 'rgba(108,99,255,0.07)',
            border: '1px dashed rgba(108,99,255,0.35)',
            borderRadius: 2,
            px: 2,
            py: 1.5
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
            #{appId}
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy ID'}>
            <IconButton onClick={copyToClipboard} color="primary" size="small">
              <ContentCopyRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Please save this ID for future reference.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Submitted on: {formatSubmitted(submittedAt || new Date().toISOString())}
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<HomeRoundedIcon />}
          onClick={onBackHome}
          sx={{ mt: 3 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  )
}
