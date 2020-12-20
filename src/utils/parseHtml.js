import flow from 'lodash/flow';
import DOMPurify from 'dompurify';

const removeLinkTarget = (html) => html.replace(/<a\s(.+)(target="[\s_a-z]")(.+)>/gi, '<a $1$2>');
const removeLinkRel = (html) => html.replace(/<a\s(.+)(rel="[\s_a-z]")(.+)>/gi, '<a $1$2>');
const addLinkAttrs = (html) =>
  html.replace(/<a\s([^>]+)>/gi, '<a $1 target="_blank" rel="noopener noreferrer">');
const addLinksToPlainUrls = (html) =>
  html.replace(
    /[^"](https?:\/\/[A-Za-z0-9-._~:/?#[\]@!$&'()*+,;%=]*)/,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );

const addMuiClassNames = (html) =>
  html.replace(
    /<a\s([^>]+)>/gi,
    '<a $1 class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary">',
  );

const parseHtml = flow([
  DOMPurify.sanitize,
  removeLinkTarget,
  removeLinkRel,
  addLinkAttrs,
  addLinksToPlainUrls,
  addMuiClassNames,
  (html) => html.trim(),
]);

export default parseHtml;
