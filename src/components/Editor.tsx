'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { PageBreak } from '@/extensions/PageBreak';
import { MenuBar } from './MenuBar';

export default function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      PageBreak,
    ],
    content: `
      <h1>Immigration Petition Cover Letter</h1>
      <p><strong>Date:</strong> January 8, 2026</p>
      <p><strong>To:</strong> U.S. Citizenship and Immigration Services</p>
      <p>This letter serves as a cover letter for the immigration petition...</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  // Core pagination logic
  const calculatePageBreaks = () => {
    if (!editor || !editorRef.current) return;

    // Step 1: Remove existing page breaks
    const { state, view } = editor;
    const tr = state.tr;
    let modified = false;

    state.doc.descendants((node, pos) => {
      if (node.type.name === 'pageBreak') {
        tr.delete(pos, pos + node.nodeSize);
        modified = true;
      }
    });

    if (modified) {
      view.dispatch(tr);
    }

    // Step 2: Calculate new page breaks
    setTimeout(() => {
      const editorElement = editorRef.current?.querySelector('.ProseMirror');
      if (!editorElement) return;

      // US Letter: 11" tall - 2" margins = 9" content
      // 96 DPI = 864px per page
      const PAGE_HEIGHT_PX = 9 * 96;
      const nodes = Array.from(editorElement.childNodes);
      
      let currentHeight = 0;
      let breakPositions: number[] = [];

      nodes.forEach((node, index) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const height = (node as HTMLElement).getBoundingClientRect().height;

          if (currentHeight + height > PAGE_HEIGHT_PX && currentHeight > 0) {
            breakPositions.push(index);
            currentHeight = height;
          } else {
            currentHeight += height;
          }
        }
      });

      // Step 3: Insert page breaks
      if (breakPositions.length > 0) {
        const { state: newState, view: newView } = editor;
        let tr = newState.tr;

        breakPositions.reverse().forEach(nodeIndex => {
          let pos = 0;
          for (let i = 0; i < nodeIndex; i++) {
            const pmNode = newState.doc.nodeAt(pos);
            if (pmNode) pos += pmNode.nodeSize;
          }

          if (pos > 0) {
            tr = tr.insert(pos, newState.schema.nodes.pageBreak.create());
          }
        });

        newView.dispatch(tr);
      }

      setPageCount(breakPositions.length + 1);
    }, 10);
  };

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }

      calculationTimeoutRef.current = setTimeout(calculatePageBreaks, 300);
    };

    editor.on('update', handleUpdate);
    setTimeout(calculatePageBreaks, 500);

    return () => {
      editor.off('update', handleUpdate);
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [editor]);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <MenuBar editor={editor} onPrint={handlePrint} />
          <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-600 flex justify-between">
            <span>US Letter (8.5" × 11") • 1" margins</span>
            <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
          </div>
        </div>
        
        <div className="bg-gray-200 p-8 mt-4">
          <div 
            ref={editorRef}
            className="bg-white shadow-xl mx-auto" 
            style={{ width: '8.5in', minHeight: '11in' }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}