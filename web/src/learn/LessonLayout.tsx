import type { Lesson } from './lessons'

export default function LessonLayout({ lesson }: { lesson: Lesson }) {
  const { Component, frontmatter } = lesson
  return (
    <article className="learn-lesson">
      <p className="learn-lesson-eyebrow">{frontmatter.section}</p>
      <div className="learn-lesson-prose">
        <Component />
      </div>
    </article>
  )
}
