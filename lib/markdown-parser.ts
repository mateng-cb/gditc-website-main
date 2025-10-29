/**
 * Markdown 解析器
 * 支持常见的 Markdown 语法转换为 HTML
 */

export interface MarkdownOptions {
  // 是否允许HTML标签
  allowHtml?: boolean;
  // 是否在新窗口打开链接
  openLinksInNewTab?: boolean;
  // 图片样式
  imageStyle?: string;
  // 代码块样式
  codeBlockStyle?: string;
}

export class MarkdownParser {
  private options: MarkdownOptions;

  constructor(options: MarkdownOptions = {}) {
    this.options = {
      allowHtml: false,
      openLinksInNewTab: true,
      imageStyle: 'max-width:100%;height:auto;display:block;margin:1rem auto;border-radius:8px;',
      codeBlockStyle: 'background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;padding:1rem;margin:1rem 0;font-family:monospace;overflow-x:auto;',
      ...options
    };
  }

  /**
   * 解析 Markdown 文本为 HTML
   */
  parse(markdown: string): string {
    if (!markdown) return '';

    let html = markdown;

    // 1. 代码块 (```code```)
    html = this.parseCodeBlocks(html);

    // 2. 行内代码 (`code`)
    html = this.parseInlineCode(html);

    // 3. 粗体 (**text** 或 __text__)
    html = this.parseBold(html);

    // 4. 斜体 (*text* 或 _text_)
    html = this.parseItalic(html);

    // 5. 删除线 (~~text~~)
    html = this.parseStrikethrough(html);

    // 6. 标题 (# ## ### #### ##### ######)
    html = this.parseHeaders(html);

    // 7. 链接 [text](url)
    html = this.parseLinks(html);

    // 8. 图片 ![alt](url)
    html = this.parseImages(html);

    // 9. 列表 (- item 或 * item 或 1. item)
    html = this.parseLists(html);

    // 10. 引用 (> text)
    html = this.parseBlockquotes(html);

    // 11. 水平线 (--- 或 ***)
    html = this.parseHorizontalRules(html);

    // 12. 换行和段落
    html = this.parseLineBreaks(html);

    return html;
  }

  /**
   * 解析代码块
   */
  private parseCodeBlocks(text: string): string {
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const lang = language || '';
      return `<pre style="${this.options.codeBlockStyle}"><code class="language-${lang}">${this.escapeHtml(code.trim())}</code></pre>`;
    });
  }

  /**
   * 解析行内代码
   */
  private parseInlineCode(text: string): string {
    return text.replace(/`([^`]+)`/g, '<code style="background:#f1f3f4;padding:2px 4px;border-radius:3px;font-family:monospace;font-size:0.9em;">$1</code>');
  }

  /**
   * 解析粗体
   */
  private parseBold(text: string): string {
    // **text** 或 __text__
    return text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  }

  /**
   * 解析斜体
   */
  private parseItalic(text: string): string {
    // *text* 或 _text_ (但不能与粗体冲突)
    return text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
               .replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
  }

  /**
   * 解析删除线
   */
  private parseStrikethrough(text: string): string {
    return text.replace(/~~(.*?)~~/g, '<del>$1</del>');
  }

  /**
   * 解析标题
   */
  private parseHeaders(text: string): string {
    return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h${level} id="${id}" style="margin-top:1.5rem;margin-bottom:0.5rem;font-weight:bold;line-height:1.2;">${title}</h${level}>`;
    });
  }

  /**
   * 解析链接
   */
  private parseLinks(text: string): string {
    const target = this.options.openLinksInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2"${target} style="color:#3b82f6;text-decoration:underline;">$1</a>`);
  }

  /**
   * 解析图片
   */
  private parseImages(text: string): string {
    return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      return `<img src="${src}" alt="${alt}" style="${this.options.imageStyle}" loading="lazy" />`;
    });
  }

  /**
   * 解析列表
   */
  private parseLists(text: string): string {
    // 无序列表
    text = text.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li style="margin:0.25rem 0;">$1</li>');
    text = text.replace(/(<li[^>]*>.*<\/li>)/s, '<ul style="margin:1rem 0;padding-left:1.5rem;">$1</ul>');
    
    // 有序列表
    text = text.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li style="margin:0.25rem 0;">$1</li>');
    text = text.replace(/(<li[^>]*>.*<\/li>)/s, '<ol style="margin:1rem 0;padding-left:1.5rem;">$1</ol>');
    
    return text;
  }

  /**
   * 解析引用
   */
  private parseBlockquotes(text: string): string {
    return text.replace(/^>\s*(.+)$/gm, '<blockquote style="border-left:4px solid #e5e7eb;padding-left:1rem;margin:1rem 0;color:#6b7280;font-style:italic;">$1</blockquote>');
  }

  /**
   * 解析水平线
   */
  private parseHorizontalRules(text: string): string {
    return text.replace(/^[-*_]{3,}$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:2rem 0;" />');
  }

  /**
   * 解析换行和段落
   */
  private parseLineBreaks(text: string): string {
    // 将两个以上换行视为新段落
    text = text.replace(/\n{2,}/g, '</p><p>');
    // 将单换行转为 <br/>
    text = text.replace(/\n/g, '<br/>');
    // 包一层段落，避免裸文本
    if (!/^\s*<p[>\s]/i.test(text)) {
      text = `<p style="margin:1rem 0;line-height:1.6;">${text}</p>`;
    }
    return text;
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    if (this.options.allowHtml) {
      return text;
    }
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 检查文本是否包含 Markdown 语法
   */
  static isMarkdown(text: string): boolean {
    if (!text) return false;
    
    const markdownPatterns = [
      /!\[[^\]]*\]\([^)]+\)/,  // 图片
      /\[[^\]]+\]\([^)]+\)/,   // 链接
      /\*\*.*?\*\*/,           // 粗体
      /__.*?__/,               // 粗体
      /\*[^*]+\*/,             // 斜体
      /_[^_]+_/,               // 斜体
      /`[^`]+`/,               // 行内代码
      /```[\s\S]*?```/,        // 代码块
      /^#{1,6}\s+.+$/m,        // 标题
      /^[-*+]\s+.+$/m,         // 无序列表
      /^\d+\.\s+.+$/m,         // 有序列表
      /^>\s+.+$/m,             // 引用
      /^[-*_]{3,}$/m,          // 水平线
      /~~.*?~~/                // 删除线
    ];
    
    return markdownPatterns.some(pattern => pattern.test(text));
  }
}

// 默认解析器实例
export const defaultMarkdownParser = new MarkdownParser();

// 便捷函数
export function parseMarkdown(text: string, options?: MarkdownOptions): string {
  const parser = new MarkdownParser(options);
  return parser.parse(text);
}

export function isMarkdown(text: string): boolean {
  return MarkdownParser.isMarkdown(text);
}
