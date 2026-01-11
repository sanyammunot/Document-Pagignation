'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { PaginationExtension } from './extensions/PaginationExtension'
import { PageIndicator } from '../PageIndicator'
import { Bold, Italic, Heading1, Heading2, List, ListOrdered } from 'lucide-react'
// Editor styles are handled in global.css

const Editor = () => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
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
            <div className="sticky top-0 z-10 flex items-center gap-2 p-2 bg-white border-b border-gray-200 shadow-sm print:hidden">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                    title="Bold"
                >
                    <Bold size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                    title="Italic"
                >
                    <Italic size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                    title="Heading 1"
                >
                    <Heading1 size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                    title="Heading 2"
                >
                    <Heading2 size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                    title="Bullet List"
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                    title="Ordered List"
                >
                    <ListOrdered size={18} />
                </button>
            </div>

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
