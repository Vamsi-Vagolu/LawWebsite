"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-lg p-4 h-96 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <div className="text-gray-500">Loading rich text editor...</div>
    </div>
  )
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
  height = 400
}: RichTextEditorProps) {
  const [editorValue, setEditorValue] = useState(value);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleEditorChange = useCallback((val?: string) => {
    const newValue = val || '';
    setEditorValue(newValue);
    onChange(newValue);
  }, [onChange]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const newValue = editorValue + '\n\n' + text;
      setEditorValue(newValue);
      onChange(newValue);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('Failed to paste from clipboard. Please ensure you have granted clipboard permissions.');
    }
  };

  const handlePasteFormatted = async () => {
    try {
      // Try to read HTML content from clipboard
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type === 'text/html') {
            const blob = await clipboardItem.getType(type);
            const htmlContent = await blob.text();
            // Convert HTML to markdown (basic conversion)
            const markdownContent = htmlToMarkdown(htmlContent);
            const newValue = editorValue + '\n\n' + markdownContent;
            setEditorValue(newValue);
            onChange(newValue);
            return;
          }
        }
      }
      // Fallback to plain text
      handlePasteFromClipboard();
    } catch (err) {
      console.error('Failed to read formatted clipboard contents: ', err);
      // Fallback to plain text
      handlePasteFromClipboard();
    }
  };

  // Basic HTML to Markdown conversion
  const htmlToMarkdown = (html: string): string => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1')
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<[^>]+>/g, '') // Remove remaining HTML tags
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up extra newlines
      .trim();
  };

  const insertFormat = (before: string, after: string = '') => {
    // Direct state manipulation approach - more reliable
    let insertText = before + after;

    // Add newlines for block elements if content exists
    if (['# ', '## ', '### ', '- ', '1. ', '> '].includes(before) && editorValue.trim()) {
      insertText = '\n' + insertText;
    }

    const newText = editorValue + insertText;
    setEditorValue(newText);
    onChange(newText);

    // Try to focus the textarea after state update
    setTimeout(() => {
      const textarea = document.querySelector('.rich-text-area') as HTMLTextAreaElement ||
                      document.querySelector('[data-testid="rich-text-area"]') as HTMLTextAreaElement ||
                      document.querySelector('.w-md-editor-text-textarea') as HTMLTextAreaElement ||
                      document.querySelector('.w-md-editor textarea') as HTMLTextAreaElement ||
                      document.querySelector('textarea') as HTMLTextAreaElement;

      if (textarea && textarea.value !== undefined) {
        textarea.focus();
        // Place cursor at end
        const length = textarea.value.length || 0;
        textarea.setSelectionRange(length, length);
      }
    }, 150);
  };

  return (
    <div className="w-full">
      {/* Custom Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 border-b-0 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormat('**', '**')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => insertFormat('*', '*')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormat('`', '`')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors font-mono"
            title="Code"
          >
            {}
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormat('# ', '')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertFormat('## ', '')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormat('### ', '')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormat('- ', '')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertFormat('1. ', '')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => insertFormat('> ', '')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Quote"
          >
            Quote
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormat('[', '](url)')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => insertFormat('![alt](', ')')}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            title="Image"
          >
            🖼️
          </button>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Paste plain text from clipboard"
          >
            📄 Paste Text
          </button>
          <button
            type="button"
            onClick={handlePasteFormatted}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            title="Paste with formatting from clipboard"
          >
            🎨 Paste Formatted
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
        <MDEditor
          value={editorValue}
          onChange={handleEditorChange}
          preview="edit"
          hideToolbar
          height={height}
          data-color-mode="light"
          style={{
            backgroundColor: 'transparent'
          }}
          textareaProps={{
            placeholder,
            className: 'rich-text-area',
            'data-testid': 'rich-text-area',
            style: {
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-3 py-2 border border-gray-300 border-t-0 bg-gray-50 text-xs text-gray-600 rounded-b-lg">
        <span>✨ Rich text editor with markdown support</span>
        <div className="flex items-center space-x-4">
          <span>{editorValue.length} characters</span>
          <span>{editorValue.split(/\s+/).filter(word => word.length > 0).length} words</span>
        </div>
      </div>
    </div>
  );
}