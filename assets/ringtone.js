/**
 * Utilitas untuk memutar ringtone panggilan
 */

let audioContext = null;
let oscillator = null;
let gainNode = null;
let isPlaying = false;

/**
 * Inisialisasi audio context
 */
const initAudio = () => {
  try {
    // Web Audio API tidak tersedia di Alipay Mini Program
    // Kita akan menggunakan InnerAudioContext sebagai gantinya
    return true;
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
};

/**
 * Putar ringtone panggilan
 */
const play = () => {
  if (isPlaying) return;
  
  try {
    // Gunakan Alipay Mini Program Audio API
    const audio = my.createInnerAudioContext();
    audio.src = '/assets/ringtone.mp3';
    audio.loop = true;
    audio.volume = 1.0;
    
    audio.onPlay(() => {
      isPlaying = true;
      console.log('Ringtone started playing');
    });
    
    audio.onError((err) => {
      console.error('Ringtone error:', err);
      isPlaying = false;
    });
    
    audio.onStop(() => {
      isPlaying = false;
      console.log('Ringtone stopped');
    });
    
    audio.play();
    
    // Simpan referensi audio untuk digunakan nanti
    window._ringtoneAudio = audio;
  } catch (error) {
    console.error('Failed to play ringtone:', error);
  }
};

/**
 * Hentikan ringtone panggilan
 */
const stop = () => {
  if (!isPlaying) return;
  
  try {
    // Hentikan audio jika ada
    if (window._ringtoneAudio) {
      window._ringtoneAudio.stop();
      window._ringtoneAudio = null;
    }
    
    isPlaying = false;
  } catch (error) {
    console.error('Failed to stop ringtone:', error);
  }
};

export default {
  initAudio,
  play,
  stop
};
