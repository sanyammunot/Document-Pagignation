import { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'

export const PageIndicator = ({ editor }: { editor: Editor }) => {
    const [pageCount, setPageCount] = useState(1)

    useEffect(() => {
        if (!editor) return

        const updatePageCount = () => {
            const count = (editor.storage as any).pagination?.pages || 1
            setPageCount(count)
        }

        updatePageCount()

        editor.on('transaction', updatePageCount)
        editor.on('update', updatePageCount)

        return () => {
            editor.off('transaction', updatePageCount)
            editor.off('update', updatePageCount)
        }
    }, [editor])

    return (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
            <span>{pageCount} Pages</span>
        </div>
    )
}
