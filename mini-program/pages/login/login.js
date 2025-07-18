const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    isLoading: false
  },
  
  onLoad() {
    // Halaman dimuat
  },
  
  onInputUsername(e) {
    this.setData({
      username: e.detail.value
    });
  },
  
  onInputPassword(e) {
    this.setData({
      password: e.detail.value
    });
  },
  
  handleLogin() {
    const { username, password } = this.data;
    
    // Validasi input
    if (!username || !password) {
      my.showToast({
        type: 'fail',
        content: 'Username dan password harus diisi',
        duration: 2000
      });
      return;
    }
    
    this.setData({ isLoading: true });
    
    // Kirim permintaan login ke API
    const loginUrl = `${app.globalData.apiBaseUrl}/api/auth/login`;
    console.log('Login URL (full):', loginUrl);
    console.log('API Base URL:', app.globalData.apiBaseUrl);
    console.log('API Path:', '/api/auth/login');
    my.request({
      url: loginUrl,
      timeout: 30000, // Menambahkan timeout 30 detik
      method: 'POST',
      data: {
        username,
        password
      },
      dataType: 'json',
      success: (res) => {
        if (res.data && res.data.token) {
          // Simpan token dan info pengguna
          my.setStorageSync({
            key: 'token',
            data: res.data.token
          });
          
          my.setStorageSync({
            key: 'userInfo',
            data: {
              _id: res.data._id,
              username: res.data.username,
              email: res.data.email,
              fullName: res.data.fullName
            }
          });
          
          // Update global data
          app.globalData.isLoggedIn = true;
          app.globalData.userInfo = {
            _id: res.data._id,
            username: res.data.username,
            email: res.data.email,
            fullName: res.data.fullName
          };
          
          // Navigasi ke halaman grup
          my.switchTab({
            url: '/pages/groups/groups'
          });
        } else {
          my.showToast({
            type: 'fail',
            content: 'Login gagal. Periksa username dan password Anda.',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('Login error:', err);
        console.error('Error details:', JSON.stringify(err));
        
        let errorMessage = 'Terjadi kesalahan saat login. Silakan coba lagi.';
        
        // Cek apakah error berisi pesan dari server
        if (err.data) {
          console.log('Error response data:', JSON.stringify(err.data));
          
          if (err.data.message) {
            errorMessage = err.data.message;
          } else if (err.data.errors && err.data.errors.length > 0) {
            // Handle validation errors
            errorMessage = err.data.errors[0].msg || 'Data tidak valid';
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
  },
  
  navigateToRegister() {
    my.navigateTo({
      url: '/pages/register/register'
    });
  }
});
