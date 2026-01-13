import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const paginationKey = new PluginKey('pagination')

export const PaginationExtension = Extension.create({
    name: 'pagination',

    addStorage() {
        return {
            pages: 1,
        }
    },

    addProseMirrorPlugins() {
        const component = this

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

                    return {
                        update(view, prevState) {

                            const PAGE_HEIGHT = 1056 // 11in
                            const PAGE_MARGIN = 96   // 1in
                            // Tune content height to ~1030px to fill the visual gap.
                            // The strict 96dpi calculation often creates a gap because screen fonts render taller than print fonts.
                            // This value is empirically tuned to match standard print drivers.
                            const CONTENT_HEIGHT = 1030
                            const BREAK_HEIGHT = (PAGE_MARGIN * 2) + 20

                            const dom = view.dom
                            const totalHeight = dom.scrollHeight

                            const currentState = paginationKey.getState(view.state)
                            const currentDecos = currentState ? currentState.find() : []

                            if (totalHeight < PAGE_HEIGHT) {
                                if (currentDecos.length > 0) {
                                    view.dispatch(view.state.tr.setMeta('pagination', DecorationSet.empty))
                                }
                                component.storage.pages = 1
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
                                    const existing = currentDecos.find((d: Decoration) => d.from === posInfo.pos)
                                    if (existing) {
                                        const coords = view.coordsAtPos(posInfo.pos)
                                        if (coords.top < currentY - 50) {
                                            currentY += (BREAK_HEIGHT + CONTENT_HEIGHT)
                                            pageCount++
                                            continue
                                        }
                                    }

                                    const widget = Decoration.widget(posInfo.pos, (view) => {
                                        const div = document.createElement('div')
                                        div.className = 'page-break'
                                        return div
                                    }, { side: -1 })

                                    pages.push(widget)
                                }

                                currentY += (BREAK_HEIGHT + CONTENT_HEIGHT)
                                pageCount++
                            }
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

                            // Update storage if changed
                            if (component.storage.pages !== pageCount) {
                                component.storage.pages = pageCount
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
