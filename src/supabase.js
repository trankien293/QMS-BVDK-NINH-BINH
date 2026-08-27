/**
 * Utility upload/delete file trên Supabase Storage qua REST API (không cần cài thêm npm package)
 */

export const DEFAULT_SUPABASE_CONFIG = {
  url: "https://yvavupkbismanidpdwio.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YXZ1cGtiaXNtYW5pZHBkd2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3ODIyNjAsImV4cCI6MjEwMzM1ODI2MH0.GN-Nt4kcqDQZBgCY_ddR9KJSP-sMvrIUczujJbqc7Ac",
  bucket: "qms-5s-images"
};

export const getStoredSupabaseConfig = () => {
  try {
    const stored = localStorage.getItem('SUPABASE_CONFIG_5S');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Lỗi đọc Supabase Config từ localStorage:", e);
  }
  return DEFAULT_SUPABASE_CONFIG;
};

export const saveSupabaseConfigToStorage = (configObj) => {
  if (!configObj) {
    localStorage.removeItem('SUPABASE_CONFIG_5S');
  } else {
    localStorage.setItem('SUPABASE_CONFIG_5S', JSON.stringify(configObj));
  }
};

/**
 * Tải ảnh đã nén (Base64 DataURL) lên Supabase Storage và nhận link Public URL
 */
export const uploadToSupabaseStorage = async (dataUrl, customConfig = null) => {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;

  const config = customConfig || getStoredSupabaseConfig();
  const { url, anonKey, bucket } = config || {};

  const effectiveUrl = url || DEFAULT_SUPABASE_CONFIG.url;
  const effectiveKey = anonKey || DEFAULT_SUPABASE_CONFIG.anonKey;

  if (!effectiveUrl || !effectiveKey) {
    throw new Error("Chưa cấu hình Supabase URL hoặc Anon Key");
  }

  const cleanUrl = effectiveUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const targetBucket = bucket || 'qms-5s-images';
  const filePath = `evaluations_5s/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;

  // Chuyển DataURL thành Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const endpoint = `${cleanUrl}/storage/v1/object/${targetBucket}/${filePath}`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${effectiveKey}`,
      'apikey': effectiveKey,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true'
    },
    body: blob
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase Error (${response.status}): ${errText}`);
  }

  // Trả về Public URL
  return `${cleanUrl}/storage/v1/object/public/${targetBucket}/${filePath}`;
};

/**
 * Xóa các file ảnh tương ứng trên Supabase Storage
 */
export const deleteFromSupabaseStorage = async (imageUrls, customConfig = null) => {
  if (!imageUrls) return;
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  if (urls.length === 0) return;

  const config = customConfig || getStoredSupabaseConfig();
  const { url, anonKey, bucket } = config || {};

  const effectiveUrl = url || DEFAULT_SUPABASE_CONFIG.url;
  const effectiveKey = anonKey || DEFAULT_SUPABASE_CONFIG.anonKey;
  const targetBucket = bucket || 'qms-5s-images';

  if (!effectiveUrl || !effectiveKey) return;

  const cleanUrl = effectiveUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  
  const prefixes = [];
  urls.forEach(u => {
    if (typeof u === 'string' && u.includes(`/storage/v1/object/public/${targetBucket}/`)) {
      const parts = u.split(`/storage/v1/object/public/${targetBucket}/`);
      if (parts[1]) prefixes.push(parts[1]);
    }
  });

  if (prefixes.length === 0) return;

  try {
    const deleteEndpoint = `${cleanUrl}/storage/v1/object/${targetBucket}`;
    const response = await fetch(deleteEndpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${effectiveKey}`,
        'apikey': effectiveKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefixes })
    });
    console.log("Xóa ảnh Supabase Storage thành công:", response.status);
  } catch (err) {
    console.warn("Lỗi xóa ảnh trên Supabase Storage:", err);
  }
};
