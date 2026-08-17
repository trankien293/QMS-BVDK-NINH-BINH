/**
 * Chuẩn hóa và gộp nhóm tên vị trí tương tự nhau trong đánh giá 5S
 * Tự động tách biệt chính xác: Xe tiêm, Bàn làm việc, Bàn giao ban, Kho vật tư, Tủ vật tư...
 */
export const removeVietnameseTones = (str) => {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
};

export const getNormalizedLocationCategory = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return 'Vị trí khác';
  
  const cleanStr = removeVietnameseTones(rawName.trim().toLowerCase())
    .replace(/\(.*?\)/g, '') // Bỏ phần trong ngoặc
    .replace(/so\s*\d+/g, '') // Bỏ "số 1", "số 2"
    .replace(/\b\d+\b/g, '')  // Bỏ số lẻ "1", "2"
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanStr.includes('tu tai lieu') || cleanStr.includes('tu ho so')) {
    return 'Tủ tài liệu';
  }
  if (cleanStr.includes('xe tiem')) {
    return 'Xe tiêm';
  }
  if (cleanStr.includes('tu thuoc')) {
    return 'Tủ thuốc';
  }
  if (cleanStr.includes('ban giao ban') || cleanStr.includes('giao ban')) {
    return 'Bàn giao ban';
  }
  if (cleanStr.includes('ban lam viec')) {
    return 'Bàn làm việc';
  }
  if (cleanStr.includes('kho vat tu')) {
    return 'Kho vật tư';
  }
  if (cleanStr.includes('tu vat tu')) {
    return 'Tủ vật tư';
  }
  if (cleanStr.includes('phong sinh')) {
    return 'Phòng sinh';
  }
  if (cleanStr.includes('ban kham')) {
    return 'Bàn khám bệnh';
  }
  if (cleanStr.includes('phong kham')) {
    return 'Phòng khám bệnh';
  }
  if (cleanStr.includes('kho thiet bi')) {
    return 'Kho thiết bị';
  }
  if (cleanStr.includes('tu thiet bi')) {
    return 'Tủ thiết bị';
  }
  
  if (!cleanStr) return 'Vị trí khác';

  // Trả về chuỗi nguyên bản đã lọc bỏ số lẻ và viết hoa chữ cái đầu
  const words = cleanStr.split(' ');
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

/**
 * Trả về mảng ảnh hợp lệ (hỗ trợ tối đa 3 ảnh/vị trí + tương thích dữ liệu 1 ảnh cũ)
 */
export const getRowImages = (row) => {
  if (!row) return [];
  if (Array.isArray(row.images) && row.images.length > 0) {
    return row.images.filter(Boolean);
  }
  if (row.image) {
    return [row.image];
  }
  return [];
};
