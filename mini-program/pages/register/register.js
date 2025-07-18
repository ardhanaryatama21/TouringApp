import api from '../utils/api';
const app = getApp();

Page({
  data: {
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    isLoading: false
  },
  
  onLoad() {
    // Halaman dimuat
  },
  
  onInputFullName(e) {
    this.setData({
      fullName: e.detail.value
    });
  },
  
  onInputEmail(e) {
    this.setData({
      email: e.detail.value
    });
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
  
  onInputConfirmPassword(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },
  
  handleRegister() {
    const { fullName, email, username, password, confirmPassword } = this.data;
    
    // Validasi input
    if (!fullName || !email || !username || !password || !confirmPassword) {
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
    
    // Validasi password
    if (password.length < 6) {
      my.showToast({
        type: 'fail',
        content: 'Password minimal 6 karakter',
        duration: 2000
      });
      return;
    }
    
    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      my.showToast({
        type: 'fail',
        content: 'Password dan konfirmasi password tidak cocok',
        duration: 2000
      });
      return;
    }
    
    this.setData({ isLoading: true });
    
    // Siapkan data user untuk registrasi
    const userData = {
      fullName,
      email,
      username,
      password
    };
    
    console.log('Mencoba register dengan data:', JSON.stringify(userData));
    console.log('API Base URL:', app.globalData.apiBaseUrl);
    
    // Menggunakan fungsi register dari utils/api.js yang sudah diperbaiki
    // untuk memastikan URL yang benar digunakan
    api.register(userData)
      .then(data => {
        console.log('Register berhasil:', data);
        
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
          
          my.showToast({
            type: 'success',
            content: 'Pendaftaran berhasil!',
            duration: 2000,
            success: () => {
              // Navigasi ke halaman grup
              my.switchTab({
                url: '/pages/groups/groups'
              });
            }
          });
        } else {
          my.showToast({
            type: 'fail',
            content: 'Pendaftaran gagal. Silakan coba lagi.',
            duration: 2000
          });
        }
      })
      .catch(err => {
        console.error('Register error:', err);
        console.error('Error details:', JSON.stringify(err));
        
        let errorMessage = 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.';
        
        // Cek apakah error berisi pesan dari server
        if (err.data) {
          console.log('Error response data:', JSON.stringify(err.data));
          
          if (err.data.message) {
            if (err.data.message.includes('already exists')) {
              errorMessage = 'Username atau email sudah digunakan';
            } else {
              errorMessage = err.data.message;
            }
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
  
  navigateToLogin() {
    my.navigateTo({
      url: '/pages/login/login'
    });
  }
});
