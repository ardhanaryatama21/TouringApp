/**
 * Utilitas untuk memformat tanggal dan waktu
 */

/**
 * Format tanggal ke format Indonesia (DD/MM/YYYY)
 * @param {Date|String} date - Tanggal yang akan diformat
 * @returns {String} Tanggal dalam format Indonesia
 */
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format tanggal dan waktu ke format Indonesia (DD/MM/YYYY HH:MM)
 * @param {Date|String} date - Tanggal dan waktu yang akan diformat
 * @returns {String} Tanggal dan waktu dalam format Indonesia
 */
const formatDateTime = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format tanggal ke format Indonesia lengkap (DD Bulan YYYY)
 * @param {Date|String} date - Tanggal yang akan diformat
 * @returns {String} Tanggal dalam format Indonesia lengkap
 */
const formatDateLong = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const year = d.getFullYear();
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const month = monthNames[d.getMonth()];
  
  return `${day} ${month} ${year}`;
};

/**
 * Format waktu relatif (misalnya "5 menit yang lalu", "2 jam yang lalu")
 * @param {Date|String} date - Tanggal yang akan diformat
 * @returns {String} Waktu relatif dalam bahasa Indonesia
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 60) {
    return 'Baru saja';
  } else if (diffMin < 60) {
    return `${diffMin} menit yang lalu`;
  } else if (diffHour < 24) {
    return `${diffHour} jam yang lalu`;
  } else if (diffDay < 7) {
    return `${diffDay} hari yang lalu`;
  } else {
    return formatDate(date);
  }
};

export default {
  formatDate,
  formatDateTime,
  formatDateLong,
  formatRelativeTime
};
