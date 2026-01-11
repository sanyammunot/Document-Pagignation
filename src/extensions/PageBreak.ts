import { Node, mergeAttributes } from '@tiptap/core';

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'page-break',
        class: 'page-break',
      }),
    ];
  },
  
  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({ type: this.name });
        },
    } as any;
  },
});