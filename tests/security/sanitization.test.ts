import { sanitizeInput, sanitizeHTML } from '../../src/lib/security/sanitization';

describe('Input Sanitization', () => {
  test('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeInput(input);
    expect(result).toBe('scriptalert("xss")/scriptHello');
  });

  test('should remove event handlers', () => {
    const input = '<div onclick="alert(1)">Test</div>';
    const result = sanitizeInput(input);
    expect(result).toBe('div "alert(1)"Test/div');
  });

  test('should sanitize HTML content', () => {
    const html = '<script>alert("xss")</script><p>Safe content</p>';
    const result = sanitizeHTML(html);
    expect(result).toBe('<p>Safe content</p>');
  });

  test('should handle empty or invalid input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
  });
});
