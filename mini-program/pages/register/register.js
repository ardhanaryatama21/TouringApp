import api from '../../utils/api';
const app = getApp();

Page({
  data: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
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
  
  onInputEmail(e) {
    this.setData({
      email: e.detail.value
    });
  },
  
  onInputPassword(e) {
    this.setData({
      password: e.detail.value
    });
  },
  
  onInputConfirmPassword(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },
  
  onInputFullName(e) {
    this.setData({
      fullName: e.detail.value
    });
  },
  
  handleRegister() {
    const { fullName, email, username, password, confirmPassword } = this.data;
    
    // Validasi input
    if (!username || !email || !password || !confirmPassword || !fullName) {
      my.showToast({
        type: 'fail',
        content: 'Semua field harus diisi',
        duration: 2000
      });
      return;
    }
    
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      my.showToast({
        type: 'fail',
        content: 'Format email tidak valid',
        duration: 2000
      });
      return;
    }
    
    if (password !== confirmPassword) {
      my.showToast({
        type: 'fail',
        content: 'Password dan konfirmasi password tidak cocok',
        duration: 2000
      });
      return;
    }
    
    this.setData({ isLoading: true });
    
    console.log('Mencoba register dengan username:', username);
    console.log('API Base URL:', app.globalData.apiBaseUrl);
    
    // FORCE menggunakan URL Railway langsung tanpa melalui api.js
    const RAILWAY_URL = 'https://touringapp-backend-production.up.railway.app';
    console.log('FORCE menggunakan URL Railway:', RAILWAY_URL);
    
    my.request({
      url: `${RAILWAY_URL}/api/auth/register`,
      method: 'POST',
      data: { username, email, password, fullName },
      dataType: 'json',
      headers: {},
      success: (res) => {
        const data = res.data;
        console.log('Register berhasil dengan direct request:', data);
        
        my.showToast({
          type: 'success',
          content: 'Registrasi berhasil! Silakan login.',
          duration: 2000
        });
        
        // Navigasi ke halaman login setelah registrasi berhasil
        my.navigateTo({
          url: '/pages/login/login'
        });
        
        this.setData({ isLoading: false });
      },
      fail: (err) => {
        console.error('Register error dengan direct request:', err);
        console.error('Error details:', JSON.stringify(err));
        
        let errorMessage = 'Terjadi kesalahan saat registrasi. Silakan coba lagi.';
        
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
        
        this.setData({ isLoading: false });
      }
    });
  },
  
  navigateToLogin() {
    my.navigateTo({
      url: '/pages/login/login'
    });
  }
});
