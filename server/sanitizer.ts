import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const DOMPurify = createDOMPurify(dom.window as any);

export const ALLOWED_HTML_TAGS = [
  'p', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'img', 'br', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
];

export const ALLOWED_HTML_ATTRS = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
  'width', 'height', 'style',
  'colspan', 'rowspan', 'align', 'border', 'cellpadding', 'cellspacing'
];

DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href') || '';
    if (/^(javascript|vbscript|data:(?!image\/)):/i.test(href.trim())) {
      node.setAttribute('href', '#');
    }
    if (node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  }
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src') || '';
    if (/^(javascript|vbscript|data:(?!image\/(png|jpeg|jpg|webp|gif|svg\+xml))):/i.test(src.trim())) {
      node.setAttribute('src', '');
    }
  }
});

export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  try {
    const clean = DOMPurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS: ALLOWED_HTML_TAGS,
      ALLOWED_ATTR: ALLOWED_HTML_ATTRS,
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'applet', 'base', 'link', 'meta', 'style'],
      FORBID_ATTR: [
        'onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur',
        'onchange', 'onsubmit', 'onkeydown', 'onkeypress', 'onkeyup',
        'formaction', 'autofocus'
      ],
      ALLOW_DATA_ATTR: false,
      USE_PROFILES: { html: true }
    });

    return String(clean);
  } catch (err) {
    console.error('[Server Sanitizer] DOMPurify sanitize failed:', err);
    return dirtyHtml.replace(/<[^>]*>/g, '');
  }
}

export function sanitizeCss(dirtyCss: string | null | undefined): string {
  if (!dirtyCss || typeof dirtyCss !== 'string') {
    return '';
  }

  let clean = dirtyCss;
  clean = clean.replace(/<\/?style[^>]*>/gi, '');
  clean = clean.replace(/<\/?script[^>]*>/gi, '');
  clean = clean.replace(/expression\s*\([^)]*\)/gi, 'none');
  clean = clean.replace(/behavior\s*:[^;}]*/gi, '');
  clean = clean.replace(/url\s*\(\s*["']?\s*(?:javascript|vbscript|data:(?!image\/))[^)]*\)/gi, 'none');
  return clean;
}
