import { validateIdParam, validateRequiredFields } from '../../utils/validators';
import { ValidationError } from '../../utils/errors';

describe('Validators', () => {
  describe('validateIdParam', () => {
    it('should return valid positive integer', () => {
      const result = validateIdParam('123', 'test ID');
      expect(result).toBe(123);
    });

    it('should throw error for non-numeric string', () => {
      expect(() => {
        validateIdParam('abc', 'test ID');
      }).toThrow(ValidationError);
      
      expect(() => {
        validateIdParam('abc', 'test ID');
      }).toThrow('Invalid test ID: must be a positive integer');
    });

    it('should throw error for negative number', () => {
      expect(() => {
        validateIdParam('-5', 'test ID');
      }).toThrow(ValidationError);
    });

    it('should throw error for zero', () => {
      expect(() => {
        validateIdParam('0', 'test ID');
      }).toThrow(ValidationError);
    });

    it('should throw error for decimal number', () => {
      expect(() => {
        validateIdParam('12.5', 'test ID');
      }).toThrow(ValidationError);
    });

    it('should throw error for empty string', () => {
      expect(() => {
        validateIdParam('', 'test ID');
      }).toThrow(ValidationError);
    });
  });

  describe('validateRequiredFields', () => {
    it('should not throw error when all required fields are present', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        age: 30
      };

      expect(() => {
        validateRequiredFields(obj, ['name', 'email']);
      }).not.toThrow();
    });

    it('should throw error when a required field is missing', () => {
      const obj = {
        name: 'John',
        age: 30
      };

      expect(() => {
        validateRequiredFields(obj, ['name', 'email']);
      }).toThrow(ValidationError);
      
      expect(() => {
        validateRequiredFields(obj, ['name', 'email']);
      }).toThrow('Missing required fields: email');
    });

    it('should throw error when multiple required fields are missing', () => {
      const obj = {
        age: 30
      };

      expect(() => {
        validateRequiredFields(obj, ['name', 'email', 'phone']);
      }).toThrow(ValidationError);
      
      expect(() => {
        validateRequiredFields(obj, ['name', 'email', 'phone']);
      }).toThrow('Missing required fields: name, email, phone');
    });

    it('should not throw error for empty required fields array', () => {
      const obj = {
        name: 'John'
      };

      expect(() => {
        validateRequiredFields(obj, []);
      }).not.toThrow();
    });

    it('should treat null values as missing', () => {
      const obj = {
        name: 'John',
        email: null
      };

      expect(() => {
        validateRequiredFields(obj, ['name', 'email']);
      }).toThrow(ValidationError);
    });

    it('should treat undefined values as missing', () => {
      const obj = {
        name: 'John',
        email: undefined
      };

      expect(() => {
        validateRequiredFields(obj, ['name', 'email']);
      }).toThrow(ValidationError);
    });

    it('should treat empty string as present', () => {
      const obj = {
        name: 'John',
        email: ''
      };

      expect(() => {
        validateRequiredFields(obj, ['name', 'email']);
      }).toThrow(ValidationError);
    });
  });
});

