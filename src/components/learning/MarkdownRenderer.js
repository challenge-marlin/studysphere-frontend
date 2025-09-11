import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content, showToc = true }) => {
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState('');

  // 見出しを抽出する関数
  const extractHeadings = (markdownContent) => {
    const headingRegex = /^(#{1,6})\s+(.+?)(?:\s*\{#([^}]+)\})?\s*$/gm;
    const extractedHeadings = [];
    let match;

    while ((match = headingRegex.exec(markdownContent)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const customId = match[3];
      const id = customId || generateId(text);
      
      extractedHeadings.push({
        level,
        text,
        id,
        customId: !!customId
      });
    }
    
    return extractedHeadings;
  };

  // アクティブな見出しを監視する
  useEffect(() => {
    if (!showToc || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings, showToc]);

  // コンテンツが変更されたときに見出しを抽出
  useEffect(() => {
    if (content) {
      const extractedHeadings = extractHeadings(content);
      setHeadings(extractedHeadings);
    }
  }, [content]);

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

  // スムーススクロール関数
  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // 目次コンポーネント
  const TableOfContents = () => {
    if (!showToc || headings.length === 0) return null;

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          目次
        </h3>
        <nav className="space-y-1">
          {headings.map((heading, index) => (
            <button
              key={index}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                activeHeading === heading.id
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
              style={{ paddingLeft: `${(heading.level - 1) * 16 + 12}px` }}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <div className="markdown-content">
      <TableOfContents />
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }) => {
          const id = generateId(children);
          // {#id}部分を除去したテキストを表示
          const displayText = Array.isArray(children) 
            ? children.map(child => 
                typeof child === 'string' 
                  ? child.replace(/\s*\{#[^}]+\}\s*$/, '') 
                  : child
              )
            : typeof children === 'string' 
              ? children.replace(/\s*\{#[^}]+\}\s*$/, '') 
              : children;
          
          return (
            <h1 
              id={id} 
              className="text-3xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b-2 border-blue-200 scroll-mt-20 group relative"
              {...props}
            >
              {displayText}
              <button
                onClick={() => scrollToHeading(id)}
                className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 hover:text-blue-700 transition-opacity duration-200"
                title="この見出しへのリンクをコピー"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            </h1>
          );
        },
        h2: ({ children, ...props }) => {
          const id = generateId(children);
          // {#id}部分を除去したテキストを表示
          const displayText = Array.isArray(children) 
            ? children.map(child => 
                typeof child === 'string' 
                  ? child.replace(/\s*\{#[^}]+\}\s*$/, '') 
                  : child
              )
            : typeof children === 'string' 
              ? children.replace(/\s*\{#[^}]+\}\s*$/, '') 
              : children;
          
          return (
            <h2 
              id={id} 
              className="text-2xl font-bold text-gray-700 mt-6 mb-3 pb-1 border-b border-blue-100 scroll-mt-16 group relative"
              {...props}
            >
              {displayText}
              <button
                onClick={() => scrollToHeading(id)}
                className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 hover:text-blue-700 transition-opacity duration-200"
                title="この見出しへのリンクをコピー"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            </h2>
          );
        },
        h3: ({ children, ...props }) => {
          const id = generateId(children);
          // {#id}部分を除去したテキストを表示
          const displayText = Array.isArray(children) 
            ? children.map(child => 
                typeof child === 'string' 
                  ? child.replace(/\s*\{#[^}]+\}\s*$/, '') 
                  : child
              )
            : typeof children === 'string' 
              ? children.replace(/\s*\{#[^}]+\}\s*$/, '') 
              : children;
          
          return (
            <h3 
              id={id} 
              className="text-xl font-semibold text-gray-700 mt-4 mb-2 scroll-mt-12 group relative"
              {...props}
            >
              {displayText}
              <button
                onClick={() => scrollToHeading(id)}
                className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 hover:text-blue-700 transition-opacity duration-200"
                title="この見出しへのリンクをコピー"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
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
        a: ({ children, href, ...props }) => {
          // ページ内アンカーリンクかどうかを判定
          const isInternalAnchor = href && href.startsWith('#');
          
          return (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline" 
              target={isInternalAnchor ? undefined : "_blank"}
              rel={isInternalAnchor ? undefined : "noopener noreferrer"}
              onClick={isInternalAnchor ? (e) => {
                e.preventDefault();
                const targetId = href.substring(1);
                const element = document.getElementById(targetId);
                if (element) {
                  element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              } : undefined}
              {...props}
            >
              {children}
            </a>
          );
        },
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
    </div>
  );
};

export default MarkdownRenderer;
