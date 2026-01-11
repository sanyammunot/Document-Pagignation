import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, List, ListOrdered, 
  Heading1, Heading2, Undo, Redo, 
  Type, Printer 
} from 'lucide-react';

interface MenuBarProps {
  editor: Editor | null;
  onPrint?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor, onPrint }) => {
  if (!editor) return null;

  const Button = ({ 
    onClick, 
    isActive, 
    disabled, 
    title, 
    children 
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? 'bg-gray-300' : ''
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border-b border-gray-300 p-2 flex gap-1 flex-wrap bg-gray-50 items-center">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={18} />
      </Button>
      
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={18} />
      </Button>
      
      <Button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <Type size={18} />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </Button>
      
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={18} />
      </Button>
      
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={18} />
      </Button>
      
      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={18} />
      </Button>

      <div className="flex-1" />
      
      {onPrint && (
        <Button onClick={onPrint} title="Print">
          <Printer size={18} />
        </Button>
      )}
    </div>
  );
};