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
      
      // Panggil API untuk membuat grup baru
      const result = await groupManager.createGroup(groupData);
      
      this.setData({ isLoading: false });
      
      // Tampilkan notifikasi sukses
      notificationManager.showToast('Grup berhasil dibuat', 'success');
      
      // Navigasi ke halaman detail grup
      my.navigateTo({
        url: `/pages/group-detail/group-detail?id=${result.groupId}`
      });
    } catch (error) {
      this.setData({ isLoading: false });
      
      // Tampilkan pesan error
      notificationManager.showToast(
        error.message || 'Gagal membuat grup. Silakan coba lagi.',
        'error'
      );
      
      console.error('Failed to create group:', error);
    }
  }
});
