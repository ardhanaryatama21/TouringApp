/**
 * Utilitas untuk validasi data input
 */

/**
 * Validasi email
 * @param {String} email - Email yang akan divalidasi
 * @returns {Boolean} True jika email valid, false jika tidak
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validasi password
 * @param {String} password - Password yang akan divalidasi
 * @param {Number} minLength - Panjang minimum password (default: 6)
 * @returns {Boolean} True jika password valid, false jika tidak
 */
const isValidPassword = (password, minLength = 6) => {
  return password && password.length >= minLength;
};

/**
 * Validasi konfirmasi password
 * @param {String} password - Password
 * @param {String} confirmPassword - Konfirmasi password
 * @returns {Boolean} True jika konfirmasi password sama dengan password, false jika tidak
 */
const isPasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validasi nama lengkap
 * @param {String} fullName - Nama lengkap yang akan divalidasi
 * @param {Number} minLength - Panjang minimum nama lengkap (default: 3)
 * @returns {Boolean} True jika nama lengkap valid, false jika tidak
 */
const isValidFullName = (fullName, minLength = 3) => {
  return fullName && fullName.trim().length >= minLength;
};

/**
 * Validasi username
 * @param {String} username - Username yang akan divalidasi
 * @param {Number} minLength - Panjang minimum username (default: 3)
 * @returns {Boolean} True jika username valid, false jika tidak
 */
const isValidUsername = (username, minLength = 3) => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return username && username.length >= minLength && usernameRegex.test(username);
};

/**
 * Validasi nama grup
 * @param {String} groupName - Nama grup yang akan divalidasi
 * @param {Number} minLength - Panjang minimum nama grup (default: 3)
 * @returns {Boolean} True jika nama grup valid, false jika tidak
 */
const isValidGroupName = (groupName, minLength = 3) => {
  return groupName && groupName.trim().length >= minLength;
};

/**
 * Validasi deskripsi grup
 * @param {String} description - Deskripsi grup yang akan divalidasi
 * @param {Number} minLength - Panjang minimum deskripsi grup (default: 10)
 * @returns {Boolean} True jika deskripsi grup valid, false jika tidak
 */
const isValidGroupDescription = (description, minLength = 10) => {
  return description && description.trim().length >= minLength;
};

export default {
  isValidEmail,
  isValidPassword,
  isPasswordMatch,
  isValidFullName,
  isValidUsername,
  isValidGroupName,
  isValidGroupDescription
};
