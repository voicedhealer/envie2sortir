import { validateFile, IMAGE_VALIDATION, DOCUMENT_VALIDATION } from '../../src/lib/security/file-validation';

// Mock File object for testing
const createMockFile = (name: string, size: number, type: string): File => {
  return {
    name,
    size,
    type,
  } as File;
};

describe('File Validation', () => {
  test('should validate correct image file', () => {
    const file = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');
    const result = validateFile(file, IMAGE_VALIDATION);
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('should reject oversized file', () => {
    const file = createMockFile('huge.jpg', 10 * 1024 * 1024, 'image/jpeg');
    const result = validateFile(file, IMAGE_VALIDATION);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('trop volumineux');
  });

  test('should reject invalid file type', () => {
    const file = createMockFile('test.txt', 1024, 'text/plain');
    const result = validateFile(file, IMAGE_VALIDATION);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('non autorisé');
  });

  test('should reject invalid extension', () => {
    const file = createMockFile('test.exe', 1024, 'image/jpeg');
    const result = validateFile(file, IMAGE_VALIDATION);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Extension non autorisée');
  });
});
