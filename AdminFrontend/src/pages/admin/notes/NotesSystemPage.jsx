import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AtSign,
  Bold,
  Check,
  Code2,
  Edit3,
  Eye,
  EyeOff,
  Hash,
  Italic,
  Link,
  List,
  ListOrdered,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Plus,
  Reply,
  Search,
  Send,
  StickyNote,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { notesService } from '../../../services/notesService'

const NOTE_TYPES = [
  { value: 'general', label: 'General', className: 'bg-slate-100 text-slate-700' },
  { value: 'important', label: 'Important', className: 'bg-rose-100 text-rose-700' },
  { value: 'client_communication', label: 'Client Communication', className: 'bg-blue-100 text-blue-700' },
  { value: 'internal_only', label: 'Internal Only', className: 'bg-amber-100 text-amber-800' },
  { value: 'announcement', label: 'Announcement', className: 'bg-violet-100 text-violet-700' },
]

const RESOURCE_TYPES = ['lead', 'opportunity', 'client', 'project', 'task', 'employee']
const REACTIONS = ['👍', '✅', '🚨', '❓']
const DEMO_RESOURCE_ID = '00000000-0000-0000-0000-000000000021'

const SAMPLE_EMPLOYEES = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Rahul Verma', role: 'Admin', email: 'rahul.verma@workmatrix.local' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Priya Sharma', role: 'HR Manager', email: 'priya.sharma@workmatrix.local' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Amit Patel', role: 'Project Lead', email: 'amit.patel@workmatrix.local' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Neha Singh', role: 'Client Success', email: 'neha.singh@workmatrix.local' },
]

const SAMPLE_NOTES = [
  {
    id: 'note-1',
    author_id: '11111111-1111-1111-1111-111111111111',
    author_name: 'Rahul Verma',
    body_html:
      '<p><strong>Client follow-up:</strong> share updated payroll timeline with <span class="mention-chip" data-user-id="44444444-4444-4444-4444-444444444444">@Neha Singh</span> and link #TASK-204 before EOD.</p>',
    body_plain: 'Client follow-up: share updated payroll timeline with @Neha Singh and link #TASK-204 before EOD.',
    note_type: 'client_communication',
    visibility: 'client_visible',
    is_pinned: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    can_edit_until: Math.floor((Date.now() + 1000 * 60 * 7) / 1000),
    reactions: [
      { emoji: '✅', user_id: '22222222-2222-2222-2222-222222222222' },
      { emoji: '👍', user_id: '33333333-3333-3333-3333-333333333333' },
    ],
    replies: [
      {
        id: 'note-1-r1',
        author_id: '33333333-3333-3333-3333-333333333333',
        author_name: 'Amit Patel',
        body_html: '<p>Timeline added to #TASK-204. Waiting on final approval.</p>',
        body_plain: 'Timeline added to #TASK-204. Waiting on final approval.',
        note_type: 'general',
        visibility: 'internal',
        is_pinned: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        can_edit_until: Math.floor((Date.now() + 1000 * 60 * 11) / 1000),
        reactions: [{ emoji: '👍', user_id: '11111111-1111-1111-1111-111111111111' }],
        replies: [],
      },
    ],
  },
  {
    id: 'note-2',
    author_id: '22222222-2222-2222-2222-222222222222',
    author_name: 'Priya Sharma',
    body_html: '<p>Internal payroll checklist is ready. Keep this note HR-only until compliance review is done.</p>',
    body_plain: 'Internal payroll checklist is ready. Keep this note HR-only until compliance review is done.',
    note_type: 'internal_only',
    visibility: 'internal',
    is_pinned: false,
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    can_edit_until: Math.floor((Date.now() - 1000 * 60 * 60 * 2) / 1000),
    reactions: [{ emoji: '❓', user_id: '44444444-4444-4444-4444-444444444444' }],
    replies: [],
  },
]

const emptyDraft = {
  body_html: '',
  body_plain: '',
  note_type: 'general',
  visibility: 'internal',
  is_pinned: false,
}

const decodeCurrentUser = () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return SAMPLE_EMPLOYEES[0]
    const payload = JSON.parse(atob(token.split('.')[1] || ''))
    return {
      id: payload.sub || SAMPLE_EMPLOYEES[0].id,
      name: payload.name || payload.email || 'Current User',
      role: payload.role || 'Team member',
      email: payload.email || '',
    }
  } catch {
    return SAMPLE_EMPLOYEES[0]
  }
}

const stripHtml = (html) => {
  const element = document.createElement('div')
  element.innerHTML = html || ''
  return element.textContent?.replace(/\s+/g, ' ').trim() || ''
}

const extractMentionIds = (html) => {
  const ids = []
  const element = document.createElement('div')
  element.innerHTML = html || ''
  element.querySelectorAll('[data-user-id]').forEach((node) => {
    const id = node.getAttribute('data-user-id')
    if (id && !ids.includes(id)) ids.push(id)
  })
  return ids
}

const normalizeEmployee = (employee) => ({
  id: employee.id || employee._id || employee.user_id,
  name:
    employee.full_name ||
    employee.name ||
    [employee.first_name, employee.last_name].filter(Boolean).join(' ') ||
    employee.email ||
    'Team member',
  role: employee.job_title_name || employee.designation || employee.role || 'Employee',
  email: employee.email || employee.work_email || '',
})

const noteTypeFor = (type) => NOTE_TYPES.find((item) => item.value === type) || NOTE_TYPES[0]

const formatDate = (value) => {
  if (!value) return 'Just now'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const flattenNotes = (notes) =>
  notes.flatMap((note) => [note, ...flattenNotes(note.replies || [])])

const statsFromNotes = (notes) => {
  const flat = flattenNotes(notes)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return {
    total_notes: flat.length,
    comments: flat.filter((note) => note.parent_note_id || String(note.id).includes('-r')).length,
    mentions: flat.reduce((total, note) => total + extractMentionIds(note.body_html).length, 0),
    this_week: flat.filter((note) => new Date(note.created_at).getTime() >= weekAgo).length,
  }
}

const upsertNestedNote = (notes, targetId, updater) =>
  notes.map((note) => {
    if (note.id === targetId) return updater(note)
    return { ...note, replies: upsertNestedNote(note.replies || [], targetId, updater) }
  })

const insertReply = (notes, parentId, reply) =>
  upsertNestedNote(notes, parentId, (note) => ({ ...note, replies: [...(note.replies || []), reply] }))

const sortPinned = (notes) =>
  [...notes].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || new Date(b.created_at) - new Date(a.created_at))

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-3">
      <div className={`rounded-lg p-2 ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value.toLocaleString('en-IN')}</p>
      </div>
    </div>
  </div>
)

const IconButton = ({ active = false, label, children, className = '', ...props }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 ${
      active ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-transparent'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
)

const RichNoteEditor = ({ value, onChange, employees, placeholder, compact = false, resetKey }) => {
  const editorRef = useRef(null)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentions, setShowMentions] = useState(false)

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value?.body_html || ''
  }, [resetKey])

  const syncValue = () => {
    const html = editorRef.current?.innerHTML || ''
    const plain = stripHtml(html)
    onChange({ body_html: html, body_plain: plain, mentions: extractMentionIds(html) })
    const match = plain.match(/(?:^|\s)@([\w.\- ]{0,30})$/)
    setMentionQuery(match?.[1]?.trim() || '')
    setShowMentions(Boolean(match))
  }

  const runCommand = (command, option = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, option)
    syncValue()
  }

  const addLink = () => {
    const url = window.prompt('URL')
    if (!url) return
    editorRef.current?.focus()
    document.execCommand('createLink', false, url)
    syncValue()
  }

  const insertMention = (employee) => {
    editorRef.current?.focus()
    const label = `@${employee.name}`
    document.execCommand(
      'insertHTML',
      false,
      `<span class="mention-chip" data-user-id="${employee.id}" contenteditable="false">${label}</span>&nbsp;`
    )
    setShowMentions(false)
    syncValue()
  }

  const filteredEmployees = employees
    .filter((employee) => employee.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    .slice(0, 5)

  return (
    <div className="relative rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-3 py-2">
        <IconButton label="Bold" onClick={() => runCommand('bold')}>
          <Bold className="h-4 w-4" />
        </IconButton>
        <IconButton label="Italic" onClick={() => runCommand('italic')}>
          <Italic className="h-4 w-4" />
        </IconButton>
        <IconButton label="Bullet list" onClick={() => runCommand('insertUnorderedList')}>
          <List className="h-4 w-4" />
        </IconButton>
        <IconButton label="Numbered list" onClick={() => runCommand('insertOrderedList')}>
          <ListOrdered className="h-4 w-4" />
        </IconButton>
        <IconButton label="Code block" onClick={() => runCommand('formatBlock', 'pre')}>
          <Code2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Embed URL" onClick={addLink}>
          <Link className="h-4 w-4" />
        </IconButton>
        <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">
          <AtSign className="h-3.5 w-3.5" />
          <Hash className="h-3.5 w-3.5" />
        </span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={syncValue}
        onFocus={syncValue}
        className={`notes-editor prose prose-sm max-w-none overflow-y-auto px-4 py-3 text-sm leading-6 text-slate-800 outline-none ${
          compact ? 'min-h-20' : 'min-h-36'
        }`}
      />
      {showMentions && filteredEmployees.length > 0 && (
        <div className="absolute left-4 top-24 z-20 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {filteredEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                insertMention(employee)
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {employee.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-900">{employee.name}</span>
                <span className="block truncate text-xs text-slate-500">{employee.role}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const NoteComposer = ({ employees, onSubmit, loading, resourceType, resourceId, isEmployee }) => {
  const [draft, setDraft] = useState(emptyDraft)
  const [resetKey, setResetKey] = useState(0)
  const isValid = draft.body_plain.trim().length > 0

  const submit = async (event) => {
    event.preventDefault()
    if (!isValid) return
    await onSubmit({
      ...draft,
      resource_type: resourceType,
      resource_id: resourceId,
      mentions: draft.mentions || [],
    })
    setDraft(emptyDraft)
    setResetKey((key) => key + 1)
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 grid gap-3 lg:grid-cols-[1fr_180px]">
        <div>
          <RichNoteEditor
            value={draft}
            onChange={(content) => setDraft((current) => ({ ...current, ...content }))}
            employees={employees}
            placeholder="Write a note..."
            resetKey={resetKey}
          />
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Type</span>
            <select
              value={draft.note_type}
              onChange={(event) => setDraft((current) => ({ ...current, note_type: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              {NOTE_TYPES.filter(type => !isEmployee || type.value !== 'announcement').map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Visibility</span>
            <div className="grid gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="visibility"
                  value="internal"
                  checked={draft.visibility === 'internal'}
                  onChange={(event) => setDraft((current) => ({ ...current, visibility: event.target.value }))}
                />
                <EyeOff className="h-4 w-4 text-slate-500" />
                Internal
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="visibility"
                  value="client_visible"
                  checked={draft.visibility === 'client_visible'}
                  onChange={(event) => setDraft((current) => ({ ...current, visibility: event.target.value }))}
                />
                <Eye className="h-4 w-4 text-slate-500" />
                Client-visible
              </label>
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-2">
              <Pin className="h-4 w-4 text-slate-500" />
              Pin
            </span>
            <input
              type="checkbox"
              checked={draft.is_pinned}
              onChange={(event) => setDraft((current) => ({ ...current, is_pinned: event.target.checked }))}
              className="h-4 w-4"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {draft.mentions?.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-indigo-700">
              <AtSign className="h-3 w-3" />
              {draft.mentions.length}
            </span>
          )}
          {(draft.body_plain.match(/#[A-Za-z0-9-]+/g) || []).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-700">
              <Hash className="h-3 w-3" />
              {tag.slice(1)}
            </span>
          ))}
        </div>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Send className="h-4 w-4" />
          Add Note
        </button>
      </div>
    </form>
  )
}

const ReactionBar = ({ note, peopleById, onReact }) => {
  const grouped = REACTIONS.map((emoji) => {
    const reactors = (note.reactions || []).filter((reaction) => reaction.emoji === emoji)
    return { emoji, reactors }
  })

  return (
    <div className="flex flex-wrap items-center gap-1">
      {grouped.map(({ emoji, reactors }) => {
        const title = reactors
          .map((reaction) => peopleById.get(reaction.user_id)?.name || 'Team member')
          .join(', ')
        return (
          <button
            key={emoji}
            type="button"
            title={title || `React ${emoji}`}
            onClick={() => onReact(note.id, emoji)}
            className={`inline-flex min-w-10 items-center justify-center gap-1 rounded-md border px-2 py-1 text-sm transition ${
              reactors.length ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <span>{emoji}</span>
            {reactors.length > 0 && <span className="text-xs font-semibold text-slate-600">{reactors.length}</span>}
          </button>
        )
      })}
    </div>
  )
}

const NoteCard = ({
  note,
  depth = 1,
  currentUser,
  employees,
  peopleById,
  onReply,
  onUpdate,
  onDelete,
  onReact,
  activeReplyId,
  setActiveReplyId,
  activeEditId,
  setActiveEditId,
  pending,
}) => {
  const type = noteTypeFor(note.note_type)
  const author = peopleById.get(note.author_id)?.name || note.author_name || 'Team member'
  const canEdit = note.author_id === currentUser.id && Date.now() < (note.can_edit_until || 0) * 1000 && !note.is_deleted
  const [replyDraft, setReplyDraft] = useState(emptyDraft)
  const [editDraft, setEditDraft] = useState({
    body_html: note.body_html,
    body_plain: note.body_plain,
    note_type: note.note_type,
    visibility: note.visibility,
    is_pinned: note.is_pinned,
  })
  const [replyResetKey, setReplyResetKey] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const isAuthor = note.author_id === currentUser.id && 
    !note.is_ticket && 
    !note.is_ticket_comment && 
    !String(note.id).includes('-comment-')
  const editExpired = Date.now() > (note.can_edit_until || 0) * 1000

  useEffect(() => {
    if (!showMenu) return
    const closeMenu = () => setShowMenu(false)
    document.addEventListener('click', closeMenu)
    return () => document.removeEventListener('click', closeMenu)
  }, [showMenu])

  const submitReply = async (event) => {
    event.preventDefault()
    if (!replyDraft.body_plain.trim()) return
    await onReply(note.id, {
      ...replyDraft,
      parent_note_id: note.id,
      resource_type: note.resource_type,
      resource_id: note.resource_id,
      note_type: replyDraft.note_type || 'general',
      visibility: replyDraft.visibility || 'internal',
      mentions: replyDraft.mentions || [],
    })
    setReplyDraft(emptyDraft)
    setReplyResetKey((key) => key + 1)
    setActiveReplyId(null)
  }

  const submitEdit = async (event) => {
    event.preventDefault()
    if (!editDraft.body_plain.trim()) return
    await onUpdate(note.id, editDraft)
    setActiveEditId(null)
  }

  return (
    <div className={`${depth > 1 ? 'border-l-2 border-slate-200 pl-4' : ''}`}>
      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {author.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{author}</p>
                {note.is_pinned && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                )}
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${type.className}`}>{type.label}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  {note.visibility === 'client_visible' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {note.visibility === 'client_visible' ? 'Client-visible' : 'Internal'}
                </span>
                {note.seen_count !== undefined && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600" title="Number of employees who saw this announcement">
                    <Eye className="h-3 w-3 text-slate-500" />
                    Seen: {note.seen_count}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{formatDate(note.created_at)}</p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-slate-600 transition hover:border-slate-200 hover:bg-slate-50"
              title="Actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 border border-slate-100 py-1">
                {isAuthor && !note.is_deleted && (
                  <>
                    {!editExpired && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveEditId(activeEditId === note.id ? null : note.id)
                          setShowMenu(false)
                        }}
                        className="flex w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Edit Note
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdate(note.id, { is_pinned: !note.is_pinned })
                        setShowMenu(false)
                      }}
                      className="flex w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition border-t border-slate-50"
                    >
                      {note.is_pinned ? 'Unpin Note' : 'Pin Note'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(note.id)
                        setShowMenu(false)
                      }}
                      className="flex w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition border-t border-slate-50"
                    >
                      Delete Note
                    </button>
                  </>
                )}
                {(!isAuthor || note.is_deleted) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(note.body_plain)
                      alert('Note content copied to clipboard!')
                      setShowMenu(false)
                    }}
                    className="flex w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Copy Content
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {activeEditId === note.id ? (
          <form onSubmit={submitEdit} className="space-y-3">
            <RichNoteEditor
              value={editDraft}
              onChange={(content) => setEditDraft((current) => ({ ...current, ...content }))}
              employees={employees}
              placeholder="Edit note..."
              compact
              resetKey={note.id}
            />
            <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
              <select
                value={editDraft.note_type}
                onChange={(event) => setEditDraft((current) => ({ ...current, note_type: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {NOTE_TYPES.filter(typeOption => currentUser?.role?.toLowerCase() !== 'employee' || typeOption.value !== 'announcement').map((typeOption) => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name={`edit-visibility-${note.id}`}
                    checked={editDraft.visibility === 'internal'}
                    onChange={() => setEditDraft((current) => ({ ...current, visibility: 'internal' }))}
                  />
                  Internal
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name={`edit-visibility-${note.id}`}
                    checked={editDraft.visibility === 'client_visible'}
                    onChange={() => setEditDraft((current) => ({ ...current, visibility: 'client_visible' }))}
                  />
                  Client-visible
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editDraft.is_pinned}
                    onChange={(event) => setEditDraft((current) => ({ ...current, is_pinned: event.target.checked }))}
                  />
                  Pin
                </label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setActiveEditId(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div
            className={`notes-body text-sm leading-6 text-slate-700 ${note.is_deleted ? 'italic text-slate-400' : ''}`}
            dangerouslySetInnerHTML={{ __html: note.body_html }}
          />
        )}

        {!note.is_deleted && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <ReactionBar note={note} peopleById={peopleById} onReact={onReact} />
            {depth < 3 && (
              <button
                type="button"
                onClick={() => setActiveReplyId(activeReplyId === note.id ? null : note.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Reply className="h-4 w-4" />
                Reply
              </button>
            )}
          </div>
        )}

        {activeReplyId === note.id && depth < 3 && (
          <form onSubmit={submitReply} className="mt-4 space-y-3 rounded-lg bg-slate-50 p-3">
            <RichNoteEditor
              value={replyDraft}
              onChange={(content) => setReplyDraft((current) => ({ ...current, ...content }))}
              employees={employees}
              placeholder="Reply..."
              compact
              resetKey={replyResetKey}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveReplyId(null)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button type="submit" disabled={pending} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                <Send className="h-4 w-4" />
                Reply
              </button>
            </div>
          </form>
        )}
      </article>

      {note.replies?.length > 0 && (
        <div className="mt-3 space-y-3">
          {note.replies.map((reply) => (
            <NoteCard
              key={reply.id}
              note={reply}
              depth={depth + 1}
              currentUser={currentUser}
              employees={employees}
              peopleById={peopleById}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReact={onReact}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              activeEditId={activeEditId}
              setActiveEditId={setActiveEditId}
              pending={pending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const NotesSystemPage = () => {
  const currentUser = useMemo(decodeCurrentUser, [])
  const isEmployee = useMemo(() => currentUser?.role?.toLowerCase() === 'employee', [currentUser])
  const [employees, setEmployees] = useState(SAMPLE_EMPLOYEES)
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [stats, setStats] = useState(statsFromNotes(SAMPLE_NOTES))
  const [resourceType, setResourceType] = useState('project')
  const [resourceId, setResourceId] = useState(DEMO_RESOURCE_ID)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [apiStatus, setApiStatus] = useState('demo')
  const [activeReplyId, setActiveReplyId] = useState(null)
  const [activeEditId, setActiveEditId] = useState(null)

  const peopleById = useMemo(() => {
    const map = new Map()
    ;[...SAMPLE_EMPLOYEES, ...employees, currentUser].forEach((person) => {
      if (person?.id) map.set(person.id, person)
    })
    notes.forEach((note) => {
      if (note.author_id && !map.has(note.author_id)) {
        map.set(note.author_id, {
          id: note.author_id,
          name: note.author_name || 'Team member',
          role: 'Employee',
        })
      }
    })
    return map
  }, [currentUser, employees, notes])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const [notesResponse, statsResponse, employeesResponse] = await Promise.all([
        notesService.getResourceNotes(resourceType, resourceId),
        notesService.getStats(),
        notesService.searchEmployees(),
      ])
      const apiNotes = Array.isArray(notesResponse) ? notesResponse : []
      const apiEmployees = Array.isArray(employeesResponse?.employees)
        ? employeesResponse.employees.map(normalizeEmployee)
        : []
      
      if (apiNotes.length > 0) {
        setNotes(sortPinned(apiNotes))
        setStats(statsResponse || statsFromNotes(apiNotes))
      } else {
        setNotes(sortPinned(SAMPLE_NOTES))
        setStats(statsResponse || statsFromNotes(SAMPLE_NOTES))
      }
      
      if (apiEmployees.length > 0) {
        setEmployees(apiEmployees)
      }
      setApiStatus('live')
    } catch (error) {
      console.warn('Notes API unavailable, using local notes preview.', error)
      setApiStatus('demo')
      setStats(statsFromNotes(notes))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const createLocalNote = (payload, parentId = null) => ({
    id: `note-${Date.now()}`,
    author_id: currentUser.id,
    author_name: currentUser.name,
    body_html: payload.body_html,
    body_plain: payload.body_plain,
    note_type: payload.note_type || 'general',
    visibility: payload.visibility || 'internal',
    parent_note_id: parentId,
    is_pinned: Boolean(payload.is_pinned),
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    can_edit_until: Math.floor((Date.now() + 15 * 60 * 1000) / 1000),
    reactions: [],
    replies: [],
    seen_count: 0,
  })

  const handleCreate = async (payload) => {
    setPending(true)
    try {
      if (apiStatus === 'live') {
        await notesService.createNote(payload)
        await loadNotes()
      } else {
        const newNote = createLocalNote(payload)
        setNotes((current) => sortPinned([newNote, ...current]))
        setStats((current) => ({
          ...current,
          total_notes: current.total_notes + 1,
          this_week: current.this_week + 1,
          mentions: current.mentions + (payload.mentions?.length || 0),
        }))
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add note.')
    } finally {
      setPending(false)
    }
  }

  const handleReply = async (parentId, payload) => {
    setPending(true)
    try {
      if (apiStatus === 'live') {
        await notesService.createNote(payload)
        await loadNotes()
      } else {
        const reply = createLocalNote(payload, parentId)
        setNotes((current) => insertReply(current, parentId, reply))
        setStats((current) => ({
          ...current,
          total_notes: current.total_notes + 1,
          comments: current.comments + 1,
          this_week: current.this_week + 1,
          mentions: current.mentions + (payload.mentions?.length || 0),
        }))
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add reply.')
    } finally {
      setPending(false)
    }
  }

  const handleUpdate = async (noteId, payload) => {
    setPending(true)
    try {
      if (apiStatus === 'live') {
        await notesService.updateNote(noteId, payload)
        await loadNotes()
      } else {
        setNotes((current) =>
          sortPinned(
            upsertNestedNote(current, noteId, (note) => ({
              ...note,
              ...payload,
              updated_at: new Date().toISOString(),
            }))
          )
        )
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update note.')
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async (noteId) => {
    setPending(true)
    try {
      if (apiStatus === 'live') {
        await notesService.deleteNote(noteId)
        await loadNotes()
      } else {
        setNotes((current) =>
          upsertNestedNote(current, noteId, (note) => ({
            ...note,
            body_html: '<p>[Note deleted]</p>',
            body_plain: '[Note deleted]',
            is_deleted: true,
            is_pinned: false,
            updated_at: new Date().toISOString(),
          }))
        )
      }
    } catch (error) {
      console.error(error)
      alert('Failed to delete note.')
    } finally {
      setPending(false)
    }
  }

  const handleReact = async (noteId, emoji) => {
    if (apiStatus === 'live') {
      try {
        await notesService.addReaction(noteId, emoji)
      } catch (error) {
        console.warn('Reaction API failed, updating local preview.', error)
      }
    }
    setNotes((current) =>
      upsertNestedNote(current, noteId, (note) => {
        const exists = (note.reactions || []).some((reaction) => reaction.emoji === emoji && reaction.user_id === currentUser.id)
        if (exists) return note
        return { ...note, reactions: [...(note.reactions || []), { emoji, user_id: currentUser.id, created_at: new Date().toISOString() }] }
      })
    )
  }

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase()
    return notes.filter((note) => {
      const matchesText = !term || note.body_plain?.toLowerCase().includes(term)
      const matchesType = typeFilter === 'all' || note.note_type === typeFilter
      const matchesVisibility = visibilityFilter === 'all' || note.visibility === visibilityFilter
      return matchesText && matchesType && matchesVisibility
    })
  }, [notes, search, typeFilter, visibilityFilter])

  return (
    <div className="space-y-5">
      <style>{`
        .notes-editor:empty:before {
          color: #94a3b8;
          content: attr(data-placeholder);
          pointer-events: none;
        }
        .notes-editor ul, .notes-body ul { list-style: disc; padding-left: 1.25rem; }
        .notes-editor ol, .notes-body ol { list-style: decimal; padding-left: 1.25rem; }
        .notes-editor pre, .notes-body pre {
          background: #0f172a;
          border-radius: 8px;
          color: #e2e8f0;
          overflow: auto;
          padding: 0.75rem;
        }
        .notes-editor a, .notes-body a { color: #2563eb; text-decoration: underline; }
        .mention-chip {
          background: #e0e7ff;
          border-radius: 999px;
          color: #3730a3;
          display: inline-flex;
          font-weight: 600;
          padding: 0.1rem 0.45rem;
        }
      `}</style>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notes System</h1>
          <p className="mt-1 text-sm text-slate-600">Unified notes across modules</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${apiStatus === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {apiStatus === 'live' ? 'Live API' : 'Demo data'}
          </span>
          <button
            type="button"
            onClick={loadNotes}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={StickyNote} label="Total Notes" value={stats.total_notes || 0} tone="bg-blue-50 text-blue-600" />
        <StatCard icon={MessageSquare} label="Comments" value={stats.comments || 0} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Users} label="Mentions" value={stats.mentions || 0} tone="bg-violet-50 text-violet-600" />
        <StatCard icon={Check} label="This Week" value={stats.this_week || 0} tone="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-[160px_1fr_auto]">
        <select
          value={resourceType}
          onChange={(event) => setResourceType(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-indigo-400"
        >
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          value={resourceId}
          onChange={(event) => setResourceId(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          placeholder="Resource ID"
        />
        <button
          type="button"
          onClick={loadNotes}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          <Search className="h-4 w-4" />
          Load
        </button>
      </div>

      <NoteComposer
        employees={employees}
        onSubmit={handleCreate}
        loading={pending}
        resourceType={resourceType}
        resourceId={resourceId}
        isEmployee={isEmployee}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
            placeholder="Search notes"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="all">All types</option>
          {NOTE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <select
          value={visibilityFilter}
          onChange={(event) => setVisibilityFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option value="all">All visibility</option>
          <option value="internal">Internal</option>
          <option value="client_visible">Client-visible</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            currentUser={currentUser}
            employees={employees}
            peopleById={peopleById}
            onReply={handleReply}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onReact={handleReact}
            activeReplyId={activeReplyId}
            setActiveReplyId={setActiveReplyId}
            activeEditId={activeEditId}
            setActiveEditId={setActiveEditId}
            pending={pending}
          />
        ))}

        {filteredNotes.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <StickyNote className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 font-medium text-slate-800">No notes found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesSystemPage

