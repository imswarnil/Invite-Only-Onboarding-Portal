import { createRoot, type Root } from 'react-dom/client'
import InviteRequestRecordPage, { type InviteRequestRecordPageProps } from './InviteRequestRecordPage'

// This file is the entry point for a SEPARATE build (see vite.sfwidget.config.ts) that
// bundles React + this component into one self-contained IIFE script — uploaded to
// Salesforce as a Static Resource and loaded by the inviteRequestReactPage LWC via
// `lightning/platformResourceLoader`. It exposes a plain global, not an ES module export,
// because the LWC loads it as a classic <script> tag (no bundler on that side to resolve
// an import from).

const roots = new WeakMap<Element, Root>()

function mount(container: Element, props: InviteRequestRecordPageProps) {
  let root = roots.get(container)
  if (!root) {
    root = createRoot(container)
    roots.set(container, root)
  }
  root.render(<InviteRequestRecordPage {...props} />)
}

function unmount(container: Element) {
  const root = roots.get(container)
  if (root) {
    root.unmount()
    roots.delete(container)
  }
}

declare global {
  interface Window {
    InviteRequestReactWidget?: { mount: typeof mount; unmount: typeof unmount }
  }
}

window.InviteRequestReactWidget = { mount, unmount }
