import parseHtml from './parseHtml';

describe('parseHtml', () => {
  it('should leave a regular string the same', () => {
    expect(parseHtml('hola amigo!')).toBe('hola amigo!');
  });

  it('should add attributes to links', () => {
    expect(parseHtml('hola amigo <a href="example.com">Dani</a>!')).toBe(
      'hola amigo <a href="example.com" target="_blank" rel="noopener noreferrer" class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary">Dani</a>!',
    );
  });
});
