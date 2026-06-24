import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogContent,
  Avatar,
  Divider,
  Badge,
  Fab,
  Link as MuiLink,
  Tooltip
} from '@mui/material'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import TimezoneWidget from './TimezoneWidget'
import { fetchApplications, changeStatus, deleteApplication } from '../store/applicationsSlice'
import { logout } from '../store/authSlice'

const VIEW_MODES = [
  { value: 'card', label: 'Card' },
  { value: 'table', label: 'Table' },
  { value: 'list', label: 'List' },
  { value: 'titles', label: 'Titles' }
]

const STATUS_OPTIONS = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
  'Rejected',
  'On Hold'
]

const STATUS_COLOR = {
  Applied: 'default',
  'Under Review': 'info',
  Shortlisted: 'primary',
  'Interview Scheduled': 'secondary',
  Selected: 'success',
  Rejected: 'error',
  'On Hold': 'warning'
}

const statusColor = status => STATUS_COLOR[status] || 'default'

export default function AdminDashboard({ onLogout }) {
  const dispatch = useDispatch()
  const applications = useSelector(state => state.applications.items)

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

  const formatTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    dispatch(fetchApplications())
  }, [dispatch])

  const openFullInfo = application => {
    setActiveCandidate(application)
    setFullInfoOpen(true)
  }

  const closeFullInfo = () => {
    setFullInfoOpen(false)
    setActiveCandidate(null)
  }

  const normalizeText = value => (value || '').toLowerCase()

  const parseNumber = value => {
    const parsed = Number(String(value).replace(/[^0-9.]/g, ''))
    return Number.isNaN(parsed) ? null : parsed
  }

  const experienceFilterFromText = text => {
    if (/fresher|0\s*[\-–]?\s*2|0\s*to\s*2|0\s*2/i.test(text)) return { min: 0, max: 2 }
    if (/mid\s*level|2\s*[\-–]?\s*5|2\s*to\s*5/i.test(text)) return { min: 2, max: 5 }
    if (/senior|5\+|5\s*\+?\s*years|5\s*years\+?/i.test(text)) return { min: 5, max: Infinity }
    const explicit = text.match(/(\d+)\s*(?:\+)?\s*(?:years|yrs|year|y)\b/i)
    if (explicit) {
      const years = Number(explicit[1])
      return { min: years, max: years }
    }
    return null
  }

  const salaryFilterFromText = text => {
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

  const workTypeFilterFromText = text => {
    if (textContainsTerm(text, 'remote')) return 'Work From Home'
    if (textContainsTerm(text, 'hybrid')) return 'Hybrid'
    if (textContainsTerm(text, 'office') || textContainsTerm(text, 'onsite')) return 'In Office'
    return null
  }

  const locationFromText = text => {
    const cities = ['mumbai', 'pune', 'bangalore', 'hyderabad', 'delhi']
    return cities.find(city => textContainsTerm(text, city)) || null
  }

  const roleSkillTermsFromText = text => {
    const terms = new Set()
    const roleKeywords = ['hr', 'developer', 'manager', 'sap', 'react', 'python', 'frontend', 'backend', 'full stack', 'ui/ux', 'ux', 'data analyst', 'devops', 'qa', 'engineering', 'engineer', 'business analyst', 'sales']
    const skillKeywords = ['react', 'python', 'javascript', 'java', 'sql', 'aws', 'sap', 'excel', 'communication', 'management', 'node', 'angular', 'design']
    roleKeywords.forEach(keyword => { if (textContainsTerm(text, keyword)) terms.add(keyword) })
    skillKeywords.forEach(keyword => { if (textContainsTerm(text, keyword)) terms.add(keyword) })
    return Array.from(terms)
  }

  const isCandidateQuery = text =>
    /candidate|candidates|skill|skills|experience|years|location|city|salary|role|position|developer|manager|hr|sap|react|python|remote|hybrid|office|resume|cv|count|total|how many/i.test(text)

  const findLocalCandidates = text => {
    const searchText = normalizeText(text)
    const includeCount = /\b(how many|total|count)\b/i.test(text)
    const experienceFilter = experienceFilterFromText(text)
    const salaryFilter = salaryFilterFromText(text)
    const workTypeFilter = workTypeFilterFromText(text)
    const location = locationFromText(searchText)
    const roleSkillTerms = roleSkillTermsFromText(searchText)

    const matchesCandidate = candidate => {
      const position = normalizeText(candidate.positionApplied)
      const skills = (candidate.skills || []).map(normalizeText)
      const locationFields = [candidate.currentLocation, candidate.preferredLocation1, candidate.preferredLocation2]
        .filter(Boolean)
        .map(normalizeText)
      const salary = parseNumber(candidate.expectedSalary)
      const experience = parseNumber(candidate.experienceYears)

      if (location && !locationFields.some(field => field.includes(location))) return false
      if (workTypeFilter && normalizeText(candidate.workTypePreference) !== normalizeText(workTypeFilter)) return false
      if (salaryFilter && (salary === null || salary < salaryFilter.min || salary > salaryFilter.max)) return false
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
    return { candidates, includeCount, roleSkillTerms, location, experienceFilter, salaryFilter, workTypeFilter }
  }

  const formatCandidateSummary = candidate => {
    const name = `${candidate.firstName || 'Unknown'} ${candidate.lastName || ''}`.trim()
    const position = candidate.positionApplied || 'Unknown Role'
    const experience = candidate.experienceYears ? `${candidate.experienceYears} yrs` : 'N/A'
    const location = candidate.currentLocation || candidate.preferredLocation1 || candidate.preferredLocation2 || 'N/A'
    const salary = parseNumber(candidate.expectedSalary) || 'N/A'
    return `${name} — ${position} | ${experience} | ${location} | ${salary}L`
  }

  const responseSuggestions = ({ found, context }) => {
    if (!found) return ['Clear Filters', 'Show All Candidates', 'Try Different Skill']
    if (context === 'location') return ['Add Skill Filter', 'Add Salary Filter', 'Show All']
    return ['Filter by Location', 'Filter by Salary', 'Sort by Experience']
  }

  const buildBuddyResponse = query => {
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

  const appendChatMessage = message => {
    setChatMessages(prev => [...prev, { ...message, id: `${message.role}-${Date.now()}` }])
  }

  const processChatQuery = text => {
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

  const handleSendMessage = event => {
    if (event) event.preventDefault()
    processChatQuery(chatInputText)
  }

  const handleChipClick = chip => processChatQuery(chip)

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
    const application = applications.find(app => app.id === id)
    if (!application) return
    const confirmed = window.confirm(`Are you sure you want to delete ${application.firstName} ${application.lastName}?`)
    if (!confirmed) return
    dispatch(deleteApplication(id))
  }

  function toggleRowExpanded(id) {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedRows(newExpanded)
  }

  useEffect(() => {
    window.localStorage.setItem('adminFilterPanelOpen', JSON.stringify(filterPanelOpen))
  }, [filterPanelOpen])

  const lastSubmitted = applications.length
    ? new Date(applications[applications.length - 1].createdAt).toLocaleString()
    : '—'

  const positionOptions = [
    'SAP FICO', 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Analyst', 'DevOps Engineer', 'QA Tester', 'UI/UX Designer', 'Business Analyst',
    'HR Executive', 'Recruitment Specialist', 'Sales Executive'
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
    new Set(applications.flatMap(app => [app.currentLocation, app.preferredLocation1, app.preferredLocation2]).filter(Boolean))
  )

  function handleToggleWorkType(type) {
    setPendingWorkTypes(prev => (prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]))
  }

  function handleChangeStatus(id, status) {
    dispatch(changeStatus({ id, status }))
    if (activeCandidate && activeCandidate.id === id) {
      setActiveCandidate(prev => ({ ...prev, status }))
    }
  }

  function handleAddSkill() {
    const skill = skillInput.trim()
    if (!skill) return
    if (!pendingSkills.includes(skill)) setPendingSkills(prev => [...prev, skill])
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
  if (appliedFilters.searchText) filterChips.push({ key: 'searchText', label: `Search: ${appliedFilters.searchText}` })
  if (appliedFilters.position) filterChips.push({ key: 'position', label: `Role: ${appliedFilters.position}` })
  if (appliedFilters.location) filterChips.push({ key: 'location', label: `Location: ${appliedFilters.location}` })
  if (appliedFilters.experience) {
    const option = experienceOptions.find(opt => opt.value === appliedFilters.experience)
    filterChips.push({ key: 'experience', label: `Experience: ${option ? option.label : appliedFilters.experience}` })
  }
  if (appliedFilters.status) filterChips.push({ key: 'status', label: `Status: ${appliedFilters.status}` })
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
  if (appliedFilters.company) filterChips.push({ key: 'company', label: `Company: ${appliedFilters.company}` })
  appliedFilters.workTypes.forEach(type => filterChips.push({ key: 'workType', value: type, label: `Work Type: ${type}` }))
  appliedFilters.skills.forEach(skill => filterChips.push({ key: 'skill', value: skill, label: `Skill: ${skill}` }))

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
      if (!values.some(value => value?.toLowerCase().includes(query))) return false
    }
    if (appliedFilters.position && !`${application.positionApplied || ''}`.toLowerCase().includes(appliedFilters.position.toLowerCase())) return false
    if (appliedFilters.company && !`${application.lastCompany || ''}`.toLowerCase().includes(appliedFilters.company.toLowerCase())) return false
    if (appliedFilters.location) {
      const locationMatch = [application.currentLocation, application.preferredLocation1, application.preferredLocation2]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(appliedFilters.location.toLowerCase()))
      if (!locationMatch) return false
    }
    if (appliedFilters.experience) {
      const years = Number(application.experienceYears)
      if (appliedFilters.experience === '0-1' && !(years >= 0 && years <= 1)) return false
      if (appliedFilters.experience === '1-3' && !(years >= 1 && years <= 3)) return false
      if (appliedFilters.experience === '3-5' && !(years >= 3 && years <= 5)) return false
      if (appliedFilters.experience === '5+' && !(years > 5)) return false
    }
    if (appliedFilters.workTypes.length > 0 && !appliedFilters.workTypes.includes(application.workTypePreference)) return false
    if (appliedFilters.salaryMin) {
      const expectedSalary = Number(application.expectedSalary)
      if (isNaN(expectedSalary) || expectedSalary < Number(appliedFilters.salaryMin)) return false
    }
    if (appliedFilters.salaryMax) {
      const expectedSalary = Number(application.expectedSalary)
      if (isNaN(expectedSalary) || expectedSalary > Number(appliedFilters.salaryMax)) return false
    }
    if (appliedFilters.status && (application.status || '').toLowerCase() !== appliedFilters.status.toLowerCase()) return false
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
      if (!appliedFilters.skills.every(skill => candidateSkills.includes(skill.toLowerCase()))) return false
    }
    return true
  })

  const lastFiltered = filteredApplications.length

  function handleLogout() {
    dispatch(logout())
    onLogout?.()
  }

  const StatusControl = ({ application, size = 'small' }) => (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <Select
        value={application.status || 'Applied'}
        onChange={e => handleChangeStatus(application.id, e.target.value)}
        renderValue={value => <Chip size="small" color={statusColor(value)} label={value} />}
        sx={{ '& .MuiSelect-select': { py: 0.5 } }}
      >
        {STATUS_OPTIONS.map(s => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  const renderCardView = () => (
    <Grid container spacing={2}>
      {filteredApplications.map(application => (
        <Grid item xs={12} md={6} key={application.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6">{application.firstName} {application.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{application.positionApplied || 'Position not specified'}</Typography>
                  <Typography variant="caption" color="text.secondary">ID: {application.uniqueId || 'N/A'}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusControl application={application} />
                  <Tooltip title="Delete candidate">
                    <IconButton color="error" size="small" onClick={() => handleDelete(application.id)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Grid container spacing={1.5}>
                {[
                  ['Contact', application.phone || 'N/A'],
                  ['Email', application.email || 'N/A'],
                  ['Experience', application.experienceYears ? `${application.experienceYears} years` : 'N/A'],
                  ['Last Company', application.lastCompany || 'N/A'],
                  ['Expected Salary', application.expectedSalary || 'N/A'],
                  ['Work Type', application.workTypePreference || 'N/A']
                ].map(([label, value]) => (
                  <Grid item xs={6} key={label}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{value}</Typography>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Resume</Typography>
                  {application.resumeName ? (
                    <MuiLink href={application.resumeData} target="_blank" rel="noreferrer">{application.resumeName}</MuiLink>
                  ) : (
                    <Typography variant="body2">N/A</Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
              <Button fullWidth variant="outlined" endIcon={<KeyboardArrowRightRoundedIcon />} onClick={() => openFullInfo(application)}>
                View Full Information
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  const renderTableView = () => (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'rgba(108,99,255,0.06)' } }}>
            <TableCell width={40} />
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Resume</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredApplications.map(application => (
            <React.Fragment key={application.id}>
              <TableRow hover>
                <TableCell>
                  <IconButton size="small" onClick={() => toggleRowExpanded(application.id)}>
                    {expandedRows.has(application.id) ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>{application.uniqueId || 'N/A'}</TableCell>
                <TableCell>{application.firstName} {application.lastName}</TableCell>
                <TableCell>{application.positionApplied || 'N/A'}</TableCell>
                <TableCell>{application.email || 'N/A'}</TableCell>
                <TableCell>{application.phone || 'N/A'}</TableCell>
                <TableCell><StatusControl application={application} /></TableCell>
                <TableCell>
                  {application.resumeName ? (
                    <MuiLink href={application.resumeData} target="_blank" rel="noreferrer">{application.resumeName}</MuiLink>
                  ) : 'N/A'}
                </TableCell>
                <TableCell>
                  <IconButton color="error" size="small" onClick={() => handleDelete(application.id)}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={9} sx={{ py: 0, borderBottom: expandedRows.has(application.id) ? undefined : 'none' }}>
                  <Collapse in={expandedRows.has(application.id)} timeout="auto" unmountOnExit>
                    <Box sx={{ py: 2 }}>
                      <Grid container spacing={1.5}>
                        {[
                          ['Experience', application.experienceYears ? `${application.experienceYears} yrs` : 'N/A'],
                          ['Location', application.currentLocation || application.preferredLocation1 || 'N/A'],
                          ['Work Type', application.workTypePreference || 'N/A'],
                          ['Date Applied', application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A']
                        ].map(([label, value]) => (
                          <Grid item xs={6} md={3} key={label}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                            <Typography variant="body2">{value}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Skills</Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {application.skills && application.skills.length > 0
                            ? application.skills.map((skill, idx) => <Chip key={idx} size="small" label={skill} />)
                            : <Typography variant="body2">No skills listed</Typography>}
                        </Stack>
                      </Box>
                      <Button sx={{ mt: 1.5 }} size="small" endIcon={<KeyboardArrowRightRoundedIcon />} onClick={() => openFullInfo(application)}>
                        View Full Information
                      </Button>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderListView = () => (
    <Stack spacing={1.5}>
      {filteredApplications.map(application => (
        <Paper key={application.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700}>{application.firstName} {application.lastName}</Typography>
              <Typography variant="body2" color="text.secondary">{application.positionApplied || 'Position not specified'}</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                <Typography variant="caption" color="text.secondary">{application.email || 'N/A'}</Typography>
                <Typography variant="caption" color="text.secondary">{application.phone || 'N/A'}</Typography>
                {application.resumeName
                  ? <MuiLink variant="caption" href={application.resumeData} target="_blank" rel="noreferrer">View Resume</MuiLink>
                  : <Typography variant="caption" color="text.secondary">No resume</Typography>}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusControl application={application} />
              <Button size="small" variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => openFullInfo(application)}>
                Details
              </Button>
              <IconButton color="error" size="small" onClick={() => handleDelete(application.id)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )

  const renderTitlesView = () => (
    <Grid container spacing={2}>
      {filteredApplications.map(application => (
        <Grid item xs={12} sm={6} md={4} key={application.id}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle1" fontWeight={700}>{application.firstName} {application.lastName}</Typography>
                <IconButton color="error" size="small" onClick={() => handleDelete(application.id)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{application.positionApplied || 'No position'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Unknown date'}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip size="small" color={statusColor(application.status || 'Applied')} label={application.status || 'Applied'} />
              </Box>
              <Button fullWidth size="small" sx={{ mt: 1.5 }} endIcon={<KeyboardArrowRightRoundedIcon />} onClick={() => openFullInfo(application)}>
                View Full Information
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  const renderCurrentView = () => {
    if (viewMode === 'table') return renderTableView()
    if (viewMode === 'list') return renderListView()
    if (viewMode === 'titles') return renderTitlesView()
    return renderCardView()
  }

  const infoRow = (label, value) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Grid>
  )

  return (
    <>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.06)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
          <Box>
            <Chip label="Admin Panel" color="primary" size="small" sx={{ mb: 0.5 }} />
            <Typography variant="h5">Candidate Applications</Typography>
            <Typography variant="body2" color="text.secondary">Review the latest applications submitted through the portal.</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Badge badgeContent={activeFilterCount} color="primary">
              <Button
                variant="outlined"
                startIcon={<FilterListRoundedIcon />}
                onClick={() => setFilterPanelOpen(prev => !prev)}
              >
                {filterPanelOpen ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </Badge>
            <TimezoneWidget />
            <Button color="error" variant="contained" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Stack>

        {filterChips.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            {filterChips.map(chip => (
              <Chip
                key={`${chip.key}-${chip.value || chip.label}`}
                label={chip.label}
                onDelete={() => handleRemoveAppliedFilter(chip.key, chip.value)}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {[
            ['Total Applications', applications.length],
            ['Showing', lastFiltered],
            ['Last Submitted', lastSubmitted]
          ].map(([label, value]) => (
            <Grid item xs={12} sm={4} key={label}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(108,99,255,0.04)' }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h6">{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Collapse in={filterPanelOpen}>
          <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Candidate Filters</Typography>
                <Typography variant="body2" color="text.secondary">Choose criteria and click Apply Filters to update the list.</Typography>
              </Box>
              {activeFilterCount > 0 && <Chip size="small" color="primary" label={`${activeFilterCount} active`} />}
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Keyword Search" value={pendingFilterText} onChange={e => setPendingFilterText(e.target.value)} placeholder="Search name, position, email, company..." />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select label="Search In" value={pendingFilterField} onChange={e => setPendingFilterField(e.target.value)}>
                  <MenuItem value="all">All Fields</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="position">Position</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="id">Unique ID</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Position / Role"
                  value={pendingPosition}
                  onChange={e => setPendingPosition(e.target.value)}
                  placeholder="Any position"
                  inputProps={{ list: 'position-options' }}
                />
                <datalist id="position-options">
                  {positionOptions.map(position => <option key={position} value={position} />)}
                </datalist>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location"
                  value={pendingLocation}
                  onChange={e => setPendingLocation(e.target.value)}
                  placeholder="City or region"
                  inputProps={{ list: 'location-options' }}
                />
                <datalist id="location-options">
                  {locationOptions.map(location => <option key={location} value={location} />)}
                </datalist>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select label="Experience" value={pendingExperience} onChange={e => setPendingExperience(e.target.value)}>
                  <MenuItem value="">Any experience</MenuItem>
                  {experienceOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select label="Application Status" value={pendingStatus} onChange={e => setPendingStatus(e.target.value)}>
                  <MenuItem value="">All statuses</MenuItem>
                  {STATUS_OPTIONS.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Work Type Preference</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {workTypeOptions.map(type => (
                    <Chip
                      key={type}
                      label={type}
                      clickable
                      color={pendingWorkTypes.includes(type) ? 'primary' : 'default'}
                      variant={pendingWorkTypes.includes(type) ? 'filled' : 'outlined'}
                      onClick={() => handleToggleWorkType(type)}
                    />
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField type="number" label="Salary Min" value={pendingSalaryMin} onChange={e => setPendingSalaryMin(e.target.value)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField type="number" label="Salary Max" value={pendingSalaryMax} onChange={e => setPendingSalaryMax(e.target.value)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField type="date" label="Applied From" InputLabelProps={{ shrink: true }} value={pendingAppliedFrom} onChange={e => setPendingAppliedFrom(e.target.value)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField type="date" label="Applied To" InputLabelProps={{ shrink: true }} value={pendingAppliedTo} onChange={e => setPendingAppliedTo(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField select label="Company" value={pendingCompany} onChange={e => setPendingCompany(e.target.value)}>
                  <MenuItem value="">Any company</MenuItem>
                  {companyOptions.map(company => <MenuItem key={company} value={company}>{company}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Skills"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    placeholder="Add skill tag and press Enter"
                  />
                  <Button variant="outlined" onClick={handleAddSkill}>Add</Button>
                </Stack>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  {pendingSkills.map(skill => (
                    <Chip key={skill} label={skill} size="small" onDelete={() => setPendingSkills(prev => prev.filter(item => item !== skill))} />
                  ))}
                </Stack>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleApplyFilters}>
                Apply Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Button>
              <Button variant="text" onClick={handleClearFilters}>Clear Filters</Button>
            </Stack>
          </Paper>
        </Collapse>

        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1.5} sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">View Mode</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_e, value) => value && setViewMode(value)}
          >
            {VIEW_MODES.map(option => (
              <ToggleButton key={option.value} value={option.value}>{option.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {applications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            No applications found yet. Candidates will appear here after submitting the form.
          </Box>
        ) : filteredApplications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            No candidates match your filter. Try a different search term.
          </Box>
        ) : (
          renderCurrentView()
        )}
      </Paper>

      <Dialog open={fullInfoOpen && Boolean(activeCandidate)} onClose={closeFullInfo} maxWidth="md" fullWidth>
        {activeCandidate && (
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, background: 'linear-gradient(135deg, rgba(108,99,255,0.10), rgba(139,131,255,0.04))' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontWeight: 700 }}>
                  {`${activeCandidate.firstName?.[0] || ''}${activeCandidate.lastName?.[0] || ''}`.toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{activeCandidate.firstName} {activeCandidate.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{activeCandidate.positionApplied || 'Position not specified'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Applied on {activeCandidate.createdAt ? new Date(activeCandidate.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Chip color={statusColor(activeCandidate.status || 'Applied')} label={activeCandidate.status || 'Applied'} />
                <IconButton onClick={closeFullInfo}><CloseRoundedIcon /></IconButton>
              </Stack>
            </Box>

            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Personal Details</Typography>
                  <Grid container spacing={1.5}>
                    {infoRow('Full Name', `${activeCandidate.firstName || ''} ${activeCandidate.lastName || ''}`)}
                    {infoRow('Primary Email', activeCandidate.email || 'N/A')}
                    {infoRow('Alternative Email', activeCandidate.altEmail || activeCandidate.alternativeEmail || 'N/A')}
                    {infoRow('Primary Phone', activeCandidate.phone || 'N/A')}
                    {infoRow('Alternative Phone', activeCandidate.altPhone || activeCandidate.alternativePhone || 'N/A')}
                    {infoRow('Current Location', activeCandidate.currentLocation || 'N/A')}
                  </Grid>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Position & Experience</Typography>
                  <Grid container spacing={1.5}>
                    {infoRow('Position Applied For', activeCandidate.positionApplied || 'N/A')}
                    {infoRow('Current Position', activeCandidate.currentPosition || 'N/A')}
                    {infoRow('Company Name', activeCandidate.companyName || activeCandidate.lastCompany || 'N/A')}
                    {infoRow('Start → End Date', `${activeCandidate.startDate || 'N/A'} → ${activeCandidate.endDate || (activeCandidate.currentlyWorking ? 'Present' : 'N/A')}`)}
                    {infoRow('Total Experience', activeCandidate.experienceYears ? `${activeCandidate.experienceYears} yrs` : 'N/A')}
                    {infoRow('Relevant Experience', activeCandidate.relevantExperienceText || activeCandidate.relevantExp || 'N/A')}
                    {infoRow('Is Fresher', activeCandidate.isFresher ? 'Yes' : 'No')}
                    {infoRow('Work Type Preference', activeCandidate.workTypePreference || 'N/A')}
                  </Grid>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Location Preferences</Typography>
                  <Grid container spacing={1.5}>
                    {infoRow('Current Location', activeCandidate.currentLocation || 'N/A')}
                    {infoRow('Preferred Location 1', activeCandidate.preferredLocation1 || 'N/A')}
                    {infoRow('Preferred Location 2', activeCandidate.preferredLocation2 || 'N/A')}
                    {infoRow('Work Type', activeCandidate.workTypePreference || 'N/A')}
                  </Grid>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Salary & Company</Typography>
                  <Grid container spacing={1.5}>
                    {infoRow('Last Drawn Salary', activeCandidate.lastSalary || 'N/A')}
                    {infoRow('Expected Salary', activeCandidate.expectedSalary || 'N/A')}
                    {infoRow('Last Company', activeCandidate.lastCompany || 'N/A')}
                    {infoRow('Bonus Received', activeCandidate.bonusDetails ? 'Yes' : 'No')}
                  </Grid>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Education Details</Typography>
                  <Grid container spacing={1.5}>
                    {infoRow('Degree / Qualification', activeCandidate.educationDetails?.degree || 'N/A')}
                    {infoRow('University / Institute', activeCandidate.educationDetails?.institute || 'N/A')}
                    {infoRow('Field of Study', activeCandidate.educationDetails?.specialization || 'N/A')}
                    {infoRow('Start → End', `${activeCandidate.educationDetails?.startDate || 'N/A'} → ${activeCandidate.educationDetails?.endDate || 'N/A'}`)}
                    {infoRow('Grade / CGPA', activeCandidate.educationDetails?.grade || 'N/A')}
                  </Grid>
                  {activeCandidate.educationHistory && activeCandidate.educationHistory.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                      {activeCandidate.educationHistory.map((item, idx) => (
                        <Typography variant="body2" key={idx}>
                          {item.degree || 'N/A'} — {item.institute || 'N/A'} ({item.startDate || 'N/A'} → {item.endDate || 'N/A'})
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Skills</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {activeCandidate.skills && activeCandidate.skills.length > 0
                      ? activeCandidate.skills.map((skill, idx) => <Chip key={idx} size="small" label={skill} />)
                      : <Typography variant="body2">No skills listed</Typography>}
                  </Stack>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Documents</Typography>
                  {activeCandidate.resumeData ? (
                    <Button startIcon={<DescriptionRoundedIcon />} href={activeCandidate.resumeData} target="_blank" rel="noreferrer" variant="outlined">
                      {activeCandidate.resumeName || 'Resume'}
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No resume available</Typography>
                  )}
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" onClick={() => handleChangeStatus(activeCandidate.id, 'Shortlisted')}>Shortlist</Button>
                <Button variant="outlined" color="error" onClick={() => handleChangeStatus(activeCandidate.id, 'Rejected')}>Reject</Button>
                <Button variant="outlined" color="warning" onClick={() => handleChangeStatus(activeCandidate.id, 'On Hold')}>On Hold</Button>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionRoundedIcon />}
                  disabled={!activeCandidate.resumeData}
                  onClick={() => activeCandidate.resumeData && window.open(activeCandidate.resumeData, '_blank')}
                >
                  Download Resume
                </Button>
              </Stack>
            </Box>
          </DialogContent>
        )}
      </Dialog>

      <Fab
        color="primary"
        onClick={handleToggleChat}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: theme => theme.zIndex.speedDial }}
      >
        <Badge badgeContent={chatOpen ? 0 : unreadCount} color="error">
          {chatOpen ? <CloseRoundedIcon /> : <ChatBubbleRoundedIcon />}
        </Badge>
      </Fab>

      {chatOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 360 },
            height: 520,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: theme => theme.zIndex.speedDial
          }}
        >
          <Box sx={{ p: 2, background: 'linear-gradient(135deg, #6c63ff, #8b83ff)', color: '#fff' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><SmartToyRoundedIcon /></Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">Resuming Buddy</Typography>
                <Typography variant="caption">🟢 Online — Ask me anything</Typography>
              </Box>
              <IconButton size="small" sx={{ color: '#fff' }} onClick={handleToggleChat}><CloseRoundedIcon fontSize="small" /></IconButton>
            </Stack>
          </Box>

          <Box ref={chatScrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f7f7fb' }}>
            {chatMessages.length === 0 ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: 'text.secondary' }}>
                <SmartToyRoundedIcon sx={{ fontSize: 48 }} />
                <Typography variant="body2">Start a conversation!</Typography>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                {chatMessages.map(message => (
                  <Box key={message.id} sx={{ alignSelf: message.role === 'bot' ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: message.role === 'bot' ? '#fff' : 'primary.main',
                        color: message.role === 'bot' ? 'text.primary' : '#fff',
                        borderColor: message.role === 'bot' ? 'rgba(15,23,42,0.08)' : 'primary.main'
                      }}
                    >
                      {message.text.split('\n').map((line, index) => (
                        <Typography variant="body2" key={index} sx={{ whiteSpace: 'pre-wrap' }}>{line}</Typography>
                      ))}
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: message.role === 'bot' ? 'left' : 'right', mt: 0.25 }}>
                      {message.timestamp}
                    </Typography>
                  </Box>
                ))}
                {isTyping && (
                  <Box sx={{ alignSelf: 'flex-start' }}>
                    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">typing…</Typography>
                    </Paper>
                  </Box>
                )}
              </Stack>
            )}
          </Box>

          {chatMessages.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ px: 2, py: 1 }}>
              {chatSuggestions.map(chip => (
                <Chip key={chip} label={chip} size="small" clickable onClick={() => handleChipClick(chip)} />
              ))}
            </Stack>
          )}

          <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1.5, borderTop: '1px solid rgba(15,23,42,0.08)' }}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                placeholder="Ask me anything about candidates..."
              />
              <IconButton color="primary" type="submit" disabled={!chatInputText.trim()}>
                <SendRoundedIcon />
              </IconButton>
            </Stack>
            <Button size="small" fullWidth onClick={handleClearChat} sx={{ mt: 0.5 }}>Clear chat</Button>
          </Box>
        </Paper>
      )}
    </>
  )
}
