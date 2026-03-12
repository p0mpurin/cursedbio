'use client'

/**
 * EditorSidebar - Left panel with Elements and Graph (hierarchy) tabs
 */
import { useState } from 'react'
import type { PageElement } from '@/lib/db'
import HierarchyGraph from './HierarchyGraph'

/** Primary elements - shown first, most commonly used */
const PRIMARY_ELEMENTS: Array<{ label: string; icon: string; template: Omit<PageElement, 'id'> }> = [
  {
    label: 'Text',
    icon: 'Aa',
    template: {
      type: 'text',
      x: 100, y: 100, width: 300, height: 60, zIndex: 10,
      props: { content: 'Double click to edit', fontSize: 24, fontFamily: 'Inter', color: '#ffffff', fontWeight: 'bold' }
    }
  },
  {
    label: 'Image',
    icon: 'Img',
    template: {
      type: 'image',
      x: 100, y: 100, width: 250, height: 250, zIndex: 5,
      props: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop', objectFit: 'cover' }
    }
  },
  {
    label: 'Shape',
    icon: 'Sh',
    template: {
      type: 'shape',
      x: 100, y: 100, width: 150, height: 150, zIndex: 4,
      props: { backgroundColor: '#B66E41', borderRadius: '0px' }
    }
  },
  {
    label: 'Button',
    icon: 'Btn',
    template: {
      type: 'button',
      x: 100, y: 100, width: 160, height: 50, zIndex: 20,
      props: { label: 'Click Me', href: '#', backgroundColor: '#525252', color: '#fff', borderRadius: '8px', fontSize: 16 }
    }
  },
]

/** Extra elements - in a collapsible "More" section */
const MORE_ELEMENTS: Array<{ label: string; icon: string; template: Omit<PageElement, 'id'> }> = [
  {
    label: 'Video',
    icon: 'V',
    template: {
      type: 'video',
      x: 100, y: 100, width: 400, height: 225, zIndex: 2,
      props: { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', controls: true }
    }
  },
  {
    label: 'Audio',
    icon: 'Au',
    template: {
      type: 'audio',
      x: 100, y: 100, width: 300, height: 50, zIndex: 50,
      props: { src: '', controls: true }
    }
  },
  {
    label: 'Embed',
    icon: 'Emb',
    template: {
      type: 'embed',
      x: 100, y: 100, width: 400, height: 225, zIndex: 2,
      props: { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    }
  },
  {
    label: 'Container',
    icon: 'Box',
    template: {
      type: 'div',
      name: 'Container',
      x: 50, y: 50, width: 400, height: 300, zIndex: 1,
      props: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.12)',
      }
    }
  },
  {
    label: 'Profile Views',
    icon: 'PV',
    template: {
      type: 'profileViews',
      name: 'Profile Views',
      x: 100, y: 100, width: 120, height: 36, zIndex: 10,
      props: {
        count: 1234,
        label: 'profile views',
        fontSize: 14,
        color: '#9a958c',
        icon: 'eye',
      }
    }
  },
  {
    label: 'Discord Profile',
    icon: 'Disc',
    template: {
      type: 'discordProfile',
      name: 'Discord Profile',
      x: 100, y: 100, width: 280, height: 80, zIndex: 10,
      props: {
        showAvatar: true,
        showUsername: true,
        showBadges: true,
        avatarSize: 48,
        fontSize: 14,
        color: '#e5e5e5',
        status: 'offline',
        customStatus: '',
      }
    }
  },
  {
    label: 'Icon Link',
    icon: 'Link',
    template: {
      type: 'button',
      x: 100, y: 100, width: 48, height: 48, zIndex: 15,
      props: {
        label: '',
        icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg',
        iconPosition: 'only',
        iconSize: 28,
        iconLinkHover: 'scale',
        href: 'https://github.com',
        backgroundColor: 'transparent',
        borderRadius: '50%',
      }
    }
  },
  {
    label: 'Custom HTML',
    icon: '</>',
    template: {
      type: 'html',
      name: 'Custom HTML',
      x: 100, y: 100, width: 64, height: 64, zIndex: 15,
      props: {
        html: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
        href: 'https://github.com',
        customCss: '[data-element-id="{{id}}"] { transition: filter 0.3s ease; cursor: pointer; } [data-element-id="{{id}}"]:hover { filter: drop-shadow(0 0 12px rgba(255,200,100,0.8)); }'
      }
    }
  }
]

export default function EditorSidebar({
  onAddElement,
  selectedId,
  onSelect,
  elements,
  onUpdateElement,
}: {
  onAddElement: (el: PageElement) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  elements: PageElement[]
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void
}) {
  const [activeTab, setActiveTab] = useState<'elements' | 'graph'>('elements')
  const [showMore, setShowMore] = useState(false)

  const mainContainer = elements.find((e) => e.type === 'div' && e.id === 'main')
  const addElement = (template: Omit<PageElement, 'id'>) => {
    const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const highestZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0)
    const el: PageElement = { ...template, id, zIndex: highestZ + 1 } as PageElement
    if (mainContainer && template.type !== 'div') {
      el.pinnedTo = 'main'
      el.x = 40
      el.y = 40
      const pinnedCount = elements.filter((e) => e.pinnedTo === 'main').length
      if (pinnedCount > 0) el.y = 40 + pinnedCount * 80
    }
    onAddElement(el)
    onSelect(id)
  }

  return (
    <aside className="w-64 h-full shrink-0 flex flex-col bg-[var(--bg-secondary)] border-r border-white/5">
      <div className="flex border-b border-white/5 p-2 gap-2">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded ${activeTab === 'elements' ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:bg-white/5'}`}
        >
          Elements
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded ${activeTab === 'graph' ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:bg-white/5'}`}
        >
          Hierarchy
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 editor-panel">
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">Click to add inside your content area:</p>
            <div className="space-y-2">
              {PRIMARY_ELEMENTS.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => addElement(tpl.template)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left text-sm transition border border-transparent hover:border-white/10"
                >
                  <span className="text-lg w-8 text-center text-[var(--text-muted)]">{tpl.icon}</span>
                  <span className="text-[var(--text-primary)]">{tpl.label}</span>
                </button>
              ))}
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="w-full flex items-center justify-between p-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                {showMore ? 'Less' : 'More elements'}
                <span>{showMore ? '−' : '+'}</span>
              </button>
              {showMore && (
                <div className="mt-2 space-y-2">
                  {MORE_ELEMENTS.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => addElement(tpl.template)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left text-sm transition border border-transparent hover:border-white/10"
                    >
                      <span className="text-lg w-8 text-center text-[var(--text-muted)]">{tpl.icon}</span>
                      <span className="text-[var(--text-primary)]">{tpl.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <HierarchyGraph
            elements={elements}
            selectedId={selectedId}
            onSelect={onSelect}
            onUpdateElement={onUpdateElement}
          />
        )}
      </div>
    </aside>
  )
}
