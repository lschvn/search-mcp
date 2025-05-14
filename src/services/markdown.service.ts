// src/services/markdown.service.ts
import Turndown from 'turndown';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { fetch } from 'undici';

const turndown = new Turndown({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full',
  preformattedCode: true,
});

turndown.remove([
  'script', 'style', 'iframe', 'noscript', 'canvas',
  'form', 'input', 'button', 'select', 'option', 'textarea',
  'object', 'embed', 'nav', 'footer', 'header', 'aside',
  'link', 'meta', 'base', 'img', 'picture',
]);

export abstract class Markdown {
  /** Convertit un blob HTML déjà récupéré */
  static convertHtml(html: string): string {
    let content = html;

    try {
      const dom = new JSDOM(html);
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      if (article?.content) content = article.content;
    } catch (e) {
      // Pas bloquant : on tombera sur le HTML brut
      console.warn('Readability extraction failed:', e);
    }

    let md = turndown.turndown(content);
    md = md.replace(/\[\s*\]\([^)]*\)/g, '')   // liens vides
           .replace(/\n{3,}/g, '\n\n')         // sauts de ligne excédentaires
           .trim();

    return md;
  }

  /** Récupère une URL et renvoie du Markdown prêt à ingérer par un LLM */
  static async fetchUrl(url: string): Promise<string> {
    const res = await fetch(url, { headers: { 'User-Agent': 'mcp-backend/0.1' } });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const html = await res.text();
    return Markdown.convertHtml(html);
  }
}
