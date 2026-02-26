export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  // Explanation:
  // (?=.*[a-z]) -> at least one lowercase
  // (?=.*[A-Z]) -> at least one uppercase
  // (?=.*\d)    -> at least one number
  // (?=.*[\W_]) -> at least one special character (non-alphanumeric)
  // .{8,}       -> minimum 8 characters
  return passwordRegex.test(password);
};



export const formatDate = (date: Date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (val?: string) => {
  if (!val) return "-";

  const d = new Date(val);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-GB");
};


/** 
 * 1. Starts with 03
 * 2. Next 2 digits can be any number (total first 4 digits = 03xx)
 * 3. Then hyphen (-)
 * 4. Then 7 digits (total length = 11 including hyphen)
 * Example valid: 0324-8976543
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^03\d{2}-\d{7}$/;
  return phoneRegex.test(phone.trim());
};