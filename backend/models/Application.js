import mongoose from 'mongoose'

const bonusEntrySchema = new mongoose.Schema({
  type: { type: String, default: '' },
  amount: { type: String, default: '' },
  fileName: { type: String, default: null }
}, { _id: false })

const educationEntrySchema = new mongoose.Schema({
  degree: { type: String, default: '' },
  specialization: { type: String, default: '' },
  institute: { type: String, default: '' },
  currentlyStudying: { type: Boolean, default: false },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  grade: { type: String, default: '' },
  fileName: { type: String, default: null }
}, { _id: false })

const applicationSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  applicationId: { type: String, required: true },
  status: { type: String, default: 'Applied', enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'On Hold'] },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  countryCode: { type: String, default: 'IN' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  altEmail: { type: String, default: '' },
  altPhone: { type: String, default: '' },
  altCountryCode: { type: String, default: 'IN' },
  positionApplied: { type: String, default: '' },
  isFresher: { type: Boolean, default: false },
  currentPosition: { type: String, default: '' },
  companyName: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  currentlyWorking: { type: Boolean, default: false },
  relevantStartDate: { type: String, default: '' },
  relevantEndDate: { type: String, default: '' },
  currentlyWorkingRelevant: { type: Boolean, default: false },
  relevantExperienceText: { type: String, default: '' },
  experienceYears: { type: String, default: '' },
  totalJobExperience: { type: String, default: '' },
  lastSalary: { type: String, default: '' },
  expectedSalary: { type: String, default: '' },
  lastCompany: { type: String, default: '' },
  salarySlips: [{
    name: { type: String, default: '' },
    size: { type: Number, default: 0 },
    type: { type: String, default: '' }
  }],
  bonusDetails: {
    count: { type: String, default: null },
    entries: [bonusEntrySchema]
  },
  educationDetails: {
    degree: { type: String, default: '' },
    specialization: { type: String, default: '' },
    institute: { type: String, default: '' },
    currentlyStudying: { type: Boolean, default: false },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    grade: { type: String, default: '' },
    fileName: { type: String, default: null }
  },
  educationHistory: [educationEntrySchema],
  skills: [String],
  resumeName: { type: String, default: null },
  resumeData: { type: String, default: null },
  currentLocation: { type: String, default: '' },
  preferredLocation1: { type: String, default: '' },
  preferredLocation2: { type: String, default: '' },
  workTypePreference: { type: String, default: 'Work from Home' }
}, { timestamps: true })

// Map _id to id in JSON output for frontend compatibility
applicationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    return ret
  }
})

export default mongoose.model('Application', applicationSchema)
