import { Link } from 'react-router-dom'
import { sections } from './lessons'

export default function Toc({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav className="learn-toc" aria-label="Lessons">
      {sections.map((section) => (
        <div className="learn-toc-section" key={section.name}>
          <p className="learn-toc-heading">{section.name}</p>
          <ul>
            {section.lessons.map((lesson) => (
              <li key={lesson.slug}>
                <Link
                  to={`/learn/${lesson.slug}`}
                  className={lesson.slug === activeSlug ? 'is-active' : undefined}
                  aria-current={lesson.slug === activeSlug ? 'page' : undefined}
                >
                  {lesson.frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
