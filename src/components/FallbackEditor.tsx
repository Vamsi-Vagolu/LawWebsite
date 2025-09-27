"use client";

import { useState, useRef, useEffect } from "react";

interface FallbackEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function FallbackEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  height = 400
}: FallbackEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(height, textareaRef.current.scrollHeight)}px`;
    }
  }, [value, height]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      // Fallback: append to end
      const newText = value + (value ? '\n' : '') + before + after;
      onChange(newText);
      return;
    }

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = value.substring(start, end);

    let insertText = before + selectedText + after;

    // Add newlines for block elements if not at start of line
    if (['# ', '## ', '### ', '- ', '1. ', '> '].includes(before)) {
      const beforeCursor = value.substring(0, start);
      if (beforeCursor && !beforeCursor.endsWith('\n')) {
        insertText = '\n' + insertText;
      }
    }

    const newText = value.substring(0, start) + insertText + value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatButton = (label: string, before: string, after: string = '', title: string) => (
    <button
      type="button"
      onClick={() => insertText(before, after)}
      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
      title={title}
    >
      {label}
    </button>
  );

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`border border-gray-300 rounded-lg ${isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {formatButton('B', '**', '**', 'Bold')}
        {formatButton('I', '*', '*', 'Italic')}
        {formatButton('H1', '# ', '', 'Heading 1')}
        {formatButton('H2', '## ', '', 'Heading 2')}
        {formatButton('H3', '### ', '', 'Heading 3')}
        {formatButton('Quote', '> ', '', 'Quote')}
        {formatButton('Code', '`', '`', 'Inline Code')}
        {formatButton('Link', '[', '](url)', 'Link')}
        {formatButton('List', '- ', '', 'Bullet List')}
        {formatButton('Numbered', '1. ', '', 'Numbered List')}

        <div className="flex-1"></div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? '⤓' : '⤢'}
        </button>
      </div>

      {/* Editor */}
      <div className="p-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none border-none outline-none font-mono text-sm leading-relaxed"
          style={{
            minHeight: `${height}px`,
            height: isFullscreen ? 'calc(100vh - 160px)' : 'auto'
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-2 py-1 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <span>Rich text formatting available</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}