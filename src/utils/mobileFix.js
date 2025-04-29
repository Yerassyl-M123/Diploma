import axios from 'axios';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

if (isMobile && isIOSDevice()) {
  axios.defaults.headers.common['X-Mobile-Safari'] = 'true';
  
  axios.interceptors.response.use(
    response => {
      const newSid = response.headers['x-auth-sid'];
      if (newSid) {
        localStorage.setItem('sid', newSid);
        console.log("Обновлен SID из заголовка:", newSid);
      }
      return response;
    },
    error => Promise.reject(error)
  );
}

console.log("Mobile fixes initialized:", isMobile && isIOSDevice() ? "applied" : "not needed");