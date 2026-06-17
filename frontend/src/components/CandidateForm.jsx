import React, { useState, useEffect, useRef } from 'react'
import api from '../api'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'
import Tesseract from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const degreeList = [
  // ── SCHOOL LEVEL ──
  "SSC (10th)", "HSC (12th)", "CBSE 10th", "CBSE 12th",
  "ICSE 10th", "ISC 12th", "State Board 10th", 
  "State Board 12th",

  // ── DIPLOMA ──
  "Diploma in Engineering", "Diploma in Computer Science",
  "Diploma in Information Technology", "Diploma in Electronics",
  "Diploma in Mechanical Engineering", "Diploma in Civil Engineering",
  "Diploma in Electrical Engineering", "Diploma in Architecture",
  "Diploma in Pharmacy", "Diploma in Business Management",
  "Polytechnic Diploma",

  // ── BACHELOR DEGREES ──
  "B.E. (Bachelor of Engineering)",
  "B.Tech (Bachelor of Technology)",
  "B.Sc (Bachelor of Science)",
  "B.Com (Bachelor of Commerce)",
  "B.A. (Bachelor of Arts)",
  "B.B.A (Bachelor of Business Administration)",
  "B.C.A (Bachelor of Computer Applications)",
  "B.Arch (Bachelor of Architecture)",
  "B.Pharm (Bachelor of Pharmacy)",
  "B.Ed (Bachelor of Education)",
  "B.Des (Bachelor of Design)",
  "B.F.Tech (Bachelor of Fashion Technology)",
  "B.H.M (Bachelor of Hotel Management)",
  "B.L.I.Sc (Bachelor of Library Science)",
  "B.P.T (Bachelor of Physiotherapy)",
  "B.S.W (Bachelor of Social Work)",
  "LLB (Bachelor of Laws)",
  "MBBS (Bachelor of Medicine)",
  "BDS (Bachelor of Dental Surgery)",
  "B.V.Sc (Bachelor of Veterinary Science)",

  // ── MASTER DEGREES ──
  "M.E. (Master of Engineering)",
  "M.Tech (Master of Technology)",
  "M.Sc (Master of Science)",
  "M.Com (Master of Commerce)",
  "M.A. (Master of Arts)",
  "M.B.A (Master of Business Administration)",
  "M.C.A (Master of Computer Applications)",
  "M.Arch (Master of Architecture)",
  "M.Pharm (Master of Pharmacy)",
  "M.Ed (Master of Education)",
  "M.Des (Master of Design)",
  "M.S. (Master of Surgery)",
  "M.S.W (Master of Social Work)",
  "LLM (Master of Laws)",
  "M.Phil (Master of Philosophy)",

  // ── POST GRADUATE DIPLOMA ──
  "PGDM (Post Graduate Diploma in Management)",
  "PGDCA (Post Graduate Diploma in Computer Applications)",
  "PG Diploma in Data Science",
  "PG Diploma in Digital Marketing",
  "PG Diploma in HR Management",
  "PG Diploma in Finance",

  // ── DOCTORATE ──
  "Ph.D (Doctor of Philosophy)",
  "D.Sc (Doctor of Science)",
  "D.Litt (Doctor of Literature)",
  "M.D (Doctor of Medicine)",

  // ── PROFESSIONAL & CERTIFICATIONS ──
  "CA (Chartered Accountant)",
  "CMA (Cost Management Accountant)",
  "CS (Company Secretary)",
  "CFA (Chartered Financial Analyst)",
  "CFP (Certified Financial Planner)",
  "ACCA (Association of Chartered Certified Accountants)",
  "CPA (Certified Public Accountant)",

  // ── IT CERTIFICATIONS ──
  "AWS Certified Solutions Architect",
  "Google Cloud Professional",
  "Microsoft Azure Certification",
  "Certified Ethical Hacker (CEH)",
  "CISSP Certification",
  "PMP (Project Management Professional)",
  "Scrum Master Certification",
  "SAP Certification",
  "Oracle Certification",
  "Cisco CCNA / CCNP",
]

const sectionKeywords = {
  personal:    ["contact", "personal", "profile", "about me", "summary"],
  experience:  ["experience", "employment", "work history", "career"],
  education:   ["education", "qualification", "academic", "degree", "university"],
  skills:      ["skills", "technical skills", "competencies", "expertise", "technologies", "tools"],
  projects:    ["projects", "assignments"],
  salary:      ["salary", "ctc", "compensation", "package"]
}

const industryTitles = [
  'Developer', 'Engineer', 'Manager', 'Consultant', 'Analyst', 'Designer', 'HR', 'Lead',
  'Architect', 'Specialist', 'Administrator', 'Coordinator', 'Executive', 'Assistant', 'Director'
]

const skillDictionary = [
  'JavaScript', 'Python', 'React', 'Angular', 'Vue', 'Node.js', 'Java', 'C++', 'C#', 'SQL', 'MongoDB',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'SAP', 'Salesforce', 'Power BI', 'Tableau',
  'Figma', 'Adobe XD', 'Photoshop', 'HR', 'Recruitment', 'Payroll', 'Training',
  'Project Management', 'Agile', 'Scrum'
]

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Noida',
  'Gurgaon', 'Indore', 'Coimbatore', 'Kochi', 'Nagpur', 'Vadodara', 'Bhubaneswar', 'Mysore',
  'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Dehradun', 'Amritsar', 'Ludhiana', 'Jodhpur',
  'Udaipur', 'Faridabad', 'Ghaziabad', 'Madurai', 'Vijayawada', 'Tirupati', 'Warangal',
  'Hubli', 'Thrissur', 'Kozhikode', 'Nashik', 'Aurangabad', 'Kolhapur', 'Rajkot',
  'Gandhinagar', 'Panaji', 'Patna', 'Ranchi', 'Jamshedpur', 'Guwahati', 'Raipur',
  'Siliguri', 'Vizag', 'Chandigarh', 'Surat'
]

const resumeStepsTemplate = [
  { key: 'read', label: '📄 Reading resume file...', status: 'idle' },
  { key: 'detect', label: '🔍 Detecting sections...', status: 'idle' },
  { key: 'personal', label: '👤 Extracting personal details...', status: 'idle' },
  { key: 'experience', label: '💼 Extracting experience...', status: 'idle' },
  { key: 'education', label: '🎓 Extracting education...', status: 'idle' },
  { key: 'skills', label: '⚡ Extracting skills...', status: 'idle' },
  { key: 'fill', label: '✅ Filling form fields...', status: 'idle' }
]

export default function CandidateForm({ onSubmitSuccess }) {
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
  const [relevantStartDate, setRelevantStartDate] = useState('')
  const [relevantEndDate, setRelevantEndDate] = useState('')
  const [currentlyWorkingRelevant, setCurrentlyWorkingRelevant] = useState(false)
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
  const [pref1Suggestions, setPref1Suggestions] = useState([])
  const [pref2Suggestions, setPref2Suggestions] = useState([])
  const [showPref1Suggest, setShowPref1Suggest] = useState(false)
  const [showPref2Suggest, setShowPref2Suggest] = useState(false)
  const pref1Ref = useRef(null)
  const pref2Ref = useRef(null)
  const [pref1Active, setPref1Active] = useState(-1)
  const [pref2Active, setPref2Active] = useState(-1)
  const [workTypePreference, setWorkTypePreference] = useState('Work from Home')
  const [showEducationDetails, setShowEducationDetails] = useState(false)
  const [currentEducation, setCurrentEducation] = useState({
    degree: '',
    specialization: '',
    institute: '',
    currentlyStudying: false,
    startDate: '',
    endDate: '',
    grade: '',
    file: null,
    fileError: ''
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
  const [ocrProgress, setOcrProgress] = useState(0)
  const [fieldConfidence, setFieldConfidence] = useState({})
  const [autofillFilledFields, setAutofillFilledFields] = useState([])
  const [submitting, setSubmitting] = useState(false)
  
  // State for searchable degree fields
  const [currentDegreeInput, setCurrentDegreeInput] = useState('')
  const [currentDegreeSuggestions, setCurrentDegreeSuggestions] = useState([])
  const [showCurrentDegreeSuggest, setShowCurrentDegreeSuggest] = useState(false)
  const [currentDegreeActiveIndex, setCurrentDegreeActiveIndex] = useState(-1)
  const currentDegreeRef = useRef(null)
  
  const [educationHistoryDegreeSuggestions, setEducationHistoryDegreeSuggestions] = useState({})
  const [showHistoryDegreeSuggest, setShowHistoryDegreeSuggest] = useState({})
  const [educationDegreeInput, setEducationDegreeInput] = useState({})
  const [educationDegreeActiveIndex, setEducationDegreeActiveIndex] = useState({})
  const educationDegreeRefs = useRef({})

  function generateUniqueId(existingApplications) {
    // Generate applicationId using count-based scheme: applicationId = 11000 + count
    const count = Array.isArray(existingApplications) ? existingApplications.length + 1 : 1
    const applicationId = 11000 + count
    return String(applicationId)
  }

  const allowedEducationFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
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
    if (file.size > 5 * 1024 * 1024) {
      return 'File size exceeds 5MB. Please upload a smaller file.'
    }
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

  function validateEducationFile(file) {
    return validateFile(file, allowedEducationFileTypes, ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'])
  }

  function validateSalarySlipFile(file) {
    return validateFile(file, allowedSalarySlipTypes, ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'])
  }

  function validateBonusFile(file) {
    return validateFile(file, allowedBonusFileTypes, ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'])
  }

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

  function handleSalarySlipChange(e) {
    handleSalarySlipFiles(e.target.files)
  }

  function handleSalaryDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsSalaryDragActive(true)
  }

  function handleSalaryDragLeave() {
    setIsSalaryDragActive(false)
  }

  function handleSalaryDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsSalaryDragActive(false)
    handleSalarySlipFiles(e.dataTransfer.files)
  }

  function removeSalarySlipFile(index) {
    setSalarySlipFiles(prev => prev.filter((_, idx) => idx !== index))
    setSalarySlipError('')
  }

  function createBonusEntry() {
    return {
      id: Date.now() + Math.random(),
      type: '',
      amount: '',
      file: null,
      fileError: ''
    }
  }

  function handleBonusEntryFile(index, e) {
    const file = e.target.files[0] || null
    const fileError = validateBonusFile(file)
    setBonusEntries(prev => prev.map((entry, idx) => {
      if (idx !== index) return entry
      return { ...entry, file, fileError }
    }))
  }

  function handleBonusCountChange(value) {
    const count = value === '5+' ? 5 : Number(value)
    setBonusCount(value)
    setBonusEntries(prev => {
      const nextEntries = [...prev]
      while (nextEntries.length < count) {
        nextEntries.push(createBonusEntry())
      }
      if (nextEntries.length > count) {
        nextEntries.length = count
      }
      return nextEntries
    })
  }

  function updateBonusEntry(index, key, value) {
    setBonusEntries(prev => prev.map((entry, idx) => {
      if (idx !== index) return entry
      return { ...entry, [key]: value }
    }))
  }

  function removeBonusEntry(index) {
    setBonusEntries(prev => {
      const nextEntries = prev.filter((_, idx) => idx !== index)
      if (nextEntries.length === 0) {
        setBonusCount('')
      } else if (nextEntries.length >= 5) {
        setBonusCount('5+')
      } else {
        setBonusCount(String(nextEntries.length))
      }
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
    setEducationHistory(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        degree: '',
        specialization: '',
        institute: '',
        currentlyStudying: false,
        startDate: '',
        endDate: '',
        grade: '',
        file: null,
        fileError: ''
      }
    ])
  }

  function updateEducationEntry(index, key, value) {
    setEducationHistory(prev => prev.map((entry, idx) => {
      if (idx !== index) return entry
      return { ...entry, [key]: value }
    }))
  }

  function handleEducationEntryFile(index, e) {
    const file = e.target.files[0] || null
    const fileError = validateEducationFile(file)
    setEducationHistory(prev => prev.map((entry, idx) => {
      if (idx !== index) return entry
      return { ...entry, file, fileError }
    }))
  }

  function removeEducationEntry(index) {
    setEducationHistory(prev => prev.filter((_, idx) => idx !== index))
  }

  // Helper function to filter and format degree suggestions with highlight
  function filterDegreeSuggestions(input) {
    if (!input || input.length < 1) return []
    const lowerInput = input.toLowerCase()
    return degreeList
      .filter(degree => degree.toLowerCase().includes(lowerInput))
      .slice(0, 8)
  }

  // Highlight matching text in suggestion
  function highlightMatch(text, query) {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <strong key={i}>{part}</strong> : 
        part
    )
  }

  // Handle current education degree input change
  function handleCurrentDegreeChange(e) {
    const value = e.target.value
    setCurrentDegreeInput(value)
    if (value.length >= 1) {
      setCurrentDegreeSuggestions(filterDegreeSuggestions(value))
      setShowCurrentDegreeSuggest(true)
      setCurrentDegreeActiveIndex(-1)
    } else {
      setCurrentDegreeSuggestions([])
      setShowCurrentDegreeSuggest(false)
    }
  }

  // Handle current education degree key down
  function handleCurrentDegreeKeyDown(e) {
    if (!showCurrentDegreeSuggest || currentDegreeSuggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowCurrentDegreeSuggest(false)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCurrentDegreeActiveIndex(prev => 
        prev < currentDegreeSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCurrentDegreeActiveIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (currentDegreeActiveIndex >= 0) {
        selectCurrentDegreeSuggestion(currentDegreeSuggestions[currentDegreeActiveIndex])
      }
    } else if (e.key === 'Escape') {
      setShowCurrentDegreeSuggest(false)
    }
  }

  // Select a degree suggestion for current education
  function selectCurrentDegreeSuggestion(degree) {
    setCurrentEducation(prev => ({ ...prev, degree }))
    setCurrentDegreeInput(degree)
    setShowCurrentDegreeSuggest(false)
    setCurrentDegreeSuggestions([])
    setCurrentDegreeActiveIndex(-1)
  }

  // Handle education history degree input change
  function handleHistoryDegreeChange(e, index) {
    const value = e.target.value
    setEducationDegreeInput(prev => ({ ...prev, [index]: value }))
    updateEducationEntry(index, 'degree', value)
    
    if (value.length >= 1) {
      const suggestions = filterDegreeSuggestions(value)
      setEducationHistoryDegreeSuggestions(prev => ({ ...prev, [index]: suggestions }))
      setShowHistoryDegreeSuggest(prev => ({ ...prev, [index]: true }))
      setEducationDegreeActiveIndex(prev => ({ ...prev, [index]: -1 }))
    } else {
      setEducationHistoryDegreeSuggestions(prev => ({ ...prev, [index]: [] }))
      setShowHistoryDegreeSuggest(prev => ({ ...prev, [index]: false }))
    }
  }

  // Handle education history degree key down
  function handleHistoryDegreeKeyDown(e, index) {
    const suggestions = educationHistoryDegreeSuggestions[index] || []
    if (!showHistoryDegreeSuggest[index] || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowHistoryDegreeSuggest(prev => ({ ...prev, [index]: false }))
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setEducationDegreeActiveIndex(prev => ({
        ...prev,
        [index]: (prev[index] || -1) < suggestions.length - 1 ? (prev[index] || -1) + 1 : prev[index]
      }))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setEducationDegreeActiveIndex(prev => ({
        ...prev,
        [index]: (prev[index] || -1) > 0 ? (prev[index] || -1) - 1 : -1
      }))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const activeIdx = educationDegreeActiveIndex[index]
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        selectHistoryDegreeSuggestion(index, suggestions[activeIdx])
      }
    } else if (e.key === 'Escape') {
      setShowHistoryDegreeSuggest(prev => ({ ...prev, [index]: false }))
    }
  }

  // Select a degree suggestion for education history
  function selectHistoryDegreeSuggestion(index, degree) {
    updateEducationEntry(index, 'degree', degree)
    setEducationDegreeInput(prev => ({ ...prev, [index]: degree }))
    setShowHistoryDegreeSuggest(prev => ({ ...prev, [index]: false }))
    setEducationHistoryDegreeSuggestions(prev => ({ ...prev, [index]: [] }))
    setEducationDegreeActiveIndex(prev => ({ ...prev, [index]: -1 }))
  }

  // Close degree suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (currentDegreeRef.current && !currentDegreeRef.current.contains(event.target)) {
        setShowCurrentDegreeSuggest(false)
      }
      Object.keys(educationDegreeRefs.current).forEach(key => {
        if (educationDegreeRefs.current[key] && !educationDegreeRefs.current[key].contains(event.target)) {
          setShowHistoryDegreeSuggest(prev => ({ ...prev, [parseInt(key)]: false }))
        }
      })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function addSkill(value) {
    const trimmed = value.trim()
    if (!trimmed) return
    if (skills.length >= 15) {
      setSkillMessage('Maximum 15 skills added.')
      return
    }
    if (skills.includes(trimmed)) {
      setSkillMessage('This skill is already added.')
      return
    }
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

  function removeSkill(index) {
    setSkills(prev => prev.filter((_, idx) => idx !== index))
    setSkillMessage('')
  }

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
    return String(text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .trim()
  }

  function splitResumeSections(fullText) {
    const lines = normalizeText(fullText)
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    const sections = { general: [] }
    let current = 'general'

    lines.forEach(line => {
      const low = line.toLowerCase()
      const sectionKey = Object.keys(sectionKeywords).find(key =>
        sectionKeywords[key].some(keyword => low.includes(keyword))
      )

      if (sectionKey) {
        current = sectionKey
        if (!sections[current]) sections[current] = []
        return
      }

      sections[current].push(line)
    })

    return Object.fromEntries(
      Object.entries(sections).map(([key, lines]) => [key, lines.join('\n')])
    )
  }

  function extractName(fullText) {
    const lines = normalizeText(fullText)
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .slice(0, 6)

    const nameLine = lines.find(line => {
      if (/\d/.test(line)) return false
      const wordCount = line.split(/\s+/).length
      return wordCount >= 2 && wordCount <= 4 && /^[A-Za-z .,'-]+$/.test(line)
    })

    if (!nameLine) return null

    const words = nameLine.split(/\s+/)
    return {
      firstName: words[0],
      lastName: words.length > 1 ? words.slice(-1)[0] : '',
      confidence: 'high'
    }
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
    if (labelMatch) {
      return { location: labelMatch[1].split(/,|\||;/)[0].trim(), confidence: 'high' }
    }

    const foundCity = indianCities.find(city => new RegExp(`\\b${city}\\b`, 'i').test(fullText))
    if (foundCity) {
      return { location: foundCity, confidence: 'medium' }
    }

    return { location: '', confidence: 'low' }
  }

  function extractCurrentPosition(sectionText, fullText) {
    const searchText = sectionText || fullText
    const found = industryTitles.find(title => new RegExp(`\\b${title}\\b`, 'i').test(searchText))
    if (found) {
      return { currentPosition: found, confidence: 'medium' }
    }
    return { currentPosition: '', confidence: 'low' }
  }

  function extractExperienceYears(fullText) {
    const match = fullText.match(/(\d+(?:\.\d*)?)\+?\s*years?\s*(?:of)?\s*experience/i)
    if (match) {
      return { experienceYears: match[1], confidence: 'high' }
    }
    return { experienceYears: '', confidence: 'low' }
  }

  function extractExperienceDates(fullText) {
    const monthNames = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
    const datePattern = new RegExp(`(${monthNames}\s*\d{4}|\d{4})\s*(?:[-–to]+)\s*(${monthNames}\s*\d{4}|\d{4}|Present|Now)`, 'i')
    const match = fullText.match(datePattern)
    if (match) {
      return {
        startDate: match[1],
        endDate: match[2],
        confidence: 'high'
      }
    }
    return { startDate: '', endDate: '', confidence: 'low' }
  }

  function extractCompanyName(fullText) {
    const atMatch = fullText.match(/\bat\s+([A-Z][A-Za-z0-9 &\-.]{2,})/i)
    if (atMatch) {
      return { companyName: atMatch[1].trim(), confidence: 'medium' }
    }
    const atSymbolMatch = fullText.match(/@\s*([A-Z][A-Za-z0-9 &\-.]{2,})/i)
    if (atSymbolMatch) {
      return { companyName: atSymbolMatch[1].trim(), confidence: 'medium' }
    }
    return { companyName: '', confidence: 'low' }
  }

  function extractEducation(fullText) {
    const degree = degreeList.find(deg => new RegExp(deg.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i').test(fullText))
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
    const found = skillDictionary
      .filter(skill => new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(fullText))
      .slice(0, 15)
    return { skills: found, confidence: found.length ? 'high' : 'low' }
  }

  function extractSalary(fullText) {
    const salaryMatch = fullText.match(/(\d+\.?\d*)\s*(lpa|lakh|lac|lakhs)/i)
    if (salaryMatch) {
      return { lastSalary: `${salaryMatch[1]} ${salaryMatch[2]}`.trim(), confidence: 'high' }
    }
    const ctcMatch = fullText.match(/(?:ctc|salary)[:\-]?\s*(\d+\.?\d*)/i)
    if (ctcMatch) {
      return { lastSalary: ctcMatch[1], confidence: 'medium' }
    }
    return { lastSalary: '', confidence: 'low' }
  }

  function getInputClass(field) {
    const confidence = fieldConfidence[field]
    if (confidence === 'high') return 'input-success'
    if (confidence === 'medium') return 'input-warning'
    if (confidence === 'low') return 'input-info'
    return ''
  }

  function renderConfidenceIcon(field) {
    const confidence = fieldConfidence[field]
    if (!confidence) return null

    const labels = {
      high: { icon: '✅', title: 'High confidence' },
      medium: { icon: '⚠️', title: 'Please verify this field' },
      low: { icon: 'ℹ️', title: 'Could not detect — please fill manually' }
    }

    return (
      <span className={`field-confidence field-confidence-${confidence}`} title={labels[confidence].title}>
        {labels[confidence].icon}
      </span>
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

  const locationOptions = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Noida', 'Gurgaon', 'Indore', 'Coimbatore', 'Kochi', 'Nagpur', 'Vadodara', 'Bhubaneswar',
    'Mysore', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Dehradun', 'Amritsar', 'Ludhiana',
    'Jodhpur', 'Udaipur', 'Faridabad', 'Ghaziabad', 'Madurai', 'Vijayawada', 'Tirupati',
    'Warangal', 'Hubli', 'Thrissur', 'Kozhikode', 'Nashik', 'Aurangabad', 'Kolhapur',
    'Rajkot', 'Gandhinagar', 'Panaji', 'Patna', 'Ranchi', 'Jamshedpur', 'Guwahati',
    'Raipur', 'Siliguri', 'Vizag', 'Chandigarh', 'Surat', 'Remote', 'Work From Home'
  ]

  function renderHighlighted(text, query) {
    if (!query) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <strong>{text.slice(idx, idx + query.length)}</strong>
        {text.slice(idx + query.length)}
      </>
    )
  }

  useEffect(() => {
    function onDocClick(e) {
      if (pref1Ref.current && !pref1Ref.current.contains(e.target)) {
        setShowPref1Suggest(false)
        setPref1Active(-1)
      }
      if (pref2Ref.current && !pref2Ref.current.contains(e.target)) {
        setShowPref2Suggest(false)
        setPref2Active(-1)
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        setShowPref1Suggest(false)
        setShowPref2Suggest(false)
        setPref1Active(-1)
        setPref2Active(-1)
      }
    }

    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])


  function findCountryByPhone(phoneValue) {
    const digits = phoneValue.replace(/[^0-9]/g, '')
    if (!digits) return null

    const normalized = digits.startsWith('0') ? digits.slice(1) : digits
    const matchingCountry = countryOptions.find(opt => {
      return normalized.startsWith(opt.prefix) || digits.startsWith(opt.prefix)
    })
    return matchingCountry ? matchingCountry.value : null
  }

  function sanitizeDigits(text) {
    return text.replace(/\D/g, '')
  }

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
    if (!start) {
      return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    }

    const startDateObj = new Date(start)
    if (Number.isNaN(startDateObj)) {
      return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    }

    if (!currentlyWorkingFlag && !end) {
      return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    }

    const endDateObj = currentlyWorkingFlag ? new Date() : new Date(end)
    if (Number.isNaN(endDateObj) || endDateObj < startDateObj) {
      return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    }

    let years = endDateObj.getFullYear() - startDateObj.getFullYear()
    let months = endDateObj.getMonth() - startDateObj.getMonth()
    const dayDelta = endDateObj.getDate() - startDateObj.getDate()

    if (dayDelta < 0) {
      months -= 1
    }
    if (months < 0) {
      years -= 1
      months += 12
    }
    if (years < 0) {
      return { valid: false, text: 'Please enter valid dates', years: 0, months: 0 }
    }

    return {
      valid: true,
      years,
      months,
      text: `${years} Years ${months} Months`
    }
  }

  useEffect(() => {
    const result = calculateTotalExperience(startDate, endDate, currentlyWorking)
    if (result.valid) {
      setExperienceYears(String(result.years))
    } else if (experienceYears) {
      setExperienceYears('')
    }
  }, [startDate, endDate, currentlyWorking])

  const showExperienceBadge = Boolean(startDate && (endDate || currentlyWorking))

  function handlePhonePaste(event, currentValue, setter, setError, countrySetter) {
    event.preventDefault()
    const pasted = (event.clipboardData || window.clipboardData).getData('text') || ''
    const digits = sanitizeDigits(pasted)
    const target = event.target
    const start = target.selectionStart || 0
    const end = target.selectionEnd || 0
    const nextValue = currentValue.slice(0, start) + digits + currentValue.slice(end)
    const hasInvalid = digits !== pasted
    setError(hasInvalid ? 'Phone number must contain digits only' : '')
    setter(nextValue)
    if (countrySetter) {
      const selected = findCountryByPhone(nextValue)
      if (selected) countrySetter(selected)
    }
  }

  function handleDigitKeyPress(event) {
    const isDigit = /^[0-9]$/.test(event.key)
    if (!isDigit) {
      event.preventDefault()
    }
  }

  function buildFieldConfidence(values) {
    const confidence = {}
    Object.entries(values).forEach(([field, meta]) => {
      if (!meta || !meta.value) {
        confidence[field] = 'low'
      } else if (meta.confidence === 'high') {
        confidence[field] = 'high'
      } else if (meta.confidence === 'medium') {
        confidence[field] = 'medium'
      } else {
        confidence[field] = 'low'
      }
    })
    return confidence
  }

  async function extractTextForResume(file) {
    const extension = file.name.split('.').pop().toLowerCase()
    if (extension === 'pdf') {
      return await extractTextFromPdf(file)
    }
    if (extension === 'docx') {
      return await extractTextFromDocx(file)
    }
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
      return await extractTextFromImage(file)
    }
    if (file.type === 'text/plain' || extension === 'txt') {
      return normalizeText(await readFileAsText(file))
    }
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
        const next = prev.map(step => step.key === key ? { ...step, status } : step)
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
      setAutofillToast('✅ Resume autofill complete! Please review highlighted fields.')
      setTimeout(() => setAutofillToast(''), 6000)
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
    if (resumeFile) {
      resumeData = await readFileAsDataURL(resumeFile)
    }

    const existing = JSON.parse(localStorage.getItem('kady_applications') || '[]')
    let uniqueId = generateUniqueId(existing)

    const application = {
      id: Date.now(),
      uniqueId,
      applicationId: uniqueId,
      status: 'Applied',
      firstName,
      lastName,
      countryCode,
      phone,
      email,
      altEmail,
      altPhone,
      altCountryCode,
      positionApplied,
      isFresher,
      currentPosition,
      companyName,
      startDate,
      endDate,
      currentlyWorking,
      relevantStartDate,
      relevantEndDate,
      currentlyWorkingRelevant,
      experienceYears,
      lastSalary,
      expectedSalary,
      lastCompany,
      currentLocation,
      preferredLocation1,
      preferredLocation2,
      workTypePreference,
      salarySlips: salarySlipFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      bonusDetails: showBonusDetails ? {
        count: bonusCount,
        entries: bonusEntries.map(entry => ({
          type: entry.type,
          amount: entry.amount,
          fileName: entry.file ? entry.file.name : null
        }))
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
        degree: entry.degree,
        specialization: entry.specialization,
        institute: entry.institute,
        currentlyStudying: entry.currentlyStudying,
        startDate: entry.startDate,
        endDate: entry.endDate,
        grade: entry.grade,
        fileName: entry.file ? entry.file.name : null
      })),
      skills: skills,
      resumeName: resumeFile ? resumeFile.name : null,
      resumeData,
      createdAt: new Date().toISOString()
    }
    // Try saving to backend first via Axios. Backend should return the saved document with applicationId field.
    try {
      const { data: saved } = await api.post('/applications', application)
      // backend should return applicationId (e.g., 11001)
      const appId = saved.applicationId || saved.uniqueId || uniqueId
      uniqueId = String(appId)
      application.uniqueId = uniqueId
      application.applicationId = uniqueId
    } catch (err) {
      // network error — fallback to localStorage
      application.uniqueId = uniqueId
      application.applicationId = uniqueId
    }

    existing.push(application)
    localStorage.setItem('kady_applications', JSON.stringify(existing))

    setSubmitting(false)
    // clear form
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
    setRelevantStartDate('')
    setRelevantEndDate('')
    setCurrentlyWorkingRelevant(false)
    setExperienceYears('')
    setLastSalary('')
    setExpectedSalary('')
    setLastCompany('')
    setCurrentLocation('')
    setPreferredLocation1('')
    setPreferredLocation2('')
    setWorkTypePreference('Work from Home')
    setShowEducationDetails(false)
    setCurrentEducation({
      degree: '',
      specialization: '',
      institute: '',
      currentlyStudying: false,
      startDate: '',
      endDate: '',
      grade: '',
      file: null,
      fileError: ''
    })
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
    document.getElementById('resume-input')?.value && (document.getElementById('resume-input').value = '')
    document.getElementById('salary-slips-input')?.value && (document.getElementById('salary-slips-input').value = '')
    
    // Call callback to show success page with the assigned unique ID
    if (onSubmitSuccess) {
      setTimeout(() => onSubmitSuccess({ applicationId: uniqueId, submittedAt: application.createdAt }), 500)
    }
  }

  return (
    <section className="card apply-card">
      <h2>Tell us about yourself</h2>
      <p className="muted">Fill your details and we'll get back to you soon.</p>
      <form onSubmit={handleSubmit} className="candidate-form">
        <div className="section-box">
          <div className="section-title">
            <span className="section-icon">01</span>
            <div>
              <h3>Personal Details</h3>
              <p className="section-subtitle">Share your basic information first.</p>
            </div>
          </div>

          <div className="form-row">
            <div className="field-with-indicator">
              <input 
                placeholder="First Name *" 
                value={firstName} 
                onChange={e=>setFirstName(e.target.value)} 
                className={`input-field ${getInputClass('firstName')}`}
              />
              {renderConfidenceIcon('firstName')}
            </div>
            <input 
              placeholder="Last Name *" 
              value={lastName} 
              onChange={e=>setLastName(e.target.value)} 
              className="input-field"
            />
          </div>

          <div className="form-row">
            <div className="field-with-indicator">
              <input 
                placeholder="Primary Email ID *" 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                className={`input-field ${getInputClass('email')}`}
              />
              {renderConfidenceIcon('email')}
            </div>
            <input 
              placeholder="Alternative Email ID (optional)" 
              type="email"
              value={altEmail} 
              onChange={e=>setAltEmail(e.target.value)} 
              className="input-field"
            />
          </div>

          <div className="form-row">
            <div className="field-with-indicator">
              <div className="phone-group">
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="input-field country-code-select"
                >
                  {countryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.flag} {option.label}
                    </option>
                  ))}
                </select>
                <input 
                  placeholder="Phone Number *" 
                  value={phone} 
                  onInput={e => handlePhoneInput(e.target.value, setPhone, setPhoneError, setCountryCode)} 
                  onKeyPress={handleDigitKeyPress}
                  onPaste={e => handlePhonePaste(e, phone, setPhone, setPhoneError, setCountryCode)}
                  inputMode="numeric"
                  autoComplete="tel"
                  className={`input-field phone-entry ${getInputClass('phone')}`}
                />
                {renderConfidenceIcon('phone')}
              </div>
              {phoneError && <p className="error-text">{phoneError}</p>}
            </div>

            <div className="field-with-indicator">
              <div className="phone-group">
                <select
                  value={altCountryCode}
                  onChange={e => setAltCountryCode(e.target.value)}
                  className="input-field country-code-select"
                >
                  {countryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.flag} {option.label}
                    </option>
                  ))}
                </select>
                <input 
                  placeholder="Enter alternative phone number" 
                  value={altPhone} 
                  onInput={e => handlePhoneInput(e.target.value, setAltPhone, setAltPhoneError, setAltCountryCode)} 
                  onKeyPress={handleDigitKeyPress}
                  onPaste={e => handlePhonePaste(e, altPhone, setAltPhone, setAltPhoneError, setAltCountryCode)}
                  inputMode="numeric"
                  autoComplete="tel"
                  className="input-field phone-entry"
                />
              </div>
              {altPhoneError && <p className="error-text">{altPhoneError}</p>}
            </div>
          </div>
        </div>

        <div className="section-box">
          <div className="section-title">
            <span className="section-icon">02</span>
            <div>
              <h3>Position & Experience</h3>
              <p className="section-subtitle">Tell us what role you're applying for and your expertise.</p>
            </div>
          </div>

          <div className="subsection-block">
            <div className="subsection-header">
              <span>Overall Experience</span>
            </div>
            <div className="field-with-indicator">
              <input 
                list="position-options"
                placeholder="Position Applied For *" 
                value={positionApplied} 
                onChange={e=>setPositionApplied(e.target.value)} 
                className={`input-field ${getInputClass('positionApplied')}`}
              />
              {renderConfidenceIcon('positionApplied')}
            </div>

            <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={isFresher}
                onChange={e => {
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
                }}
              />
              <span>I am a Fresher</span>
            </label>

            <label className="field-label">
              Total Years of Job Experience
              <input
                placeholder="e.g. 3 or 3.5"
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={totalJobExperience}
                onChange={e => setTotalJobExperience(e.target.value)}
                className="input-field small-input-field"
                disabled={isFresher}
                style={{ opacity: isFresher ? 0.65 : 1 }}
              />
            </label>

            {isFresher && (
              <p className="small-note">Experience fields are disabled for freshers.</p>
            )}
          </div>

          <div className={`experience-block ${isFresher ? 'disabled-content' : ''}`}>
            <div className="subsection-block">
              <div className="subsection-header">
                <span>Last Company Details</span>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input
                  placeholder="Last or current position"
                  value={currentPosition}
                  onChange={e => setCurrentPosition(e.target.value)}
                  className="input-field"
                  disabled={isFresher}
                />
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', marginBottom: 0 }}>
                  Enter your last or current job title or designation
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input
                  placeholder="Last company name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="input-field"
                  disabled={isFresher}
                />
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', marginBottom: 0 }}>
                  Enter the name of your last or current company
                </p>
              </div>

              <div className="form-row">
                <div className="date-field-with-note">
                  <label className="field-label">
                    Start Date
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="input-field"
                      disabled={isFresher}
                    />
                  </label>
                </div>

                <div className="date-field-with-note end-date-wrapper">
                  <label className="field-label">
                    End Date
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="input-field"
                      disabled={currentlyWorking || isFresher}
                    />
                  </label>
                  {currentlyWorking && <span className="present-tag">Present</span>}
                  <label className="checkbox-toggle current-working-toggle">
                    <input
                      type="checkbox"
                      checked={currentlyWorking}
                      onChange={e => setCurrentlyWorking(e.target.checked)}
                      disabled={isFresher}
                    />
                    <span>Currently Working Here</span>
                  </label>
                </div>
              </div>

              <div className={`full-width field-label experience-row ${showExperienceBadge ? '' : 'hidden'}`}>
                <span>Last Company Experience</span>
                <div className={`experience-badge ${calculateTotalExperience(startDate, endDate, currentlyWorking).valid ? '' : 'error'}`}>
                  {calculateTotalExperience(startDate, endDate, currentlyWorking).text}
                </div>
              </div>

              <p className="small-note" style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>
                Please add your last company details including position, duration and experience.
              </p>
            </div>

            <div className="subsection-block">
              <div className="subsection-header">
                <span>Relevant Experience</span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="field-label">
                  Relevant Experience
                  <input
                    type="text"
                    placeholder="e.g. 2 Years 3 Months"
                    value={relevantExperienceText}
                    onChange={e => setRelevantExperienceText(e.target.value)}
                    className="input-field"
                    disabled={isFresher}
                  />
                </label>
                <p className="small-note" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', marginBottom: 0 }}>
                  Optional
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-box">
          <div className="section-title">
            <span className="section-icon">03</span>
            <div>
              <h3>Salary & Company</h3>
              <p className="section-subtitle">Add your recent compensation and employer details.</p>
            </div>
          </div>

          <input 
            placeholder="Last Company Name" 
            value={lastCompany} 
            onChange={e=>setLastCompany(e.target.value)} 
            className="input-field"
            disabled={isFresher}
          />

          <div className="form-row">
            <input 
              placeholder="Last Drawn Salary (in LPA)" 
              value={lastSalary} 
              onChange={e=>setLastSalary(e.target.value)} 
              className="input-field"
              disabled={isFresher}
            />
            <input 
              placeholder="Expected Salary" 
              value={expectedSalary} 
              onChange={e=>setExpectedSalary(e.target.value)} 
              className="input-field"
            />
          </div>

          {!isFresher && (
            <div className="upload-section">
              <div
                className={`upload-dropzone ${isSalaryDragActive ? 'drag-over' : ''}`}
                onDragOver={handleSalaryDragOver}
                onDragLeave={handleSalaryDragLeave}
                onDrop={handleSalaryDrop}
              >
                <input
                  id="salary-slips-input"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={handleSalarySlipChange}
                />
                <div className="drop-content">
                  <svg className="upload-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M20 21H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  <span className="drop-main">Drag &amp; drop or click to upload</span>
                  <span className="drop-sep">|</span>
                  <span className="drop-supported">PDF DOC IMG (5MB)</span>
                </div>
              </div>
              {salarySlipError && <p className="error-text">{salarySlipError}</p>}
              {salarySlipFiles.length > 0 && (
                <div className="upload-file-list">
                  {salarySlipFiles.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${index}`} className="upload-file-item">
                      <span>{file.name} — {formatFileSize(file.size)}</span>
                      <button type="button" className="remove-file-btn" onClick={() => removeSalarySlipFile(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isFresher && (
            <p className="small-note muted">Salary slip and bonus fields are not applicable for freshers.</p>
          )}

          {!isFresher && (
            <div className="checkbox-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={showBonusDetails}
                  onChange={e => {
                    const checked = e.target.checked
                    setShowBonusDetails(checked)
                    if (!checked) {
                      setBonusCount('')
                      setBonusEntries([])
                    }
                  }}
                />
                <span>Did you receive any bonus from your company? (optional)</span>
              </label>
            </div>
          )}

          {showBonusDetails && !isFresher && (
            <div className="bonus-panel">
              <div className="form-row">
                <select
                  value={bonusCount}
                  onChange={e => handleBonusCountChange(e.target.value)}
                  className="input-field"
                >
                  <option value="">Number of Bonuses Received</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              {bonusEntries.map((entry, index) => (
                <div className="bonus-entry" key={entry.id}>
                  <div className="education-card-header">
                    <strong>Bonus {index + 1}</strong>
                    <button type="button" className="remove-card-btn" onClick={() => removeBonusEntry(index)}>Remove</button>
                  </div>

                  <div className="form-row">
                    <select
                      value={entry.type}
                      onChange={e => updateBonusEntry(index, 'type', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Bonus Type</option>
                      <option>Performance Bonus</option>
                      <option>Festive Bonus</option>
                      <option>Joining Bonus</option>
                      <option>Retention Bonus</option>
                      <option>Project Bonus</option>
                      <option>Other</option>
                    </select>
                    <input
                      placeholder="Bonus Amount"
                      type="number"
                      value={entry.amount}
                      onChange={e => updateBonusEntry(index, 'amount', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="form-row">
                    <label className="file-label small-file-label">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={e => handleBonusEntryFile(index, e)}
                      />
                      <span>{entry.file ? entry.file.name : 'Upload Bonus Slip (optional)'}</span>
                    </label>
                  </div>
                  {entry.fileError && <p className="error-text">{entry.fileError}</p>}
                </div>
              ))}

              <p className="small-note">All bonus details and uploads are optional.</p>
            </div>
          )}
        </div>

        <div className="section-box">
          <div className="section-title">
            <span className="section-icon">04</span>
            <div>
              <h3>Location Preferences</h3>
              <p className="section-subtitle">Tell us your current and preferred work locations.</p>
            </div>
          </div>

          <div className="form-row">
            <label className="field-label">
              Current Location
              <input
                placeholder="Current Location"
                value={currentLocation}
                onChange={e => setCurrentLocation(e.target.value)}
                className="input-field"
                type="text"
              />
            </label>
            <label className="field-label autocomplete-wrapper" ref={pref1Ref}>
              Preferred Location 1
              <input
                placeholder="Preferred Location 1"
                value={preferredLocation1}
                onChange={e => {
                  const v = e.target.value
                  setPreferredLocation1(v)
                  setPref1Active(-1)
                  if (v && v.length >= 1) {
                    const list = locationOptions.filter(loc => loc.toLowerCase().includes(v.toLowerCase()))
                    setPref1Suggestions(list.slice(0, 8))
                    setShowPref1Suggest(true)
                  } else {
                    setPref1Suggestions([])
                    setShowPref1Suggest(false)
                  }
                }}
                onFocus={e => {
                  const v = e.target.value
                  if (v && v.length >= 1) {
                    const list = locationOptions.filter(loc => loc.toLowerCase().includes(v.toLowerCase()))
                    setPref1Suggestions(list.slice(0, 8))
                    setShowPref1Suggest(true)
                  }
                }}
                onKeyDown={e => {
                  const list = pref1Suggestions
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setShowPref1Suggest(true)
                    setPref1Active(prev => Math.min(prev + 1, list.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setPref1Active(prev => Math.max(prev - 1, 0))
                  } else if (e.key === 'Enter') {
                    if (pref1Active >= 0 && list[pref1Active]) {
                      e.preventDefault()
                      setPreferredLocation1(list[pref1Active])
                      setShowPref1Suggest(false)
                      setPref1Active(-1)
                    }
                  } else if (e.key === 'Escape') {
                    setShowPref1Suggest(false)
                    setPref1Active(-1)
                  }
                }}
                className="input-field"
                type="text"
                autoComplete="off"
              />
              {showPref1Suggest && (
                <div className="autocomplete-suggestions">
                  {pref1Suggestions.length > 0 ? (
                    pref1Suggestions.map((loc, idx) => (
                      <div
                        key={loc}
                        className={`autocomplete-item ${idx === pref1Active ? 'active' : ''}`}
                        onMouseDown={() => {
                          setPreferredLocation1(loc)
                          setShowPref1Suggest(false)
                          setPref1Active(-1)
                        }}
                      >
                        {renderHighlighted(loc, preferredLocation1)}
                      </div>
                    ))
                  ) : (
                    <div className="autocomplete-item no-match">No city found — you can type your own</div>
                  )}
                </div>
              )}
            </label>
          </div>

          <div className="form-row">
            <label className="field-label autocomplete-wrapper" ref={pref2Ref}>
              Preferred Location 2
              <input
                placeholder="Preferred Location 2"
                value={preferredLocation2}
                onChange={e => {
                  const v = e.target.value
                  setPreferredLocation2(v)
                  setPref2Active(-1)
                  if (v && v.length >= 1) {
                    const list = locationOptions.filter(loc => loc.toLowerCase().includes(v.toLowerCase()))
                    setPref2Suggestions(list.slice(0, 8))
                    setShowPref2Suggest(true)
                  } else {
                    setPref2Suggestions([])
                    setShowPref2Suggest(false)
                  }
                }}
                onFocus={e => {
                  const v = e.target.value
                  if (v && v.length >= 1) {
                    const list = locationOptions.filter(loc => loc.toLowerCase().includes(v.toLowerCase()))
                    setPref2Suggestions(list.slice(0, 8))
                    setShowPref2Suggest(true)
                  }
                }}
                onKeyDown={e => {
                  const list = pref2Suggestions
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setShowPref2Suggest(true)
                    setPref2Active(prev => Math.min(prev + 1, list.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setPref2Active(prev => Math.max(prev - 1, 0))
                  } else if (e.key === 'Enter') {
                    if (pref2Active >= 0 && list[pref2Active]) {
                      e.preventDefault()
                      setPreferredLocation2(list[pref2Active])
                      setShowPref2Suggest(false)
                      setPref2Active(-1)
                    }
                  } else if (e.key === 'Escape') {
                    setShowPref2Suggest(false)
                    setPref2Active(-1)
                  }
                }}
                className="input-field"
                type="text"
                autoComplete="off"
              />
              {showPref2Suggest && (
                <div className="autocomplete-suggestions">
                  {pref2Suggestions.length > 0 ? (
                    pref2Suggestions.map((loc, idx) => (
                      <div
                        key={loc}
                        className={`autocomplete-item ${idx === pref2Active ? 'active' : ''}`}
                        onMouseDown={() => {
                          setPreferredLocation2(loc)
                          setShowPref2Suggest(false)
                          setPref2Active(-1)
                        }}
                      >
                        {renderHighlighted(loc, preferredLocation2)}
                      </div>
                    ))
                  ) : (
                    <div className="autocomplete-item no-match">No city found — you can type your own</div>
                  )}
                </div>
              )}
            </label>

            <fieldset className="work-type-group">
              <legend className="field-label">Work Type Preference</legend>
              <div className="radio-grid">
                {['Work from Home', 'In Office', 'Hybrid'].map(type => (
                  <label key={type} className="radio-option">
                    <input
                      type="radio"
                      name="workTypePreference"
                      value={type}
                      checked={workTypePreference === type}
                      onChange={() => setWorkTypePreference(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="section-box full-width">
          <label className="checkbox-toggle">
            <input
              type="checkbox"
              checked={showEducationDetails}
              onChange={e => setShowEducationDetails(e.target.checked)}
            />
            <span>Add Education Details (optional)</span>
          </label>

          {showEducationDetails && (
            <div className="section-card">
              <div className="section-title">
                <span className="section-icon">06</span>
                <div>
                  <h3>Current Education</h3>
                  <p className="section-subtitle">Share your latest education details.</p>
                </div>
              </div>

              <div className="form-row">
                <div ref={currentDegreeRef} style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Degree / Qualification"
                    value={currentDegreeInput || currentEducation.degree}
                    onChange={handleCurrentDegreeChange}
                    onKeyDown={handleCurrentDegreeKeyDown}
                    onFocus={() => {
                      if (currentDegreeInput.length >= 1) {
                        setShowCurrentDegreeSuggest(true)
                      }
                    }}
                    className="input-field"
                    autoComplete="off"
                  />
                  {showCurrentDegreeSuggest && currentDegreeSuggestions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid rgba(108, 99, 255, 0.2)',
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(108,99,255,0.1)',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        marginTop: '4px'
                      }}
                    >
                      {currentDegreeSuggestions.map((degree, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectCurrentDegreeSuggestion(degree)}
                          onMouseEnter={() => setCurrentDegreeActiveIndex(idx)}
                          style={{
                            padding: '10px 14px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            backgroundColor: currentDegreeActiveIndex === idx ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          {highlightMatch(degree, currentDegreeInput)}
                        </div>
                      ))}
                    </div>
                  )}
                  {showCurrentDegreeSuggest && currentDegreeSuggestions.length === 0 && currentDegreeInput && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid rgba(108, 99, 255, 0.2)',
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(108,99,255,0.1)',
                        padding: '10px 14px',
                        fontSize: '13px',
                        color: '#666',
                        zIndex: 1000,
                        marginTop: '4px'
                      }}
                    >
                      No match found — you can type your own degree
                    </div>
                  )}
                </div>
                <input
                  placeholder="Field of Study / Specialization"
                  value={currentEducation.specialization}
                  onChange={e => handleCurrentEducationChange('specialization', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-row">
                <input
                  placeholder="University / Institute Name"
                  value={currentEducation.institute}
                  onChange={e => handleCurrentEducationChange('institute', e.target.value)}
                  className="input-field"
                />
                <label className="checkbox-toggle">
                  <input
                    type="checkbox"
                    checked={currentEducation.currentlyStudying}
                    onChange={e => handleCurrentEducationChange('currentlyStudying', e.target.checked)}
                  />
                  <span>Currently Studying here</span>
                </label>
              </div>

              <div className="form-row">
                <input
                  type="date"
                  value={currentEducation.startDate}
                  onChange={e => handleCurrentEducationChange('startDate', e.target.value)}
                  className="input-field"
                />
                <div className="date-field-with-note">
                  <input
                    type="date"
                    value={currentEducation.endDate}
                    onChange={e => handleCurrentEducationChange('endDate', e.target.value)}
                    className="input-field"
                    disabled={currentEducation.currentlyStudying}
                  />
                  {currentEducation.currentlyStudying && <p className="small-note">Ongoing</p>}
                </div>
              </div>

              <div className="form-row">
                <input
                  placeholder="Grade / Percentage / CGPA (optional)"
                  value={currentEducation.grade}
                  onChange={e => handleCurrentEducationChange('grade', e.target.value)}
                  className="input-field"
                />
                <label className="file-label small-file-label">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleCurrentEducationFile}
                  />
                  <span>{currentEducation.file ? currentEducation.file.name : 'Upload Marksheet / Certificate (optional)'}</span>
                </label>
              </div>
              {currentEducation.fileError && <p className="error-text">{currentEducation.fileError}</p>}

              <div className="section-title section-subsection-title">
                <span className="section-icon">+</span>
                <div>
                  <h3>Education History</h3>
                  <p className="section-subtitle">Add more education records if available.</p>
                </div>
              </div>

              {educationHistory.map((entry, index) => (
                <div key={entry.id} className="education-card">
                  <div className="education-card-header">
                    <strong>Education {index + 1}</strong>
                    <button type="button" className="remove-card-btn" onClick={() => removeEducationEntry(index)}>Remove</button>
                  </div>

                  <div className="form-row">
                    <div ref={el => { educationDegreeRefs.current[index] = el }} style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Degree / Qualification"
                        value={educationDegreeInput[index] || entry.degree}
                        onChange={e => handleHistoryDegreeChange(e, index)}
                        onKeyDown={e => handleHistoryDegreeKeyDown(e, index)}
                        onFocus={() => {
                          const input = educationDegreeInput[index]
                          if (input && input.length >= 1) {
                            setShowHistoryDegreeSuggest(prev => ({ ...prev, [index]: true }))
                          }
                        }}
                        className="input-field"
                        autoComplete="off"
                      />
                      {showHistoryDegreeSuggest[index] && (educationHistoryDegreeSuggestions[index] || []).length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid rgba(108, 99, 255, 0.2)',
                            borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(108,99,255,0.1)',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            marginTop: '4px'
                          }}
                        >
                          {(educationHistoryDegreeSuggestions[index] || []).map((degree, idx) => (
                            <div
                              key={idx}
                              onClick={() => selectHistoryDegreeSuggestion(index, degree)}
                              onMouseEnter={() => setEducationDegreeActiveIndex(prev => ({ ...prev, [index]: idx }))}
                              style={{
                                padding: '10px 14px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                backgroundColor: (educationDegreeActiveIndex[index] || -1) === idx ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                                transition: 'background-color 0.2s'
                              }}
                            >
                              {highlightMatch(degree, educationDegreeInput[index])}
                            </div>
                          ))}
                        </div>
                      )}
                      {showHistoryDegreeSuggest[index] && (educationHistoryDegreeSuggestions[index] || []).length === 0 && educationDegreeInput[index] && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid rgba(108, 99, 255, 0.2)',
                            borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(108,99,255,0.1)',
                            padding: '10px 14px',
                            fontSize: '13px',
                            color: '#666',
                            zIndex: 1000,
                            marginTop: '4px'
                          }}
                        >
                          No match found — you can type your own degree
                        </div>
                      )}
                    </div>
                    <input
                      placeholder="Field of Study / Specialization"
                      value={entry.specialization}
                      onChange={e => updateEducationEntry(index, 'specialization', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="form-row">
                    <input
                      placeholder="University / Institute Name"
                      value={entry.institute}
                      onChange={e => updateEducationEntry(index, 'institute', e.target.value)}
                      className="input-field"
                    />
                    <label className="checkbox-toggle">
                      <input
                        type="checkbox"
                        checked={entry.currentlyStudying}
                        onChange={e => updateEducationEntry(index, 'currentlyStudying', e.target.checked)}
                      />
                      <span>Currently Studying here</span>
                    </label>
                  </div>

                  <div className="form-row">
                    <input
                      type="date"
                      value={entry.startDate}
                      onChange={e => updateEducationEntry(index, 'startDate', e.target.value)}
                      className="input-field"
                    />
                    <div className="date-field-with-note">
                      <input
                        type="date"
                        value={entry.endDate}
                        onChange={e => updateEducationEntry(index, 'endDate', e.target.value)}
                        className="input-field"
                        disabled={entry.currentlyStudying}
                      />
                      {entry.currentlyStudying && <p className="small-note">Ongoing</p>}
                    </div>
                  </div>

                  <div className="form-row">
                    <input
                      placeholder="Grade / Percentage / CGPA (optional)"
                      value={entry.grade}
                      onChange={e => updateEducationEntry(index, 'grade', e.target.value)}
                      className="input-field"
                    />
                    <label className="file-label small-file-label">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={e => handleEducationEntryFile(index, e)}
                      />
                      <span>{entry.file ? entry.file.name : 'Upload Marksheet / Certificate (optional)'}</span>
                    </label>
                  </div>
                  {entry.fileError && <p className="error-text">{entry.fileError}</p>}
                </div>
              ))}

              <button type="button" className="secondary-btn add-education-btn" onClick={addEducationEntry}>
                Add Education
              </button>
            </div>
          )}
        </div>

        <div className="section-box full-width">
          <label className="checkbox-toggle">
            <input
              type="checkbox"
              checked={showSkillSets}
              onChange={e => setShowSkillSets(e.target.checked)}
            />
            <span>Add Skill Sets (optional)</span>
          </label>

          {showSkillSets && (
            <div className="section-card">
              <div className="section-title">
                <span className="section-icon">07</span>
                <div>
                  <h3>Skill Sets</h3>
                  <p className="section-subtitle">Add your skills as tags for quick review.</p>
                </div>
              </div>

              <div className="skill-input-group">
                <input
                  placeholder="Type a skill and press Enter (e.g. React, Python, Figma)"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  disabled={skills.length >= 15}
                  className="input-field"
                />
                <div className="skill-tags">
                  {skills.map((skill, idx) => (
                    <span key={`${skill}-${idx}`} className="skill-chip">
                      {skill}
                      <button type="button" onClick={() => removeSkill(idx)}>×</button>
                    </span>
                  ))}
                </div>
                <p className="skill-counter">{skills.length} / 15 skills added</p>
                {skillMessage && <p className="error-text">{skillMessage}</p>}
              </div>

              <div className="suggested-skills">
                <p className="small-note">Suggested skills:</p>
                <div className="suggested-skill-list">
                  {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Figma', 'Java', 'CSS', 'AWS', 'Git', 'TypeScript', 'MongoDB'].map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className="suggested-skill"
                      onClick={() => addSuggestedSkill(skill)}
                      disabled={skills.length >= 15 || skills.includes(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="section-box">
          <div className="section-title">
            <span className="section-icon">05</span>
            <div>
              <h3>Resume Upload</h3>
              <p className="section-subtitle">Upload and autofill from your resume file.</p>
            </div>
          </div>

          <label className="file-label">
            <input id="resume-input" type="file" accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx" onChange={handleFile} />
            <span>{resumeFile ? '✓ ' + resumeFile.name : 'Upload your resume (TXT, DOCX, PDF, PPT, IMAGE)'}</span>
          </label>
          <div className="resume-actions">
            {resumeFile && (
              <div className="file-preview">
                <span className="file-name">📄 {resumeFile.name}</span>
                <span className="file-size">{formatFileSize(resumeFile.size)}</span>
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={() => {
                    setResumeFile(null)
                    document.getElementById('resume-input').value = ''
                    setResumeMessage('')
                  }}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            )}
            <button
              type="button"
              className="autofill-btn"
              onClick={handleAutofill}
              disabled={!resumeFile || isAutofilling}
            >
              {isAutofilling ? '⏳ Autofilling... please wait' : '✨ Autofill from Resume'}
            </button>
            <button
              type="button"
              className="clear-autofill-btn"
              onClick={clearAutofill}
              disabled={!autofillFilledFields.length || isAutofilling}
            >
              Clear Autofill
            </button>
            {resumeMessage && <p className="resume-message">{resumeMessage}</p>}

            {isAutofilling && (
              <>
                <div className="autofill-progress-bar">
                  <div className="autofill-progress-fill" style={{ width: `${autofillProgress}%` }} />
                  <span>{autofillProgress}%</span>
                </div>

                <div className="autofill-steps">
                  {autofillSteps.map(step => (
                    <div key={step.key} className={`autofill-step ${step.status}`}>
                      <span className="step-icon">
                        {step.status === 'done' ? '✅' : step.status === 'running' ? '⏳' : '•'}
                      </span>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {autofillSummary && (
              <div className="autofill-summary">
                <strong>✅ Autofill Complete!</strong>
                <p>{autofillSummary.filledCount} fields filled successfully</p>
                <p>{autofillSummary.verifyCount} fields need verification</p>
                <p>{autofillSummary.missingCount} fields could not be detected</p>
              </div>
            )}

            {autofillToast && <div className="autofill-toast">{autofillToast}</div>}
          </div>
        </div>

        <div className="actions">
          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </section>
  )
}
