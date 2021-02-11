import parseHtml from './parseHtml';

describe('parseHtml', () => {
  it('should leave a regular string the same', () => {
    expect(parseHtml('hola amigo!')).toBe('hola amigo!');
  });

  it('should add attributes to links', () => {
    const input = 'hola amigo <a href="http://example.com">Dani</a>!';
    const output =
      'hola amigo <a href="http://example.com" target="_blank" rel="noopener noreferrer" class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary">Dani</a>!';

    expect(parseHtml(input)).toBe(output);
  });

  it('should add attributes to links when they are alone', () => {
    const input = '<a href="example.com">Dani</a>';
    const output =
      '<a href="example.com" target="_blank" rel="noopener noreferrer" class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary">Dani</a>';

    expect(parseHtml(input)).toBe(output);
  });

  it('should add an A tag around regular links', () => {
    const input = 'Check out https://quatro.com today';
    const output =
      'Check out <a href="https://quatro.com" target="_blank" rel="noopener noreferrer" class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary">https://quatro.com</a> today';
    expect(parseHtml(input)).toBe(output);
  });

  it('should add an A tag around regular links with quary params', () => {
    const input = 'Check out https://quatro.com?faq today';
    const output =
      'Check out <a href="https://quatro.com?faq" target="_blank" rel="noopener noreferrer" class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary">https://quatro.com?faq</a> today';
    expect(parseHtml(input)).toBe(output);
  });

  it('should add an A tag around regular links when they are alone', () => {
    const input =
      'https://docs.google.com/document/d/1z9uK2gFBZeuiMLmsh08kf9RSmdj7RKzR1OC20U-m_cI/edit#heading=h.dvnefaql60r3';
    const output =
      '<a href="https://docs.google.com/document/d/1z9uK2gFBZeuiMLmsh08kf9RSmdj7RKzR1OC20U-m_cI/edit#heading=h.dvnefaql60r3" target="_blank" rel="noopener noreferrer" class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary">https://docs.google.com/document/d/1z9uK2gFBZeuiMLmsh08kf9RSmdj7RKzR1OC20U-m_cI/edit#heading=h.dvnefaql60r3</a>';
    expect(parseHtml(input)).toBe(output);
  });
});
