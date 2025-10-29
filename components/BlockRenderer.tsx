import React from 'react';
import { BlockContent, BlockChild } from '../lib/detail-api';

interface BlockRendererProps {
  blocks: BlockContent[];
  className?: string;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, className = '' }) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const renderText = (children: BlockChild[]): string => {
    return children.map(child => child.text).join('');
  };

  const renderBlock = (block: BlockContent, index: number) => {
    const key = `block-${index}`;
    const text = renderText(block.children);

    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 1}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={key} className="mb-4 font-bold text-dark dark:text-white">
            {text}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p key={key} className="mb-4 text-base text-body-color dark:text-dark-6 leading-relaxed">
            {text}
          </p>
        );

      case 'image':
        if (block.image) {
          return (
            <div key={key} className="mb-6">
              <img
                src={block.image.url}
                alt={block.image.alternativeText || block.image.caption || ''}
                className="w-full h-auto rounded-lg shadow-md"
                loading="lazy"
              />
              {block.image.caption && (
                <p className="mt-2 text-sm text-body-color dark:text-dark-6 text-center italic">
                  {block.image.caption}
                </p>
              )}
            </div>
          );
        }
        return null;

      case 'list':
        return (
          <ul key={key} className="mb-4 list-disc list-inside text-body-color dark:text-dark-6">
            <li>{text}</li>
          </ul>
        );

      case 'quote':
        return (
          <blockquote key={key} className="mb-4 pl-4 border-l-4 border-primary bg-gray-50 dark:bg-dark-2 py-2">
            <p className="text-body-color dark:text-dark-6 italic">
              {text}
            </p>
          </blockquote>
        );

      case 'code':
        return (
          <pre key={key} className="mb-4 p-4 bg-gray-100 dark:bg-dark-2 rounded-lg overflow-x-auto">
            <code className="text-sm text-body-color dark:text-dark-6">
              {text}
            </code>
          </pre>
        );

      default:
        return (
          <div key={key} className="mb-4 text-body-color dark:text-dark-6">
            {text}
          </div>
        );
    }
  };

  return (
    <div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default BlockRenderer;
