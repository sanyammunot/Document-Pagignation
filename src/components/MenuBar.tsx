import { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline,
  Heading1, Heading2,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Indent, Outdent,
  Image as ImageIcon, Link as LinkIcon,
  Highlighter, Type,
  Undo, Redo,
  Search,
  Minus
} from 'lucide-react'

interface MenuBarProps {
  editor: Editor | null
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    if (!editor) return

    const handler = () => {
      forceUpdate({})
    }

    editor.on('transaction', handler)
    editor.on('selectionUpdate', handler)
    editor.on('update', handler)

    return () => {
      editor.off('transaction', handler)
      editor.off('selectionUpdate', handler)
      editor.off('update', handler)
    }
  }, [editor])

  if (!editor) return null

  const addImage = () => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const Button = ({ onClick, isActive, disabled, title, children }: any) => (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      className={`p-1.5 rounded text-gray-700 hover:bg-gray-200 transition-colors ${isActive ? 'bg-gray-300 text-black' : ''
        } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      title={title}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-5 bg-gray-300 mx-1" />

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-200 shadow-sm print:hidden">
      {/* History */}
      <Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={16} />
      </Button>

      <Divider />

      {/* Text Formatting */}
      <select
        className="h-8 border border-gray-300 rounded text-sm px-1 outline-none focus:border-blue-500"
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        value={editor.getAttributes('textStyle').fontFamily || ''}
      >
        <option value="">Default Font</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </select>

      <Divider />

      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter size={16} />
      </Button>

      {/* Colors - Simulating a picker with a wrapper or just a button for now. 
                For a real picker we'd need a popover. Using native color input is safest for MVP. */}
      <div className="flex items-center gap-1 mx-1">
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
          title="Text Color"
        />
      </div>

      <Divider />

      {/* Headings */}
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </Button>

      <Divider />

      {/* Alignment */}
      <Button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
        title="Justify"
      >
        <AlignJustify size={16} />
      </Button>

      <Divider />

      {/* Lists & Indent */}
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().lift('listItem').run()} // sink/lift logic handles indent/outdent mostly for lists
        // For paragraphs, indent extensions are needed but not standard in starter kit without configuration. 
        // Tiptap doesn't have a default "indent" for paragraphs in StarterKit without "extension-indent" (community).
        // I will skip Indent/Outdent for paragraphs if I don't have the extension, or just use it for lists.
        disabled={!editor.can().liftListItem('listItem') && !editor.can().lift('listItem')}
        title="Outdent"
      >
        <Outdent size={16} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        disabled={!editor.can().sinkListItem('listItem')}
        title="Indent"
      >
        <Indent size={16} />
      </Button>

      <Divider />

      {/* Insert */}
      <Button onClick={setLink} isActive={editor.isActive('link')} title="Insert Link">
        <LinkIcon size={16} />
      </Button>
      <Button onClick={addImage} title="Insert Image">
        <ImageIcon size={16} />
      </Button>
      <Button onClick={() => editor.commands.setHorizontalRule()} title="Horizontal Rule">
        <Minus size={16} />
      </Button>

      <Divider />

      {/* Search (Placeholder) */}
      <Button onClick={() => alert('Search feature coming soon!')} title="Search">
        <Search size={16} />
      </Button>

    </div>
  )
}