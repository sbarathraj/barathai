
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple markdown renderer for basic formatting
  const renderMarkdown = (text: string) => {
    // Handle bold text with **text** or <BOLD>text</BOLD>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/<BOLD>(.*?)<\/BOLD>/g, '<strong>$1</strong>');
    
    // Handle italic text with *text* or <ITALIC>text</ITALIC>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/<ITALIC>(.*?)<\/ITALIC>/g, '<em>$1</em>');
    
    // Handle inline code with `code` or <INLINECODE>code</INLINECODE>
    text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    text = text.replace(/<INLINECODE>(.*?)<\/INLINECODE>/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Handle headers
    text = text.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-4 mb-2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>');
    
    // Handle line breaks
    text = text.replace(/\n/g, '<br>');
    
    // Handle horizontal rules
    text = text.replace(/^---$/gm, '<hr class="my-4 border-border">');
    
    return text;
  };

  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};
