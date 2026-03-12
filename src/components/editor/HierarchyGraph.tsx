'use client'

/**
 * HierarchyGraph - Unreal-style hierarchy view where you drag elements to connect them to containers.
 * Drag an element and drop it on a container to pin (parent), or on Canvas to unpin.
 * Visual tree with connector lines. Layer settings (z-order, visibility, lock) live in Properties panel.
 */
import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import type { PageElement } from '@/lib/db'

type TreeNode = {
  el: PageElement
  children: TreeNode[]
  depth: number
}

function buildTree(elements: PageElement[]): TreeNode[] {
  const byParent = new Map<string | null, PageElement[]>()
  byParent.set(null, [])
  for (const el of elements) {
    const pid = el.pinnedTo ?? null
    if (!byParent.has(pid)) byParent.set(pid, [])
    byParent.get(pid)!.push(el)
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => b.zIndex - a.zIndex)
  }
  function build(parentId: string | null, depth: number): TreeNode[] {
    const list = byParent.get(parentId) ?? []
    return list.map((el) => ({
      el,
      children: build(el.id, depth + 1),
      depth,
    }))
  }
  return build(null, 0)
}

const INDENT = 16

function HierarchyRow({
  node,
  isSelected,
  onSelect,
  isDropTarget,
  isDraggingOver,
  isDragging,
}: {
  node: TreeNode
  isSelected: boolean
  onSelect: () => void
  isDropTarget?: boolean
  isDraggingOver?: boolean
  isDragging?: boolean
}) {
  const { el, children, depth } = node
  const isContainer = el.type === 'div'
  const hasChildren = children.length > 0
  const paddingLeft = 8 + depth * INDENT

  const { attributes, listeners, setNodeRef, isDragging: dndDragging } = useDraggable({
    id: el.id,
    data: { el },
    disabled: isContainer,
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: el.id,
    data: { el },
    disabled: !isContainer,
  })

  const dragging = isDragging ?? dndDragging

  return (
    <div
      ref={isContainer ? setDropRef : setNodeRef}
      data-element-id={el.id}
      {...(!isContainer ? { ...attributes, ...listeners } : {})}
      className={`flex items-center h-7 rounded text-sm transition cursor-pointer select-none
        ${isSelected ? 'bg-[var(--messmer-copper)]/25 text-white' : 'hover:bg-white/5 text-[var(--text-muted)]'}
        ${isDropTarget || isOver ? 'ring-1 ring-[var(--messmer-copper)]/50' : ''}
        ${(isDraggingOver || isOver) && isContainer ? 'bg-[var(--messmer-copper)]/15' : ''}
        ${dragging ? 'opacity-50' : ''}
      `}
      style={{ paddingLeft }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Connector lines - vertical bar for depth */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px bg-white/15"
          style={{ left: 8 + (depth - 1) * INDENT + INDENT / 2 - 1 }}
        />
      )}
      <span className="text-[10px] text-[var(--text-muted)] mr-2 shrink-0 w-4 truncate" title={el.type}>
        {isContainer ? '▣' : '▤'}
      </span>
      <span className="flex-1 truncate text-[var(--text-primary)]">{el.name || el.type}</span>
      {hasChildren && (
        <span className="text-[10px] text-[var(--text-muted)]">({children.length})</span>
      )}
    </div>
  )
}

function CanvasDropZone({
  onSelect,
  isDropTarget,
}: {
  onSelect: () => void
  isDropTarget?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas', data: {} })
  const active = isDropTarget || isOver
  return (
    <div
      ref={setNodeRef}
      data-drop-target="canvas"
      className={`flex items-center h-8 rounded text-xs font-medium transition cursor-pointer
        ${active ? 'bg-[var(--messmer-copper)]/20 ring-1 ring-[var(--messmer-copper)]/40' : 'bg-white/5 hover:bg-white/8 text-[var(--text-muted)]'}
      `}
      style={{ paddingLeft: 8 }}
      onClick={onSelect}
    >
      <span className="mr-2">◫</span>
      Canvas root
    </div>
  )
}

export default function HierarchyGraph({
  elements,
  selectedId,
  onSelect,
  onUpdateElement,
}: {
  elements: PageElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const containers = elements.filter((e) => e.type === 'div')

  const tree = buildTree(elements)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setDraggedId(String(e.active.id))
  }, [])

  const handleDragOver = useCallback((e: DragOverEvent) => {
    const over = e.over
    if (!over) {
      setDropTargetId(null)
      return
    }
    const id = String(over.id)
    if (id === 'canvas') {
      setDropTargetId('canvas')
      return
    }
    const target = elements.find((x) => x.id === id)
    if (target?.type === 'div' && id !== draggedId) {
      setDropTargetId(id)
    } else {
      setDropTargetId(null)
    }
  }, [elements, draggedId])

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e
      setDraggedId(null)
      setDropTargetId(null)
      if (!over) return
      const dragEl = elements.find((x) => x.id === active.id)
      if (!dragEl || dragEl.type === 'div') return

      const overId = String(over.id)
      if (overId === 'canvas') {
        onUpdateElement(dragEl.id, { pinnedTo: undefined })
        return
      }
      const overEl = elements.find((x) => x.id === overId)
      if (overEl?.type === 'div' && overEl.id !== dragEl.id) {
        onUpdateElement(dragEl.id, { pinnedTo: overEl.id })
      }
    },
    [elements, onUpdateElement]
  )

  const handleDragCancel = useCallback(() => {
    setDraggedId(null)
    setDropTargetId(null)
  }, [])

  const draggedEl = draggedId ? elements.find((e) => e.id === draggedId) : null

  return (
    <div className="flex flex-col h-full">
      <p className="text-[11px] text-[var(--text-muted)] mb-2">
        Drag elements onto containers to parent them. Drop on Canvas to unpin.
      </p>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 overflow-y-auto min-h-0 space-y-0.5">
          <CanvasDropZone
            onSelect={() => onSelect(null)}
            isDropTarget={dropTargetId === 'canvas'}
          />
          {tree.map((node) => (
            <TreeNodeRecursive
              key={node.el.id}
              node={node}
              selectedId={selectedId}
              onSelect={onSelect}
              onUpdateElement={onUpdateElement}
              draggedId={draggedId}
              dropTargetId={dropTargetId}
              containers={containers}
            />
          ))}
        </div>

        <DragOverlay>
          {draggedEl ? (
            <div className="opacity-90 bg-[var(--bg-secondary)] border border-[var(--messmer-copper)]/40 rounded px-2 py-1 text-sm shadow-lg flex items-center gap-2">
              <span className="text-[var(--messmer-copper)]">▤</span>
              <span>{draggedEl.name || draggedEl.type}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function TreeNodeRecursive({
  node,
  selectedId,
  onSelect,
  onUpdateElement,
  draggedId,
  dropTargetId,
  containers,
}: {
  node: TreeNode
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void
  draggedId: string | null
  dropTargetId: string | null
  containers: PageElement[]
}) {
  const { el, children, depth } = node
  const isContainer = el.type === 'div'
  const canAcceptDrop = isContainer && el.id !== draggedId && draggedId != null
  const isDropTarget = dropTargetId === el.id
  const isSelected = selectedId === el.id

  return (
    <div className="relative" data-element-id={el.id}>
      <HierarchyRow
        node={node}
        isSelected={isSelected}
        onSelect={() => onSelect(el.id)}
        isDropTarget={canAcceptDrop && isDropTarget}
        isDraggingOver={canAcceptDrop && isDropTarget}
      />
      {children.map((child) => (
        <TreeNodeRecursive
          key={child.el.id}
          node={child}
          selectedId={selectedId}
          onSelect={onSelect}
          onUpdateElement={onUpdateElement}
          draggedId={draggedId}
          dropTargetId={dropTargetId}
          containers={containers}
        />
      ))}
    </div>
  )
}
