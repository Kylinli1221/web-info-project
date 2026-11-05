import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

export function renderMarkdown(value: string): string {
  const rendered = marked.parse(value, { async: false, gfm: true })

  return sanitizeHtml(rendered, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr', 'blockquote',
      'ul', 'ol', 'li',
      'a', 'strong', 'em', 'del',
      'pre', 'code',
      'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'rel'],
      code: ['class'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      th: ['align'],
      td: ['align'],
      col: ['span', 'width'],
    },
    allowedClasses: {
      code: [/^language-[a-z0-9_-]+$/i],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto'],
      img: ['http', 'https'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: 'a',
        attribs: {
          ...attributes,
          rel: 'noopener noreferrer',
        },
      }),
    },
  })
}
