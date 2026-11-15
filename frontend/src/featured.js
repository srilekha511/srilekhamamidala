// Resolves data.featured (experience ids and project ids) into one-line entries for the landing page.
// Ids that no longer exist are skipped.
export function featuredItems({ featured = [], experience = [], projects = [] }) {
  return featured.flatMap((id) => {
    const job = experience.find((e) => e.id === id)
    if (job) return [{ key: String(id), title: job.plaque ?? job.company, note: job.role, href: `#/${job.room}`, external: false }]
    const project = projects.find((p) => p.id === id)
    if (!project) return []
    const external = !!project.link
    return [{ key: String(id), title: project.plaque ?? project.title, note: project.category, href: external ? project.link : `#/${project.room}`, external }]
  })
}
