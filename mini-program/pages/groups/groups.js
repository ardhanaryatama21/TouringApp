const app = getApp();

Page({
  data: {
    activeTab: 'groups',
    groups: [],
    invitations: [],
    showModal: false,
    newGroup: {
      name: '',
      description: ''
    },
    isLoading: false
  },
  
  onLoad() {
    // Periksa status login
    if (!app.globalData.isLoggedIn) {
      my.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
  },
  
  onShow() {
    // Muat data grup dan undangan
    this.fetchGroups();
    this.fetchInvitations();
  },
  
  // Tab Navigation
  switchTab(e) {
    const tab = e.target.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },
  
  // Fetch data dari API
  fetchGroups() {
    const token = my.getStorageSync({ key: 'token' }).data;
    if (!token) return;
    
    this.setData({ isLoading: true });
    
    my.request({
      url: `${app.globalData.apiBaseUrl}/groups`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json',
      success: (res) => {
        if (res.data) {
          this.setData({
            groups: res.data
          });
        }
      },
      fail: (err) => {
        console.error('Fetch groups error:', err);
        my.showToast({
          type: 'fail',
          content: 'Gagal memuat grup. Silakan coba lagi.',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },
  
  fetchInvitations() {
    const token = my.getStorageSync({ key: 'token' }).data;
    if (!token) return;
    
    my.request({
      url: `${app.globalData.apiBaseUrl}/groups/invitations`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json',
      success: (res) => {
        if (res.data) {
          this.setData({
            invitations: res.data
          });
        }
      },
      fail: (err) => {
        console.error('Fetch invitations error:', err);
      }
    });
  },
  
  // Navigasi ke halaman buat grup
  showCreateGroupModal() {
    my.navigateTo({
      url: '/pages/create-group/create-group'
    });
  },
  
  hideCreateGroupModal() {
    this.setData({
      showModal: false
    });
  },
  
  onInputGroupName(e) {
    this.setData({
      'newGroup.name': e.detail.value
    });
  },
  
  onInputGroupDescription(e) {
    this.setData({
      'newGroup.description': e.detail.value
    });
  },
  
  createGroup() {
    const { name, description } = this.data.newGroup;
    
    // Validasi input
    if (!name || !description) {
      my.showToast({
        type: 'fail',
        content: 'Nama dan deskripsi grup harus diisi',
        duration: 2000
      });
      return;
    }
    
    const token = my.getStorageSync({ key: 'token' }).data;
    if (!token) return;
    
    this.setData({ isLoading: true });
    
    my.request({
      url: `${app.globalData.apiBaseUrl}/groups`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        name,
        description
      },
      dataType: 'json',
      success: (res) => {
        if (res.data) {
          my.showToast({
            type: 'success',
            content: 'Grup berhasil dibuat',
            duration: 2000
          });
          
          this.hideCreateGroupModal();
          this.fetchGroups();
        }
      },
      fail: (err) => {
        console.error('Create group error:', err);
        my.showToast({
          type: 'fail',
          content: 'Gagal membuat grup. Silakan coba lagi.',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },
  
  // Navigasi ke detail grup
  navigateToGroupDetail(e) {
    const groupId = e.currentTarget.dataset.id;
    my.navigateTo({
      url: `/pages/group-detail/group-detail?id=${groupId}`
    });
  },
  
  // Memulai panggilan grup
  initiateGroupCall(e) {
    e.stopPropagation(); // Mencegah navigasi ke detail grup
    
    const groupId = e.currentTarget.dataset.id;
    const groupName = e.currentTarget.dataset.name;
    
    my.navigateTo({
      url: `/pages/call/call?groupId=${groupId}&groupName=${groupName}`
    });
  },
  
  // Menerima undangan grup
  acceptInvitation(e) {
    const invitationId = e.currentTarget.dataset.id;
    const token = my.getStorageSync({ key: 'token' }).data;
    if (!token) return;
    
    this.setData({ isLoading: true });
    
    my.request({
      url: `${app.globalData.apiBaseUrl}/groups/invitations/${invitationId}/accept`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json',
      success: (res) => {
        if (res.data) {
          my.showToast({
            type: 'success',
            content: 'Undangan diterima',
            duration: 2000
          });
          
          // Refresh data
          this.fetchGroups();
          this.fetchInvitations();
        }
      },
      fail: (err) => {
        console.error('Accept invitation error:', err);
        my.showToast({
          type: 'fail',
          content: 'Gagal menerima undangan. Silakan coba lagi.',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },
  
  // Menolak undangan grup
  rejectInvitation(e) {
    const invitationId = e.currentTarget.dataset.id;
    const token = my.getStorageSync({ key: 'token' }).data;
    if (!token) return;
    
    this.setData({ isLoading: true });
    
    my.request({
      url: `${app.globalData.apiBaseUrl}/groups/invitations/${invitationId}/reject`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json',
      success: (res) => {
        if (res.data) {
          my.showToast({
            type: 'success',
            content: 'Undangan ditolak',
            duration: 2000
          });
          
          // Refresh data undangan
          this.fetchInvitations();
        }
      },
      fail: (err) => {
        console.error('Reject invitation error:', err);
        my.showToast({
          type: 'fail',
          content: 'Gagal menolak undangan. Silakan coba lagi.',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  }
});
