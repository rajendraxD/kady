import React, { useEffect, useRef, useState } from 'react'
import TimezoneWidget from './TimezoneWidget'
import api from '../api'

const VIEW_MODES = [
  { value: 'card', label: 'Card View' },
  { value: 'table', label: 'Table View' },
  { value: 'list', label: 'List View' },
  { value: 'titles', label: 'Titles View' }
]

export default function AdminDashboard({ onLogout }) {
  const [applications, setApplications] = useState([])
  const STATUS_OPTIONS = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Selected',
    'Rejected',
    'On Hold'
  ]
  const [viewMode, setViewMode] = useState('card')
  const [filterText, setFilterText] = useState('')
  const [filterField, setFilterField] = useState('all')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [pendingFilterText, setPendingFilterText] = useState('')
  const [pendingFilterField, setPendingFilterField] = useState('all')
  const [pendingPosition, setPendingPosition] = useState('')
  const [pendingLocation, setPendingLocation] = useState('')
  const [pendingExperience, setPendingExperience] = useState('')
  const [pendingWorkTypes, setPendingWorkTypes] = useState([])
  const [pendingSalaryMin, setPendingSalaryMin] = useState('')
  const [pendingSalaryMax, setPendingSalaryMax] = useState('')
  const [pendingCompany, setPendingCompany] = useState('')
  const [pendingStatus, setPendingStatus] = useState('')
  const [pendingAppliedFrom, setPendingAppliedFrom] = useState('')
  const [pendingAppliedTo, setPendingAppliedTo] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [pendingSkills, setPendingSkills] = useState([])
  const [filterPanelOpen, setFilterPanelOpen] = useState(() => {
    const stored = window.localStorage.getItem('adminFilterPanelOpen')
    return stored ? JSON.parse(stored) : false
  })
  const [appliedFilters, setAppliedFilters] = useState({
    searchText: '',
    searchField: 'all',
    position: '',
    location: '',
    experience: '',
    workTypes: [],
    salaryMin: '',
    salaryMax: '',
    company: '',
    status: '',
    appliedFrom: '',
    appliedTo: '',
    skills: []
  })

  const chatScrollRef = useRef(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInputText, setChatInputText] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: '👋 Hi! I am your Resuming Buddy.\nI search only the local candidate database here in the admin panel.\nAsk me about skills, experience, location, salary or job roles.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [chatSuggestions, setChatSuggestions] = useState([
    '🔍 Find Candidates',
    '💼 By Skills',
    '📍 By Location'
  ])
  const [activeCandidate, setActiveCandidate] = useState(null)
  const [fullInfoOpen, setFullInfoOpen] = useState(false)
  const [fullInfoClosing, setFullInfoClosing] = useState(false)
  const closeTimeoutRef = useRef(null)

  const formatTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && fullInfoOpen && !fullInfoClosing) {
        closeFullInfo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullInfoOpen, fullInfoClosing])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const closeFullInfo = () => {
    if (!fullInfoOpen || fullInfoClosing) return
    setFullInfoClosing(true)
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setFullInfoOpen(false)
      setFullInfoClosing(false)
      setActiveCandidate(null)
      closeTimeoutRef.current = null
    }, 220)
  }

  const handleFullInfoOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeFullInfo()
    }
  }

  const handleFullInfoCloseClick = (event) => {
    event.stopPropagation()
    closeFullInfo()
  }

  const normalizeText = (value) => (value || '').toLowerCase()

  const parseNumber = (value) => {
    const parsed = Number(String(value).replace(/[^0-9\.]/g, ''))
    return Number.isNaN(parsed) ? null : parsed
  }

  const experienceFilterFromText = (text) => {
    if (/fresher|0\s*[\-–]?\s*2|0\s*to\s*2|0\s*2/i.test(text)) {
      return { min: 0, max: 2 }
    }
    if (/mid\s*level|2\s*[\-–]?\s*5|2\s*to\s*5/i.test(text)) {
      return { min: 2, max: 5 }
    }
    if (/senior|5\+|5\s*\+?\s*years|5\s*years\+?/i.test(text)) {
      return { min: 5, max: Infinity }
    }
    const explicit = text.match(/(\d+)\s*(?:\+)?\s*(?:years|yrs|year|y)\b/i)
    if (explicit) {
      const years = Number(explicit[1])
      return { min: years, max: years }
    }
    return null
  }

  const salaryFilterFromText = (text) => {
    if (/below\s*(\d+)/i.test(text)) {
      const match = text.match(/below\s*(\d+)/i)
      return { min: 0, max: Number(match[1]) }
    }
    if (/above\s*(\d+)/i.test(text)) {
      const match = text.match(/above\s*(\d+)/i)
      return { min: Number(match[1]), max: Infinity }
    }
    if (/([0-9]+)\s*(?:to|\-|–)\s*([0-9]+)/i.test(text)) {
      const match = text.match(/([0-9]+)\s*(?:to|\-|–)\s*([0-9]+)/i)
      return { min: Number(match[1]), max: Number(match[2]) }
    }
    return null
  }

  const textContainsTerm = (text, term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
  }

  const workTypeFilterFromText = (text) => {
    if (textContainsTerm(text, 'remote')) return 'Work From Home'
    if (textContainsTerm(text, 'hybrid')) return 'Hybrid'
    if (textContainsTerm(text, 'office') || textContainsTerm(text, 'onsite')) return 'In Office'
    return null
  }

  const locationFromText = (text) => {
    const cities = ['mumbai', 'pune', 'bangalore', 'hyderabad', 'delhi']
    return cities.find(city => textContainsTerm(text, city)) || null
  }

  const roleSkillTermsFromText = (text) => {
    const terms = new Set()
    const roleKeywords = ['hr', 'developer', 'manager', 'sap', 'react', 'python', 'frontend', 'backend', 'full stack', 'ui/ux', 'ux', 'data analyst', 'devops', 'qa', 'engineering', 'engineer', 'business analyst', 'sales']
    const skillKeywords = ['react', 'python', 'javascript', 'java', 'sql', 'aws', 'sap', 'excel', 'communication', 'management', 'node', 'angular', 'design']
    roleKeywords.forEach(keyword => { if (textContainsTerm(text, keyword)) terms.add(keyword) })
    skillKeywords.forEach(keyword => { if (textContainsTerm(text, keyword)) terms.add(keyword) })
    return Array.from(terms)
  }

  const isCandidateQuery = (text) => {
    return /candidate|candidates|skill|skills|experience|years|location|city|salary|role|position|developer|manager|hr|sap|react|python|remote|hybrid|office|resume|cv|count|total|how many/i.test(text)
  }

  const findLocalCandidates = (text) => {
    const searchText = normalizeText(text)
    const includeCount = /\b(how many|total|count)\b/i.test(text)
    const experienceFilter = experienceFilterFromText(text)
    const salaryFilter = salaryFilterFromText(text)
    const workTypeFilter = workTypeFilterFromText(text)
    const location = locationFromText(searchText)
    const roleSkillTerms = roleSkillTermsFromText(searchText)

    const matchesCandidate = (candidate) => {
      const position = normalizeText(candidate.positionApplied)
      const skills = (candidate.skills || []).map(normalizeText)
      const locationFields = [candidate.currentLocation, candidate.preferredLocation1, candidate.preferredLocation2]
        .filter(Boolean)
        .map(normalizeText)
      const salary = parseNumber(candidate.expectedSalary)
      const experience = parseNumber(candidate.experienceYears)

      if (location && !locationFields.some(field => field.includes(location))) {
        return false
      }

      if (workTypeFilter && normalizeText(candidate.workTypePreference) !== normalizeText(workTypeFilter)) {
        return false
      }

      if (salaryFilter && (salary === null || salary < salaryFilter.min || salary > salaryFilter.max)) {
        return false
      }

      if (experienceFilter) {
        if (experience === null) return false
        if (experience < experienceFilter.min || experience > experienceFilter.max) return false
      }

      if (roleSkillTerms.length > 0) {
        const hasRoleSkill = roleSkillTerms.some(term =>
          position.includes(term) || skills.some(skill => skill.includes(term))
        )
        if (!hasRoleSkill) return false
      }

      return true
    }

    const candidates = applications.filter(matchesCandidate)
    return {
      candidates,
      includeCount,
      roleSkillTerms,
      location,
      experienceFilter,
      salaryFilter,
      workTypeFilter
    }
  }

  const formatCandidateSummary = (candidate) => {
    const name = `${candidate.firstName || 'Unknown'} ${candidate.lastName || ''}`.trim()
    const position = candidate.positionApplied || 'Unknown Role'
    const experience = candidate.experienceYears ? `${candidate.experienceYears} yrs` : 'N/A'
    const location = candidate.currentLocation || candidate.preferredLocation1 || candidate.preferredLocation2 || 'N/A'
    const salary = parseNumber(candidate.expectedSalary) || 'N/A'
    return `${name} — ${position} | ${experience} | ${location} | ${salary}L`
  }

  const responseSuggestions = ({ found, context }) => {
    if (!found) {
      return ['Clear Filters', 'Show All Candidates', 'Try Different Skill']
    }
    if (context === 'location') {
      return ['Add Skill Filter', 'Add Salary Filter', 'Show All']
    }
    return ['Filter by Location', 'Filter by Salary', 'Sort by Experience']
  }

  const buildBuddyResponse = (query) => {
    const normalized = normalizeText(query)
    if (!isCandidateQuery(normalized)) {
      setChatSuggestions(['Show All Candidates', 'Try Different Skill', 'Filter by Location'])
      return '🤖 I am Resuming Buddy! I only know about candidates in your hiring database 😊'
    }

    const search = findLocalCandidates(query)
    const { candidates, includeCount, location, roleSkillTerms, experienceFilter, salaryFilter, workTypeFilter } = search
    const hasSearchIntent = location || roleSkillTerms.length > 0 || experienceFilter || salaryFilter || workTypeFilter
    const context = location ? 'location' : (roleSkillTerms.length > 0 ? 'role' : 'general')

    if (includeCount && !hasSearchIntent) {
      const total = applications.length
      const active = applications.filter(app => app.status === 'Applied' || app.status === 'Under Review' || app.status === 'Interview Scheduled').length
      const shortlisted = applications.filter(app => app.status === 'Shortlisted' || app.status === 'Selected').length
      const pending = applications.filter(app => app.status === 'Applied' || app.status === 'Under Review').length
      setChatSuggestions(['Filter by Role', 'Filter by Location', 'Show All Candidates'])
      return `📊 Total candidates in database: ${total}\n• Active applications: ${active}\n• Shortlisted: ${shortlisted}\n• Pending review: ${pending}`
    }

    if (candidates.length === 0) {
      setChatSuggestions(responseSuggestions({ found: false }))
      return `😔 No candidates found matching '${query}'\nTry searching by:\n• Different skill or role name\n• Different location\n• Different experience range`
    }

    const topResults = candidates.slice(0, 4)
    const formattedResults = topResults.map((candidate, index) => `${index + 1}. ${formatCandidateSummary(candidate)}`).join('\n')
    setChatSuggestions(responseSuggestions({ found: true, context }))
    return `🔍 Found ${candidates.length} candidates matching your search!\n\n${formattedResults}\n\nWant to refine further by location, salary or skills?`
  }

  const appendChatMessage = (message) => {
    setChatMessages(prev => [...prev, { ...message, id: `${message.role}-${Date.now()}` }])
  }

  const processChatQuery = (text) => {
    const trimmedText = text.trim()
    if (!trimmedText) return
    appendChatMessage({ role: 'admin', text: trimmedText, timestamp: formatTimestamp() })
    setChatInputText('')
    setIsTyping(true)

    setTimeout(() => {
      const response = buildBuddyResponse(trimmedText)
      appendChatMessage({ role: 'bot', text: response, timestamp: formatTimestamp() })
      setIsTyping(false)
      if (!chatOpen) setUnreadCount(prev => prev + 1)
    }, 800)
  }

  const handleToggleChat = () => {
    setChatOpen(prev => {
      const next = !prev
      if (next) setUnreadCount(0)
      return next
    })
  }

  const handleSendMessage = (event) => {
    if (event) event.preventDefault()
    processChatQuery(chatInputText)
  }

  const handleChipClick = (chip) => {
    processChatQuery(chip)
  }

  const handleClearChat = () => {
    setChatMessages([])
    setUnreadCount(0)
    setChatInputText('')
    setIsTyping(false)
    setChatSuggestions(['🔍 Find Candidates', '💼 By Skills', '📍 By Location'])
  }

  useEffect(() => {
    if (!chatOpen || !chatScrollRef.current) return
    const scrollContainer = chatScrollRef.current
    scrollContainer.scrollTop = scrollContainer.scrollHeight
  }, [chatMessages, isTyping, chatOpen])

  function handleDelete(id) {
    const application = applications.find(application => application.id === id)
    if (!application) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${application.firstName} ${application.lastName}?`
    )
    if (!confirmed) return

    const updated = applications.filter(application => application.id !== id)
    setApplications(updated)
    localStorage.setItem('kady_applications', JSON.stringify(updated))
  }

  function toggleRowExpanded(id) {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  useEffect(() => {
    async function loadApplications() {
      // Try fetching from backend first
      try {
        const { data: backendApps } = await api.get('/applications')
        if (Array.isArray(backendApps) && backendApps.length > 0) {
          // Merge backend data with local data for backward compatibility
          const localApps = JSON.parse(localStorage.getItem('kady_applications') || '[]')
          const localById = new Map(localApps.map(a => [a.uniqueId || a.id, a]))
          const merged = backendApps.map(b => {
            const local = localById.get(b.uniqueId || b.id)
            // prefer the backend status unless local has a more recent change
            return local && local.status !== b.status ? { ...b, status: local.status } : b
          })
          setApplications(merged.map(a => ({ ...a, status: a.status || 'Applied' })))
          return
        }
      } catch (_err) {
        // backend unavailable — use localStorage
      }

      // Fallback to localStorage
      const storedApplications = JSON.parse(localStorage.getItem('kady_applications') || '[]')
      setApplications(
        storedApplications.map(a => ({
          ...a,
          status: a.status || 'Applied'
        }))
      )
    }
    loadApplications()
  }, [])

  useEffect(() => {
    window.localStorage.setItem('adminFilterPanelOpen', JSON.stringify(filterPanelOpen))
  }, [filterPanelOpen])

  const lastSubmitted = applications.length
    ? new Date(applications[applications.length - 1].createdAt).toLocaleString()
    : '—'

  const positionOptions = [
    'SAP FICO',
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'DevOps Engineer',
    'QA Tester',
    'UI/UX Designer',
    'Business Analyst',
    'HR Executive',
    'Recruitment Specialist',
    'Sales Executive'
  ]

  const experienceOptions = [
    { value: '0-1', label: '0-1 yrs' },
    { value: '1-3', label: '1-3 yrs' },
    { value: '3-5', label: '3-5 yrs' },
    { value: '5+', label: '5+ yrs' }
  ]

  const workTypeOptions = ['Work from Home', 'In Office', 'Hybrid']

  const companyOptions = Array.from(new Set(applications.map(app => app.lastCompany).filter(Boolean)))
  const locationOptions = Array.from(
    new Set(
      applications
        .flatMap(app => [app.currentLocation, app.preferredLocation1, app.preferredLocation2])
        .filter(Boolean)
    )
  )

  function handleToggleWorkType(type) {
    setPendingWorkTypes(prev =>
      prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]
    )
  }

  function updateApplicationStatus(id, newStatus) {
    setApplications(prev => {
      const updated = prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
      try {
        localStorage.setItem('kady_applications', JSON.stringify(updated))
      } catch (err) {
        // ignore
      }
      return updated
    })

    // attempt backend sync. If backend not present, this will silently fail.
    api.patch(`/applications/${id}/status`, { status: newStatus }).catch(() => {})
  }

  function handleChangeStatus(id, status) {
    updateApplicationStatus(id, status)
  }

  function handleAddSkill() {
    const skill = skillInput.trim()
    if (!skill) return
    if (!pendingSkills.includes(skill)) {
      setPendingSkills(prev => [...prev, skill])
    }
    setSkillInput('')
  }

  function handleSkillInputKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  function handleRemoveAppliedFilter(key, value) {
    const nextApplied = { ...appliedFilters }
    const nextPending = {
      searchText: pendingFilterText,
      searchField: pendingFilterField,
      position: pendingPosition,
      location: pendingLocation,
      experience: pendingExperience,
      workTypes: pendingWorkTypes,
      salaryMin: pendingSalaryMin,
      salaryMax: pendingSalaryMax,
      company: pendingCompany,
      status: pendingStatus,
      appliedFrom: pendingAppliedFrom,
      appliedTo: pendingAppliedTo,
      skills: pendingSkills
    }

    switch (key) {
      case 'searchText':
      case 'position':
      case 'location':
      case 'experience':
      case 'company':
      case 'status':
        nextApplied[key] = ''
        nextPending[key] = ''
        break
      case 'salary':
        nextApplied.salaryMin = ''
        nextApplied.salaryMax = ''
        nextPending.salaryMin = ''
        nextPending.salaryMax = ''
        break
      case 'appliedDate':
        nextApplied.appliedFrom = ''
        nextApplied.appliedTo = ''
        nextPending.appliedFrom = ''
        nextPending.appliedTo = ''
        break
      case 'workType':
        nextApplied.workTypes = nextApplied.workTypes.filter(item => item !== value)
        nextPending.workTypes = nextPending.workTypes.filter(item => item !== value)
        break
      case 'skill':
        nextApplied.skills = nextApplied.skills.filter(item => item !== value)
        nextPending.skills = nextPending.skills.filter(item => item !== value)
        break
      default:
        return
    }

    setAppliedFilters(nextApplied)
    setPendingFilterText(nextPending.searchText)
    setPendingFilterField(nextPending.searchField)
    setPendingPosition(nextPending.position)
    setPendingLocation(nextPending.location)
    setPendingExperience(nextPending.experience)
    setPendingWorkTypes(nextPending.workTypes)
    setPendingSalaryMin(nextPending.salaryMin)
    setPendingSalaryMax(nextPending.salaryMax)
    setPendingCompany(nextPending.company)
    setPendingStatus(nextPending.status)
    setPendingAppliedFrom(nextPending.appliedFrom)
    setPendingAppliedTo(nextPending.appliedTo)
    setPendingSkills(nextPending.skills)
  }

  function handleApplyFilters() {
    setFilterText(pendingFilterText)
    setFilterField(pendingFilterField)
    setAppliedFilters({
      searchText: pendingFilterText,
      searchField: pendingFilterField,
      position: pendingPosition,
      location: pendingLocation,
      experience: pendingExperience,
      workTypes: pendingWorkTypes,
      salaryMin: pendingSalaryMin,
      salaryMax: pendingSalaryMax,
      status: pendingStatus,
      appliedFrom: pendingAppliedFrom,
      appliedTo: pendingAppliedTo,
      company: pendingCompany,
      skills: pendingSkills
    })
  }

  function handleClearFilters() {
    setPendingFilterText('')
    setPendingFilterField('all')
    setPendingPosition('')
    setPendingLocation('')
    setPendingExperience('')
    setPendingWorkTypes([])
    setPendingSalaryMin('')
    setPendingSalaryMax('')
    setPendingCompany('')
    setPendingStatus('')
    setPendingAppliedFrom('')
    setPendingAppliedTo('')
    setSkillInput('')
    setPendingSkills([])
    setFilterText('')
    setFilterField('all')
    setAppliedFilters({
      searchText: '',
      searchField: 'all',
      position: '',
      location: '',
      experience: '',
      workTypes: [],
      salaryMin: '',
      salaryMax: '',
      company: '',
      status: '',
      appliedFrom: '',
      appliedTo: '',
      skills: []
    })
  }

  const activeFilterCount = [
    appliedFilters.searchText,
    appliedFilters.position,
    appliedFilters.location,
    appliedFilters.experience,
    appliedFilters.company,
    appliedFilters.salaryMin || appliedFilters.salaryMax,
    appliedFilters.status,
    appliedFilters.appliedFrom || appliedFilters.appliedTo,
    appliedFilters.workTypes.length && appliedFilters.workTypes,
    appliedFilters.skills.length && appliedFilters.skills
  ].filter(Boolean).length

  const filterChips = []
  if (appliedFilters.searchText) {
    filterChips.push({ key: 'searchText', label: `Search: ${appliedFilters.searchText}` })
  }
  if (appliedFilters.position) {
    filterChips.push({ key: 'position', label: `Role: ${appliedFilters.position}` })
  }
  if (appliedFilters.location) {
    filterChips.push({ key: 'location', label: `Location: ${appliedFilters.location}` })
  }
  if (appliedFilters.experience) {
    const option = experienceOptions.find(opt => opt.value === appliedFilters.experience)
    filterChips.push({ key: 'experience', label: `Experience: ${option ? option.label : appliedFilters.experience}` })
  }
  if (appliedFilters.status) {
    filterChips.push({ key: 'status', label: `Status: ${appliedFilters.status}` })
  }
  if (appliedFilters.salaryMin || appliedFilters.salaryMax) {
    const min = appliedFilters.salaryMin || 'Min'
    const max = appliedFilters.salaryMax || 'Max'
    filterChips.push({ key: 'salary', label: `Salary: ${min} - ${max}` })
  }
  if (appliedFilters.appliedFrom || appliedFilters.appliedTo) {
    const from = appliedFilters.appliedFrom || 'Any'
    const to = appliedFilters.appliedTo || 'Any'
    filterChips.push({ key: 'appliedDate', label: `Applied: ${from} → ${to}` })
  }
  if (appliedFilters.company) {
    filterChips.push({ key: 'company', label: `Company: ${appliedFilters.company}` })
  }
  appliedFilters.workTypes.forEach(type => {
    filterChips.push({ key: 'workType', value: type, label: `Work Type: ${type}` })
  })
  appliedFilters.skills.forEach(skill => {
    filterChips.push({ key: 'skill', value: skill, label: `Skill: ${skill}` })
  })

  const filteredApplications = applications.filter(application => {
    const query = appliedFilters.searchText.toLowerCase().trim()
    const fields = {
      all: [
        `${application.firstName} ${application.lastName}`,
        application.positionApplied,
        application.email,
        application.phone,
        application.lastCompany,
        application.uniqueId
      ],
      name: `${application.firstName} ${application.lastName}`,
      position: application.positionApplied,
      email: application.email,
      phone: application.phone,
      company: application.lastCompany,
      id: application.uniqueId
    }

    if (query) {
      const selectedValue = fields[appliedFilters.searchField] || fields.all
      const values = Array.isArray(selectedValue) ? selectedValue : [selectedValue]
      if (!values.some(value => value?.toLowerCase().includes(query))) {
        return false
      }
    }

    if (appliedFilters.position && !`${application.positionApplied || ''}`.toLowerCase().includes(appliedFilters.position.toLowerCase())) {
      return false
    }

    if (appliedFilters.company && !`${application.lastCompany || ''}`.toLowerCase().includes(appliedFilters.company.toLowerCase())) {
      return false
    }

    if (appliedFilters.location) {
      const locationMatch = [application.currentLocation, application.preferredLocation1, application.preferredLocation2]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(appliedFilters.location.toLowerCase()))
      if (!locationMatch) {
        return false
      }
    }

    if (appliedFilters.experience) {
      const years = Number(application.experienceYears)
      if (appliedFilters.experience === '0-1' && !(years >= 0 && years <= 1)) return false
      if (appliedFilters.experience === '1-3' && !(years >= 1 && years <= 3)) return false
      if (appliedFilters.experience === '3-5' && !(years >= 3 && years <= 5)) return false
      if (appliedFilters.experience === '5+' && !(years > 5)) return false
    }

    if (appliedFilters.workTypes.length > 0 && !appliedFilters.workTypes.includes(application.workTypePreference)) {
      return false
    }

    if (appliedFilters.salaryMin) {
      const expectedSalary = Number(application.expectedSalary)
      if (isNaN(expectedSalary) || expectedSalary < Number(appliedFilters.salaryMin)) {
        return false
      }
    }

    if (appliedFilters.salaryMax) {
      const expectedSalary = Number(application.expectedSalary)
      if (isNaN(expectedSalary) || expectedSalary > Number(appliedFilters.salaryMax)) {
        return false
      }
    }

    if (appliedFilters.status) {
      if ((application.status || '').toLowerCase() !== appliedFilters.status.toLowerCase()) {
        return false
      }
    }

    if (appliedFilters.appliedFrom || appliedFilters.appliedTo) {
      const createdAt = application.createdAt ? new Date(application.createdAt) : null
      if (!createdAt || Number.isNaN(createdAt.getTime())) return false
      if (appliedFilters.appliedFrom) {
        const fromDate = new Date(appliedFilters.appliedFrom)
        if (!Number.isNaN(fromDate.getTime()) && createdAt < fromDate) return false
      }
      if (appliedFilters.appliedTo) {
        const toDate = new Date(appliedFilters.appliedTo)
        if (!Number.isNaN(toDate.getTime()) && createdAt > toDate) return false
      }
    }

    if (appliedFilters.skills.length > 0) {
      const candidateSkills = (application.skills || []).map(skill => skill.toLowerCase())
      if (!appliedFilters.skills.every(skill => candidateSkills.includes(skill.toLowerCase()))) {
        return false
      }
    }

    return true
  })

  const lastFiltered = filteredApplications.length

  const renderCardView = () => (
    <div className="application-list">
      {filteredApplications.map(application => (
        <article key={application.id} className="application-card">
          <div className="application-card-header">
            <div>
              <h3>{application.firstName} {application.lastName}</h3>
              <p className="muted">{application.positionApplied || 'Position not specified'}</p>
              <p className="muted">ID: {application.uniqueId || 'N/A'}</p>
            </div>
            <div className="card-header-actions">
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDelete(application.id)}
                title="Delete candidate"
              >
                🗑️
              </button>
              <div className="status-control">
                <span className={`status-badge status-${(application.status || 'Applied')
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}>{application.status || 'Applied'}</span>
                <select
                  className="status-select"
                  value={application.status || 'Applied'}
                  onChange={e => handleChangeStatus(application.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="application-grid">
            <div className="application-item">
              <strong>Contact</strong>
              {application.phone || 'N/A'}
            </div>
            <div className="application-item">
              <strong>Email</strong>
              {application.email || 'N/A'}
            </div>
            <div className="application-item">
              <strong>Experience</strong>
              {application.experienceYears ? `${application.experienceYears} years` : 'N/A'}
            </div>
            <div className="application-item">
              <strong>Relevant Field</strong>
              {application.relevantExp || 'N/A'}
            </div>
            <div className="application-item">
              <strong>Last Company</strong>
              {application.lastCompany || 'N/A'}
            </div>
            <div className="application-item">
              <strong>Expected Salary</strong>
              {application.expectedSalary || 'N/A'}
            </div>
            <div className="application-item">
              <strong>Resume</strong>
              {application.resumeName ? (
                <a
                  href={application.resumeData}
                  target="_blank"
                  rel="noreferrer"
                  className="resume-link"
                >
                  {application.resumeName}
                </a>
              ) : (
                'N/A'
              )}
            </div>
          </div>
          <button
            type="button"
            className="card-view-full-info-btn"
            onClick={() => {
              if (closeTimeoutRef.current) {
                window.clearTimeout(closeTimeoutRef.current)
                closeTimeoutRef.current = null
              }
              setActiveCandidate(application)
              setFullInfoClosing(false)
              setFullInfoOpen(true)
            }}
          >
            View Full Information
            <span className="card-view-btn-icon">→</span>
          </button>
        </article>
      ))}
    </div>
  )

  const renderTableView = () => (
    <div className="application-table-wrapper">
      <table className="application-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>ID</th>
            <th>Name</th>
            <th>Position</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Resume</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.map(application => (
            <React.Fragment key={application.id}>
              <tr className={expandedRows.has(application.id) ? 'expanded-row' : ''}>
                <td>
                  <button
                    type="button"
                    className="expand-btn"
                    onClick={() => toggleRowExpanded(application.id)}
                    title={expandedRows.has(application.id) ? 'Collapse details' : 'Expand details'}
                  >
                    <span className={`chevron ${expandedRows.has(application.id) ? 'chevron-down' : ''}`}>›</span>
                  </button>
                </td>
                <td>{application.uniqueId || 'N/A'}</td>
                <td>{application.firstName} {application.lastName}</td>
                <td>{application.positionApplied || 'N/A'}</td>
                <td>{application.email || 'N/A'}</td>
                <td>{application.phone || 'N/A'}</td>
                <td>
                  <div className="status-control table-status">
                    <span className={`status-badge status-${(application.status || 'Applied')
                      .toLowerCase()
                      .replace(/\s+/g, '-')}`}>{application.status || 'Applied'}</span>
                    <select
                      className="status-select"
                      value={application.status || 'Applied'}
                      onChange={e => handleChangeStatus(application.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  {application.resumeName ? (
                    <a href={application.resumeData} target="_blank" rel="noreferrer" className="resume-link">
                      {application.resumeName}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="delete-btn table-delete-btn"
                    onClick={() => handleDelete(application.id)}
                    title="Delete candidate"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              {expandedRows.has(application.id) && (
                <tr className="detail-row">
                  <td colSpan="9">
                    <div className="detail-row-panel">
                      <div className="detail-row-top">
                        <div className="detail-row-main">
                          <div className="detail-row-field">
                            <span className="detail-row-label">Name</span>
                            <span className="detail-row-value">{application.firstName} {application.lastName}</span>
                          </div>
                          <div className="detail-row-field">
                            <span className="detail-row-label">Email</span>
                            <span className="detail-row-value">{application.email || 'N/A'}</span>
                          </div>
                          <div className="detail-row-field">
                            <span className="detail-row-label">Phone</span>
                            <span className="detail-row-value">{application.phone || 'N/A'}</span>
                          </div>
                          <div className="detail-row-field">
                            <span className="detail-row-label">Position</span>
                            <span className="detail-row-value">{application.positionApplied || 'N/A'}</span>
                          </div>
                          <div className="detail-row-field">
                            <span className="detail-row-label">Experience</span>
                            <span className="detail-row-value">{application.experienceYears ? `${application.experienceYears} yrs` : 'N/A'}</span>
                          </div>
                          <div className="detail-row-field">
                            <span className="detail-row-label">Location</span>
                            <span className="detail-row-value">{application.currentLocation || application.preferredLocation1 || 'N/A'}</span>
                          </div>
                          <div className="detail-row-field">
                            <span className="detail-row-label">Work Type</span>
                            <span className="detail-row-value">{application.workTypePreference || 'N/A'}</span>
                          </div>
                          <div className="detail-row-field">
                            <span className="detail-row-label">Date Applied</span>
                            <span className="detail-row-value">{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="detail-row-status">
                          <span className={`status-badge status-${(application.status || 'Applied').toLowerCase().replace(/\s+/g, '-')}`}>
                            {application.status || 'Applied'}
                          </span>
                        </div>
                      </div>

                      <div className="detail-row-skills">
                        <span className="detail-row-label">Skills</span>
                        <div className="skills-display">
                          {application.skills && application.skills.length > 0 ? (
                            application.skills.map((skill, idx) => (
                              <span key={idx} className="skill-badge">{skill}</span>
                            ))
                          ) : (
                            <span className="detail-value">No skills listed</span>
                          )}
                        </div>
                      </div>

                      <div className="detail-row-footer">
                        <button
                          type="button"
                          className="view-full-info-btn"
                          onClick={() => {
                            if (closeTimeoutRef.current) {
                              window.clearTimeout(closeTimeoutRef.current)
                              closeTimeoutRef.current = null
                            }
                            setActiveCandidate(application)
                            setFullInfoClosing(false)
                            setFullInfoOpen(true)
                          }}
                        >
                          View Full Information →
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderListView = () => (
    <ul className="application-list-view">
      {filteredApplications.map(application => (
        <li key={application.id} className="application-list-item">
          <div className="list-view-top">
            <div>
              <strong>{application.firstName} {application.lastName}</strong>
              <p className="muted">{application.positionApplied || 'Position not specified'}</p>
            </div>
            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDelete(application.id)}
              title="Delete candidate"
            >
              🗑️
            </button>
              <div className="status-control list-status">
                <span className={`status-badge status-${(application.status || 'Applied')
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}>{application.status || 'Applied'}</span>
                <select
                  className="status-select"
                  value={application.status || 'Applied'}
                  onChange={e => handleChangeStatus(application.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
          </div>
          <div className="application-list-meta">
            <span>{application.email || 'N/A'}</span>
            <span>{application.phone || 'N/A'}</span>
            <span>
              {application.resumeName ? (
                <a href={application.resumeData} target="_blank" rel="noreferrer" className="resume-link">
                  View Resume
                </a>
              ) : (
                'No resume'
              )}
            </span>
          </div>
          <div className="list-view-actions">
            <button
              type="button"
              className="list-view-full-info-btn"
              onClick={() => {
                if (closeTimeoutRef.current) {
                  window.clearTimeout(closeTimeoutRef.current)
                  closeTimeoutRef.current = null
                }
                setActiveCandidate(application)
                setFullInfoClosing(false)
                setFullInfoOpen(true)
              }}
            >
              <span className="list-view-btn-icon">👁️</span>
              View Full Information
            </button>
          </div>
        </li>
      ))}
    </ul>
  )

  const renderTitlesView = () => (
    <div className="title-view-grid">
      {filteredApplications.map(application => (
        <div key={application.id} className="title-view-card">
          <div className="title-card-header">
            <h3>{application.firstName} {application.lastName}</h3>
            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDelete(application.id)}
              title="Delete candidate"
            >
              🗑️
            </button>
            <div className="status-control title-status">
              <span className={`status-badge status-${(application.status || 'Applied')
                .toLowerCase()
                .replace(/\s+/g, '-')}`}>{application.status || 'Applied'}</span>
              <select
                className="status-select"
                value={application.status || 'Applied'}
                onChange={e => handleChangeStatus(application.id, e.target.value)}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <p>{application.positionApplied || 'No position'}</p>
          <p className="muted">{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Unknown date'}</p>
          <button
            type="button"
            className="title-card-overlay"
            onClick={() => {
              if (closeTimeoutRef.current) {
                window.clearTimeout(closeTimeoutRef.current)
                closeTimeoutRef.current = null
              }
              setActiveCandidate(application)
              setFullInfoClosing(false)
              setFullInfoOpen(true)
            }}
          >
            <span>View Full Information <span className="title-overlay-icon">→</span></span>
          </button>
        </div>
      ))}
    </div>
  )

  const renderCurrentView = () => {
    if (viewMode === 'table') return renderTableView()
    if (viewMode === 'list') return renderListView()
    if (viewMode === 'titles') return renderTitlesView()
    return renderCardView()
  }

  return (
    <>
      <section className="card admin-dashboard-card">
        <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="badge">Admin Panel</span>
          <div>
            <h2>Candidate Applications</h2>
            <p className="muted">Review the latest applications submitted through the portal.</p>
          </div>
        </div>
        <div className="admin-header-right">
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => setFilterPanelOpen(prev => !prev)}
          >
            {filterPanelOpen ? '🔼 Hide Filters' : '🔽 Show Filters'}
            {activeFilterCount > 0 && (
              <span className="filter-toggle-count">{activeFilterCount}</span>
            )}
          </button>
          <TimezoneWidget />
          <button
            type="button"
            className="logout-btn"
            onClick={async () => {
              try {
                await api.post('/auth/logout')
              } catch (_err) {
                // best-effort: clear locally regardless
              }
              localStorage.removeItem('kady_admin_token')
              localStorage.removeItem('kady_admin_user')
              onLogout?.()
            }}
            title="Logout"
          >
            <span>Logout</span>
            <span className="logout-icon">→</span>
          </button>
        </div>
      </div>

      {filterChips.length > 0 && (
        <div className="active-filter-chips">
          {filterChips.map(chip => (
            <span key={`${chip.key}-${chip.value || chip.label}`} className="filter-chip">
              {chip.label}
              <button
                type="button"
                onClick={() => handleRemoveAppliedFilter(chip.key, chip.value)}
                aria-label={`Remove ${chip.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="admin-summary">
        <div className="summary-item">
          <span>Total Applications</span>
          <strong>{applications.length}</strong>
        </div>
        <div className="summary-item">
          <span>Showing</span>
          <strong>{lastFiltered}</strong>
        </div>
        <div className="summary-item">
          <span>Last Submitted</span>
          <strong>{lastSubmitted}</strong>
        </div>
      </div>

      <div className={`admin-filter-panel ${filterPanelOpen ? 'open' : 'collapsed'}`}>
        <div className="filter-panel-header">
          <div>
            <h3>Candidate Filters</h3>
            <p className="muted">Choose criteria and click Apply Filters to update the list.</p>
          </div>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount} active</span>
          )}
        </div>

        <div className="filter-grid">
          <div className="filter-box">
            <label htmlFor="filter-text">Keyword Search</label>
            <input
              id="filter-text"
              type="text"
              value={pendingFilterText}
              onChange={e => setPendingFilterText(e.target.value)}
              placeholder="Search name, position, email, company..."
              className="filter-input"
            />
          </div>

          <div className="filter-box">
            <label htmlFor="filter-field">Search In</label>
            <select
              id="filter-field"
              value={pendingFilterField}
              onChange={e => setPendingFilterField(e.target.value)}
              className="view-select"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="position">Position</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="company">Company</option>
              <option value="id">Unique ID</option>
            </select>
          </div>

          <div className="filter-box">
            <label htmlFor="position-filter">Position / Role</label>
            <input
              id="position-filter"
              list="position-options"
              value={pendingPosition}
              onChange={e => setPendingPosition(e.target.value)}
              placeholder="Any position"
              className="filter-input"
            />
            <datalist id="position-options">
              {positionOptions.map(position => (
                <option key={position} value={position} />
              ))}
            </datalist>
          </div>

          <div className="filter-box">
            <label htmlFor="location-filter">Location</label>
            <input
              id="location-filter"
              list="location-options"
              type="text"
              value={pendingLocation}
              onChange={e => setPendingLocation(e.target.value)}
              placeholder="City or region"
              className="filter-input"
            />
            <datalist id="location-options">
              {locationOptions.map(location => (
                <option key={location} value={location} />
              ))}
            </datalist>
          </div>

          <div className="filter-box">
            <label htmlFor="experience-filter">Experience</label>
            <select
              id="experience-filter"
              value={pendingExperience}
              onChange={e => setPendingExperience(e.target.value)}
              className="view-select"
            >
              <option value="">Any experience</option>
              {experienceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-box">
            <label>Work Type Preference</label>
            <div className="work-type-options">
              {workTypeOptions.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`chip ${pendingWorkTypes.includes(type) ? 'chip-selected' : ''}`}
                  onClick={() => handleToggleWorkType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-box">
            <label htmlFor="status-filter">Application Status</label>
            <select
              id="status-filter"
              value={pendingStatus}
              onChange={e => setPendingStatus(e.target.value)}
              className="view-select"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="filter-box">
            <label>Salary Range</label>
            <div className="salary-range-row">
              <input
                type="number"
                min="0"
                value={pendingSalaryMin}
                onChange={e => setPendingSalaryMin(e.target.value)}
                placeholder="Min"
                className="filter-input"
              />
              <input
                type="number"
                min="0"
                value={pendingSalaryMax}
                onChange={e => setPendingSalaryMax(e.target.value)}
                placeholder="Max"
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-box filter-box-full">
            <label>Date Applied</label>
            <div className="salary-range-row">
              <input
                type="date"
                value={pendingAppliedFrom}
                onChange={e => setPendingAppliedFrom(e.target.value)}
                className="filter-input"
              />
              <input
                type="date"
                value={pendingAppliedTo}
                onChange={e => setPendingAppliedTo(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-box">
            <label htmlFor="company-filter">Company</label>
            <select
              id="company-filter"
              value={pendingCompany}
              onChange={e => setPendingCompany(e.target.value)}
              className="view-select"
            >
              <option value="">Any company</option>
              {companyOptions.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="filter-box filter-box-full">
            <label htmlFor="skills-filter">Skills</label>
            <div className="skills-input-row">
              <input
                id="skills-filter"
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillInputKeyDown}
                placeholder="Add skill tag and press Enter"
                className="filter-input"
              />
              <button type="button" className="tag-add-btn" onClick={handleAddSkill}>
                Add
              </button>
            </div>
            <div className="skill-tags">
              {pendingSkills.map(skill => (
                <span key={skill} className="skill-tag">
                  {skill}
                  <button type="button" className="skill-remove-btn" onClick={() => setPendingSkills(prev => prev.filter(item => item !== skill))}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button type="button" className="apply-filters-btn" onClick={handleApplyFilters}>
            Apply Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
          <button type="button" className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="admin-controls">
        <div className="view-group">
          <label className="view-mode-label" htmlFor="view-mode-select">
            View Mode
          </label>
          <select
            id="view-mode-select"
            value={viewMode}
            onChange={e => setViewMode(e.target.value)}
            className="view-select"
          >
            {VIEW_MODES.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          No applications found yet. Candidates will appear here after submitting the form.
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="empty-state">
          No candidates match your filter. Try a different search term.
        </div>
      ) : (
        renderCurrentView()
      )}
    </section>

      {(fullInfoOpen || fullInfoClosing) && activeCandidate && (
        <div className={`full-info-overlay ${fullInfoClosing ? 'closing' : 'open'}`} onClick={handleFullInfoOverlayClick}>
          <div className={`full-info-modal ${fullInfoClosing ? 'closing' : 'open'}`} onClick={e => e.stopPropagation()}>
            <button type="button" className="full-info-close" onClick={e => { e.stopPropagation(); closeFullInfo() }} aria-label="Close full information">
              ×
            </button>
            <div className="full-info-header">
              <div className="full-info-avatar">{`${activeCandidate.firstName?.[0] || ''}${activeCandidate.lastName?.[0] || ''}`.toUpperCase()}</div>
              <div>
                <h2>{activeCandidate.firstName} {activeCandidate.lastName}</h2>
                <p className="full-info-role">{activeCandidate.positionApplied || 'Position not specified'}</p>
                <p className="full-info-date">Applied on {activeCandidate.createdAt ? new Date(activeCandidate.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <span className={`status-badge status-${(activeCandidate.status || 'Applied').toLowerCase().replace(/\s+/g, '-')}`}>
                {activeCandidate.status || 'Applied'}
              </span>
            </div>

            <div className="full-info-body">
              <section className="full-info-section">
                <h3>Personal Details</h3>
                <div className="full-info-grid">
                  <div className="full-info-row"><span>Full Name</span><span>{activeCandidate.firstName} {activeCandidate.lastName}</span></div>
                  <div className="full-info-row"><span>Primary Email</span><span>{activeCandidate.email || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Alternative Email</span><span>{activeCandidate.alternativeEmail || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Primary Phone</span><span>{activeCandidate.phone || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Alternative Phone</span><span>{activeCandidate.alternativePhone || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Current Location</span><span>{activeCandidate.currentLocation || 'N/A'}</span></div>
                </div>
              </section>

              <section className="full-info-section">
                <h3>Position & Experience</h3>
                <div className="full-info-grid">
                  <div className="full-info-row"><span>Position Applied For</span><span>{activeCandidate.positionApplied || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Current Position</span><span>{activeCandidate.currentPosition || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Company Name</span><span>{activeCandidate.lastCompany || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Start Date → End Date</span><span>{activeCandidate.employmentStart || 'N/A'} → {activeCandidate.employmentEnd || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Total Experience</span><span>{activeCandidate.experienceYears ? `${activeCandidate.experienceYears} yrs` : 'N/A'}</span></div>
                  <div className="full-info-row"><span>Relevant Experience</span><span>{activeCandidate.relevantExp || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Is Fresher</span><span>{activeCandidate.isFresher ? 'Yes' : 'No'}</span></div>
                  <div className="full-info-row"><span>Work Type Preference</span><span>{activeCandidate.workTypePreference || 'N/A'}</span></div>
                </div>
              </section>

              <section className="full-info-section">
                <h3>Location Preferences</h3>
                <div className="full-info-grid">
                  <div className="full-info-row"><span>Current Location</span><span>{activeCandidate.currentLocation || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Preferred Location 1</span><span>{activeCandidate.preferredLocation1 || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Preferred Location 2</span><span>{activeCandidate.preferredLocation2 || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Work Type</span><span>{activeCandidate.workTypePreference || 'N/A'}</span></div>
                </div>
              </section>

              <section className="full-info-section">
                <h3>Salary & Company</h3>
                <div className="full-info-grid">
                  <div className="full-info-row"><span>Current Salary</span><span>{activeCandidate.currentSalary || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Expected Salary</span><span>{activeCandidate.expectedSalary || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Current Company</span><span>{activeCandidate.lastCompany || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Company Duration</span><span>{activeCandidate.companyStart || 'N/A'} → {activeCandidate.companyEnd || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Total Years at Company</span><span>{activeCandidate.companyYears || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Bonus Received</span><span>{activeCandidate.bonusReceived ? 'Yes' : 'No'}</span></div>
                </div>
              </section>

              <section className="full-info-section">
                <h3>Education Details</h3>
                <div className="full-info-grid">
                  <div className="full-info-row"><span>Degree / Qualification</span><span>{activeCandidate.degree || 'N/A'}</span></div>
                  <div className="full-info-row"><span>University / Institute</span><span>{activeCandidate.university || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Field of Study</span><span>{activeCandidate.fieldOfStudy || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Start → End Year</span><span>{activeCandidate.educationStart || 'N/A'} → {activeCandidate.educationEnd || 'N/A'}</span></div>
                  <div className="full-info-row"><span>Grade / CGPA</span><span>{activeCandidate.grade || 'N/A'}</span></div>
                </div>
                {activeCandidate.educationHistory && activeCandidate.educationHistory.length > 0 && (
                  <div className="education-history">
                    {activeCandidate.educationHistory.map((item, idx) => (
                      <div key={idx} className="education-entry">
                        <span>{item.degree || 'N/A'} — {item.institute || 'N/A'}</span>
                        <span>{item.startYear || 'N/A'} → {item.endYear || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="full-info-section">
                <h3>Skills</h3>
                <div className="skills-display">
                  {activeCandidate.skills && activeCandidate.skills.length > 0 ? (
                    activeCandidate.skills.map((skill, idx) => (
                      <span key={idx} className="skill-badge">{skill}</span>
                    ))
                  ) : (
                    <span className="detail-value">No skills listed</span>
                  )}
                </div>
              </section>

              <section className="full-info-section">
                <h3>Documents</h3>
                <div className="document-grid">
                  {activeCandidate.resumeData ? (
                    <div className="document-card">
                      <div className="document-meta">
                        <span className="document-title">Resume</span>
                        <span className="document-name">{activeCandidate.resumeName || 'Resume'}</span>
                      </div>
                      <a className="document-download" href={activeCandidate.resumeData} target="_blank" rel="noreferrer">Download</a>
                    </div>
                  ) : (
                    <div className="document-card document-empty">No resume available</div>
                  )}
                  {[activeCandidate.salarySlip1, activeCandidate.salarySlip2, activeCandidate.salarySlip3].map((file, idx) => file ? (
                    <div key={idx} className="document-card">
                      <div className="document-meta">
                        <span className="document-title">Salary Slip</span>
                        <span className="document-name">Slip {idx + 1}</span>
                      </div>
                      <a className="document-download" href={file} target="_blank" rel="noreferrer">Download</a>
                    </div>
                  ) : null)}
                  {activeCandidate.bonusSlip && (
                    <div className="document-card">
                      <div className="document-meta">
                        <span className="document-title">Bonus Slip</span>
                        <span className="document-name">Bonus Slip</span>
                      </div>
                      <a className="document-download" href={activeCandidate.bonusSlip} target="_blank" rel="noreferrer">Download</a>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="full-info-actions">
              <button type="button" className="action-btn action-shortlist" onClick={() => handleChangeStatus(activeCandidate.id, 'Shortlisted')}>
                Shortlist
              </button>
              <button type="button" className="action-btn action-reject" onClick={() => handleChangeStatus(activeCandidate.id, 'Rejected')}>
                Reject
              </button>
              <button type="button" className="action-btn action-hold" onClick={() => handleChangeStatus(activeCandidate.id, 'On Hold')}>
                On Hold
              </button>
              <button
                type="button"
                className="action-btn action-download"
                onClick={() => activeCandidate.resumeData && window.open(activeCandidate.resumeData, '_blank')}
              >
                Download Resume
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`chat-toggle-button ${chatOpen ? 'open' : ''}`}
        onClick={handleToggleChat}
        title="Resuming Buddy"
      >
        <span className="chat-toggle-icon">{chatOpen ? '✕' : '💬'}</span>
        {unreadCount > 0 && !chatOpen && (
          <span className="chat-unread-badge">{unreadCount}</span>
        )}
      </button>

      <div className={`chat-window ${chatOpen ? 'chat-open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">🤖</div>
            <div>
              <div className="chat-title">Resuming Buddy</div>
              <div className="chat-status">🟢 Online — Ask me anything</div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button type="button" className="chat-header-button" onClick={() => setChatOpen(false)}>
              —
            </button>
            <button type="button" className="chat-header-button" onClick={handleToggleChat}>
              ✕
            </button>
          </div>
        </div>

        <div className="chat-body">
          {chatMessages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="robot-illustration">🤖</div>
              <div className="empty-text">Start a conversation!</div>
            </div>
          ) : (
            <div className="chat-messages" ref={chatScrollRef}>
              {chatMessages.map(message => (
                <div key={message.id} className={`chat-message ${message.role === 'bot' ? 'bot-message' : 'admin-message'}`}>
                  {message.role === 'bot' && <div className="message-author">Resuming Buddy</div>}
                  <div className="message-bubble">
                    {message.text.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message bot-message typing-indicator">
                  <div className="message-author">Resuming Buddy</div>
                  <div className="typing-bubble">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {chatMessages.length > 0 && (
            <div className="chat-chips">
              {chatSuggestions.map(chip => (
                <button key={chip} type="button" className="chip quick-reply-chip" onClick={() => handleChipClick(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="chat-input-bar" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            value={chatInputText}
            onChange={e => setChatInputText(e.target.value)}
            placeholder="Ask me anything about candidates..."
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={!chatInputText.trim()}
          >
            ➤
          </button>
        </form>

        <button type="button" className="chat-clear-button" onClick={handleClearChat}>
          Clear chat
        </button>
      </div>
    </>
  )
}
