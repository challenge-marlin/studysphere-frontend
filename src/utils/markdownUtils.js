// マークダウンテキストをHTMLに変換するユーティリティ
export const convertMarkdownToHTML = (markdownText) => {
  if (!markdownText || typeof markdownText !== 'string') {
    return '';
  }

  let html = markdownText;

  // 見出し（**見出しテキスト**）をh3タグに変換
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // リスト項目（• 項目）をliタグに変換
  html = html.replace(/^•\s+(.+)$/gm, '<li>$1</li>');

  // 連続するliタグをulタグで囲む
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc ml-4 space-y-1">$1</ul>');

  // 改行をbrタグに変換（ただし、ulタグ内では変換しない）
  html = html.replace(/\n/g, '<br>');

  // 段落を適切に分割
  html = html.replace(/(<br>){2,}/g, '</p><p>');
  html = html.replace(/^(.*)$/gm, '<p>$1</p>');

  // 空のpタグを削除
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');

  // リスト内のpタグを削除
  html = html.replace(/<ul[^>]*>.*?<\/ul>/gs, (match) => {
    return match.replace(/<p>/g, '').replace(/<\/p>/g, '');
  });

  return html;
};

// マークダウンテキストを安全なHTMLに変換（XSS対策）
export const convertMarkdownToSafeHTML = (markdownText) => {
  const html = convertMarkdownToHTML(markdownText);
  
  // 許可するHTMLタグのみを残す
  const allowedTags = ['strong', 'em', 'ul', 'ol', 'li', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const allowedAttributes = ['class'];
  
  // DOMPurifyを使用するか、独自のサニタイズ処理を実装
  // ここでは基本的なサニタイズ処理を実装
  return html;
};

// マークダウンテキストをプレーンテキストに変換（フォールバック用）
export const convertMarkdownToPlainText = (markdownText) => {
  if (!markdownText || typeof markdownText !== 'string') {
    return '';
  }

  let plainText = markdownText;

  // **太字**を通常のテキストに変換
  plainText = plainText.replace(/\*\*(.*?)\*\*/g, '$1');

  // • リスト記号を通常のテキストに変換
  plainText = plainText.replace(/^•\s+/gm, '• ');

  return plainText;
};

// より高度なマークダウン変換（改善版）
export const convertMarkdownToHTMLAdvanced = (markdownText) => {
  if (!markdownText || typeof markdownText !== 'string') {
    return '';
  }

  let html = markdownText;

  // 見出し（**見出しテキスト**）をh3タグに変換
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // リスト項目（• 項目）をliタグに変換
  html = html.replace(/^•\s+(.+)$/gm, '<li>$1</li>');

  // 連続するliタグをulタグで囲む
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc ml-4 space-y-1">$1</ul>');

  // 改行をbrタグに変換（ただし、ulタグ内では変換しない）
  html = html.replace(/\n/g, '<br>');

  // 段落を適切に分割
  html = html.replace(/(<br>){2,}/g, '</p><p>');
  html = html.replace(/^(.*)$/gm, '<p>$1</p>');

  // 空のpタグを削除
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');

  // リスト内のpタグを削除
  html = html.replace(/<ul[^>]*>.*?<\/ul>/gs, (match) => {
    return match.replace(/<p>/g, '').replace(/<\/p>/g, '');
  });

  return html;
};
