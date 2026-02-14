import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

/** コードがHTMLとして解釈できそうか簡易判定（言語未指定ブロック用） */
const looksLikeHtml = (s) => {
  const t = String(s).trim();
  if (!t) return false;
  return (
    /<!DOCTYPE\s+html/i.test(t) ||
    /^<html[\s>]/i.test(t) ||
    (/<\w+[\s/>]/.test(t) && /<\/\w+>/.test(t)) ||
    /<!--[\s\S]*-->/.test(t)
  );
};

const codeBlockStyle = {
  margin: 0,
  padding: '1rem',
  borderRadius: '0.5rem',
  overflow: 'auto',
  marginBottom: '1rem',
  fontSize: '0.875rem'
};

/** 全角アスタリスク（＊ U+FF0A）を半角（*）に変換。パーサーは半角の ** しか strong として解釈しない */
const normalizeAsterisks = (text) => {
  if (!text || typeof text !== 'string') return text;
  return String(text).replace(/\uFF0A/g, '*');
};

/** 全角シャープ（＃ U+FF03）を半角（#）に変換。見出しは半角 # でないとパーサーが認識しない */
const normalizeHashes = (text) => {
  if (!text || typeof text !== 'string') return text;
  return String(text).replace(/\uFF03/g, '#');
};

/** CommonMarkでは ** と文字の間にスペースがあると太字にならないため、前処理で正規化する */
const normalizeBoldDelimiters = (text) => {
  if (!text || typeof text !== 'string') return text;
  let t = normalizeAsterisks(text);
  // 半角・全角スペースのみ削除（改行は残す。\s だと \n も消えて段落が繋がる）
  t = t.replace(/\*\*[ \t\u3000]+/g, '**').replace(/[ \t\u3000]+\*\*/g, '**');
  return t;
};

/**
 * コードブロックのフェンスが '''（シングルクォート3つ）で書かれているとパーサーが認識しないため、
 * 行頭の ''' を ```（バッククォート3つ）に置き換える。
 */
const normalizeCodeFences = (text) => {
  if (!text || typeof text !== 'string') return text;
  let t = text;
  // 閉じフェンス：行が ''' だけ（＋任意の空白）→ ```
  t = t.replace(/(^|\n)'''\s*(\n|$)/g, '$1```\n$2');
  // 開きフェンス：行頭の '''（例: '''html）→ ```
  t = t.replace(/(^|\n)'''/g, '$1```');
  return t;
};

/**
 * 閉じ忘れた ``` や ```html の直後から見出し・表までがコード扱いになるのを防ぐ。
 * 見出し（行頭の #{1,6}）または表の行（行頭の |）の直前に閉じフェンスを挿入する。
 */
const closeUnclosedFencedBlocks = (text) => {
  if (!text || typeof text !== 'string') return text;
  let t = text;
  // 開きフェンス → 何か → 見出し行（行全体）のパターンで、見出しの直前に ``` を挿入
  // $3 は見出し行全体（\n### 5. button：...）を保持するため [^\n]* で行末までキャプチャ
  t = t.replace(/(```(?:html)?\s*\r?\n)([\s\S]*?)(\r?\n\s*#{1,6}\s[^\n]*)/g, '$1$2\n```\n$3');
  // 開きフェンス → 何か → 表の行（| で始まる）のパターンでも同様に閉じる
  t = t.replace(/(```(?:html)?\s*\r?\n)([\s\S]*?)(\r?\n\s*\|[^\n]+)/g, '$1$2\n```\n$3');
  // すでに閉じられていた場合に ``` が連続するので、連続を1つに
  t = t.replace(/\n```\s*\n```\n/g, '\n```\n');
  return t;
};

/**
 * 表の行が改行なしで連結されている（|...||...|）場合に改行を挿入し、GFM表としてパースされるようにする。
 * パイプが6本以上ある行（＝2行分以上）かつ || を含む場合のみ置換し、通常のセル区切りは触らない。
 */
const ensureTableLineBreaks = (text) => {
  if (!text || typeof text !== 'string') return text;
  return String(text).split('\n').map((line) => {
    const pipeCount = (line.match(/\|/g) || []).length;
    if (pipeCount >= 6 && line.includes('||')) {
      return line.replace(/\|\s*\|/g, '|\n|');
    }
    return line;
  }).join('\n');
};

/** 見出し・太字・表・コードブロックが正しくパースされるよう正規化する */
const normalizeMarkdownDelimiters = (text) => {
  if (!text || typeof text !== 'string') return text;
  let t = String(text);
  t = normalizeCodeFences(t);  // ''' → ``` を先に（コードブロック認識のため）
  t = normalizeHashes(normalizeBoldDelimiters(t));
  t = closeUnclosedFencedBlocks(t);
  t = ensureTableLineBreaks(t);
  return t;
};

/**
 * 文字列中の **...** を strong と text のノード配列に展開する（再帰で複数 ** に対応）
 */
function expandTextWithStrong(value) {
  if (typeof value !== 'string') return [];
  if (!value.includes('**')) return value === '' ? [] : [{ type: 'text', value }];
  const parts = value.split('**');
  const nodes = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i] !== '') nodes.push(...expandTextWithStrong(parts[i]));
    } else {
      nodes.push({ type: 'strong', children: [{ type: 'text', value: parts[i] }] });
    }
  }
  return nodes;
}

/**
 * パース後も ** がそのまま残っているテキストを <strong> に変換する remark プラグイン。
 * パーサーが ** を解釈しない場合（全角・エスケープ等）のフォールバック。
 */
function remarkStrongFallback() {
  return (tree) => {
    visit(tree, (node) => {
      if (!node.children) return;
      const newChildren = [];
      for (const child of node.children) {
        if (child.type !== 'text' || typeof child.value !== 'string' || !child.value.includes('**')) {
          newChildren.push(child);
          continue;
        }
        newChildren.push(...expandTextWithStrong(child.value));
      }
      node.children = newChildren;
    });
  };
}

const MarkdownRenderer = ({ content, showToc = true, scrollContainerRef }) => {
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState('');
  const normalizedContent = normalizeMarkdownDelimiters(content);

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

  // コンテンツが変更されたときに見出しを抽出（正規化後のテキストを使用）
  useEffect(() => {
    if (normalizedContent) {
      const extractedHeadings = extractHeadings(normalizedContent);
      setHeadings(extractedHeadings);
    }
  }, [normalizedContent]);

  // 見出しのIDを生成する関数
  // 目次リンク（例: #第1章-日常でのai活用例, #第2章aiツールの体験）と一致する形式で生成
  const generateId = (text) => {
    if (!text) return '';
    
    // childrenが配列の場合（例: ["第1章 ", "日常でのAI活用例"]）は結合
    const textStr = Array.isArray(text)
      ? text.map(t => (typeof t === 'string' ? t : '')).join('')
      : text.toString();
    
    // Markdownの {#id} 形式をチェック（明示指定があればそれを優先）
    const idMatch = textStr.match(/\{#([^}]+)\}$/);
    if (idMatch) {
      return idMatch[1];
    }
    
    // 目次リンク形式に合わせる: スペース→ハイフン、英大文字→小文字、区切り記号を除去
    // 数字は半角に統一（全角数字があるとアンカーが効かない場合がある）
    return textStr
      .trim()
      .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)) // 全角数字→半角
      .replace(/[・．。、]/g, '') // 中黒・句読点を除去（リンク形式に合わせる）
      .replace(/\s*[：:]\s*/g, '') // 全角・半角コロンを除去
      .replace(/\s+/g, '-') // スペースをハイフンに変換
      .replace(/[Ａ-Ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)) // 全角英字→半角
      .replace(/[ａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .toLowerCase() // 英字を小文字に
      .replace(/-+/g, '-') // 連続ハイフンを1つに
      .replace(/^-|-$/g, '') // 先頭・末尾のハイフンを削除
      || 'section-' + Math.random().toString(36).substr(2, 9); // フォールバック
  };

  // 要素からスクロール可能な親を探索
  const findScrollParent = (el) => {
    let parent = el?.parentElement;
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      const overflow = style.overflow;
      if (overflowY === 'auto' || overflowY === 'scroll' || overflow === 'auto' || overflow === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  };

  // スムーススクロール関数（スクロールコンテナ内の場合はそのコンテナをスクロール）
  // アンカーIDの全角数字を半角に正規化（リンク先と見出しIDの一致用）
  const normalizeAnchorId = (str) =>
    String(str).replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

  const scrollToHeading = (id) => {
    const rawId = typeof id === 'string' ? id : '';
    const decodedId = (() => {
      try {
        return decodeURIComponent(rawId);
      } catch {
        return rawId;
      }
    })();
    const normalizedId = normalizeAnchorId(decodedId);
    const element =
      document.getElementById(decodedId) ||
      document.getElementById(normalizedId) ||
      document.getElementById(rawId);
    if (!element) return;

    const container = scrollContainerRef?.current ?? findScrollParent(element);
    if (container && container.contains(element)) {
      requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top + container.scrollTop;
        const scrollMargin = 80;
        container.scrollTo({
          top: Math.max(0, relativeTop - scrollMargin),
          behavior: 'smooth'
        });
      });
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      remarkPlugins={[remarkGfm, remarkStrongFallback]}
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
        strong: ({ children, ...props }) => (
          <strong className="font-bold" style={{ fontWeight: 700 }} {...props}>
            {children}
          </strong>
        ),
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
        code: ({ inline, className, children, ...props }) => {
          const match = /language-([\w-]+)/.exec(className ?? '');
          const codeString = String(children).replace(/\n$/, '');
          const lang = match ? match[1] : (looksLikeHtml(codeString) ? 'html' : null);

          // フェンス付きコードブロック（```html など）または言語未指定でHTMLと判定→ シンタックスハイライト
          if (!inline && lang) {
            return (
              <SyntaxHighlighter
                language={lang}
                style={oneLight}
                PreTag="div"
                customStyle={codeBlockStyle}
                codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
                showLineNumbers={false}
              >
                {codeString}
              </SyntaxHighlighter>
            );
          }
          // 言語未指定のブロック（HTMLでない）→ グレー枠のプレーン表示
          if (!inline) {
            return (
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <code className="text-sm font-mono text-gray-800" {...props}>
                  {children}
                </code>
              </pre>
            );
          }
          // インラインコード
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
          const isInternalAnchor = href && (href.startsWith('#') || href.includes('#'));
          let displayHref = href;
          let anchorId = '';
          if (isInternalAnchor) {
            const hashPart = href.includes('#') ? href.split('#')[1] || '' : href.replace(/^#/, '');
            try {
              anchorId = decodeURIComponent(hashPart);
              displayHref = '#' + anchorId;
            } catch {
              anchorId = hashPart;
            }
          }
          
          return (
            <a 
              {...props}
              href={isInternalAnchor ? displayHref : href}
              className="text-blue-600 hover:text-blue-800 underline" 
              target={isInternalAnchor ? undefined : "_blank"}
              rel={isInternalAnchor ? undefined : "noopener noreferrer"}
              onClick={isInternalAnchor ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollToHeading(anchorId || displayHref.replace(/^#/, ''));
              } : undefined}
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
      {normalizedContent}
    </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
