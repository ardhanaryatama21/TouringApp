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
    console.log('Login URL:', `${app.globalData.apiBaseUrl}/auth/login`);
    my.request({
      url: `${app.globalData.apiBaseUrl}/auth/login`,
      method: 'POST',
      data: {
        username,
        password
      },
      dataType: 'json',
      success: (res) => {
        console.log('Login response:', JSON.stringify(res.data));
        
        if (res.data && res.data.token) {
          // Simpan token dan info pengguna
          try {
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
            
            console.log('Login successful, navigating to groups page');
            
            // Navigasi ke halaman grup
            my.switchTab({
              url: '/pages/groups/groups'
            });
          } catch (error) {
            console.error('Error saving login data:', error);
            my.showToast({
              type: 'fail',
              content: 'Terjadi kesalahan saat menyimpan data login',
              duration: 2000
            });
          }
        } else {
          console.log('Login failed: Invalid response format');
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
