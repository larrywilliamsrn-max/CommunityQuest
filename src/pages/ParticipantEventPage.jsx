import { Link } from 'react-router-dom'

function ParticipantEventPage({ title, description, details, ctaLabel, backTo }) {
  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Participant activity</p>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">{title}</h1>
        <p className="text-base text-[var(--text-secondary)]">{description}</p>
      </div>

      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] p-4 text-sm text-[var(--text-secondary)]">
        <p className="font-semibold text-[var(--text-primary)]">What happens next</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {details.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to={backTo}
          className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}

export default ParticipantEventPage
