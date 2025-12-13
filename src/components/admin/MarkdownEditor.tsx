'use client';

// Markdown editor with rich text toolbar and live preview toggle
// Supports split view: editor | preview

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '마크다운으로 작성하세요...'
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertText(before: string, after: string = '') {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  const toolbarButtons = [
    {
      label: 'B',
      title: 'Bold',
      onClick: () => insertText('**', '**')
    },
    {
      label: 'I',
      title: 'Italic',
      onClick: () => insertText('_', '_')
    },
    {
      label: 'C',
      title: 'Code',
      onClick: () => insertText('`', '`')
    },
    {
      label: '```',
      title: 'Code Block',
      onClick: () => insertText('```\n', '\n```')
    },
    {
      label: '>',
      title: 'Blockquote',
      onClick: () => insertText('> ', '')
    },
    {
      label: 'H1',
      title: 'Heading 1',
      onClick: () => insertText('# ', '')
    },
    {
      label: 'H2',
      title: 'Heading 2',
      onClick: () => insertText('## ', '')
    },
    {
      label: 'H3',
      title: 'Heading 3',
      onClick: () => insertText('### ', '')
    },
    {
      label: '•',
      title: 'Bullet List',
      onClick: () => insertText('- ', '')
    },
    {
      label: '1.',
      title: 'Numbered List',
      onClick: () => insertText('1. ', '')
    },
    {
      label: '---',
      title: '구분선',
      onClick: () => insertText('\n---\n', '')
    }
  ];

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-950">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/60 p-2">
        <div className="flex flex-wrap items-center gap-2">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.onClick}
              title={btn.title}
              className="rounded px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSplitView(false);
              setShowPreview(false);
            }}
            className={[
              'rounded px-2 py-1 text-xs font-medium transition',
              !showPreview && !splitView
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
            ].join(' ')}
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => {
              setSplitView(true);
              setShowPreview(true);
            }}
            className={[
              'rounded px-2 py-1 text-xs font-medium transition',
              splitView
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
            ].join(' ')}
          >
            분할
          </button>
          <button
            type="button"
            onClick={() => {
              setSplitView(false);
              setShowPreview(true);
            }}
            className={[
              'rounded px-2 py-1 text-xs font-medium transition',
              showPreview && !splitView
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
            ].join(' ')}
          >
            미리보기
          </button>
        </div>
      </div>

      {/* Editor/Preview Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        {(!showPreview || splitView) && (
          <div className={splitView ? 'flex-1' : 'flex-1'}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-full w-full resize-none border-0 bg-transparent p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              style={{ minHeight: '400px' }}
            />
          </div>
        )}

        {/* Split divider */}
        {splitView && (
          <div className="w-px bg-slate-800" />
        )}

        {/* Preview */}
        {showPreview && (
          <div
            className={[
              'overflow-auto p-4',
              splitView ? 'flex-1' : 'flex-1'
            ].join(' ')}
          >
            {value ? (
              <div className="prose prose-invert max-w-none text-sm text-slate-100">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                  rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-500">미리보기할 내용이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
