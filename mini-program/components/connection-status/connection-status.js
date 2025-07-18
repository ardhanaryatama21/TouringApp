Component({
  data: {
    isConnected: true,
    statusText: ''
  },
  
  props: {
    // Status koneksi (true = terhubung, false = terputus)
    connected: true,
    // Teks status kustom (opsional)
    customText: ''
  },
  
  didMount() {
    this.updateStatus(this.props.connected, this.props.customText);
    
    // Mendengarkan perubahan status jaringan
    my.onNetworkStatusChange((res) => {
      this.updateStatus(res.isConnected);
    });
    
    // Cek status jaringan saat ini
    my.getNetworkType({
      success: (res) => {
        const isConnected = res.networkType !== 'NONE';
        this.updateStatus(isConnected);
      }
    });
  },
  
  didUpdate(prevProps) {
    if (prevProps.connected !== this.props.connected || 
        prevProps.customText !== this.props.customText) {
      this.updateStatus(this.props.connected, this.props.customText);
    }
  },
  
  methods: {
    // Memperbarui status koneksi dan teks
    updateStatus(isConnected, customText = '') {
      let statusText = '';
      
      if (customText) {
        statusText = customText;
      } else {
        statusText = isConnected ? 'Terhubung' : 'Tidak ada koneksi internet';
      }
      
      this.setData({
        isConnected,
        statusText
      });
    }
  }
});
