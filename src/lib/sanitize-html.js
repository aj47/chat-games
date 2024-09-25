export function sanitizeHtml(html) {
  // Remove all script tags and their contents
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove all event handlers
  html = html.replace(/ on\w+="[^"]*"/g, '');

  // Only allow specific tags
  const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br'];
  const tagRegex = new RegExp(`<(\/?)(${allowedTags.join('|')})([^>]*)>`, 'gi');
  
  html = html.replace(tagRegex, (match, close, tag, attrs) => {
    if (tag.toLowerCase() === 'a') {
      // Only allow href and target attributes for <a> tags
      attrs = attrs.replace(/(\w+)\s*=\s*("[^"]*"|'[^']*')/gi, (attrMatch, attrName, attrValue) => {
        if (['href', 'target'].includes(attrName.toLowerCase())) {
          return attrMatch;
        }
        return '';
      });
    } else {
      // Remove all attributes for other tags
      attrs = '';
    }
    return `<${close}${tag}${attrs}>`;
  });

  // Remove all other tags
  html = html.replace(/<[^>]+>/g, '');

  return { __html: html };
}
