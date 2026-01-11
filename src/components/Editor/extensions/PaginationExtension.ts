import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const paginationKey = new PluginKey('pagination')

export const PaginationExtension = Extension.create({
    name: 'pagination',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: paginationKey,
                state: {
                    init() {
                        return DecorationSet.empty
                    },
                    apply(tr, oldState) {
                        // Check if our specific meta data is present
                        const meta = tr.getMeta('pagination')
                        if (meta) {
                            return meta
                        }
                        // Map decorations on content changes to keep them in place while editing
                        // until the next layout calculation runs
                        return oldState.map(tr.mapping, tr.doc)
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state)
                    },
                },
                view(editorView) {
                    // Helper to debounce or throttle if needed, but for now we run on every docile update + animation frame

                    return {
                        update(view, prevState) {
                            // Optimization: If document structure hasn't changed, maybe skip? 
                            // But layout might change due to CSS or other factors. 
                            // We'll rely on the check at the end to avoid loops.

                            const PAGE_HEIGHT = 1056 // 11in
                            const PAGE_MARGIN = 96   // 1in
                            const CONTENT_HEIGHT = PAGE_HEIGHT - (PAGE_MARGIN * 2) // 9in of usable text
                            const BREAK_HEIGHT = (PAGE_MARGIN * 2) + 20

                            const dom = view.dom
                            const totalHeight = dom.scrollHeight

                            if (totalHeight < PAGE_HEIGHT) {
                                const current = paginationKey.getState(view.state)
                                if (current && current.find().length > 0) {
                                    view.dispatch(view.state.tr.setMeta('pagination', DecorationSet.empty))
                                }
                                return
                            }

                            const pages: Decoration[] = []
                            const editorRect = dom.getBoundingClientRect()
                            const MAX_PAGES = 100

                            // First break happens when content exceeds the first page's text area
                            // Area 1: starts at +margin, ends at +margin+content
                            let currentY = editorRect.top + PAGE_MARGIN + CONTENT_HEIGHT
                            let pageCount = 1

                            while (currentY < editorRect.bottom && pageCount < MAX_PAGES) {
                                const posInfo = view.posAtCoords({
                                    left: editorRect.left + 50,
                                    top: currentY
                                })

                                if (posInfo) {
                                    const widget = Decoration.widget(posInfo.pos, (view) => {
                                        const div = document.createElement('div')
                                        div.className = 'page-break'
                                        return div
                                    }, { side: -1 })

                                    pages.push(widget)
                                }

                                // Jump: The break widget ITSELF consumes the 'bottom margin p1' + 'top margin p2'
                                // So we jump the widget height + the next page's allowed content height
                                currentY += (BREAK_HEIGHT + CONTENT_HEIGHT)
                                pageCount++
                            }

                            // Diff check: If the new decorations are effectively same as old, do NOT dispatch
                            // JSON stringify is expensive but distinct sets of widgets are hard to compare shallowly.
                            // We can optimize by count and positions.

                            const currentState = paginationKey.getState(view.state)
                            const currentDecos = currentState ? currentState.find() : []

                            // Simple heuristic: if count differs, update. 
                            // If same count, check exact positions.
                            let hasChanged = false
                            if (currentDecos.length !== pages.length) {
                                hasChanged = true
                            } else {
                                for (let i = 0; i < pages.length; i++) {
                                    if (currentDecos[i].from !== pages[i].from) {
                                        hasChanged = true
                                        break
                                    }
                                }
                            }

                            if (hasChanged) {
                                const decoSet = DecorationSet.create(view.state.doc, pages)
                                // Must dispatch in a new transaction
                                // Wrap in requestAnimationFrame to avoid "Dispatching while updating" error
                                requestAnimationFrame(() => {
                                    if (view.isDestroyed) return;
                                    view.dispatch(view.state.tr.setMeta('pagination', decoSet))
                                })
                            }
                        }
                    }
                }
            })
        ]
    },
})
