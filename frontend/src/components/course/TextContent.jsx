import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Requires Katex CSS for proper rendering of formulas

export const TextContent = ({ data, onValidate }) => {
  // Free-reading segments auto-validate immediately so the user can just continue reading
  useEffect(() => {
    onValidate(true);
  }, [onValidate]);

  return (
    <div className="prose dark:prose-invert max-w-none animate-fadeIn text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {data.content}
      </ReactMarkdown>
    </div>
  );
};

TextContent.propTypes = {
  data: PropTypes.shape({
    content: PropTypes.string.isRequired,
  }).isRequired,
  onValidate: PropTypes.func.isRequired,
};
