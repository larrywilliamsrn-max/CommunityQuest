import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EVENT_CONFIG_STORAGE_KEY = 'questchain-event-config'

function CreateQuestPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    eventTitle: 'Community Glow Fair',
    eventDescription: 'A vibrant night of art, tech, and neighborhood storytelling.',
    questTitle: 'Glow Trail',
    questSummary: 'Discover the glow trail and unlock the hidden badge.',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    window.localStorage.setItem(EVENT_CONFIG_STORAGE_KEY, JSON.stringify(form))
    navigate('/organizer')
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Organizer workspace</p>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Create a new quest</h1>
        <p className="text-base text-[var(--text-secondary)]">Explain the event experience here and publish it so participants see the latest story in their dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
            <span>Event title</span>
            <input
              name="eventTitle"
              value={form.eventTitle}
              onChange={handleChange}
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-[var(--text-primary)]"
              placeholder="Event title"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
            <span>Event description</span>
            <input
              name="eventDescription"
              value={form.eventDescription}
              onChange={handleChange}
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-[var(--text-primary)]"
              placeholder="Describe the experience"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
          <span>Quest title</span>
          <input
            name="questTitle"
            value={form.questTitle}
            onChange={handleChange}
            className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-[var(--text-primary)]"
            placeholder="Quest title"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
          <span>Quest summary</span>
          <textarea
            name="questSummary"
            value={form.questSummary}
            onChange={handleChange}
            className="min-h-24 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-[var(--text-primary)]"
            placeholder="Explain what participants should do"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[var(--surface-inverted)] px-4 py-2 font-semibold text-white"
          >
            Publish quest
          </button>
        </div>
      </form>
    </section>
  )
}

export default CreateQuestPage
