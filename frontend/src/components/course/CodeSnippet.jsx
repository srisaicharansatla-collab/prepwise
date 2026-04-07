import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Classic VS Code Dark Theme

export const CodeSnippet = ({ data, onValidate }) => {
  // Code snippets are "view-only", validating immediately so learners aren't trapped
  useEffect(() => {
    onValidate(true);
  }, [onValidate]);

  return (
    <div className="animate-fadeIn w-full flex flex-col gap-2 relative">
      {data.title && (
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm tracking-wide bg-gray-100 dark:bg-gray-800 self-start px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700">
          {data.title}
        </h4>
      )}
      
      <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-[#2d3139] shadow-lg relative text-[15px]">
        <SyntaxHighlighter 
          language={data.language || 'javascript'} 
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1.5rem', background: '#0d1117' }} // GitHub Dark Dimmed aesthetic background override
          wrapLongLines={true}
        >
          {data.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

CodeSnippet.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    language: PropTypes.string,
    content: PropTypes.string.isRequired,
  }).isRequired,
  onValidate: PropTypes.func.isRequired,
};
