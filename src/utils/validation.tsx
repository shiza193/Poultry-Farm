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