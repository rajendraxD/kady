import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Avatar,
  Divider,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  LinearProgress,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  Snackbar
} from '@mui/material'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import InfoRoundedIcon from '@mui/icons-material/InfoRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'
import Tesseract from 'tesseract.js'
import { submitApplication } from '../store/applicationsSlice'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const degreeList = [
  'SSC (10th)', 'HSC (12th)', 'CBSE 10th', 'CBSE 12th', 'ICSE 10th', 'ISC 12th', 'State Board 10th', 'State Board 12th',
  'Diploma in Engineering', 'Diploma in Computer Science', 'Diploma in Information Technology', 'Diploma in Electronics',
  'Diploma in Mechanical Engineering', 'Diploma in Civil Engineering', 'Diploma in Electrical Engineering', 'Diploma in Architecture',
  'Diploma in Pharmacy', 'Diploma in Business Management', 'Polytechnic Diploma',
  'B.E. (Bachelor of Engineering)', 'B.Tech (Bachelor of Technology)', 'B.Sc (Bachelor of Science)', 'B.Com (Bachelor of Commerce)',
  'B.A. (Bachelor of Arts)', 'B.B.A (Bachelor of Business Administration)', 'B.C.A (Bachelor of Computer Applications)',
  'B.Arch (Bachelor of Architecture)', 'B.Pharm (Bachelor of Pharmacy)', 'B.Ed (Bachelor of Education)', 'B.Des (Bachelor of Design)',
  'B.F.Tech (Bachelor of Fashion Technology)', 'B.H.M (Bachelor of Hotel Management)', 'B.L.I.Sc (Bachelor of Library Science)',
  'B.P.T (Bachelor of Physiotherapy)', 'B.S.W (Bachelor of Social Work)', 'LLB (Bachelor of Laws)', 'MBBS (Bachelor of Medicine)',
  'BDS (Bachelor of Dental Surgery)', 'B.V.Sc (Bachelor of Veterinary Science)',
  'M.E. (Master of Engineering)', 'M.Tech (Master of Technology)', 'M.Sc (Master of Science)', 'M.Com (Master of Commerce)',
  'M.A. (Master of Arts)', 'M.B.A (Master of Business Administration)', 'M.C.A (Master of Computer Applications)',
  'M.Arch (Master of Architecture)', 'M.Pharm (Master of Pharmacy)', 'M.Ed (Master of Education)', 'M.Des (Master of Design)',
  'M.S. (Master of Surgery)', 'M.S.W (Master of Social Work)', 'LLM (Master of Laws)', 'M.Phil (Master of Philosophy)',
  'PGDM (Post Graduate Diploma in Management)', 'PGDCA (Post Graduate Diploma in Computer Applications)',
  'PG Diploma in Data Science', 'PG Diploma in Digital Marketing', 'PG Diploma in HR Management', 'PG Diploma in Finance',
  'Ph.D (Doctor of Philosophy)', 'D.Sc (Doctor of Science)', 'D.Litt (Doctor of Literature)', 'M.D (Doctor of Medicine)',
  'CA (Chartered Accountant)', 'CMA (Cost Management Accountant)', 'CS (Company Secretary)', 'CFA (Chartered Financial Analyst)',
  'CFP (Certified Financial Planner)', 'ACCA (Association of Chartered Certified Accountants)', 'CPA (Certified Public Accountant)',
  'AWS Certified Solutions Architect', 'Google Cloud Professional', 'Microsoft Azure Certification',
  'Certified Ethical Hacker (CEH)', 'CISSP Certification', 'PMP (Project Management Professional)',
  'Scrum Master Certification', 'SAP Certification', 'Oracle Certification', 'Cisco CCNA / CCNP'
]

const sectionKeywords = {
  personal: ['contact', 'personal', 'profile', 'about me', 'summary'],
  experience: ['experience', 'employment', 'work history', 'career'],
  education: ['education', 'qualification', 'academic', 'degree', 'university'],
  skills: ['skills', 'technical skills', 'competencies', 'expertise', 'technologies', 'tools'],
  projects: ['projects', 'assignments'],
  salary: ['salary', 'ctc', 'compensation', 'package']
}

const industryTitles = ['Developer', 'Engineer', 'Manager', 'Consultant', 'Analyst', 'Designer', 'HR', 'Lead', 'Architect', 'Specialist', 'Administrator', 'Coordinator', 'Executive', 'Assistant', 'Director']

const skillDictionary = ['JavaScript', 'Python', 'React', 'Angular', 'Vue', 'Node.js', 'Java', 'C++', 'C#', 'SQL', 'MongoDB', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'SAP', 'Salesforce', 'Power BI', 'Tableau', 'Figma', 'Adobe XD', 'Photoshop', 'HR', 'Recruitment', 'Payroll', 'Training', 'Project Management', 'Agile', 'Scrum']

const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Noida', 'Gurgaon', 'Indore', 'Coimbatore', 'Kochi', 'Nagpur', 'Vadodara', 'Bhubaneswar', 'Mysore', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Dehradun', 'Amritsar', 'Ludhiana', 'Jodhpur', 'Udaipur', 'Faridabad', 'Ghaziabad', 'Madurai', 'Vijayawada', 'Tirupati', 'Warangal', 'Hubli', 'Thrissur', 'Kozhikode', 'Nashik', 'Aurangabad', 'Kolhapur', 'Rajkot', 'Gandhinagar', 'Panaji', 'Patna', 'Ranchi', 'Jamshedpur', 'Guwahati', 'Raipur', 'Siliguri', 'Vizag', 'Chandigarh', 'Surat']

const positionOptions = ['SAP FICO', 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'DevOps Engineer', 'QA Tester', 'UI/UX Designer', 'Business Analyst', 'HR Executive', 'Recruitment Specialist', 'Sales Executive']

const resumeStepsTemplate = [
  { key: 'read', label: 'Reading resume file...', status: 'idle' },
  { key: 'detect', label: 'Detecting sections...', status: 'idle' },
  { key: 'personal', label: 'Extracting personal details...', status: 'idle' },
  { key: 'experience', label: 'Extracting experience...', status: 'idle' },
  { key: 'education', label: 'Extracting education...', status: 'idle' },
  { key: 'skills', label: 'Extracting skills...', status: 'idle' },
  { key: 'fill', label: 'Filling form fields...', status: 'idle' }
]

const countryOptions = [
  { value: 'IN', flag: '🇮🇳', label: 'India (+91)', prefix: '91' },
  { value: 'US', flag: '🇺🇸', label: 'United States (+1)', prefix: '1' },
  { value: 'CA', flag: '🇨🇦', label: 'Canada (+1)', prefix: '1' },
  { value: 'GB', flag: '🇬🇧', label: 'United Kingdom (+44)', prefix: '44' },
  { value: 'AU', flag: '🇦🇺', label: 'Australia (+61)', prefix: '61' },
  { value: 'AE', flag: '🇦🇪', label: 'United Arab Emirates (+971)', prefix: '971' },
  { value: 'SG', flag: '🇸🇬', label: 'Singapore (+65)', prefix: '65' },
  { value: 'NZ', flag: '🇳🇿', label: 'New Zealand (+64)', prefix: '64' },
  { value: 'DE', flag: '🇩🇪', label: 'Germany (+49)', prefix: '49' },
  { value: 'FR', flag: '🇫🇷', label: 'France (+33)', prefix: '33' },
  { value: 'ZA', flag: '🇿🇦', label: 'South Africa (+27)', prefix: '27' }
]

const locationOptions = [...indianCities, 'Remote', 'Work From Home']

const SectionHeader = ({ number, title, subtitle }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
    <Avatar variant="rounded" sx={{ bgcolor: 'rgba(108,99,255,0.12)', color: 'primary.main', fontWeight: 700, width: 40, height: 40 }}>
      {number}
    </Avatar>
    <Box>
      <Typography variant="h6">{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Stack>
)

export default function CandidateForm({ onSubmitSuccess }) {
  const dispatch = useDispatch()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [countryCode, setCountryCode] = useState('IN')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [email, setEmail] = useState('')
  const [altEmail, setAltEmail] = useState('')
  const [altCountryCode, setAltCountryCode] = useState('IN')
  const [altPhone, setAltPhone] = useState('')
  const [altPhoneError, setAltPhoneError] = useState('')
  const [positionApplied, setPositionApplied] = useState('')
  const [isFresher, setIsFresher] = useState(false)
  const [currentPosition, setCurrentPosition] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentlyWorking, setCurrentlyWorking] = useState(false)
  const [relevantExperienceText, setRelevantExperienceText] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [totalJobExperience, setTotalJobExperience] = useState('')
  const [lastSalary, setLastSalary] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [lastCompany, setLastCompany] = useState('')
  const [salarySlipFiles, setSalarySlipFiles] = useState([])
  const [salarySlipError, setSalarySlipError] = useState('')
  const [isSalaryDragActive, setIsSalaryDragActive] = useState(false)
  const [showBonusDetails, setShowBonusDetails] = useState(false)
  const [bonusCount, setBonusCount] = useState('')
  const [bonusEntries, setBonusEntries] = useState([])
  const [currentLocation, setCurrentLocation] = useState('')
  const [preferredLocation1, setPreferredLocation1] = useState('')
  const [preferredLocation2, setPreferredLocation2] = useState('')
  const [workTypePreference, setWorkTypePreference] = useState('Work from Home')
  const [showEducationDetails, setShowEducationDetails] = useState(false)
  const [currentEducation, setCurrentEducation] = useState({
    degree: '', specialization: '', institute: '', currentlyStudying: false, startDate: '', endDate: '', grade: '', file: null, fileError: ''
  })
  const [educationHistory, setEducationHistory] = useState([])
  const [showSkillSets, setShowSkillSets] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState([])
  const [skillMessage, setSkillMessage] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeMessage, setResumeMessage] = useState('')
  const [isAutofilling, setIsAutofilling] = useState(false)
  const [autofillSteps, setAutofillSteps] = useState(resumeStepsTemplate)
  const [autofillProgress, setAutofillProgress] = useState(0)
  const [autofillSummary, setAutofillSummary] = useState(null)
  const [autofillToast, setAutofillToast] = useState('')
  const [, setOcrProgress] = useState(0)
  const [fieldConfidence, setFieldConfidence] = useState({})
  const [autofillFilledFields, setAutofillFilledFields] = useState([])
  const [submitting, setSubmitting] = useState(false)

  function generateUniqueId(existingApplications) {
    const count = Array.isArray(existingApplications) ? existingApplications.length + 1 : 1
    return String(11000 + count)
  }

  const allowedEducationFileTypes = [
    'application/pdf', 'image/jpeg', 'image/png', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  const allowedSalarySlipTypes = [
    ...allowedEducationFileTypes,
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  const allowedBonusFileTypes = [...allowedEducationFileTypes]

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} MB`.replace('.0', '')
    return `${(kb / 1024).toFixed(1)} GB`
  }

  function validateFile(file, allowedTypes, allowedExtensions) {
    if (!file) return ''
    if (file.size > 5 * 1024 * 1024) return 'File size exceeds 5MB. Please upload a smaller file.'
    if (allowedTypes.includes(file.type)) return ''
    const extension = file.name.split('.').pop().toLowerCase()
    if (allowedExtensions.includes(extension)) return ''
    return `Only ${allowedExtensions.join(', ').toUpperCase()} formats are allowed.`
  }

  function handleFile(e) {
    const f = e.target.files[0]
    setResumeFile(f || null)
    setResumeMessage('')
  }

  const validateEducationFile = file => validateFile(file, allowedEducationFileTypes, ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'])
  const validateSalarySlipFile = file => validateFile(file, allowedSalarySlipTypes, ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'])
  const validateBonusFile = file => validateFile(file, allowedBonusFileTypes, ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'])

  function handleSalarySlipFiles(fileList) {
    const files = Array.from(fileList)
    const nextFiles = [...salarySlipFiles]
    if (nextFiles.length + files.length > 3) {
      setSalarySlipError('You can upload a maximum of 3 salary slips only.')
      return
    }
    let invalidFound = false
    files.forEach(file => {
      const fileError = validateSalarySlipFile(file)
      if (fileError) {
        invalidFound = true
        setSalarySlipError(fileError)
        return
      }
      nextFiles.push(file)
    })
    if (!invalidFound) {
      setSalarySlipFiles(nextFiles)
      setSalarySlipError('')
    }
  }

  const handleSalarySlipChange = e => handleSalarySlipFiles(e.target.files)
  function handleSalaryDragOver(e) { e.preventDefault(); e.stopPropagation(); setIsSalaryDragActive(true) }
  function handleSalaryDragLeave() { setIsSalaryDragActive(false) }
  function handleSalaryDrop(e) { e.preventDefault(); e.stopPropagation(); setIsSalaryDragActive(false); handleSalarySlipFiles(e.dataTransfer.files) }
  function removeSalarySlipFile(index) { setSalarySlipFiles(prev => prev.filter((_, idx) => idx !== index)); setSalarySlipError('') }

  function createBonusEntry() {
    return { id: Date.now() + Math.random(), type: '', amount: '', file: null, fileError: '' }
  }
  function handleBonusEntryFile(index, e) {
    const file = e.target.files[0] || null
    const fileError = validateBonusFile(file)
    setBonusEntries(prev => prev.map((entry, idx) => (idx !== index ? entry : { ...entry, file, fileError })))
  }
  function handleBonusCountChange(value) {
    const count = value === '5+' ? 5 : Number(value)
    setBonusCount(value)
    setBonusEntries(prev => {
      const nextEntries = [...prev]
      while (nextEntries.length < count) nextEntries.push(createBonusEntry())
      if (nextEntries.length > count) nextEntries.length = count
      return nextEntries
    })
  }
  function updateBonusEntry(index, key, value) {
    setBonusEntries(prev => prev.map((entry, idx) => (idx !== index ? entry : { ...entry, [key]: value })))
  }
  function removeBonusEntry(index) {
    setBonusEntries(prev => {
      const nextEntries = prev.filter((_, idx) => idx !== index)
      if (nextEntries.length === 0) setBonusCount('')
      else if (nextEntries.length >= 5) setBonusCount('5+')
      else setBonusCount(String(nextEntries.length))
      return nextEntries
    })
  }

  function handleCurrentEducationChange(key, value) {
    setCurrentEducation(prev => ({ ...prev, [key]: value }))
  }
  function handleCurrentEducationFile(e) {
    const file = e.target.files[0] || null
    const fileError = validateEducationFile(file)
    setCurrentEducation(prev => ({ ...prev, file, fileError }))
  }
  function addEducationEntry() {
    setEducationHistory(prev => [...prev, { id: Date.now() + Math.random(), degree: '', specialization: '', institute: '', currentlyStudying: false, startDate: '', endDate: '', grade: '', file: null, fileError: '' }])
  }
  function updateEducationEntry(index, key, value) {
    setEducationHistory(prev => prev.map((entry, idx) => (idx !== index ? entry : { ...entry, [key]: value })))
  }
  function handleEducationEntryFile(index, e) {
    const file = e.target.files[0] || null
    const fileError = validateEducationFile(file)
    setEducationHistory(prev => prev.map((entry, idx) => (idx !== index ? entry : { ...entry, file, fileError })))
  }
  function removeEducationEntry(index) {
    setEducationHistory(prev => prev.filter((_, idx) => idx !== index))
  }

  function addSkill(value) {
    const trimmed = value.trim()
    if (!trimmed) return
    if (skills.length >= 15) { setSkillMessage('Maximum 15 skills added.'); return }
    if (skills.includes(trimmed)) { setSkillMessage('This skill is already added.'); return }
    setSkills(prev => [...prev, trimmed])
    setSkillInput('')
    setSkillMessage('')
  }
  function handleSkillKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addSkill(skillInput.replace(/,+$/, ''))
    }
  }
  function removeSkill(index) { setSkills(prev => prev.filter((_, idx) => idx !== index)); setSkillMessage('') }
  function addSuggestedSkill(skill) {
    if (skills.length >= 15 || skills.includes(skill)) return
    setSkills(prev => [...prev, skill])
    setSkillMessage('')
  }

  async function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result)
      reader.onerror = () => rej(new Error('file read error'))
      reader.readAsDataURL(file)
    })
  }
  async function readFileAsText(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result)
      reader.onerror = () => rej(new Error('file read error'))
      reader.readAsText(file)
    })
  }
  async function readFileAsArrayBuffer(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result)
      reader.onerror = () => rej(new Error('file read error'))
      reader.readAsArrayBuffer(file)
    })
  }

  function normalizeText(text) {
    return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ').trim()
  }

  function splitResumeSections(fullText) {
    const lines = normalizeText(fullText).split('\n').map(line => line.trim()).filter(Boolean)
    const sections = { general: [] }
    let current = 'general'
    lines.forEach(line => {
      const low = line.toLowerCase()
      const sectionKey = Object.keys(sectionKeywords).find(key => sectionKeywords[key].some(keyword => low.includes(keyword)))
      if (sectionKey) {
        current = sectionKey
        if (!sections[current]) sections[current] = []
        return
      }
      sections[current].push(line)
    })
    return Object.fromEntries(Object.entries(sections).map(([key, lines]) => [key, lines.join('\n')]))
  }

  function extractName(fullText) {
    const lines = normalizeText(fullText).split('\n').map(line => line.trim()).filter(Boolean).slice(0, 6)
    const nameLine = lines.find(line => {
      if (/\d/.test(line)) return false
      const wordCount = line.split(/\s+/).length
      return wordCount >= 2 && wordCount <= 4 && /^[A-Za-z .,'-]+$/.test(line)
    })
    if (!nameLine) return null
    const words = nameLine.split(/\s+/)
    return { firstName: words[0], lastName: words.length > 1 ? words.slice(-1)[0] : '', confidence: 'high' }
  }

  function extractEmails(fullText) {
    return fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi) || []
  }
  function extractPhones(fullText) {
    const indian = fullText.match(/(\+91|0)?[6-9]\d{9}/g) || []
    const international = fullText.match(/(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || []
    return Array.from(new Set([...indian, ...international].map(phone => phone.replace(/\s+/g, ' ').trim())))
  }
  function extractLocation(fullText) {
    const labelMatch = fullText.match(/(?:Location|Address|City)[:\-]\s*(.+)/i)
    if (labelMatch) return { location: labelMatch[1].split(/,|\||;/)[0].trim(), confidence: 'high' }
    const foundCity = indianCities.find(city => new RegExp(`\\b${city}\\b`, 'i').test(fullText))
    if (foundCity) return { location: foundCity, confidence: 'medium' }
    return { location: '', confidence: 'low' }
  }
  function extractCurrentPosition(sectionText, fullText) {
    const searchText = sectionText || fullText
    const found = industryTitles.find(title => new RegExp(`\\b${title}\\b`, 'i').test(searchText))
    if (found) return { currentPosition: found, confidence: 'medium' }
    return { currentPosition: '', confidence: 'low' }
  }
  function extractExperienceYears(fullText) {
    const match = fullText.match(/(\d+(?:\.\d*)?)\+?\s*years?\s*(?:of)?\s*experience/i)
    if (match) return { experienceYears: match[1], confidence: 'high' }
    return { experienceYears: '', confidence: 'low' }
  }
  function extractExperienceDates(fullText) {
    const monthNames = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
    const datePattern = new RegExp(`(${monthNames}\\s*\\d{4}|\\d{4})\\s*(?:[-–to]+)\\s*(${monthNames}\\s*\\d{4}|\\d{4}|Present|Now)`, 'i')
    const match = fullText.match(datePattern)
    if (match) return { startDate: match[1], endDate: match[2], confidence: 'high' }
    return { startDate: '', endDate: '', confidence: 'low' }
  }
  function extractCompanyName(fullText) {
    const atMatch = fullText.match(/\bat\s+([A-Z][A-Za-z0-9 &\-.]{2,})/i)
    if (atMatch) return { companyName: atMatch[1].trim(), confidence: 'medium' }
    const atSymbolMatch = fullText.match(/@\s*([A-Z][A-Za-z0-9 &\-.]{2,})/i)
    if (atSymbolMatch) return { companyName: atSymbolMatch[1].trim(), confidence: 'medium' }
    return { companyName: '', confidence: 'low' }
  }
  function extractEducation(fullText) {
    const degree = degreeList.find(deg => new RegExp(deg.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i').test(fullText))
    const yearMatch = fullText.match(/(19|20)\d{2}/g)
    const instituteMatch = fullText.match(/(?:University|College|Institute|School)[:\-]?\s*([A-Za-z0-9 &,.'-]+)/i)
    return {
      degree: degree || '',
      institute: instituteMatch ? instituteMatch[1].trim() : '',
      graduationYear: yearMatch ? yearMatch[yearMatch.length - 1] : '',
      confidence: degree ? 'medium' : 'low'
    }
  }
  function extractSkills(fullText) {
    const found = skillDictionary.filter(skill => new RegExp(`\\b${skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(fullText)).slice(0, 15)
    return { skills: found, confidence: found.length ? 'high' : 'low' }
  }
  function extractSalary(fullText) {
    const salaryMatch = fullText.match(/(\d+\.?\d*)\s*(lpa|lakh|lac|lakhs)/i)
    if (salaryMatch) return { lastSalary: `${salaryMatch[1]} ${salaryMatch[2]}`.trim(), confidence: 'high' }
    const ctcMatch = fullText.match(/(?:ctc|salary)[:\-]?\s*(\d+\.?\d*)/i)
    if (ctcMatch) return { lastSalary: ctcMatch[1], confidence: 'medium' }
    return { lastSalary: '', confidence: 'low' }
  }

  function confidenceColor(field) {
    const confidence = fieldConfidence[field]
    if (confidence === 'high') return 'success'
    if (confidence === 'medium') return 'warning'
    if (confidence === 'low') return 'info'
    return 'primary'
  }
  function renderConfidenceAdornment(field) {
    const confidence = fieldConfidence[field]
    if (!confidence) return null
    const map = {
      high: { icon: <CheckCircleRoundedIcon color="success" fontSize="small" />, title: 'High confidence' },
      medium: { icon: <WarningAmberRoundedIcon color="warning" fontSize="small" />, title: 'Please verify this field' },
      low: { icon: <InfoRoundedIcon color="info" fontSize="small" />, title: 'Could not detect — please fill manually' }
    }
    const entry = map[confidence]
    if (!entry) return null
    return (
      <InputAdornment position="end">
        <Tooltip title={entry.title}>{entry.icon}</Tooltip>
      </InputAdornment>
    )
  }

  async function extractTextFromPdf(file) {
    const buffer = await readFileAsArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    let text = ''
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum)
      const content = await page.getTextContent()
      const pageText = content.items.map(item => item.str).join(' ')
      text += pageText + '\n\n'
    }
    return normalizeText(text)
  }
  async function extractTextFromDocx(file) {
    const buffer = await readFileAsArrayBuffer(file)
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return normalizeText(result.value || '')
  }
  async function extractTextFromImage(file) {
    const worker = await Tesseract.createWorker({
      logger: ({ status, progress }) => {
        if (status === 'recognizing text') {
          setResumeMessage(`Scanning resume... ${Math.round(progress * 100)}%`)
          setOcrProgress(Math.round(progress * 100))
        }
      }
    })
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    const { data } = await worker.recognize(file)
    await worker.terminate()
    return normalizeText(data.text || '')
  }

  function findCountryByPhone(phoneValue) {
    const digits = phoneValue.replace(/[^0-9]/g, '')
    if (!digits) return null
    const normalized = digits.startsWith('0') ? digits.slice(1) : digits
    const matchingCountry = countryOptions.find(opt => normalized.startsWith(opt.prefix) || digits.startsWith(opt.prefix))
    return matchingCountry ? matchingCountry.value : null
  }
  const sanitizeDigits = text => text.replace(/\D/g, '')
  function handlePhoneInput(value, setter, setError, countrySetter) {
    const digits = sanitizeDigits(value)
    const hasInvalid = digits !== value
    setError(hasInvalid ? 'Phone number must contain digits only' : '')
    setter(digits)
    if (countrySetter) {
      const selected = findCountryByPhone(digits)
      if (selected) countrySetter(selected)
    }
  }

  function calculateTotalExperience(start, end, currentlyWorkingFlag) {
    if (!start) return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    const startDateObj = new Date(start)
    if (Number.isNaN(startDateObj.getTime())) return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    if (!currentlyWorkingFlag && !end) return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    const endDateObj = currentlyWorkingFlag ? new Date() : new Date(end)
    if (Number.isNaN(endDateObj.getTime()) || endDateObj < startDateObj) return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    let years = endDateObj.getFullYear() - startDateObj.getFullYear()
    let months = endDateObj.getMonth() - startDateObj.getMonth()
    const dayDelta = endDateObj.getDate() - startDateObj.getDate()
    if (dayDelta < 0) months -= 1
    if (months < 0) { years -= 1; months += 12 }
    if (years < 0) return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    return { valid: true, years, months, text: `${years} Years ${months} Months` }
  }

  useEffect(() => {
    const result = calculateTotalExperience(startDate, endDate, currentlyWorking)
    if (result.valid) setExperienceYears(String(result.years))
    else if (experienceYears) setExperienceYears('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, currentlyWorking])

  const showExperienceBadge = Boolean(startDate && (endDate || currentlyWorking))

  function handleDigitKeyPress(event) {
    if (!/^[0-9]$/.test(event.key)) event.preventDefault()
  }

  function buildFieldConfidence(values) {
    const confidence = {}
    Object.entries(values).forEach(([field, meta]) => {
      if (!meta || !meta.value) confidence[field] = 'low'
      else if (meta.confidence === 'high') confidence[field] = 'high'
      else if (meta.confidence === 'medium') confidence[field] = 'medium'
      else confidence[field] = 'low'
    })
    return confidence
  }

  async function extractTextForResume(file) {
    const extension = file.name.split('.').pop().toLowerCase()
    if (extension === 'pdf') return await extractTextFromPdf(file)
    if (extension === 'docx') return await extractTextFromDocx(file)
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) return await extractTextFromImage(file)
    if (file.type === 'text/plain' || extension === 'txt') return normalizeText(await readFileAsText(file))
    throw new Error('Unsupported resume format for offline parsing')
  }

  async function handleAutofill() {
    if (!resumeFile) {
      setResumeMessage('Upload a resume first to autofill the form.')
      return
    }
    setIsAutofilling(true)
    setAutofillSteps(resumeStepsTemplate)
    setAutofillProgress(0)
    setAutofillSummary(null)
    setAutofillToast('')
    setFieldConfidence({})
    setAutofillFilledFields([])
    setOcrProgress(0)
    setResumeMessage('Reading your resume... please wait')

    const updateStep = (key, status) => {
      setAutofillSteps(prev => {
        const next = prev.map(step => (step.key === key ? { ...step, status } : step))
        const doneCount = next.filter(step => step.status === 'done').length
        setAutofillProgress(Math.round((doneCount / next.length) * 100))
        return next
      })
    }

    try {
      updateStep('read', 'running')
      const fullText = await extractTextForResume(resumeFile)
      updateStep('read', 'done')

      updateStep('detect', 'running')
      const sections = splitResumeSections(fullText)
      updateStep('detect', 'done')

      updateStep('personal', 'running')
      const nameInfo = extractName(fullText)
      const emails = extractEmails(fullText)
      const phones = extractPhones(fullText)
      const locationInfo = extractLocation(fullText)
      updateStep('personal', 'done')

      updateStep('experience', 'running')
      const experienceText = sections.experience || sections.general || ''
      const positionInfo = extractCurrentPosition(experienceText, fullText)
      const yearsInfo = extractExperienceYears(fullText)
      const datesInfo = extractExperienceDates(experienceText)
      const companyInfo = extractCompanyName(experienceText)
      updateStep('experience', 'done')

      updateStep('education', 'running')
      const educationInfo = extractEducation(sections.education || fullText)
      updateStep('education', 'done')

      updateStep('skills', 'running')
      const skillsInfo = extractSkills(sections.skills || fullText)
      const salaryInfo = extractSalary(fullText)
      updateStep('skills', 'done')

      updateStep('fill', 'running')

      const parsedValues = {
        firstName: { value: nameInfo?.firstName || '', confidence: nameInfo?.confidence || 'low' },
        lastName: { value: nameInfo?.lastName || '', confidence: nameInfo?.confidence || 'low' },
        email: { value: emails[0] || '', confidence: emails.length ? 'high' : 'low' },
        phone: { value: phones[0] || '', confidence: phones.length ? 'high' : 'low' },
        altPhone: { value: phones[1] || '', confidence: phones.length > 1 ? 'medium' : 'low' },
        currentLocation: { value: locationInfo.location || '', confidence: locationInfo.confidence },
        positionApplied: { value: positionInfo.currentPosition || '', confidence: positionInfo.confidence },
        currentPosition: { value: positionInfo.currentPosition || '', confidence: positionInfo.confidence },
        experienceYears: { value: yearsInfo.experienceYears || '', confidence: yearsInfo.confidence },
        startDate: { value: datesInfo.startDate || '', confidence: datesInfo.confidence },
        endDate: { value: datesInfo.endDate || '', confidence: datesInfo.confidence },
        companyName: { value: companyInfo.companyName || '', confidence: companyInfo.confidence },
        lastSalary: { value: salaryInfo.lastSalary || '', confidence: salaryInfo.confidence },
        skills: { value: skillsInfo.skills, confidence: skillsInfo.confidence }
      }

      const confidence = buildFieldConfidence(parsedValues)
      setFieldConfidence(confidence)

      if (parsedValues.firstName.value) setFirstName(parsedValues.firstName.value)
      if (parsedValues.lastName.value) setLastName(parsedValues.lastName.value)
      if (parsedValues.email.value) setEmail(parsedValues.email.value)
      if (parsedValues.phone.value) {
        setPhone(parsedValues.phone.value)
        const autoCountry = findCountryByPhone(parsedValues.phone.value)
        if (autoCountry) setCountryCode(autoCountry)
      }
      if (parsedValues.altPhone.value) {
        setAltPhone(parsedValues.altPhone.value)
        const altCountry = findCountryByPhone(parsedValues.altPhone.value)
        if (altCountry) setAltCountryCode(altCountry)
      }
      if (parsedValues.positionApplied.value) setPositionApplied(parsedValues.positionApplied.value)
      if (parsedValues.currentPosition.value) setCurrentPosition(parsedValues.currentPosition.value)
      if (parsedValues.experienceYears.value) setExperienceYears(parsedValues.experienceYears.value)
      if (parsedValues.startDate.value) setStartDate(parsedValues.startDate.value)
      if (parsedValues.endDate.value) setEndDate(parsedValues.endDate.value)
      if (parsedValues.companyName.value) setCompanyName(parsedValues.companyName.value)
      if (parsedValues.lastSalary.value) setLastSalary(parsedValues.lastSalary.value)
      if (parsedValues.currentLocation.value) setCurrentLocation(parsedValues.currentLocation.value)
      if (parsedValues.skills.value.length) setSkills(parsedValues.skills.value)

      if (educationInfo.degree || educationInfo.institute || educationInfo.graduationYear) {
        setShowEducationDetails(true)
        setCurrentEducation(prev => ({
          ...prev,
          degree: educationInfo.degree || prev.degree,
          institute: educationInfo.institute || prev.institute,
          grade: educationInfo.graduationYear || prev.grade
        }))
      }

      const filledCount = Object.values(parsedValues).filter(item => item.value && item.value.length).length
      const verifyCount = Object.values(confidence).filter(c => c === 'medium').length
      const missingCount = Object.values(confidence).filter(c => c === 'low').length

      setAutofillSummary({ filledCount, verifyCount, missingCount })
      setAutofillFilledFields(Object.keys(parsedValues).filter(key => parsedValues[key].value && parsedValues[key].value.length))
      updateStep('fill', 'done')

      setResumeMessage('Resume autofill complete. Please review highlighted fields.')
      setAutofillToast('Resume autofill complete! Please review highlighted fields.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setIsAutofilling(false)
    } catch (error) {
      updateStep('fill', 'done')
      setResumeMessage(error.message || 'Could not read the resume. Please try another file.')
      setIsAutofilling(false)
    }
  }

  function clearAutofill() {
    if (autofillFilledFields.includes('firstName')) setFirstName('')
    if (autofillFilledFields.includes('lastName')) setLastName('')
    if (autofillFilledFields.includes('email')) setEmail('')
    if (autofillFilledFields.includes('phone')) setPhone('')
    if (autofillFilledFields.includes('altPhone')) setAltPhone('')
    if (autofillFilledFields.includes('positionApplied')) setPositionApplied('')
    if (autofillFilledFields.includes('currentPosition')) setCurrentPosition('')
    if (autofillFilledFields.includes('companyName')) setCompanyName('')
    if (autofillFilledFields.includes('startDate')) setStartDate('')
    if (autofillFilledFields.includes('endDate')) setEndDate('')
    if (autofillFilledFields.includes('experienceYears')) setExperienceYears('')
    if (autofillFilledFields.includes('lastSalary')) setLastSalary('')
    if (autofillFilledFields.includes('currentLocation')) setCurrentLocation('')
    if (autofillFilledFields.includes('skills')) setSkills([])
    setFieldConfidence({})
    setAutofillSummary(null)
    setAutofillToast('')
    setAutofillSteps(resumeStepsTemplate)
    setAutofillProgress(0)
    setIsAutofilling(false)
    setResumeMessage('Autofill cleared. Please fill these fields manually.')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!firstName || !lastName || !phone || !email || !positionApplied) {
      alert('Please fill required fields (first name, last name, phone, email, position).')
      return
    }
    setSubmitting(true)
    let resumeData = null
    if (resumeFile) resumeData = await readFileAsDataURL(resumeFile)

    const existing = JSON.parse(localStorage.getItem('kady_applications') || '[]')
    const uniqueId = generateUniqueId(existing)

    const application = {
      id: Date.now(),
      uniqueId,
      applicationId: uniqueId,
      status: 'Applied',
      firstName, lastName, countryCode, phone, email, altEmail, altPhone, altCountryCode,
      positionApplied, isFresher, currentPosition, companyName, startDate, endDate, currentlyWorking,
      relevantStartDate: '', relevantEndDate: '', currentlyWorkingRelevant: false,
      relevantExperienceText, experienceYears, lastSalary, expectedSalary, lastCompany,
      currentLocation, preferredLocation1, preferredLocation2, workTypePreference,
      salarySlips: salarySlipFiles.map(file => ({ name: file.name, size: file.size, type: file.type })),
      bonusDetails: showBonusDetails ? {
        count: bonusCount,
        entries: bonusEntries.map(entry => ({ type: entry.type, amount: entry.amount, fileName: entry.file ? entry.file.name : null }))
      } : null,
      educationDetails: showEducationDetails ? {
        degree: currentEducation.degree,
        specialization: currentEducation.specialization,
        institute: currentEducation.institute,
        currentlyStudying: currentEducation.currentlyStudying,
        startDate: currentEducation.startDate,
        endDate: currentEducation.endDate,
        grade: currentEducation.grade,
        fileName: currentEducation.file ? currentEducation.file.name : null
      } : null,
      educationHistory: educationHistory.map(entry => ({
        degree: entry.degree, specialization: entry.specialization, institute: entry.institute,
        currentlyStudying: entry.currentlyStudying, startDate: entry.startDate, endDate: entry.endDate,
        grade: entry.grade, fileName: entry.file ? entry.file.name : null
      })),
      skills,
      resumeName: resumeFile ? resumeFile.name : null,
      resumeData,
      createdAt: new Date().toISOString()
    }

    let savedId = uniqueId
    try {
      const result = await dispatch(submitApplication(application)).unwrap()
      savedId = result.uniqueId
    } catch {
      // submit thunk already persists to localStorage on failure
    }

    setSubmitting(false)
    resetForm()
    if (onSubmitSuccess) {
      setTimeout(() => onSubmitSuccess({ applicationId: savedId, submittedAt: application.createdAt }), 500)
    }
  }

  function resetForm() {
    setFirstName('')
    setLastName('')
    setCountryCode('IN')
    setPhone('')
    setPhoneError('')
    setEmail('')
    setAltEmail('')
    setAltCountryCode('IN')
    setAltPhone('')
    setAltPhoneError('')
    setPositionApplied('')
    setIsFresher(false)
    setCurrentPosition('')
    setCompanyName('')
    setStartDate('')
    setEndDate('')
    setCurrentlyWorking(false)
    setRelevantExperienceText('')
    setExperienceYears('')
    setTotalJobExperience('')
    setLastSalary('')
    setExpectedSalary('')
    setLastCompany('')
    setCurrentLocation('')
    setPreferredLocation1('')
    setPreferredLocation2('')
    setWorkTypePreference('Work from Home')
    setShowEducationDetails(false)
    setCurrentEducation({ degree: '', specialization: '', institute: '', currentlyStudying: false, startDate: '', endDate: '', grade: '', file: null, fileError: '' })
    setEducationHistory([])
    setShowSkillSets(false)
    setSkillInput('')
    setSkills([])
    setSkillMessage('')
    setSalarySlipFiles([])
    setSalarySlipError('')
    setIsSalaryDragActive(false)
    setShowBonusDetails(false)
    setBonusCount('')
    setBonusEntries([])
    setResumeFile(null)
    setFieldConfidence({})
    setAutofillSummary(null)
    setAutofillFilledFields([])
    setAutofillSteps(resumeStepsTemplate)
    setAutofillProgress(0)
  }

  const experienceCalc = calculateTotalExperience(startDate, endDate, currentlyWorking)

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4">Tell us about yourself</Typography>
        <Typography color="text.secondary">Fill your details and we'll get back to you soon.</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Section 1: Personal Details */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.06)' }}>
            <SectionHeader number="01" title="Personal Details" subtitle="Share your basic information first." />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name" required value={firstName} onChange={e => setFirstName(e.target.value)}
                  color={confidenceColor('firstName')} focused={Boolean(fieldConfidence.firstName)}
                  InputProps={{ endAdornment: renderConfidenceAdornment('firstName') }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Name" required value={lastName} onChange={e => setLastName(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Primary Email ID" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  color={confidenceColor('email')} focused={Boolean(fieldConfidence.email)}
                  InputProps={{ endAdornment: renderConfidenceAdornment('email') }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Alternative Email ID (optional)" type="email" value={altEmail} onChange={e => setAltEmail(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1}>
                  <TextField select value={countryCode} onChange={e => setCountryCode(e.target.value)} sx={{ width: 110 }}>
                    {countryOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.flag} +{option.prefix}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Phone Number" required value={phone}
                    onChange={e => handlePhoneInput(e.target.value, setPhone, setPhoneError, setCountryCode)}
                    onKeyPress={handleDigitKeyPress}
                    inputProps={{ inputMode: 'numeric', autoComplete: 'tel' }}
                    error={Boolean(phoneError)} helperText={phoneError}
                    color={confidenceColor('phone')} focused={Boolean(fieldConfidence.phone)}
                    InputProps={{ endAdornment: renderConfidenceAdornment('phone') }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1}>
                  <TextField select value={altCountryCode} onChange={e => setAltCountryCode(e.target.value)} sx={{ width: 110 }}>
                    {countryOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.flag} +{option.prefix}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Alternative Phone" value={altPhone}
                    onChange={e => handlePhoneInput(e.target.value, setAltPhone, setAltPhoneError, setAltCountryCode)}
                    onKeyPress={handleDigitKeyPress}
                    inputProps={{ inputMode: 'numeric', autoComplete: 'tel' }}
                    error={Boolean(altPhoneError)} helperText={altPhoneError}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Position & Experience */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.06)' }}>
            <SectionHeader number="02" title="Position & Experience" subtitle="Tell us what role you're applying for and your expertise." />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo options={positionOptions} value={positionApplied}
                  onChange={(_e, value) => setPositionApplied(value || '')}
                  onInputChange={(_e, value) => setPositionApplied(value)}
                  renderInput={params => (
                    <TextField
                      {...params} label="Position Applied For" required
                      color={confidenceColor('positionApplied')} focused={Boolean(fieldConfidence.positionApplied)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Years of Job Experience" type="number" placeholder="e.g. 3 or 3.5"
                  inputProps={{ step: '0.1', min: 0, max: 50 }}
                  value={totalJobExperience} onChange={e => setTotalJobExperience(e.target.value)} disabled={isFresher}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={isFresher} onChange={e => {
                    const checked = e.target.checked
                    setIsFresher(checked)
                    if (checked) {
                      setShowBonusDetails(false)
                      setBonusCount('')
                      setBonusEntries([])
                      setSalarySlipFiles([])
                      setSalarySlipError('')
                      setTotalJobExperience('0')
                    }
                  }} />}
                  label="I am a Fresher"
                />
                {isFresher && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Experience fields are disabled for freshers.</Typography>}
              </Grid>

              <Grid item xs={12}><Divider><Chip label="Last Company Details" size="small" /></Divider></Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last or current position" value={currentPosition} onChange={e => setCurrentPosition(e.target.value)} disabled={isFresher} helperText="Your last or current job title or designation" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last company name" value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={isFresher} helperText="Name of your last or current company" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={startDate} onChange={e => setStartDate(e.target.value)} disabled={isFresher} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={e => setEndDate(e.target.value)} disabled={currentlyWorking || isFresher} />
                <FormControlLabel
                  sx={{ mt: 0.5 }}
                  control={<Checkbox checked={currentlyWorking} onChange={e => setCurrentlyWorking(e.target.checked)} disabled={isFresher} />}
                  label="Currently Working Here"
                />
              </Grid>
              {showExperienceBadge && (
                <Grid item xs={12}>
                  <Alert severity={experienceCalc.valid ? 'info' : 'warning'} icon={false}>
                    Last Company Experience: <strong>{experienceCalc.text}</strong>
                  </Alert>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField label="Relevant Experience" placeholder="e.g. 2 Years 3 Months" value={relevantExperienceText} onChange={e => setRelevantExperienceText(e.target.value)} disabled={isFresher} helperText="Optional" />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Salary & Company */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.06)' }}>
            <SectionHeader number="03" title="Salary & Company" subtitle="Add your recent compensation and employer details." />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Last Company Name" value={lastCompany} onChange={e => setLastCompany(e.target.value)} disabled={isFresher} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Drawn Salary (in LPA)" value={lastSalary} onChange={e => setLastSalary(e.target.value)} disabled={isFresher}
                  color={confidenceColor('lastSalary')} focused={Boolean(fieldConfidence.lastSalary)}
                  InputProps={{ endAdornment: renderConfidenceAdornment('lastSalary') }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Expected Salary" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} />
              </Grid>

              {!isFresher && (
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    onDragOver={handleSalaryDragOver} onDragLeave={handleSalaryDragLeave} onDrop={handleSalaryDrop}
                    sx={{
                      p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2, cursor: 'pointer',
                      borderColor: isSalaryDragActive ? 'primary.main' : 'rgba(15,23,42,0.2)',
                      bgcolor: isSalaryDragActive ? 'rgba(108,99,255,0.06)' : 'transparent'
                    }}
                    component="label"
                  >
                    <input hidden id="salary-slips-input" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={handleSalarySlipChange} />
                    <CloudUploadRoundedIcon color="primary" />
                    <Typography variant="body2">Drag &amp; drop or click to upload salary slips</Typography>
                    <Typography variant="caption" color="text.secondary">PDF DOC IMG (max 3 files, 5MB each)</Typography>
                  </Paper>
                  {salarySlipError && <Alert severity="error" sx={{ mt: 1 }}>{salarySlipError}</Alert>}
                  {salarySlipFiles.length > 0 && (
                    <List dense>
                      {salarySlipFiles.map((file, index) => (
                        <ListItem
                          key={`${file.name}-${file.size}-${index}`}
                          secondaryAction={
                            <IconButton edge="end" size="small" onClick={() => removeSalarySlipFile(index)}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={file.name} secondary={formatFileSize(file.size)} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
              )}
              {isFresher && (
                <Grid item xs={12}><Typography variant="body2" color="text.secondary">Salary slip and bonus fields are not applicable for freshers.</Typography></Grid>
              )}

              {!isFresher && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox checked={showBonusDetails} onChange={e => {
                      const checked = e.target.checked
                      setShowBonusDetails(checked)
                      if (!checked) { setBonusCount(''); setBonusEntries([]) }
                    }} />}
                    label="Did you receive any bonus from your company? (optional)"
                  />
                </Grid>
              )}

              {showBonusDetails && !isFresher && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <TextField select label="Number of Bonuses Received" value={bonusCount} onChange={e => handleBonusCountChange(e.target.value)} sx={{ maxWidth: 280 }}>
                      <MenuItem value="">Select…</MenuItem>
                      {['1', '2', '3', '4', '5+'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                    </TextField>
                    {bonusEntries.map((entry, index) => (
                      <Box key={entry.id} sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">Bonus {index + 1}</Typography>
                          <Button size="small" color="error" onClick={() => removeBonusEntry(index)}>Remove</Button>
                        </Stack>
                        <Grid container spacing={2} sx={{ mt: 0 }}>
                          <Grid item xs={12} sm={6}>
                            <TextField select label="Bonus Type" value={entry.type} onChange={e => updateBonusEntry(index, 'type', e.target.value)}>
                              <MenuItem value="">Select…</MenuItem>
                              {['Performance Bonus', 'Festive Bonus', 'Joining Bonus', 'Retention Bonus', 'Project Bonus', 'Other'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField label="Bonus Amount" type="number" value={entry.amount} onChange={e => updateBonusEntry(index, 'amount', e.target.value)} />
                          </Grid>
                          <Grid item xs={12}>
                            <Button component="label" variant="outlined" size="small" startIcon={<CloudUploadRoundedIcon />}>
                              {entry.file ? entry.file.name : 'Upload Bonus Slip (optional)'}
                              <input hidden type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => handleBonusEntryFile(index, e)} />
                            </Button>
                            {entry.fileError && <Alert severity="error" sx={{ mt: 1 }}>{entry.fileError}</Alert>}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>All bonus details and uploads are optional.</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Section 4: Location Preferences */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.06)' }}>
            <SectionHeader number="04" title="Location Preferences" subtitle="Tell us your current and preferred work locations." />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Current Location" value={currentLocation} onChange={e => setCurrentLocation(e.target.value)}
                  color={confidenceColor('currentLocation')} focused={Boolean(fieldConfidence.currentLocation)}
                  InputProps={{ endAdornment: renderConfidenceAdornment('currentLocation') }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo options={locationOptions} value={preferredLocation1}
                  onChange={(_e, value) => setPreferredLocation1(value || '')}
                  onInputChange={(_e, value) => setPreferredLocation1(value)}
                  renderInput={params => <TextField {...params} label="Preferred Location 1" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo options={locationOptions} value={preferredLocation2}
                  onChange={(_e, value) => setPreferredLocation2(value || '')}
                  onInputChange={(_e, value) => setPreferredLocation2(value)}
                  renderInput={params => <TextField {...params} label="Preferred Location 2" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Work Type Preference</FormLabel>
                  <RadioGroup row value={workTypePreference} onChange={e => setWorkTypePreference(e.target.value)}>
                    {['Work from Home', 'In Office', 'Hybrid'].map(type => (
                      <FormControlLabel key={type} value={type} control={<Radio />} label={type} />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Section 5: Resume Upload */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.06)' }}>
            <SectionHeader number="05" title="Resume Upload" subtitle="Upload and autofill from your resume file." />
            <Stack spacing={2}>
              <Button component="label" variant="outlined" startIcon={<CloudUploadRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>
                {resumeFile ? resumeFile.name : 'Upload your resume (TXT, DOCX, PDF, IMAGE)'}
                <input hidden id="resume-input" type="file" accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx" onChange={handleFile} />
              </Button>

              {resumeFile && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`${resumeFile.name} · ${formatFileSize(resumeFile.size)}`} onDelete={() => { setResumeFile(null); setResumeMessage('') }} />
                </Stack>
              )}

              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Button variant="contained" startIcon={<AutoFixHighRoundedIcon />} onClick={handleAutofill} disabled={!resumeFile || isAutofilling}>
                  {isAutofilling ? 'Autofilling…' : 'Autofill from Resume'}
                </Button>
                <Button variant="text" onClick={clearAutofill} disabled={!autofillFilledFields.length || isAutofilling}>
                  Clear Autofill
                </Button>
              </Stack>

              {resumeMessage && <Typography variant="body2" color="text.secondary">{resumeMessage}</Typography>}

              {isAutofilling && (
                <Box>
                  <LinearProgress variant="determinate" value={autofillProgress} sx={{ borderRadius: 1, height: 8 }} />
                  <Typography variant="caption" color="text.secondary">{autofillProgress}%</Typography>
                  <List dense>
                    {autofillSteps.map(step => (
                      <ListItem key={step.key} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {step.status === 'done'
                            ? <CheckCircleRoundedIcon color="success" fontSize="small" />
                            : step.status === 'running'
                              ? <HourglassEmptyRoundedIcon color="primary" fontSize="small" />
                              : <RadioButtonUncheckedRoundedIcon color="disabled" fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={step.label} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {autofillSummary && (
                <Alert severity="success">
                  <strong>Autofill Complete!</strong> {autofillSummary.filledCount} fields filled · {autofillSummary.verifyCount} need verification · {autofillSummary.missingCount} not detected.
                </Alert>
              )}
            </Stack>
          </Paper>

          {/* Section 6: Education (optional) */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.06)' }}>
            <FormControlLabel
              control={<Checkbox checked={showEducationDetails} onChange={e => setShowEducationDetails(e.target.checked)} />}
              label="Add Education Details (optional)"
            />
            {showEducationDetails && (
              <Box sx={{ mt: 2 }}>
                <SectionHeader number="06" title="Current Education" subtitle="Share your latest education details." />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      freeSolo options={degreeList} value={currentEducation.degree}
                      onChange={(_e, value) => handleCurrentEducationChange('degree', value || '')}
                      onInputChange={(_e, value) => handleCurrentEducationChange('degree', value)}
                      renderInput={params => <TextField {...params} label="Degree / Qualification" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Field of Study / Specialization" value={currentEducation.specialization} onChange={e => handleCurrentEducationChange('specialization', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="University / Institute Name" value={currentEducation.institute} onChange={e => handleCurrentEducationChange('institute', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox checked={currentEducation.currentlyStudying} onChange={e => handleCurrentEducationChange('currentlyStudying', e.target.checked)} />}
                      label="Currently Studying here"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={currentEducation.startDate} onChange={e => handleCurrentEducationChange('startDate', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} value={currentEducation.endDate} onChange={e => handleCurrentEducationChange('endDate', e.target.value)} disabled={currentEducation.currentlyStudying} helperText={currentEducation.currentlyStudying ? 'Ongoing' : ''} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Grade / Percentage / CGPA (optional)" value={currentEducation.grade} onChange={e => handleCurrentEducationChange('grade', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button component="label" variant="outlined" startIcon={<CloudUploadRoundedIcon />}>
                      {currentEducation.file ? currentEducation.file.name : 'Upload Marksheet / Certificate (optional)'}
                      <input hidden type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleCurrentEducationFile} />
                    </Button>
                    {currentEducation.fileError && <Alert severity="error" sx={{ mt: 1 }}>{currentEducation.fileError}</Alert>}
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }}><Chip label="Education History" size="small" /></Divider>

                {educationHistory.map((entry, index) => (
                  <Paper key={entry.id} variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">Education {index + 1}</Typography>
                      <Button size="small" color="error" onClick={() => removeEducationEntry(index)}>Remove</Button>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          freeSolo options={degreeList} value={entry.degree}
                          onChange={(_e, value) => updateEducationEntry(index, 'degree', value || '')}
                          onInputChange={(_e, value) => updateEducationEntry(index, 'degree', value)}
                          renderInput={params => <TextField {...params} label="Degree / Qualification" />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Field of Study / Specialization" value={entry.specialization} onChange={e => updateEducationEntry(index, 'specialization', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="University / Institute Name" value={entry.institute} onChange={e => updateEducationEntry(index, 'institute', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={<Checkbox checked={entry.currentlyStudying} onChange={e => updateEducationEntry(index, 'currentlyStudying', e.target.checked)} />}
                          label="Currently Studying here"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={entry.startDate} onChange={e => updateEducationEntry(index, 'startDate', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} value={entry.endDate} onChange={e => updateEducationEntry(index, 'endDate', e.target.value)} disabled={entry.currentlyStudying} helperText={entry.currentlyStudying ? 'Ongoing' : ''} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Grade / Percentage / CGPA (optional)" value={entry.grade} onChange={e => updateEducationEntry(index, 'grade', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button component="label" variant="outlined" startIcon={<CloudUploadRoundedIcon />}>
                          {entry.file ? entry.file.name : 'Upload Marksheet / Certificate (optional)'}
                          <input hidden type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => handleEducationEntryFile(index, e)} />
                        </Button>
                        {entry.fileError && <Alert severity="error" sx={{ mt: 1 }}>{entry.fileError}</Alert>}
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Button variant="outlined" onClick={addEducationEntry}>Add Education</Button>
              </Box>
            )}
          </Paper>

          {/* Section 7: Skill Sets (optional) */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.06)' }}>
            <FormControlLabel
              control={<Checkbox checked={showSkillSets} onChange={e => setShowSkillSets(e.target.checked)} />}
              label="Add Skill Sets (optional)"
            />
            {showSkillSets && (
              <Box sx={{ mt: 2 }}>
                <SectionHeader number="07" title="Skill Sets" subtitle="Add your skills as tags for quick review." />
                <TextField
                  label="Type a skill and press Enter" placeholder="e.g. React, Python, Figma"
                  value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} disabled={skills.length >= 15}
                />
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  {skills.map((skill, idx) => (
                    <Chip key={`${skill}-${idx}`} label={skill} onDelete={() => removeSkill(idx)} />
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{skills.length} / 15 skills added</Typography>
                {skillMessage && <Alert severity="warning" sx={{ mt: 1 }}>{skillMessage}</Alert>}

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 0.5 }}>Suggested skills:</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Figma', 'Java', 'CSS', 'AWS', 'Git', 'TypeScript', 'MongoDB'].map(skill => (
                    <Chip
                      key={skill} label={skill} variant="outlined" clickable
                      onClick={() => addSuggestedSkill(skill)}
                      disabled={skills.length >= 15 || skills.includes(skill)}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>

          <Box sx={{ textAlign: 'center', pb: 2 }}>
            <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ px: 6 }}>
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
            </Button>
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={Boolean(autofillToast)}
        autoHideDuration={6000}
        onClose={() => setAutofillToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setAutofillToast('')}>{autofillToast}</Alert>
      </Snackbar>
    </Box>
  )
}
