import type { ComponentType } from 'react'

export interface Frontmatter {
  section: string
  order: number
  title: string
}

export interface Lesson {
  slug: string
  frontmatter: Frontmatter
  Component: ComponentType
}

const modules = import.meta.glob<{ default: ComponentType; frontmatter: Frontmatter }>(
  '../../../learning/*.md',
  { eager: true },
)

function slugify(path: string): string {
  const file = path.split('/').pop() ?? path
  return file.replace(/\.mdx?$/, '')
}

// The single source of truth: every lesson, sorted once by frontmatter.order.
// The sidebar (grouped) and the pager (flat prev/next) both derive from this same
// sort so they can never disagree about "what comes next."
export const lessons: Lesson[] = Object.entries(modules)
  .map(([path, mod]) => ({
    slug: slugify(path),
    frontmatter: mod.frontmatter,
    Component: mod.default,
  }))
  .sort((a, b) => a.frontmatter.order - b.frontmatter.order)

export interface Section {
  name: string
  lessons: Lesson[]
}

// Sections ordered by the lowest `order` value inside them, so a new section
// slots into the sidebar wherever its first lesson falls in the reading sequence.
export const sections: Section[] = (() => {
  const bySection = new Map<string, Lesson[]>()
  for (const lesson of lessons) {
    const group = bySection.get(lesson.frontmatter.section) ?? []
    group.push(lesson)
    bySection.set(lesson.frontmatter.section, group)
  }
  return Array.from(bySection.entries())
    .map(([name, group]) => ({ name, lessons: group }))
    .sort((a, b) => a.lessons[0].frontmatter.order - b.lessons[0].frontmatter.order)
})()

export function lessonBySlug(slug: string | undefined): Lesson | undefined {
  if (!slug) return lessons[0]
  return lessons.find((l) => l.slug === slug)
}

export function neighbors(slug: string | undefined): { prev?: Lesson; next?: Lesson } {
  const lesson = lessonBySlug(slug)
  const index = lesson ? lessons.indexOf(lesson) : -1
  if (index === -1) return {}
  return { prev: lessons[index - 1], next: lessons[index + 1] }
}
