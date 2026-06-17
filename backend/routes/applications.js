const express = require('express')
const Application = require('../models/Application')
const { verifyToken } = require('../middleware/auth')

const router = express.Router()

// GET /api/applications — list all applications (auth required)
router.get('/', verifyToken, async (_req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 })
    res.json(applications)
  } catch (err) {
    console.error('GET /applications error:', err)
    res.status(500).json({ error: 'Failed to fetch applications' })
  }
})

// POST /api/applications — create a new application
router.post('/', async (req, res) => {
  try {
    const body = req.body

    // Generate a uniqueId using a count-based scheme (same as frontend)
    const count = await Application.countDocuments()
    const applicationId = 11000 + count + 1

    const application = new Application({
      uniqueId: String(applicationId),
      applicationId: String(applicationId),
      status: body.status || 'Applied',
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      countryCode: body.countryCode || 'IN',
      phone: body.phone || '',
      email: body.email || '',
      altEmail: body.altEmail || '',
      altPhone: body.altPhone || '',
      altCountryCode: body.altCountryCode || 'IN',
      positionApplied: body.positionApplied || '',
      isFresher: !!body.isFresher,
      currentPosition: body.currentPosition || '',
      companyName: body.companyName || '',
      startDate: body.startDate || '',
      endDate: body.endDate || '',
      currentlyWorking: !!body.currentlyWorking,
      relevantStartDate: body.relevantStartDate || '',
      relevantEndDate: body.relevantEndDate || '',
      currentlyWorkingRelevant: !!body.currentlyWorkingRelevant,
      relevantExperienceText: body.relevantExperienceText || '',
      experienceYears: body.experienceYears || '',
      totalJobExperience: body.totalJobExperience || '',
      lastSalary: body.lastSalary || '',
      expectedSalary: body.expectedSalary || '',
      lastCompany: body.lastCompany || '',
      salarySlips: body.salarySlips || [],
      bonusDetails: body.bonusDetails || null,
      educationDetails: body.educationDetails || null,
      educationHistory: body.educationHistory || [],
      skills: body.skills || [],
      resumeName: body.resumeName || null,
      resumeData: body.resumeData || null,
      currentLocation: body.currentLocation || '',
      preferredLocation1: body.preferredLocation1 || '',
      preferredLocation2: body.preferredLocation2 || '',
      workTypePreference: body.workTypePreference || 'Work from Home'
    })

    const saved = await application.save()
    res.status(201).json(saved)
  } catch (err) {
    console.error('POST /applications error:', err)
    res.status(500).json({ error: 'Failed to save application' })
  }
})

// PATCH /api/applications/:id/status — update application status (auth required)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'On Hold']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ error: 'Application not found' })
    }

    res.json(updated)
  } catch (err) {
    console.error('PATCH /applications/:id/status error:', err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

module.exports = router
