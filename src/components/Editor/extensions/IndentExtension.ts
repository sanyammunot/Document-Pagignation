import { Extension } from '@tiptap/core'

export interface IndentOptions {
    types: string[]
    indentLevels: number
    defaultIndentLevel: number
    htmlAttributes: Record<string, any>
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        indent: {
            indent: () => ReturnType
            outdent: () => ReturnType
        }
    }
}

export const IndentExtension = Extension.create<IndentOptions>({
    name: 'indent',

    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            indentLevels: 8,
            defaultIndentLevel: 0,
            htmlAttributes: {},
        }
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: this.options.defaultIndentLevel,
                        parseHTML: element => {
                            const dataIndent = element.getAttribute('data-indent')
                            if (dataIndent) {
                                return parseInt(dataIndent, 10)
                            }

                            // Fallback for pasted content with margin-left
                            const marginLeft = element.style.marginLeft
                            if (marginLeft) {
                                // Attempt to parse standard units
                                const value = parseInt(marginLeft, 10)
                                if (!isNaN(value)) {
                                    // Rough conversion: assume 2rem (32px) or 2em is 1 level?
                                    // Let's just say > 20px is level 1?
                                    // This is a rough heuristic.
                                    if (marginLeft.endsWith('rem')) return value / 2
                                    if (marginLeft.endsWith('px')) return Math.floor(value / 32)
                                }
                            }
                            return 0
                        },
                        renderHTML: attributes => {
                            if (attributes.indent === 0) {
                                return {}
                            }

                            return {
                                'data-indent': attributes.indent,
                                style: `margin-left: ${attributes.indent * 2}rem;` // 2rem per indent level
                            }
                        },
                    },
                },
            },
        ]
    },

    addCommands() {
        return {
            indent: () => ({ tr, state, dispatch, editor }) => {
                let applicable = false
                const { selection } = state

                tr.selection.ranges.forEach(range => {
                    state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
                        if (this.options.types.includes(node.type.name)) {
                            const currentIndent = node.attrs.indent || 0
                            if (currentIndent < this.options.indentLevels) {
                                applicable = true
                                if (dispatch) {
                                    tr.setNodeMarkup(pos, undefined, {
                                        ...node.attrs,
                                        indent: currentIndent + 1
                                    })
                                }
                            }
                        }
                    })
                })

                return applicable
            },
            outdent: () => ({ tr, state, dispatch }) => {
                let applicable = false
                const { selection } = state

                tr.selection.ranges.forEach(range => {
                    state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
                        if (this.options.types.includes(node.type.name)) {
                            const currentIndent = node.attrs.indent || 0
                            if (currentIndent > 0) {
                                applicable = true
                                if (dispatch) {
                                    tr.setNodeMarkup(pos, undefined, {
                                        ...node.attrs,
                                        indent: currentIndent - 1
                                    })
                                }
                            }
                        }
                    })
                })

                return applicable
            }
        }
    },

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                if (this.editor.can().sinkListItem('listItem')) {
                    return this.editor.commands.sinkListItem('listItem')
                }
                return this.editor.commands.indent()
            },
            'Shift-Tab': () => {
                if (this.editor.can().liftListItem('listItem')) {
                    return this.editor.commands.liftListItem('listItem')
                }
                return this.editor.commands.outdent()
            },
        }
    },
})
