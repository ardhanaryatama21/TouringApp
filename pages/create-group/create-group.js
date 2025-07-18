const app = getApp();
const validator = require('../../utils/validator');
const notificationManager = require('../../utils/notificationManager');
const groupManager = require('../../utils/groupManager');

Page({
  data: {
    groupName: '',
    description: '',
    categories: ['Wisata', 'Pendakian', 'Pantai', 'Gunung', 'Lainnya'],
    categoryIndex: 0,
    selectedIcon: 'travel',
    isLoading: false,
    errors: {}
  },
  
  onLoad() {
    // Periksa apakah pengguna sudah login
    const token = my.getStorageSync({ key: 'token' }).data;
    if (!token) {
      my.redirectTo({ url: '/pages/login/login' });
      return;
    }
  },
  
  navigateBack() {
    my.navigateBack();
  },
  
  onGroupNameInput(e) {
    this.setData({
      groupName: e.detail.value,
      'errors.groupName': null
    });
  },
  
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value,
      'errors.description': null
    });
  },
  
  onCategoryChange(e) {
    this.setData({
      categoryIndex: e.detail.value
    });
  },
  
  selectIcon(e) {
    const icon = e.target.dataset.icon;
    this.setData({
      selectedIcon: icon
    });
  },
  
  validateForm() {
    const errors = {};
    let isValid = true;
    
    // Validasi nama grup
    if (!validator.isValidGroupName(this.data.groupName)) {
      errors.groupName = 'Nama grup harus minimal 3 karakter';
      isValid = false;
    }
    
    // Validasi deskripsi
    if (!validator.isValidGroupDescription(this.data.description)) {
      errors.description = 'Deskripsi grup harus minimal 10 karakter';
      isValid = false;
    }
    
    this.setData({ errors });
    return isValid;
  },
  
  async createGroup() {
    // Validasi form
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({ isLoading: true });
    
    try {
      const groupData = {
        name: this.data.groupName,
        description: this.data.description,
        category: this.data.categories[this.data.categoryIndex],
        icon: this.data.selectedIcon
      };
      
      console.log('Mencoba membuat grup dengan data:', JSON.stringify(groupData));
      
      // Panggil API untuk membuat grup baru
      const result = await groupManager.createGroup(groupData);
      
      this.setData({ isLoading: false });
      
      // Tampilkan notifikasi sukses
      notificationManager.showToast('Grup berhasil dibuat', 'success');
      
      // Navigasi ke halaman detail grup
      console.log('Hasil pembuatan grup:', JSON.stringify(result));
      
      if (result && result._id) {
        // Format baru - respons dari backend yang sudah diperbaiki
        my.navigateTo({
          url: `/pages/group-detail/group-detail?id=${result._id}`
        });
      } else if (result && result._id) {
        // Format lama - respons langsung dari MongoDB
        my.navigateTo({
          url: `/pages/group-detail/group-detail?id=${result._id}`
        });
      } else {
        console.error('Grup berhasil dibuat tetapi tidak ada ID yang dikembalikan:', result);
        // Navigasi ke halaman groups
        my.switchTab({
          url: '/pages/groups/groups'
        });
      }
    } catch (error) {
      this.setData({ isLoading: false });
      
      // Log error secara detail
      console.error('Error saat membuat grup:', error);
      if (error.response) {
        console.error('Response error:', JSON.stringify(error.response));
      }
      
      // Tampilkan pesan error yang lebih spesifik
      let errorMessage = 'Gagal membuat grup. Silakan coba lagi.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 401) {
        errorMessage = 'Sesi login Anda telah berakhir. Silakan login kembali.';
        // Redirect ke halaman login
        setTimeout(() => {
          my.redirectTo({ url: '/pages/login/login' });
        }, 2000);
      }
      
      notificationManager.showToast(errorMessage, 'error');
    }
  }
});
