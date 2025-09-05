import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content }) => {
  // 見出しのIDを生成する関数
  const generateId = (text) => {
    if (!text) return '';
    
    const textStr = text.toString();
    
    // Markdownの {#id} 形式をチェック
    const idMatch = textStr.match(/\{#([^}]+)\}$/);
    if (idMatch) {
      return idMatch[1];
    }
    
    // 日本語の見出しを英数字に変換するマッピング
    const japaneseToEnglish = {
      '第1章': 'chapter-1',
      '第2章': 'chapter-2', 
      '第3章': 'chapter-3',
      '第4章': 'chapter-4',
      '第5章': 'chapter-5',
      'コンピュータの基本構造と役割': 'computer-basics',
      'Windows 11の基本操作': 'windows-11-basics',
      'ソフトウェアの基本操作': 'software-basics',
      '外付けハードウェアデバイスの使用方法': 'external-devices',
      'Q&Aセッション': 'qa-session',
      'はじめに': 'introduction',
      'まとめ': 'summary',
      '総論': 'conclusion'
    };
    
    // マッピングに一致する場合は変換
    for (const [japanese, english] of Object.entries(japaneseToEnglish)) {
      if (textStr.includes(japanese)) {
        return english;
      }
    }
    
    // マッピングにない場合は、英数字のみを抽出してIDを生成
    return textStr
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 特殊文字を削除
      .replace(/\s+/g, '-') // スペースをハイフンに変換
      .replace(/-+/g, '-') // 連続するハイフンを1つに
      .replace(/^-|-$/g, '') // 先頭と末尾のハイフンを削除
      .replace(/[^\w-]/g, '') // 英数字とハイフン以外を削除
      || 'section-' + Math.random().toString(36).substr(2, 9); // フォールバック
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }) => {
          const id = generateId(children);
          return (
            <h1 
              id={id} 
              className="text-3xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b-2 border-blue-200 scroll-mt-20"
              {...props}
            >
              {children}
            </h1>
          );
        },
        h2: ({ children, ...props }) => {
          const id = generateId(children);
          return (
            <h2 
              id={id} 
              className="text-2xl font-bold text-gray-700 mt-6 mb-3 pb-1 border-b border-blue-100 scroll-mt-16"
              {...props}
            >
              {children}
            </h2>
          );
        },
        h3: ({ children, ...props }) => {
          const id = generateId(children);
          return (
            <h3 
              id={id} 
              className="text-xl font-semibold text-gray-700 mt-4 mb-2 scroll-mt-12"
              {...props}
            >
              {children}
            </h3>
          );
        },
        p: ({ children, ...props }) => (
          <p className="text-gray-700 leading-relaxed mb-4" {...props}>
            {children}
          </p>
        ),
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="ml-4" {...props}>
            {children}
          </li>
        ),
        blockquote: ({ children, ...props }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-gray-700 italic mb-4" {...props}>
            {children}
          </blockquote>
        ),
        code: ({ children, className, ...props }) => {
          if (className && className.startsWith('language-')) {
            return (
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <code className={`${className} text-sm`} {...props}>
                  {children}
                </code>
              </pre>
            );
          }
          return (
            <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300" {...props}>
              {children}
            </table>
          </div>
        ),
        th: ({ children, ...props }) => (
          <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="border border-gray-300 px-4 py-2" {...props}>
            {children}
          </td>
        ),
        a: ({ children, href, ...props }) => (
          <a 
            href={href} 
            className="text-blue-600 hover:text-blue-800 underline" 
            target="_blank" 
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        img: ({ src, alt, ...props }) => (
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full h-auto rounded-lg shadow-md my-4" 
            {...props}
          />
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
