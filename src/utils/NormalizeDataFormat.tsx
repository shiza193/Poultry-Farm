import { showErrorToast } from './AppToast';

/**
 * Normalize API data to expected type.
 * Handles backend format changes (array ↔ object).
 * Shows toast if type differs from expectation.
 *
 * @param data API response (object or array)
 * @param expectedType 'object' | 'array' (what  code expects)
 * @param label Optional label for toast
 * @returns normalized data in expected type
 */
export const normalizeDataFormat = (
  data: any,
  expectedType: 'object' | 'array' = 'object',
  label = 'Data',
) => {
  if (data === null || data === undefined) {
    return expectedType === 'array' ? [] : {};
  }

  // Type Checking

  const isArray = Array.isArray(data);
  const isObject = typeof data === 'object' && !isArray;

  // Matches expected type → return as is
  if (
    (expectedType === 'object' && isObject) ||
    (expectedType === 'array' && isArray)
  ) {
    return data;
  }

  // Show toast about format change
  showErrorToast(
    `${label} format changed! Expected ${expectedType}, got ${
      isArray ? 'array' : 'object'
    }.`,
  );


  //Conversion Logic

  // Convert to expected type
  if (expectedType === 'object') {
    // Convert array → object with { items: [...] }
    if (isArray) return { items: data };
    // Wrap primitive in object
    return { items: [data] };
  } else {
    // Convert object → array
    if (isObject) return Object.values(data);
    // Wrap primitive in array
    return [data];
  }
};






// important

// Array ko directly object nahi bana sakte

// To usay ek property ke andar rakh dete hain

// Safe wrapper bana diya

//  if (isArray) return { items: data };