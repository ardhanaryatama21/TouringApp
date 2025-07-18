Component({
  data: {
    initials: '',
    backgroundColor: '#4A90E2',
    textSize: 24
  },
  
  props: {
    // Nama pengguna untuk inisial
    fullName: '',
    // URL gambar avatar (opsional)
    imageUrl: '',
    // Ukuran avatar dalam rpx (default: 80)
    size: 80,
    // Warna latar belakang jika tidak ada gambar (default: warna primer)
    color: ''
  },
  
  didMount() {
    this.updateAvatar();
  },
  
  didUpdate(prevProps) {
    if (prevProps.fullName !== this.props.fullName || 
        prevProps.imageUrl !== this.props.imageUrl ||
        prevProps.color !== this.props.color) {
      this.updateAvatar();
    }
  },
  
  methods: {
    // Memperbarui tampilan avatar
    updateAvatar() {
      const { fullName, color, size } = this.props;
      
      // Hitung inisial dari nama lengkap
      let initials = '';
      if (fullName) {
        const nameParts = fullName.split(' ');
        if (nameParts.length === 1) {
          initials = nameParts[0].charAt(0);
        } else {
          initials = nameParts[0].charAt(0) + nameParts[1].charAt(0);
        }
      }
      
      // Hitung ukuran teks berdasarkan ukuran avatar
      const textSize = Math.floor(size * 0.4);
      
      // Gunakan warna yang diberikan atau hasilkan warna berdasarkan nama
      let backgroundColor = color;
      if (!backgroundColor) {
        // Hasilkan warna konsisten berdasarkan nama
        const colors = [
          '#4A90E2', // Biru
          '#50B83C', // Hijau
          '#F49342', // Oranye
          '#9C6ADE', // Ungu
          '#DE5F5F', // Merah
          '#47C1BF', // Teal
          '#B76E79', // Marun
          '#5E5E5E'  // Abu-abu
        ];
        
        if (fullName) {
          const nameHash = fullName.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
          }, 0);
          
          backgroundColor = colors[nameHash % colors.length];
        } else {
          backgroundColor = colors[0];
        }
      }
      
      this.setData({
        initials,
        backgroundColor,
        textSize
      });
    }
  }
});
