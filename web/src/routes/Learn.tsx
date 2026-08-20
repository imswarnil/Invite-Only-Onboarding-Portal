import { Link, useParams } from 'react-router-dom'
import Toc from '../learn/Toc'
import LessonLayout from '../learn/LessonLayout'
import Pager from '../learn/Pager'
import { lessonBySlug, neighbors } from '../learn/lessons'
import '../learn/learn.css'

export default function Learn() {
  const { slug } = useParams()
  const lesson = lessonBySlug(slug)
  const { prev, next } = neighbors(lesson?.slug)

  return (
    <div className="learn-shell">
      <header className="learn-header">
        <Link to="/" className="learn-brand">
          Invite Only Portal
        </Link>
        <span className="learn-header-label">Learn</span>
      </header>

      <div className="learn-body">
        <aside className="learn-sidebar">
          <Toc activeSlug={lesson?.slug} />
        </aside>

        <main className="learn-main">
          {lesson ? (
            <>
              <LessonLayout lesson={lesson} />
              <Pager prev={prev} next={next} />
            </>
          ) : (
            <p>Lesson not found.</p>
          )}
        </main>
      </div>

      <footer className="learn-footer">
        Independent educational project — not affiliated with, endorsed by, or connected to
        Stripe.
      </footer>
    </div>
  )
}
