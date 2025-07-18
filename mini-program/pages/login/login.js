import api from '../utils/api';
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
    
    console.log('Mencoba login dengan username:', username);
    console.log('API Base URL:', app.globalData.apiBaseUrl);
    
    // Menggunakan fungsi login dari utils/api.js yang sudah diperbaiki
    // untuk memastikan URL yang benar digunakan
    api.login(username, password)
      .then(data => {
        console.log('Login berhasil:', data);
        
        if (data && data.token) {
          // Simpan token dan info pengguna
          my.setStorageSync({
            key: 'token',
            data: data.token
          });
          
          my.setStorageSync({
            key: 'userInfo',
            data: {
              _id: data._id,
              username: data.username,
              email: data.email,
              fullName: data.fullName
            }
          });
          
          // Update global data
          app.globalData.isLoggedIn = true;
          app.globalData.userInfo = {
            _id: data._id,
            username: data.username,
            email: data.email,
            fullName: data.fullName
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
      })
      .catch(err => {
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
      })
      .finally(() => {
        this.setData({ isLoading: false });
      });
  },
  
  navigateToRegister() {
    my.navigateTo({
      url: '/pages/register/register'
    });
  }
});
