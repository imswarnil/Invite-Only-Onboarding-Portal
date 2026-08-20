import { Link } from 'react-router-dom'
import type { Lesson } from './lessons'

export default function Pager({ prev, next }: { prev?: Lesson; next?: Lesson }) {
  if (!prev && !next) return null
  return (
    <nav className="learn-pager" aria-label="Lesson pagination">
      {prev ? (
        <Link to={`/learn/${prev.slug}`} className="learn-pager-link learn-pager-prev">
          <span className="learn-pager-label">Previous</span>
          <span className="learn-pager-title">{prev.frontmatter.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={`/learn/${next.slug}`} className="learn-pager-link learn-pager-next">
          <span className="learn-pager-label">Next</span>
          <span className="learn-pager-title">{next.frontmatter.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
