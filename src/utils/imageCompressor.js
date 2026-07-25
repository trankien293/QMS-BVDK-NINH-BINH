/**
 * Tiện ích nén ảnh trực tiếp trên trình duyệt bằng Canvas HTML5
 * @param {File} file - File ảnh gốc chụp từ thiết bị
 * @param {number} maxWidth - Chiều rộng tối đa (default: 1024px)
 * @param {number} quality - Chất lượng JPEG (0.1 đến 1.0, default: 0.75)
 * @returns {Promise<{ dataUrl: string, sizeKb: number }>} Ảnh nén Base64 & Dung lượng (KB)
 */
export const compressImage = (file, maxWidth = 1024, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File không phải là ảnh hợp lệ'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Tính toán kích thước xấp xỉ KB
        const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896;
        const sizeKb = Math.round((sizeInBytes / 1024) * 10) / 10;

        resolve({ dataUrl, sizeKb });
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
