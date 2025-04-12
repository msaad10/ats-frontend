import React, { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { theme } from '../../styles/theme';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const [content, setContent] = useState(value || '');
  const editorRef = useRef(null);

  const handleChange = () => {
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const formatText = (command) => {
    document.execCommand(command, false, null);
    handleChange();
  };

  return (
    <div className="rich-text-editor">
      <div className="formatting-toolbar mb-2">
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-2"
          onClick={() => formatText('bold')}
        >
          <strong>B</strong>
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-2"
          onClick={() => formatText('italic')}
        >
          <em>I</em>
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => formatText('underline')}
        >
          <u>U</u>
        </Button>
      </div>
      <div
        ref={editorRef}
        className="editor-content form-control"
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleChange}
        style={{
          minHeight: '200px',
          padding: '0.5rem',
          border: '2px solid rgb(46, 60, 73)',
          borderRadius: '0.25rem',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          outline: 'none',
          backgroundColor: theme.colors.background,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          textAlign: 'left',
          direction: 'l',
          unicodeBidi: 'bidi-override',
        }}
      />
      <style jsx>{`
        .rich-text-editor {
          margin-bottom: 1rem;
        }
        .formatting-toolbar {
          display: flex;
          gap: 0.5rem;
        }
        .formatting-toolbar button {
          padding: 0.25rem 0.5rem;
          min-width: 32px;
        }
        .editor-content:empty:before {
          content: attr(placeholder);
          color: #6c757d;
          pointer-events: none;
        }
        .editor-content {
          border: 2px solid #ced4da;
          border-radius: 0.25rem;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .editor-content:focus {
          border-color: ${theme.colors.primary};
          outline: 0;
          box-shadow: 0 0 0 0.2rem ${theme.colors.primary}25;
        }
        .editor-content * {
          unicode-bidi: bidi-override;
          direction: ltr;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 