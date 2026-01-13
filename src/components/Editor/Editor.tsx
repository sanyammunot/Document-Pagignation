'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { PaginationExtension } from './extensions/PaginationExtension'
import { PageIndicator } from '../PageIndicator'
import { MenuBar } from '../MenuBar'
// Editor styles are handled in global.css

const Editor = () => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Highlight.configure({ multicolor: true }),
            PaginationExtension,
        ],
        content: `
      <h1>Document Title</h1>
      <p>Start typing your document here. As you type and fill the page, a visual page break will appear automatically.</p>
      <p>This mimics the behavior of a real word processor using ProseMirror decorations.</p>
      ${'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>'.repeat(20)}
    `,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            localStorage.setItem('editor-content', editor.getHTML())
        },
        onCreate: ({ editor }) => {
            const savedContent = localStorage.getItem('editor-content')
            if (savedContent) {
                // If we find saved content, overwrite the default initial content
                editor.commands.setContent(savedContent)
            }
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Toolbar */}
            <MenuBar editor={editor} />

            {/* Editor Viewport */}
            <div className="editor-viewport" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>

            {/* Footer Info */}
            <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2 print:hidden z-50">
                <PageIndicator editor={editor} />
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 max-w-xs">
                    <p className="font-semibold mb-1">Pagination Demo</p>
                    <p>Type content to see automatic page breaks (gray gaps).</p>
                    <p className="mt-1">Press <strong>Ctrl+P</strong> to verify clean printing.</p>
                </div>
            </div>
        </div>
    )
}

export default Editor
