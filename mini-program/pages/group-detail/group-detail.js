const app = getApp();

Page({
  data: {
    groupId: '',
    group: null,
    createdDate: '',
    isCreator: false,
    showInviteModal: false,
    inviteEmail: '',
    isLoading: false
  },
  
  onLoad(query) {
    // Periksa status login
    if (!app.globalData.isLoggedIn) {
      my.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    if (query.id) {
      this.setData({
        groupId: query.id
      });
      this.fetchGroupDetails(query.id);
    }
  },
  
  // Fetch data grup dari API
  fetchGroupDetails(groupId) {
    const token = my.getStorageSync({ key: 'token' }).data;
    const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
    if (!token) return;
    
    this.setData({ isLoading: true });
    
    my.request({
      url: `${app.globalData.apiBaseUrl}/groups/${groupId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json',
      success: (res) => {
        if (res.data) {
          // Format tanggal
          const createdAt = new Date(res.data.createdAt);
          const formattedDate = `${createdAt.getDate()}/${createdAt.getMonth() + 1}/${createdAt.getFullYear()}`;
          
          // Cek apakah pengguna adalah pembuat grup
          const isCreator = res.data.creator._id === userInfo._id;
          
          this.setData({
            group: res.data,
            createdDate: formattedDate,
            isCreator
          });
        }
      },
      fail: (err) => {
        console.error('Fetch group details error:', err);
        my.showToast({
          type: 'fail',
          content: 'Gagal memuat detail grup. Silakan coba lagi.',
          duration: 2000
        });
        
        // Kembali ke halaman sebelumnya jika gagal memuat
        my.navigateBack();
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },
  
  // Navigasi kembali
  navigateBack() {
    my.navigateBack();
  },
  
  // Memulai panggilan grup
  initiateGroupCall() {
    const { groupId, group } = this.data;
    
    my.navigateTo({
      url: `/pages/call/call?groupId=${groupId}&groupName=${group.name}`
    });
  },
  
  // Modal untuk mengundang anggota
  showInviteModal() {
    this.setData({
      showInviteModal: true,
      inviteEmail: ''
    });
  },
  
  hideInviteModal() {
    this.setData({
      showInviteModal: false
    });
  },
  
  onInputInviteEmail(e) {
    this.setData({
      inviteEmail: e.detail.value
    });
  },
  
  // Mengundang anggota baru
  inviteMember() {
    const { groupId, inviteEmail } = this.data;
    
    // Validasi email
    if (!inviteEmail) {
      my.showToast({
        type: 'fail',
        content: 'Email harus diisi',
        duration: 2000
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      my.showToast({
        type: 'fail',
        content: 'Format email tidak valid',
        duration: 2000
      });
      return;
    }
    
    const token = my.getStorageSync({ key: 'token' }).data;
    if (!token) return;
    
    this.setData({ isLoading: true });
    
    my.request({
      url: `${app.globalData.apiBaseUrl}/groups/${groupId}/invite`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        email: inviteEmail
      },
      dataType: 'json',
      success: (res) => {
        if (res.data) {
          my.showToast({
            type: 'success',
            content: 'Undangan berhasil dikirim',
            duration: 2000
          });
          
          this.hideInviteModal();
        }
      },
      fail: (err) => {
        console.error('Invite member error:', err);
        
        let errorMessage = 'Gagal mengirim undangan. Silakan coba lagi.';
        
        // Cek pesan error dari server
        if (err.data && err.data.message) {
          if (err.data.message.includes('not found')) {
            errorMessage = 'Pengguna dengan email tersebut tidak ditemukan';
          } else if (err.data.message.includes('already a member')) {
            errorMessage = 'Pengguna sudah menjadi anggota grup ini';
          } else if (err.data.message.includes('already invited')) {
            errorMessage = 'Pengguna sudah diundang sebelumnya';
          } else {
            errorMessage = err.data.message;
          }
        }
        
        my.showToast({
          type: 'fail',
          content: errorMessage,
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  }
});
