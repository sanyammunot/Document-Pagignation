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
  Minus,
  Palette
} from 'lucide-react'

interface MenuBarProps {
  editor: Editor | null
}

const ColorPicker = ({ icon: Icon, color, onChange, label, colors }: any) => {
  const [isOpen, setIsOpen] = useState(false)

  // Close when clicking outside - simple implementation
  useEffect(() => {
    const close = () => setIsOpen(false)
    if (isOpen) {
      window.addEventListener('click', close)
    }
    return () => window.removeEventListener('click', close)
  }, [isOpen])

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        className="flex items-center gap-2 p-1.5 rounded text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
        onClick={() => setIsOpen(!isOpen)}
        title={label}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Icon size={16} />
        <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: color }} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded p-2 grid grid-cols-3 gap-1 z-50 w-max">
          {colors.map((c: string) => (
            <button
              key={c}
              className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              onClick={() => {
                onChange(c)
                setIsOpen(false)
              }}
              onMouseDown={(e) => e.preventDefault()}
              title={c}
            />
          ))}
          <button
            className="col-span-3 w-full h-6 rounded border border-gray-200 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center text-xs"
            onClick={() => {
              onChange(null) // Reset/Unset
              setIsOpen(false)
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="Remove Color"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    if (!editor) return () => { }

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

  // ... (keeping existing handlers addImage, setLink)
  const addImage = () => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
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

  const textColors = ["#000000", "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"]
  const highlightColors = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#e9d5ff", "#fed7aa"] // Pastels

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-200 shadow-sm print:hidden">
      {/* History */}
      <Button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo size={16} />
      </Button>
      <Button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo size={16} />
      </Button>

      <Divider />

      {/* Font Family */}
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

      {/* Basic Formatting */}
      <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
        <Bold size={16} />
      </Button>
      <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
        <Italic size={16} />
      </Button>
      <Button onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
        <Underline size={16} />
      </Button>

      {/* Color Pickers */}
      <ColorPicker
        icon={Palette}
        color={editor.getAttributes('textStyle').color || '#000000'}
        onChange={(color: string | null) => {
          if (color) editor.chain().focus().setColor(color).run()
          else editor.chain().focus().unsetColor().run()
        }}
        label="Text Color"
        colors={textColors}
      />

      <ColorPicker
        icon={Highlighter}
        color={editor.getAttributes('highlight').color || 'transparent'}
        onChange={(color: string | null) => {
          if (color) editor.chain().focus().toggleHighlight({ color }).run()
          else editor.chain().focus().unsetHighlight().run()
        }}
        label="Highlight"
        colors={highlightColors}
      />

      <Divider />
      {/* ... keeping the rest of the buttons ... */}

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