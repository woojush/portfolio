'use client';

// TipTap Rich Text Editor (Notion-style)
// Replaces MarkdownEditor with a WYSIWYG editor

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: '내용을 입력하세요...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 hover:text-blue-300 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
    ],
    content: value || '',
    immediatelyRender: false, // SSR hydration 문제 해결
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // HTML로 저장
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="h-[500px] bg-slate-950 rounded-lg border border-slate-800 p-4 text-slate-400">에디터 로딩 중...</div>;
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-3">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('bold')
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('italic')
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('code')
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {'</>'}
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          H3
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('bulletList')
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          • 목록
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('orderedList')
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          1. 목록
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded px-2 py-1 text-xs transition ${
            editor.isActive('blockquote')
              ? 'bg-warmBeige text-slate-900'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          인용
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('링크 URL을 입력하세요:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className="rounded px-2 py-1 text-xs bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
        >
          링크
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('이미지 URL을 입력하세요:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="rounded px-2 py-1 text-xs bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
        >
          이미지
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-[500px]" />
    </div>
  );
}

