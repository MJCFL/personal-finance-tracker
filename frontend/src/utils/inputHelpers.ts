/**
 * Utility functions for handling form inputs
 */

/**
 * Handles number input changes, properly managing leading zeros and empty values
 * 
 * @param value The current input value
 * @param onChange The onChange handler function for number state
 * @param allowEmpty Whether to allow empty values (defaults to true)
 * @param min Minimum allowed value (optional)
 * @returns void
 */
export const handleNumberInputChange = (
  value: string,
  onChange: (value: number | '') => void,
  allowEmpty: boolean = true,
  min?: number
): void => {
  // Handle empty input
  if (value === '') {
    if (allowEmpty) {
      onChange('');
    } else {
      onChange(min || 0);
    }
    return;
  }

  // Handle input with only a decimal point
  if (value === '.') {
    // We want to keep the decimal point but need to return a number
    // So we'll use 0 and let the input field show '0.'
    onChange(0);
    return;
  }

  // Handle single zero input - this is important to allow typing 0.xx
  if (value === '0') {
    onChange(0);
    return;
  }

  // Parse the value as a number
  const numValue = parseFloat(value);
  
  // Check if it's a valid number
  if (!isNaN(numValue)) {
    // Apply minimum value constraint if provided
    if (min !== undefined && numValue < min) {
      onChange(min);
    } else {
      onChange(numValue);
    }
  }
};

/**
 * Handles number input changes for string state, properly managing leading zeros and empty values
 * 
 * @param value The current input value
 * @param onChange The onChange handler function for string state
 * @param allowEmpty Whether to allow empty values (defaults to true)
 * @param min Minimum allowed value (optional)
 * @returns void
 */
export const handleStringNumberInputChange = (
  value: string,
  onChange: (value: string) => void,
  allowEmpty: boolean = true,
  min?: number
): void => {
  // Handle empty input
  if (value === '') {
    if (allowEmpty) {
      onChange('');
    } else {
      onChange(String(min || 0));
    }
    return;
  }

  // Handle input with only a decimal point
  if (value === '.') {
    onChange('0.');
    return;
  }

  // Always preserve the original input for valid number formats
  // This ensures we can type '0' and then continue with '0.xx'
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    // Apply minimum value constraint if provided
    if (min !== undefined && numValue < min) {
      onChange(String(min));
    } else {
      // Keep the original string to preserve leading zeros and formatting
      onChange(value);
    }
  }
};
