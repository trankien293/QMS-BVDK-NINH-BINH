import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ClipboardCheck, 
  UserCheck, 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Search,
  Settings,
  X,
  Loader2,
  Cloud,
  CloudOff,
  Eye,
  Zap,
  Building2,
  Layers,
  MapPin,
  Sparkles,
  Construction,
  ShieldCheck,
  Menu,
  ArrowRight,
  Stethoscope,
  Briefcase,
  FlaskConical
} from 'lucide-react';
import { 
  getStoredFirebaseConfig, 
  saveFirebaseConfigToStorage, 
  initFirebase, 
  subscribeEvaluations, 
  saveEvaluationToFirestore, 
  getDb 
} from './firebase';
import { getNormalizedLocationCategory, getRowImages, SAMPLE_LOCATIONS_BY_SYSTEM } from './utils/locationNormalizer';

// Danh sách 47 khoa/phòng/trung tâm Bệnh viện Đa khoa tỉnh Ninh Bình
const DEPARTMENTS = [
  "Phòng Tài chính - Kế toán",
  "Phòng Vật tư thiết bị Y tế",
  "Phòng Kế hoạch tổng hợp",
  "Phòng Tổ chức cán bộ",
  "Phòng Hành chính",
  "Phòng Công nghệ thông tin",
  "Phòng Điều dưỡng",
  "Phòng Công tác xã hội",
  "Phòng Quản lý chất lượng Bệnh viện",
  "Trung tâm Đào tạo chỉ đạo tuyến",
  "Khoa Huyết học truyền máu",
  "Khoa khám bệnh và điều trị yêu cầu",
  "Khoa Khám bệnh",
  "Khoa Giải phẫu bệnh",
  "Khoa Thăm dò chức năng",
  "Khoa Kiểm soát nhiễm khuẩn",
  "Khoa Dược",
  "Khoa Hóa sinh – vi sinh",
  "Khoa Dinh dưỡng",
  "Trung tâm Chẩn đoán hình ảnh-Điện quang can thiệp",
  "Khoa Ngoại thần kinh – Sọ não",
  "Khoa Phẫu thuật gây mê hồi sức",
  "Trung tâm PT Tiêu hóa gan-mật-tụy",
  "Trung tâm ung bướu",
  "Trung tâm Chấn thương chỉnh hình-Thẩm mỹ",
  "Khoa Ngoại thận tiết niệu",
  "Khoa Phụ Sản",
  "Khoa Nội tổng hợp",
  "Khoa Cơ xương khớp",
  "Khoa Truyền nhiễm",
  "Khoa Phục hồi chức năng",
  "Khoa Nội tiết",
  "Trung tâm tim mạch",
  "Khoa Lọc máu thận nhân tạo",
  "Khoa Thần kinh",
  "Khoa Nội thận tiết niệu",
  "Khoa Cấp cứu",
  "Khoa Hồi sức tích cực và phòng chống độc",
  "Trung tâm Bảo vệ sức khỏe cán bộ",
  "Khoa Y học cổ truyền",
  "Khoa Đột quỵ",
  "Khoa Da liễu",
  "Khoa Nội Hô Hấp",
  "Khoa Nhi",
  "Khoa Mắt",
  "Khoa Răng hàm mặt",
  "Khoa Tai mũi họng"
];

const DEPT_SYSTEM_MAP = {
  "Phòng Tài chính - Kế toán": "PHONG_BAN",
  "Phòng Vật tư thiết bị Y tế": "PHONG_BAN",
  "Phòng Kế hoạch tổng hợp": "PHONG_BAN",
  "Phòng Tổ chức cán bộ": "PHONG_BAN",
  "Phòng Hành chính": "PHONG_BAN",
  "Phòng Công nghệ thông tin": "PHONG_BAN",
  "Phòng Điều dưỡng": "PHONG_BAN",
  "Phòng Công tác xã hội": "PHONG_BAN",
  "Phòng Quản lý chất lượng Bệnh viện": "PHONG_BAN",
  "Trung tâm Đào tạo chỉ đạo tuyến": "PHONG_BAN",
  "Khoa Huyết học truyền máu": "CAN_LAM_SANG",
  "Khoa khám bệnh và điều trị yêu cầu": "CAN_LAM_SANG",
  "Khoa Khám bệnh": "CAN_LAM_SANG",
  "Khoa Giải phẫu bệnh": "CAN_LAM_SANG",
  "Khoa Thăm dò chức năng": "CAN_LAM_SANG",
  "Khoa Kiểm soát nhiễm khuẩn": "CAN_LAM_SANG",
  "Khoa Dược": "CAN_LAM_SANG",
  "Khoa Hóa sinh – vi sinh": "CAN_LAM_SANG",
  "Khoa Dinh dưỡng": "CAN_LAM_SANG",
  "Trung tâm Chẩn đoán hình ảnh-Điện quang can thiệp": "CAN_LAM_SANG",
  "Khoa Ngoại thần kinh – Sọ não": "LAM_SANG",
  "Khoa Phẫu thuật gây mê hồi sức": "LAM_SANG",
  "Trung tâm PT Tiêu hóa gan-mật-tụy": "LAM_SANG",
  "Trung tâm ung bướu": "LAM_SANG",
  "Trung tâm Chấn thương chỉnh hình-Thẩm mỹ": "LAM_SANG",
  "Khoa Ngoại thận tiết niệu": "LAM_SANG",
  "Khoa Phụ Sản": "LAM_SANG",
  "Khoa Nội tổng hợp": "LAM_SANG",
  "Khoa Cơ xương khớp": "LAM_SANG",
  "Khoa Truyền nhiễm": "LAM_SANG",
  "Khoa Phục hồi chức năng": "LAM_SANG",
  "Khoa Nội tiết": "LAM_SANG",
  "Trung tâm tim mạch": "LAM_SANG",
  "Khoa Lọc máu thận nhân tạo": "LAM_SANG",
  "Khoa Thần kinh": "LAM_SANG",
  "Khoa Nội thận tiết niệu": "LAM_SANG",
  "Khoa Cấp cứu": "LAM_SANG",
  "Khoa Hồi sức tích cực và phòng chống độc": "LAM_SANG",
  "Trung tâm Bảo vệ sức khỏe cán bộ": "LAM_SANG",
  "Khoa Y học cổ truyền": "LAM_SANG",
  "Khoa Đột quỵ": "LAM_SANG",
  "Khoa Da liễu": "LAM_SANG",
  "Khoa Nội Hô Hấp": "LAM_SANG",
  "Khoa Nhi": "LAM_SANG",
  "Khoa Mắt": "LAM_SANG",
  "Khoa Răng hàm mặt": "LAM_SANG",
  "Khoa Tai mũi họng": "LAM_SANG"
};

const INSPECTION_CRITERIA = [
  { id: 1, label: '1. Không vật thừa' },
  { id: 2, label: '2. Tách biệt' },
  { id: 3, label: '3. Quy ước thứ tự' },
  { id: 4, label: '4. Định lượng/Dán tem' },
  { id: 5, label: '5. Sạch sẽ' },
  { id: 6, label: '6. Người phụ trách' },
  { id: 7, label: '7. S5 (Không sẵn sàng)' }
];

const INITIAL_HOSPITAL_DATABASE = [
  {
    id: "eval-1",
    department: "Khoa Cấp cứu",
    system: "LAM_SANG",
    inspector: "Nguyễn Văn Tuyên",
    date: "2026-07-15",
    rows: [
      { id: "cc-1", location: "Xe tiêm cấp cứu 1", criteria: [true, true, true, true, true, true, false], note: "Sắp xếp tốt", improvement: 1, image: null },
      { 
        id: "cc-2", 
        location: "Tủ thuốc trực cấp cứu", 
        criteria: [true, false, true, false, true, true, false], 
        note: "Hộp thuốc chưa phân loại rõ, thiếu nhãn hạn dùng", 
        improvement: 0, 
        image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23fee2e2' stroke='%23f87171' stroke-width='6' rx='8'/><circle cx='150' cy='80' r='35' fill='%23ef4444'/><path d='M150 60 v40 M130 80 h40' stroke='white' stroke-width='8' stroke-linecap='round'/><text x='150' y='145' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23991b1b' text-anchor='middle'>HỘP THUỐC CHƯA PHÂN LOẠI</text><text x='150' y='165' font-family='sans-serif' font-size='11' fill='%23b91c1c' text-anchor='middle'>Thiếu nhãn cảnh báo hạn dùng</text></svg>"
      },
      { id: "cc-3", location: "Bàn giao ban hành chính", criteria: [true, true, true, true, true, true, false], note: "", improvement: 0, image: null },
      { 
        id: "cc-4", 
        location: "Tủ vật tư tiêu hao", 
        criteria: [true, true, false, true, false, true, true], 
        note: "Có chai truyền hết hạn chưa dọn (S5), bám bụi bẩn", 
        improvement: 0, 
        image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23fee2e2' stroke='%23ef4444' stroke-width='6' rx='8'/><path d='M120 50 h60 v70 h-60 z M150 120 v20' fill='none' stroke='%23ef4444' stroke-width='6' stroke-linecap='round'/><circle cx='150' cy='75' r='12' fill='%23ef4444'/><text x='150' y='160' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23991b1b' text-anchor='middle'>S5: CHAI TRUYỀN HẾT HẠN</text><text x='150' y='178' font-family='sans-serif' font-size='10' fill='%23b91c1c' text-anchor='middle'>Phát hiện chai hết hạn chưa dọn dẹp</text></svg>"
      }
    ]
  },
  {
    id: "eval-2",
    department: "Khoa Phụ Sản",
    system: "LAM_SANG",
    inspector: "Trần Thị Hồng",
    date: "2026-07-16",
    rows: [
      { id: "ps-1", location: "Phòng sinh đẻ số 2", criteria: [true, true, true, true, true, true, false], note: "Sạch sẽ, sẵn sàng", improvement: 2, image: null },
      { id: "ps-2", location: "Bàn làm việc hành chính khoa", criteria: [false, true, true, true, true, true, false], note: "Còn lưu trữ hồ sơ bệnh án cũ từ tháng trước", improvement: 1, image: null }
    ]
  },
  {
    id: "eval-6",
    department: "Phòng Quản lý chất lượng Bệnh viện",
    system: "PHONG_BAN",
    inspector: "Vũ Thị Mai",
    date: "2026-07-16",
    rows: [
      { id: "ql-1", location: "Bàn làm việc Tổ 1", criteria: [true, true, true, true, true, true, false], note: "Gọn gàng sạch sẽ", improvement: 2, image: null },
      { id: "ql-2", location: "Tủ lưu trữ hồ sơ tài liệu", criteria: [true, true, true, true, true, true, false], note: "Hồ sơ lưu trữ theo năm rất khoa học", improvement: 3, image: null }
    ]
  },
  {
    id: "eval-7",
    department: "Phòng Vật tư thiết bị Y tế",
    system: "PHONG_BAN",
    inspector: "Đặng Quốc Việt",
    date: "2026-07-15",
    rows: [
      { id: "vt-1", location: "Kho vật tư chấn thương", criteria: [true, false, false, false, true, true, false], note: "Thiếu sơ đồ kho, chưa phân định ranh giới vật tư", improvement: 0, image: null },
      { 
        id: "vt-3", 
        location: "Kho thiết bị dự phòng", 
        criteria: [true, true, true, true, false, true, true], 
        note: "Một số máy hỏng không dán tem đỏ cảnh báo, bám bụi bẩn", 
        improvement: 0, 
        image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23fef3c7' stroke='%23f59e0b' stroke-width='6' rx='8'/><path d='M150 40 L190 110 H110 Z' fill='%23f59e0b'/><text x='150' y='95' font-family='sans-serif' font-size='22' font-weight='bold' fill='white' text-anchor='middle'>!</text><text x='150' y='145' font-family='sans-serif' font-size='12' font-weight='bold' fill='%2392400e' text-anchor='middle'>MÁY HỎNG CHƯA DÁN TEM ĐỎ</text><text x='150' y='165' font-family='sans-serif' font-size='11' fill='%23b45309' text-anchor='middle'>Chưa sàng lọc phân định khu vực</text></svg>"
      }
    ]
  }
];

const PIE_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#2563eb", "#7c3aed", "#db2777", "#059669"];

const generateConicGradient = (items) => {
  if (!items || items.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)';
  let accumulated = 0;
  const slices = items.map((item, index) => {
    const color = PIE_COLORS[index % PIE_COLORS.length];
    const start = accumulated;
    accumulated += parseFloat(item.percentage) || 0;
    const end = Math.min(accumulated, 100);
    return `${color} ${start}% ${end}%`;
  });
  if (accumulated < 100) {
    slices.push(`#f1f5f9 ${accumulated}% 100%`);
  }
  return `conic-gradient(${slices.join(', ')})`;
};

export default function App() {
  // Navigation State (Default = HOME)
  const [currentModule, setCurrentModule] = useState('HOME');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 5S Module State
  const [activeTab, setActiveTab] = useState('EVALUATION');
  const [activeSubDashboard, setActiveSubDashboard] = useState('LAM_SANG');
  
  const [firebaseConfig, setFirebaseConfig] = useState(() => getStoredFirebaseConfig());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [configJsonInput, setConfigJsonInput] = useState(() => JSON.stringify(getStoredFirebaseConfig(), null, 2));
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState({});

  const [hospitalDatabase, setHospitalDatabase] = useState(() => {
    try {
      const stored = localStorage.getItem('HOSPITAL_DATABASE_5S');
      return stored ? JSON.parse(stored) : INITIAL_HOSPITAL_DATABASE;
    } catch (e) {
      return INITIAL_HOSPITAL_DATABASE;
    }
  });
  const [selectedUnitForReport, setSelectedUnitForReport] = useState(null);
  const [viewImageModal, setViewImageModal] = useState(null);

  // Đọc nháp đồng bộ từ localStorage ngay từ bước khởi tạo state
  const [draftForm] = useState(() => {
    try {
      const stored = localStorage.getItem('QMS_5S_DRAFT_FORM');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Form State
  const [department, setDepartment] = useState(() => draftForm?.department || '');
  const [inspector, setInspector] = useState(() => draftForm?.inspector || '');
  const [date, setDate] = useState(() => draftForm?.date || new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState(() => (Array.isArray(draftForm?.rows) && draftForm.rows.length > 0) ? draftForm.rows : [
    {
      id: `row-${Date.now()}-0`,
      location: 'Bàn làm việc số 1',
      criteria: [true, true, true, true, true, true, false],
      note: '',
      improvement: 0,
      image: null
    }
  ]);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [deptSearch, setDeptSearch] = useState(() => draftForm?.department || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Đã lưu thành công dữ liệu!');

  // Tự động lưu vĩnh viễn hospitalDatabase vào LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('HOSPITAL_DATABASE_5S', JSON.stringify(hospitalDatabase));
    } catch (e) {
      console.warn("Lưu LocalStorage chưa thành công:", e);
    }
  }, [hospitalDatabase]);

  // Tự động lưu bản nháp form khi người dùng thay đổi dữ liệu đang chấm
  useEffect(() => {
    if (department || inspector || (rows && rows.length > 1) || (rows[0] && (rows[0].note || (rows[0].images && rows[0].images.length > 0)))) {
      try {
        localStorage.setItem('QMS_5S_DRAFT_FORM', JSON.stringify({ department, inspector, date, rows }));
      } catch (e) {}
    }
  }, [department, inspector, date, rows]);

  // Cảnh báo trước khi làm mới hoặc đóng trang khi đang chấm dở
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (department || (rows && rows.length > 1) || (rows[0] && rows[0].note)) {
        e.preventDefault();
        e.returnValue = 'Bạn có phiên chấm 5S chưa lưu. Bạn có chắc muốn rời đi?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [department, rows]);

  const handleClearDraft = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy bản nháp đang chấm dở và tạo lại phiên chấm mới?")) {
      try { localStorage.removeItem('QMS_5S_DRAFT_FORM'); } catch (e) {}
      setDepartment('');
      setDeptSearch('');
      setInspector('');
      setRows([
        {
          id: `row-${Date.now()}-0`,
          location: 'Bàn làm việc số 1',
          criteria: [true, true, true, true, true, true, false],
          note: '',
          improvement: 0,
          image: null
        }
      ]);
      setExpandedRowId(null);
    }
  };

  // Real-time Firebase Listener
  useEffect(() => {
    const config = firebaseConfig || getStoredFirebaseConfig();
    const db = initFirebase(config);
    if (db) {
      setIsFirebaseConnected(true);
      const unsubscribe = subscribeEvaluations((cloudData) => {
        if (Array.isArray(cloudData)) {
          setHospitalDatabase(cloudData);
        }
      }, (err) => {
        console.warn("Chưa tải được dữ liệu Cloud:", err);
      });
      return () => unsubscribe();
    } else {
      setIsFirebaseConnected(false);
    }
  }, [firebaseConfig]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectDepartment = (name) => {
    setDepartment(name);
    setDeptSearch(name);
    setShowSuggestions(false);
    const sys = DEPT_SYSTEM_MAP[name] || 'LAM_SANG';
    const sampleList = SAMPLE_LOCATIONS_BY_SYSTEM[sys] || SAMPLE_LOCATIONS_BY_SYSTEM.LAM_SANG;
    const defaultLoc = sampleList[0] || 'Bàn làm việc số 1';
    setRows(prev => {
      if (prev.length === 1 && (!prev[0].location || prev[0].location.startsWith('Xe tiêm') || prev[0].location.startsWith('Vị trí đánh giá') || prev[0].location === 'Bàn làm việc số 1')) {
        return [{ ...prev[0], location: defaultLoc }];
      }
      return prev;
    });
  };

  const addRow = () => {
    const newId = `row-${Date.now()}`;
    const sys = DEPT_SYSTEM_MAP[department] || 'LAM_SANG';
    const sampleList = SAMPLE_LOCATIONS_BY_SYSTEM[sys] || SAMPLE_LOCATIONS_BY_SYSTEM.LAM_SANG;
    const nextLocIndex = rows.length % sampleList.length;
    const defaultNextLoc = sampleList[nextLocIndex] || sampleList[0] || 'Bàn làm việc số 1';

    const newRow = {
      id: newId,
      location: defaultNextLoc,
      criteria: [true, true, true, true, true, true, false],
      note: '',
      improvement: 0,
      image: null
    };
    setRows(prev => [...prev, newRow]);
    setExpandedRowId(newId);
  };

  const removeRow = (id, e) => {
    if (e) e.stopPropagation();
    if (rows.length === 1) {
      alert("Cần giữ ít nhất 1 vị trí kiểm tra!");
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
    if (expandedRowId === id) {
      setExpandedRowId(null);
    }
  };

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const toggleCriteria = (rowId, critIndex) => {
    setRows(prev => prev.map(r => {
      if (r.id === rowId) {
        const newCriteria = [...r.criteria];
        newCriteria[critIndex] = !newCriteria[critIndex];
        return { ...r, criteria: newCriteria };
      }
      return r;
    }));
  };

  const handleAddImages = async (rowId, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsCompressing(prev => ({ ...prev, [rowId]: true }));
    try {
      const newImages = [];
      let totalKb = 0;
      for (const file of files) {
        const { dataUrl, sizeKb } = await compressImage(file, 800, 0.65);
        newImages.push(dataUrl);
        totalKb += (sizeKb || 0);
      }
      setRows(prev => prev.map(r => {
        if (r.id === rowId) {
          const existing = getRowImages(r);
          const combined = [...existing, ...newImages].slice(0, 3);
          return { ...r, images: combined, image: combined[0] || null, imageKb: totalKb };
        }
        return r;
      }));
    } catch (err) {
      alert("Lỗi nén ảnh: " + err.message);
    } finally {
      setIsCompressing(prev => ({ ...prev, [rowId]: false }));
    }
  };

  const handleImageChange = handleAddImages;

  const handleDeleteImage = (rowId, imgIdx) => {
    setRows(prev => prev.map(r => {
      if (r.id === rowId) {
        const existing = getRowImages(r);
        const updated = existing.filter((_, idx) => idx !== imgIdx);
        return { ...r, images: updated, image: updated[0] || null };
      }
      return r;
    }));
  };

  const activeStats = useMemo(() => {
    const total = rows.length;
    const passed = rows.filter(r => {
      return r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false;
    }).length;
    const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    const totalImprovements = rows.reduce((sum, r) => sum + (parseInt(r.improvement) || 0), 0);
    return { total, passed, percentage, totalImprovements };
  }, [rows]);

  const filteredDepartments = useMemo(() => {
    if (!deptSearch) return DEPARTMENTS;
    return DEPARTMENTS.filter(dept => 
      dept.toLowerCase().includes(deptSearch.toLowerCase())
    );
  }, [deptSearch]);

  const handleSaveFirebaseConfig = () => {
    try {
      let configObj = null;
      if (configJsonInput.trim().startsWith('{')) {
        configObj = JSON.parse(configJsonInput);
      } else if (configJsonInput.includes('apiKey')) {
        const cleaned = configJsonInput.replace(/const firebaseConfig =/g, '').replace(/;/g, '');
        configObj = Function('"use strict";return (' + cleaned + ')')();
      }

      if (!configObj || !configObj.apiKey || !configObj.projectId) {
        alert("Cấu hình Firebase không hợp lệ! Vui lòng nhập đúng JSON chứa apiKey và projectId.");
        return;
      }

      saveFirebaseConfigToStorage(configObj);
      setFirebaseConfig(configObj);
      initFirebase(configObj);
      setIsFirebaseConnected(true);
      setShowSettings(false);
      setConfigJsonInput('');
      setToastMessage('Đã kết nối thành công Firebase Cloud Real-time!');
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } catch (err) {
      alert("Lỗi đọc mã Firebase Config: " + err.message);
    }
  };

  const saveReport = async () => {
    if (!department) {
      alert("Vui lòng chọn hoặc nhập Khoa/Phòng trước khi lưu!");
      return;
    }

    if (!inspector) {
      alert("Vui lòng nhập tên Người đánh giá!");
      return;
    }

    const detectedSystem = DEPT_SYSTEM_MAP[department] || "LAM_SANG";

    const newEvaluation = {
      id: `eval-${Date.now()}`,
      department,
      system: detectedSystem,
      inspector: inspector || "Đoàn kiểm tra chất lượng",
      date: date,
      rows: JSON.parse(JSON.stringify(rows)),
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      // 1. Cập nhật dữ liệu cục bộ tức thì -> Không phụ thuộc hoàn toàn vào Cloud
      setHospitalDatabase(prev => {
        const updated = [newEvaluation, ...prev.filter(e => e.id !== newEvaluation.id)];
        try {
          localStorage.setItem('HOSPITAL_DATABASE_5S', JSON.stringify(updated));
        } catch (e) {
          console.warn("Lưu LocalStorage chưa thành công:", e);
        }
        return updated;
      });

      setToastMessage('✅ Đã lưu kết quả đánh giá thành công!');
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);

      // Reset Form
      setDepartment('');
      setDeptSearch('');
      setInspector('');
      setRows([
        {
          id: `row-${Date.now()}-0`,
          location: 'Xe tiêm cấp cứu 1',
          criteria: [true, true, true, true, true, true, false],
          note: '',
          improvement: 0,
          image: null
        }
      ]);
      setExpandedRowId(null);
      try { localStorage.removeItem('QMS_5S_DRAFT_FORM'); } catch (e) {}

      // 2. Đồng bộ Firebase Cloud chạy nền với giới hạn Timeout 3.5s
      if (isFirebaseConnected) {
        try {
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout kết nối Firebase Cloud")), 3500));
          await Promise.race([
            saveEvaluationToFirestore(newEvaluation),
            timeoutPromise
          ]);
          setToastMessage('⚡ Đã lưu và đồng bộ Real-time Cloud!');
          setShowSavedToast(true);
          setTimeout(() => setShowSavedToast(false), 3000);
        } catch (cloudErr) {
          console.warn("Đồng bộ Firebase chậm/offline, dữ liệu đã lưu an toàn vào máy:", cloudErr);
        }
      }
    } catch (err) {
      alert("Lỗi khi lưu dữ liệu: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Thống kê Dashboard 5S đầy đủ
  const dashboardStats = useMemo(() => {
    const generateSystemStats = (systemCode) => {
      const evals = hospitalDatabase.filter(e => e.system === systemCode);
      
      const rankMap = {};
      evals.forEach(ev => {
        let passedCount = 0;
        let failedCount = 0;
        ev.rows.forEach(r => {
          const ok = r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false;
          if (ok) passedCount++; else failedCount++;
        });
        rankMap[ev.department] = {
          department: ev.department,
          evaluationId: ev.id,
          total: ev.rows.length,
          passed: passedCount,
          failed: failedCount,
          percentage: ev.rows.length > 0 ? ((passedCount / ev.rows.length) * 100).toFixed(0) : 0,
          inspector: ev.inspector,
          date: ev.date,
          rows: ev.rows
        };
      });

      const ranking = Object.values(rankMap).sort((a, b) => b.passed - a.passed || b.percentage - a.percentage);

      const failedUnits = Object.values(rankMap)
        .filter(u => u.failed > 0)
        .sort((a, b) => b.failed - a.failed)
        .slice(0, 5)
        .map(u => ({ label: u.department, value: u.failed }));

      const locationFailureMap = {};
      let totalFailedLocations = 0;
      evals.forEach(ev => {
        ev.rows.forEach(r => {
          const ok = r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false;
          if (!ok) {
            const normalized = getNormalizedLocationCategory(r.location);
            locationFailureMap[normalized] = (locationFailureMap[normalized] || 0) + 1;
            totalFailedLocations++;
          }
        });
      });

      const failedLocations = Object.entries(locationFailureMap)
        .map(([loc, count]) => ({
          label: loc,
          count,
          percentage: totalFailedLocations > 0 ? ((count / totalFailedLocations) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const sCounts = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0 };
      let totalSFailures = 0;

      evals.forEach(ev => {
        ev.rows.forEach(r => {
          if (r.criteria[0] === false) { sCounts.S1++; totalSFailures++; }
          if (r.criteria[1] === false || r.criteria[2] === false || r.criteria[3] === false) { sCounts.S2++; totalSFailures++; }
          if (r.criteria[4] === false) { sCounts.S3++; totalSFailures++; }
          if (r.criteria[5] === false) { sCounts.S4++; totalSFailures++; }
          if (r.criteria[6] === true) { sCounts.S5++; totalSFailures++; }
        });
      });

      const sLabels = {
        S1: "S1 - Không sàng lọc",
        S2: "S2 - Không sắp xếp",
        S3: "S3 - Không sạch sẽ",
        S4: "S4 - Không duy trì",
        S5: "S5 - Không sẵn sàng"
      };

      const sFailures = Object.entries(sCounts)
        .map(([sKey, count]) => ({
          key: sKey,
          label: sLabels[sKey],
          count,
          percentage: totalSFailures > 0 ? ((count / totalSFailures) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.count - a.count);

      return { ranking, failedUnits, failedLocations, sFailures, totalFailedLocations, totalSFailures };
    };

    return {
      PHONG_BAN: generateSystemStats('PHONG_BAN'),
      LAM_SANG: generateSystemStats('LAM_SANG'),
      CAN_LAM_SANG: generateSystemStats('CAN_LAM_SANG')
    };
  }, [hospitalDatabase]);

  // Thống kê Top 5 đv lỗi 5S của từng phân hệ cho Trang chủ
  const homeTop5FailedStats = useMemo(() => {
    const getTop5 = (systemCode) => {
      const evals = hospitalDatabase.filter(e => e.system === systemCode);
      const map = {};
      evals.forEach(ev => {
        let failed = 0;
        ev.rows.forEach(r => {
          const ok = r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false;
          if (!ok) failed++;
        });
        if (failed > 0) {
          map[ev.department] = (map[ev.department] || 0) + failed;
        }
      });

      return Object.entries(map)
        .map(([dept, value]) => ({ label: dept, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    };

    return {
      LAM_SANG: getTop5('LAM_SANG'),
      PHONG_BAN: getTop5('PHONG_BAN'),
      CAN_LAM_SANG: getTop5('CAN_LAM_SANG')
    };
  }, [hospitalDatabase]);

  // Hình ảnh thực tế tại 5 đơn vị lỗi 5S nhiều nhất (Chỉ lấy ảnh các vị trí LỖI/CHƯA ĐẠT 5S)
  const top5FailedUnitsImages = useMemo(() => {
    const currentSystemStats = dashboardStats[activeSubDashboard];
    const top5UnitNames = currentSystemStats.failedUnits.map(u => u.label);

    const result = [];
    hospitalDatabase.forEach(ev => {
      if (ev.system === activeSubDashboard && top5UnitNames.includes(ev.department)) {
        ev.rows.forEach(r => {
          const isPassed = r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false;
          // CHỈ lấy ảnh nếu vị trí KHÔNG ĐẠT (Lỗi 5S)
          if (!isPassed) {
            const imgs = getRowImages(r);
            imgs.forEach(img => {
              result.push({
                department: ev.department,
                inspector: ev.inspector,
                date: ev.date,
                location: r.location,
                image: img,
                note: r.note || "Chưa có ghi chú",
                isPassed
              });
            });
          }
        });
      }
    });

    return result;
  }, [hospitalDatabase, activeSubDashboard, dashboardStats]);

  const currentStats = dashboardStats[activeSubDashboard];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FIREBASE SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Cloud size={20} /> Cài đặt Firebase Cloud Real-time
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Zap size={14} className="text-blue-600" /> Tối ưu kết nối Real-time & Multi-user:
                </p>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Dán chuỗi <strong>firebaseConfig</strong> (JSON hoặc object) tạo từ Firebase Console vào đây để kết nối Cloud Real-time.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Dán Firebase Config Object tại đây:</label>
                <textarea 
                  rows={6}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "ninhbinh-5s.firebaseapp.com",\n  "projectId": "ninhbinh-5s"\n}`}
                  className="w-full text-xs p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors font-mono resize-none"
                  value={configJsonInput}
                  onChange={(e) => setConfigJsonInput(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveFirebaseConfig}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow flex items-center gap-1.5"
              >
                <Save size={14} /> Lưu & Kết nối Cloud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL IMAGE PREVIEW MODAL */}
      {viewImageModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setViewImageModal(null)}>
          <div className="relative bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 text-white p-3 px-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm">{viewImageModal.department}</h4>
                <p className="text-[11px] text-slate-300">Vị trí: {viewImageModal.location} • Người kiểm tra: {viewImageModal.inspector || 'Đoàn kiểm tra'}</p>
              </div>
              <button onClick={() => setViewImageModal(null)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-3 bg-black flex items-center justify-center max-h-[75vh]">
              <img src={viewImageModal.image} alt="Bằng chứng 5S" className="max-h-[70vh] object-contain rounded-lg shadow" />
            </div>
            {viewImageModal.note && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700">
                <strong className="text-slate-900">Ghi chú lỗi:</strong> {viewImageModal.note}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================================== */}
      {/* 👈 SIDEBAR BÊN TRÁI: MÀU XANH DƯƠNG - TRẮNG, BỎ ICON, BUTTON & CHỮ TO NỔI BẬT */}
      {/* =================================================================================== */}
      <aside className={`bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white w-full md:w-72 shrink-0 flex flex-col justify-between p-5 border-r border-blue-800 transition-all ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="pb-5 border-b border-blue-800/80 space-y-1">
            <h2 className="font-black text-base text-white uppercase tracking-wider leading-snug">
              BỆNH VIỆN ĐA KHOA TỈNH NINH BÌNH
            </h2>
            <p className="text-xs text-blue-200 font-semibold italic">Hệ thống Quản lý Chất lượng</p>
          </div>

          {/* Navigation Button List: BỎ ICON, BUTTON VÀ CHỮ TO LÊN */}
          <div className="space-y-2.5">
            <span className="text-xs font-black uppercase text-blue-300 px-2 tracking-widest">
              DANH SÁCH MODULE
            </span>
            
            {/* BUTTON TRANG CHỦ */}
            <button
              onClick={() => setCurrentModule('HOME')}
              className={`w-full text-left py-4 px-5 rounded-2xl text-base font-extrabold transition-all duration-200 block shadow-sm ${
                currentModule === 'HOME'
                ? 'bg-white text-blue-900 shadow-xl scale-[1.02]'
                : 'bg-blue-800/40 text-white hover:bg-blue-800/80 border border-blue-700/50'
              }`}
            >
              TRANG CHỦ OVERVIEW
            </button>

            {/* BUTTON MODULE 1: 5S */}
            <button
              onClick={() => setCurrentModule('MODULE_5S')}
              className={`w-full text-left py-4 px-5 rounded-2xl text-base font-extrabold transition-all duration-200 block shadow-sm ${
                currentModule === 'MODULE_5S'
                ? 'bg-white text-blue-900 shadow-xl scale-[1.02]'
                : 'bg-blue-800/40 text-white hover:bg-blue-800/80 border border-blue-700/50'
              }`}
            >
              MODULE 1: ĐÁNH GIÁ 5S
            </button>

            {/* BUTTON MODULE 2: 83 TIÊU CHÍ BYT */}
            <button
              onClick={() => setCurrentModule('MODULE_QUALITY_83')}
              className={`w-full text-left py-4 px-5 rounded-2xl text-base font-extrabold transition-all duration-200 block shadow-sm ${
                currentModule === 'MODULE_QUALITY_83'
                ? 'bg-white text-blue-900 shadow-xl scale-[1.02]'
                : 'bg-blue-800/40 text-white hover:bg-blue-800/80 border border-blue-700/50'
              }`}
            >
              MODULE 2: 83 TIÊU CHÍ BYT
            </button>
          </div>
        </div>

        {/* Footer Settings Button */}
        <div className="pt-5 border-t border-blue-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-blue-200 font-bold px-1">
            <span>Kết nối Cloud:</span>
            {isFirebaseConnected ? (
              <span className="text-emerald-300 font-extrabold">⚡ Real-time</span>
            ) : (
              <span className="text-amber-300 font-extrabold">💾 Local</span>
            )}
          </div>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            ⚙️ CÀI ĐẶT FIREBASE API
          </button>
        </div>
      </aside>

      {/* =================================================================================== */}
      {/* MAIN CONTENT REGION */}
      {/* =================================================================================== */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        
        {/* Mobile Nav Toggle */}
        <div className="md:hidden bg-blue-900 text-white p-3.5 flex justify-between items-center sticky top-0 z-40 shadow-md">
          <span className="font-black text-xs uppercase tracking-wider">BVĐK TỈNH NINH BÌNH</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-blue-800 rounded-lg text-white font-bold">
            <Menu size={20} />
          </button>
        </div>

        {/* =================================================================================== */}
        {/* 🏠 TRANG CHỦ / HOME: EXECUTIVE DASHBOARD */}
        {/* =================================================================================== */}
        {currentModule === 'HOME' && (
          <main className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in">
            {/* Blue Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/10 border border-white/20 rounded-full text-blue-100 text-xs font-bold">
                  <Sparkles size={14} /> Trung Tâm Điều Hành Chất Lượng Bệnh Viện
                </div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
                  Bệnh Viện Đa Khoa Tỉnh Ninh Bình
                </h1>
                <p className="text-xs md:text-sm text-blue-100 italic">
                  Báo cáo tổng hợp chỉ số 5S & tiêu chuẩn chất lượng bệnh viện thời gian thực
                </p>
              </div>

              <button 
                onClick={() => setCurrentModule('MODULE_5S')}
                className="px-6 py-3.5 bg-white text-blue-900 hover:bg-blue-50 font-black text-xs md:text-sm rounded-2xl shadow-xl transition-all flex items-center gap-2 active:scale-95 shrink-0"
              >
                <span>CHUYỂN SANG MODULE 5S</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick KPI Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Đơn vị đã đánh giá 5S</span>
                <p className="text-2xl md:text-3xl font-black text-blue-900">{hospitalDatabase.length}</p>
                <span className="text-[10px] text-emerald-600 font-bold">✓ Cập nhật mới nhất</span>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Tổng vị trí kiểm tra</span>
                <p className="text-2xl md:text-3xl font-black text-blue-900">
                  {hospitalDatabase.reduce((sum, ev) => sum + ev.rows.length, 0)}
                </p>
                <span className="text-[10px] text-blue-600 font-bold">Trên toàn bệnh viện</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Tỷ lệ Đạt 5S Trung Bình</span>
                <p className="text-2xl md:text-3xl font-black text-emerald-600">
                  {(() => {
                    let totalR = 0; let passedR = 0;
                    hospitalDatabase.forEach(ev => ev.rows.forEach(r => {
                      totalR++;
                      if (r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false) passedR++;
                    }));
                    return totalR > 0 ? ((passedR / totalR) * 100).toFixed(1) + '%' : '0%';
                  })()}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold">Đạt chuẩn y tế</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Số Module Quản Lý</span>
                <p className="text-2xl md:text-3xl font-black text-purple-900">2 Module</p>
                <span className="text-[10px] text-purple-600 font-bold">1 Sẵn sàng • 1 Đang phát triển</span>
              </div>
            </section>

            {/* BÁO CÁO CỘT TỔNG HỢP TOP 5 ĐƠN VỊ LỖI CỦA 3 PHÂN HỆ */}
            <section className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-black text-base md:text-lg text-slate-900 uppercase flex items-center gap-2">
                  <BarChart3 size={22} className="text-blue-600" /> Biểu đồ cột: 5 Đơn vị có nhiều vị trí không đạt 5S nhất theo từng phân hệ
                </h3>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  Thống kê nhanh Top 5 khoa/phòng/trung tâm cần chấn chỉnh công tác 5S ở khối Lâm sàng, Khối Phòng ban và Khối Cận lâm sàng. Bấm vào từng phân hệ để chuyển tới Báo cáo tổng hợp chi tiết.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. KHỐI LÂM SÀNG */}
                <div 
                  onClick={() => {
                    setCurrentModule('MODULE_5S');
                    setActiveTab('DASHBOARD');
                    setActiveSubDashboard('LAM_SANG');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-4 border border-blue-100 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between font-extrabold text-xs text-blue-900 uppercase pb-2 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={16} className="text-blue-600" /> Khối Lâm Sàng
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                      Báo cáo <ArrowRight size={12} />
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {homeTop5FailedStats.LAM_SANG.length > 0 ? (
                      homeTop5FailedStats.LAM_SANG.map((item, idx) => {
                        const maxVal = Math.max(...homeTop5FailedStats.LAM_SANG.map(x => x.value), 1);
                        const pct = ((item.value / maxVal) * 100).toFixed(0);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-800 truncate max-w-[170px]">{idx + 1}. {item.label}</span>
                              <span className="text-red-600 font-mono font-black">{item.value} lỗi</span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-4">Chưa có vị trí lỗi</p>
                    )}
                  </div>
                </div>

                {/* 2. KHỐI PHÒNG BAN */}
                <div 
                  onClick={() => {
                    setCurrentModule('MODULE_5S');
                    setActiveTab('DASHBOARD');
                    setActiveSubDashboard('PHONG_BAN');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-4 border border-blue-100 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between font-extrabold text-xs text-blue-900 uppercase pb-2 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-blue-700" /> Khối Phòng Ban
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5">
                      Báo cáo <ArrowRight size={12} />
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {homeTop5FailedStats.PHONG_BAN.length > 0 ? (
                      homeTop5FailedStats.PHONG_BAN.map((item, idx) => {
                        const maxVal = Math.max(...homeTop5FailedStats.PHONG_BAN.map(x => x.value), 1);
                        const pct = ((item.value / maxVal) * 100).toFixed(0);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-800 truncate max-w-[170px]">{idx + 1}. {item.label}</span>
                              <span className="text-red-600 font-mono font-black">{item.value} lỗi</span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-4">Chưa có vị trí lỗi</p>
                    )}
                  </div>
                </div>

                {/* 3. KHỐI CẬN LÂM SÀNG */}
                <div 
                  onClick={() => {
                    setCurrentModule('MODULE_5S');
                    setActiveTab('DASHBOARD');
                    setActiveSubDashboard('CAN_LAM_SANG');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-4 border border-blue-100 hover:border-teal-300 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between font-extrabold text-xs text-blue-900 uppercase pb-2 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <FlaskConical size={16} className="text-blue-600" /> Khối Cận Lâm Sàng
                    </div>
                    <span className="text-[10px] font-bold text-teal-600 group-hover:underline flex items-center gap-0.5">
                      Báo cáo <ArrowRight size={12} />
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {homeTop5FailedStats.CAN_LAM_SANG.length > 0 ? (
                      homeTop5FailedStats.CAN_LAM_SANG.map((item, idx) => {
                        const maxVal = Math.max(...homeTop5FailedStats.CAN_LAM_SANG.map(x => x.value), 1);
                        const pct = ((item.value / maxVal) * 100).toFixed(0);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-800 truncate max-w-[170px]">{idx + 1}. {item.label}</span>
                              <span className="text-red-600 font-mono font-black">{item.value} lỗi</span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-4">Chưa có vị trí lỗi</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* =================================================================================== */}
        {/* RENDER MODULE 1: ĐÁNH GIÁ - GIÁM SÁT 5S (GIỮ NGUYÊN GIAO DIỆN & TÍNH NĂNG 100%) */}
        {/* =================================================================================== */}
        {currentModule === 'MODULE_5S' && (
          <>
            <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-30 border-b border-blue-800">
              <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck size={26} className="text-emerald-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-extrabold text-base md:text-lg leading-tight uppercase tracking-wider">Hệ thống Quản lý 5S</h1>
                      {isFirebaseConnected ? (
                        <span className="bg-emerald-500/30 border border-emerald-300 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Zap size={10} className="animate-pulse text-emerald-300" /> Real-time Cloud
                        </span>
                      ) : (
                        <span className="bg-amber-500/30 border border-amber-300 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CloudOff size={10} /> Local Mode
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs text-blue-100 italic">Bệnh Viện Đa Khoa Tỉnh Ninh Bình</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="bg-blue-800 hover:bg-blue-700 active:scale-95 transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 font-bold text-xs shadow"
                    title="Cài đặt kết nối Firebase Cloud Real-time"
                  >
                    <Settings size={16} />
                    <span className="hidden sm:inline">Cài đặt API</span>
                  </button>

                  {activeTab === 'EVALUATION' && (
                    <button 
                      onClick={saveReport}
                      disabled={isSaving}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 active:scale-95 transition-all px-3.5 py-2 rounded-lg flex items-center gap-1.5 font-bold text-xs md:text-sm shadow-md"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      <span>{isSaving ? "Đang lưu..." : "Lưu kết quả"}</span>
                    </button>
                  )}
                </div>
              </div>
            </header>

            <main className="max-w-5xl mx-auto p-3 md:p-4 space-y-4 md:space-y-6">
              <section className="bg-white rounded-xl shadow-sm border border-blue-100 p-1.5 grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    setActiveTab('EVALUATION');
                    setSelectedUnitForReport(null);
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs md:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 ${
                    activeTab === 'EVALUATION' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardCheck size={16} /> Đoàn Kiểm Tra
                </button>
                <button
                  onClick={() => setActiveTab('DASHBOARD')}
                  className={`py-2.5 px-3 rounded-lg text-xs md:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 ${
                    activeTab === 'DASHBOARD' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 size={16} /> Báo Cáo Tổng Hợp
                </button>
              </section>

              {activeTab === 'EVALUATION' && (
                <>
                  {draftForm && (department || (rows && rows.length > 1) || (rows[0] && (rows[0].note || getRowImages(rows[0]).length > 0))) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-amber-800 shadow-sm animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                        <span>📝 Đã tự động khôi phục phiên đang chấm dở {department ? `(Khoa: ${department})` : ''} • {rows.length} vị trí</span>
                      </div>
                      <button 
                        onClick={handleClearDraft}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer"
                        title="Xóa bản nháp này để chấm mới từ đầu"
                      >
                        Hủy nháp & Làm mới
                      </button>
                    </div>
                  )}
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 relative" ref={suggestionRef}>
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <LayoutDashboard size={13} className="text-blue-600" /> Khoa / Phòng / Trung tâm
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Tìm hoặc chọn khoa phòng..."
                          className="w-full border-b border-slate-200 focus:border-blue-600 outline-none py-1.5 pr-6 text-sm font-semibold transition-colors bg-transparent"
                          value={deptSearch}
                          onChange={(e) => {
                            setDeptSearch(e.target.value);
                            setDepartment(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                        />
                        <Search size={14} className="absolute right-1 top-2.5 text-slate-400 pointer-events-none" />
                      </div>
                      
                      {showSuggestions && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                          {filteredDepartments.length > 0 ? (
                            filteredDepartments.map((dept, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => selectDepartment(dept)}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-50 last:border-0 transition-colors"
                              >
                                {dept}
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-xs text-slate-400 italic text-center">
                              Không tìm thấy khoa phòng tương ứng
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <UserCheck size={13} className="text-blue-600" /> Người đánh giá
                      </label>
                      <input 
                        type="text" 
                        placeholder="Nhập tên cán bộ..."
                        className="w-full border-b border-slate-200 focus:border-blue-600 outline-none py-1.5 text-sm font-semibold transition-colors bg-transparent"
                        value={inspector}
                        onChange={(e) => setInspector(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Calendar size={13} className="text-blue-600" /> Ngày thực hiện
                      </label>
                      <input 
                        type="date" 
                        className="w-full border-b border-slate-200 focus:border-blue-600 outline-none py-1.5 text-sm font-semibold transition-colors bg-transparent"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </section>

                  <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Tổng vị trí</span>
                      <span className="text-xl md:text-2xl font-black text-blue-900">{activeStats.total}</span>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Vị trí Đạt 5S</span>
                      <span className="text-xl md:text-2xl font-black text-emerald-900">{activeStats.passed}</span>
                    </div>
                    <div className={`p-3 rounded-xl flex flex-col items-center justify-center border text-center ${parseFloat(activeStats.percentage) >= 80 ? 'bg-teal-50/60 border-teal-100' : 'bg-orange-50/60 border-orange-100'}`}>
                      <span className={`${parseFloat(activeStats.percentage) >= 80 ? 'text-teal-600' : 'text-orange-600'} text-[10px] font-bold uppercase tracking-wider`}>Tỷ Lệ Đạt</span>
                      <span className={`text-xl md:text-2xl font-black ${parseFloat(activeStats.percentage) >= 80 ? 'text-teal-950' : 'text-orange-950'}`}>{activeStats.percentage}%</span>
                    </div>
                    <div className="bg-purple-50/60 border border-purple-100 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">Số Sáng Kiến</span>
                      <span className="text-xl md:text-2xl font-black text-purple-900">{activeStats.totalImprovements}</span>
                    </div>
                  </section>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 flex items-start gap-2.5 shadow-sm">
                    <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">ĐẶT TÊN VỊ TRÍ CHẤM TÙY CHỈNH & XÓA VỊ TRÍ KHÔNG CẦN TẠI GÓC PHẢI:</p>
                      <p className="text-[11px] text-blue-800 mt-0.5">Bạn có thể gõ trực tiếp tên vị trí bất kỳ và nhấn biểu tượng thùng rác màu đỏ ở cuối mỗi dòng để xóa vị trí khi thấy không cần thiết.</p>
                    </div>
                  </div>

                  <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 text-xs font-extrabold text-slate-500 uppercase w-12 text-center">STT</th>
                          <th className="p-4 text-xs font-extrabold text-slate-500 uppercase min-w-[240px]">Tên vị trí đánh giá (Tùy chỉnh)</th>
                          <th className="p-4 text-xs font-extrabold text-slate-500 uppercase text-center w-40">Ảnh bằng chứng</th>
                          <th className="p-4 text-xs font-extrabold text-slate-500 uppercase text-center w-32">Kết luận</th>
                          <th className="p-4 text-xs font-extrabold text-slate-500 uppercase w-24 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => {
                          const isPassed = row.criteria.slice(0, 6).every(c => c === true) && row.criteria[6] === false;
                          const isExpanded = expandedRowId === row.id;

                          return (
                            <React.Fragment key={row.id}>
                              <tr 
                                onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                                className={`border-b border-slate-100 hover:bg-slate-50/80 transition-all cursor-pointer ${
                                  isExpanded ? 'bg-blue-50/30' : ''
                                }`}
                              >
                                <td className="p-4 text-sm text-slate-500 text-center font-bold">{index + 1}</td>
                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white rounded-lg px-2.5 py-1.5 transition-all">
                                    <MapPin size={15} className="text-blue-600 shrink-0" />
                                    <input 
                                      type="text" 
                                      placeholder="Gõ tên vị trí tùy ý (VD: Xe tiêm 1, Tủ thuốc...)"
                                      className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal"
                                      value={row.location}
                                      onChange={(e) => updateRow(row.id, 'location', e.target.value)}
                                    />
                                  </div>
                                </td>
                                <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                                  {getRowImages(row).length > 0 ? (
                                    <div className="flex items-center justify-center -space-x-2 overflow-hidden">
                                      {getRowImages(row).map((imgUrl, imgIdx) => (
                                        <div key={imgIdx} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-slate-100 shadow-sm relative group cursor-pointer" onClick={() => setViewImageModal({ image: imgUrl, location: row.location, department, inspector, note: row.note })}>
                                          <img src={imgUrl} alt={`Ảnh ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">Không có ảnh</span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  {isPassed ? (
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">Đạt chuẩn</span>
                                  ) : (
                                    <span className="text-xs font-bold text-red-700 bg-red-100/70 px-2.5 py-1 rounded-full">Chưa đạt</span>
                                  )}
                                </td>
                                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    onClick={(e) => removeRow(row.id, e)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto font-bold text-xs"
                                    title="Xóa vị trí này"
                                  >
                                    <Trash2 size={16} />
                                    <span className="hidden lg:inline">Xóa</span>
                                  </button>
                                </td>
                              </tr>

                              {isExpanded && (
                                <tr className="bg-slate-50/40">
                                  <td colSpan={5} className="p-4 border-b border-slate-200 animate-slide-down">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="space-y-3">
                                        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                          <ClipboardCheck size={14} className="text-blue-600" /> Chấm điểm 7 tiêu chí
                                        </h4>
                                        <div className="space-y-1.5">
                                          {INSPECTION_CRITERIA.map((crit, cIdx) => {
                                            const status = row.criteria[cIdx];
                                            const isS5 = cIdx === 6;
                                            return (
                                              <button
                                                key={crit.id}
                                                onClick={() => toggleCriteria(row.id, cIdx)}
                                                className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all ${
                                                  isS5 
                                                    ? (status ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600')
                                                    : (status ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600')
                                                }`}
                                              >
                                                <span>{crit.label}</span>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                                  isS5 ? (status ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-400') : (status ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400')
                                                }`}>
                                                  {isS5 ? (status ? <AlertCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />) : (status ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />)}
                                                </div>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      <div className="space-y-3 flex flex-col justify-between">
                                        <div className="space-y-2">
                                          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <FileText size={14} className="text-blue-600" /> Ghi chú vị trí này
                                          </h4>
                                          <textarea 
                                            className="w-full h-32 p-3 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none font-medium"
                                            placeholder="Nhập ghi chú lỗi hoặc yêu cầu khắc phục cụ thể..."
                                            value={row.note || ''}
                                            onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                                          />
                                        </div>

                                        <div className="flex items-center justify-between border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                                          <span className="text-xs font-bold text-slate-500">Số sáng kiến cải tiến:</span>
                                          <input 
                                            type="number" 
                                            min="0"
                                            className="w-16 bg-transparent border-none text-xs font-bold outline-none text-center p-0"
                                            value={row.improvement || 0}
                                            onChange={(e) => updateRow(row.id, 'improvement', parseInt(e.target.value) || 0)}
                                          />
                                        </div>
                                      </div>

                                      <div className="space-y-3 flex flex-col justify-between">
                                        <div className="space-y-2">
                                          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Camera size={14} className="text-blue-600" /> Bằng chứng 5S (Tối đa 3 ảnh)
                                          </h4>
                                          {getRowImages(row).length > 0 ? (
                                            <div className="space-y-2">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                {getRowImages(row).map((imgUrl, imgIdx) => (
                                                  <div key={imgIdx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                                    <img 
                                                      src={imgUrl} 
                                                      alt={`Bằng chứng ${imgIdx + 1}`} 
                                                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                                                      onClick={() => setViewImageModal({ image: imgUrl, location: row.location, department, inspector, note: row.note })}
                                                    />
                                                    <button 
                                                      type="button"
                                                      onClick={() => handleDeleteImage(row.id, imgIdx)}
                                                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition-all shadow"
                                                      title="Xóa ảnh này"
                                                    >
                                                      ✕
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                              {getRowImages(row).length < 3 && (
                                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg cursor-pointer transition-colors">
                                                  <Camera size={14} /> Thêm ảnh đính kèm
                                                  <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    multiple
                                                    className="hidden" 
                                                    onChange={(e) => handleAddImages(row.id, e)}
                                                  />
                                                </label>
                                              )}
                                            </div>
                                          ) : (
                                            <label className="cursor-pointer space-y-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                                              <ImageIcon size={28} className="text-slate-400" />
                                              <span className="text-xs font-bold text-blue-600">Bấm chụp hoặc chọn ảnh</span>
                                              <span className="text-[10px] text-slate-400">Hỗ trợ chọn nhiều ảnh (Tối đa 3 ảnh)</span>
                                              <input 
                                                type="file" 
                                                accept="image/*" 
                                                multiple
                                                className="hidden" 
                                                onChange={(e) => handleAddImages(row.id, e)}
                                              />
                                            </label>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="block md:hidden space-y-3">
                    {rows.map((row, index) => {
                      const isPassed = row.criteria.slice(0, 6).every(c => c === true) && row.criteria[6] === false;
                      const isExpanded = expandedRowId === row.id;

                      return (
                        <div key={row.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          <div 
                            onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                            className="p-3 flex items-center justify-between cursor-pointer border-b border-slate-100 bg-slate-50/50"
                          >
                            <div className="flex items-center gap-2 flex-1 pr-2" onClick={(e) => e.stopPropagation()}>
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <input 
                                type="text" 
                                placeholder="Gõ tên vị trí tùy chỉnh..."
                                className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs font-bold outline-none text-slate-800"
                                value={row.location}
                                onChange={(e) => updateRow(row.id, 'location', e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isPassed ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Đạt</span>
                              ) : (
                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Chưa đạt</span>
                              )}
                              <button 
                                onClick={(e) => removeRow(row.id, e)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                                title="Xóa vị trí"
                              >
                                <Trash2 size={16} />
                              </button>
                              <span className="text-slate-400">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 space-y-4 bg-white animate-fade-in">
                              <div className="space-y-2">
                                <label className="text-[11px] font-extrabold text-slate-500 uppercase">7 Tiêu chí 5S:</label>
                                <div className="space-y-1">
                                  {INSPECTION_CRITERIA.map((crit, cIdx) => {
                                    const status = row.criteria[cIdx];
                                    const isS5 = cIdx === 6;
                                    return (
                                      <button
                                        key={crit.id}
                                        onClick={() => toggleCriteria(row.id, cIdx)}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all ${
                                          isS5 
                                            ? (status ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600')
                                            : (status ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600')
                                        }`}
                                      >
                                        <span>{crit.label}</span>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                          isS5 ? (status ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-400') : (status ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400')
                                        }`}>
                                          {isS5 ? (status ? <AlertCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />) : (status ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />)}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <textarea 
                                  className="w-full h-24 p-2.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-medium"
                                  placeholder="Ghi chú vị trí lỗi..."
                                  value={row.note || ''}
                                  onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                                />
                                
                                <div className="space-y-2">
                                  {getRowImages(row).length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap py-1">
                                      {getRowImages(row).map((imgUrl, imgIdx) => (
                                        <div key={imgIdx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                          <img 
                                            src={imgUrl} 
                                            alt={`Bằng chứng ${imgIdx + 1}`} 
                                            className="w-full h-full object-cover cursor-pointer" 
                                            onClick={() => setViewImageModal({ image: imgUrl, location: row.location, department, inspector, note: row.note })}
                                          />
                                          <button 
                                            type="button"
                                            onClick={() => handleDeleteImage(row.id, imgIdx)}
                                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs cursor-pointer hover:bg-blue-100 transition-colors">
                                      <Camera size={16} /> {getRowImages(row).length > 0 ? `Thêm ảnh (${getRowImages(row).length}/3)` : "Chụp / Chọn ảnh"}
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        multiple
                                        className="hidden" 
                                        onChange={(e) => handleAddImages(row.id, e)}
                                      />
                                    </label>
                                    <button 
                                      onClick={(e) => removeRow(row.id, e)}
                                      className="text-red-500 p-2 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                                    >
                                      <Trash2 size={14} /> Xóa vị trí
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={addRow}
                    className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                  >
                    <Plus size={18} /> Thêm vị trí đánh giá mới
                  </button>
                </>
              )}

              {/* BÁO CÁO TỔNG HỢP CỦA MODULE 5S */}
              {activeTab === 'DASHBOARD' && (
                <div className="space-y-6 animate-fade-in">
                  <section className="bg-white rounded-xl border border-blue-100 p-1.5 grid grid-cols-3 gap-1 shadow-sm">
                    <button 
                      onClick={() => setActiveSubDashboard('LAM_SANG')}
                      className={`py-2.5 px-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                        activeSubDashboard === 'LAM_SANG' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Activity size={14} /> Khối Lâm Sàng
                    </button>
                    <button 
                      onClick={() => setActiveSubDashboard('PHONG_BAN')}
                      className={`py-2.5 px-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                        activeSubDashboard === 'PHONG_BAN' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 size={14} /> Khối Phòng Ban
                    </button>
                    <button 
                      onClick={() => setActiveSubDashboard('CAN_LAM_SANG')}
                      className={`py-2.5 px-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                        activeSubDashboard === 'CAN_LAM_SANG' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Layers size={14} /> Cận Lâm Sàng
                    </button>
                  </section>

                  {/* 1. TẦNG CÁC BIỂU ĐỒ (BIỂU ĐỒ CỘT 5 ĐƠN VỊ, TRÒN 5 VỊ TRÍ, TRÒN % LỖI S) */}
                  <section className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Biểu đồ cột 5 đơn vị */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-800 uppercase flex items-center gap-2">
                          <BarChart3 size={18} className="text-red-600" /> Biểu đồ cột: 5 đơn vị có nhiều vị trí không đạt 5S nhất
                        </h3>

                        <div className="space-y-3">
                          {currentStats.failedUnits.length > 0 ? (
                            currentStats.failedUnits.map((unit, idx) => {
                              const maxVal = Math.max(...currentStats.failedUnits.map(u => u.value), 1);
                              const barWidth = ((unit.value / maxVal) * 100).toFixed(0);
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-slate-800 truncate max-w-[200px]">{idx + 1}. {unit.label}</span>
                                    <span className="text-red-600 font-mono font-black">{unit.value} vị trí vi phạm</span>
                                  </div>
                                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500 shadow-sm"
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl">
                              Khối này chưa ghi nhận đơn vị nào có vị trí vi phạm
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Biểu đồ tròn 5 vị trí */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-800 uppercase flex items-center gap-2">
                          <PieChart size={18} className="text-amber-500" /> Biểu đồ tròn: 5 vị trí không đạt 5S nhiều nhất
                        </h3>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="relative shrink-0 flex items-center justify-center">
                            <div 
                              className="w-36 h-36 rounded-full shadow-md flex items-center justify-center"
                              style={{ background: generateConicGradient(currentStats.failedLocations) }}
                            >
                              <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center text-center p-1">
                                <span className="text-[9px] font-bold text-slate-400">VỊ TRÍ LỖI</span>
                                <span className="text-lg font-black text-slate-800">{currentStats.totalFailedLocations}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5 flex-1 w-full text-xs">
                            {currentStats.failedLocations.length > 0 ? (
                              currentStats.failedLocations.map((loc, idx) => (
                                <div key={idx} className="flex justify-between items-center font-bold">
                                  <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                                    <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                                    {loc.label}
                                  </span>
                                  <span className="font-mono text-slate-700">{loc.count} lượt ({loc.percentage}%)</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-400 italic text-center py-4">Chưa có vị trí vi phạm</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Biểu đồ tròn tỷ lệ % các loại lỗi S (S1 - S5) */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
                      <h3 className="font-extrabold text-sm text-slate-800 uppercase flex items-center gap-2">
                        <PieChart size={18} className="text-blue-600" /> Biểu đồ tròn: Tỷ lệ % các tiêu chí lỗi S (S1 - S5)
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative shrink-0 flex items-center justify-center">
                          <div 
                            className="w-40 h-40 rounded-full shadow-md flex items-center justify-center transition-all duration-500"
                            style={{ background: generateConicGradient(currentStats.sFailures) }}
                          >
                            <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner text-center p-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TỔNG LỖI S</span>
                              <span className="text-xl font-black text-slate-800">{currentStats.totalSFailures}</span>
                              <span className="text-[9px] text-slate-500 font-medium">lượt vi phạm</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full text-xs">
                          {currentStats.sFailures.map((s, idx) => (
                            <div key={s.key} className="flex justify-between items-center p-2.5 bg-blue-50/40 rounded-xl font-bold border border-blue-100">
                              <span className="flex items-center gap-2 truncate">
                                <span 
                                  className="w-3 h-3 rounded-sm inline-block shrink-0" 
                                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                                />
                                {s.label}
                              </span>
                              <span className="font-mono text-slate-900 shrink-0 ml-1">{s.count} lỗi ({s.percentage}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. TẦNG HÌNH ẢNH BẰNG CHỨNG TẠI 5 ĐƠN VỊ MẮC LỖI NHIỀU NHẤT */}
                  <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
                    <div>
                      <h3 className="font-extrabold text-sm md:text-base text-slate-800 uppercase flex items-center gap-2">
                        <Camera size={18} className="text-blue-600" /> Hình ảnh bằng chứng 5S tại 5 đơn vị mắc lỗi nhiều nhất
                      </h3>
                      <p className="text-xs text-slate-500 italic mt-0.5">Tập hợp các bức ảnh chụp ghi nhận thực tế tại các đơn vị có tỷ lệ vi phạm cao nhất</p>
                    </div>

                    {top5FailedUnitsImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {top5FailedUnitsImages.map((imgItem, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setViewImageModal(imgItem)}
                            className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-all relative"
                          >
                            <div className="h-32 bg-slate-200 overflow-hidden relative">
                              <img src={imgItem.image} alt={imgItem.location} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                imgItem.isPassed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                {imgItem.isPassed ? 'Đạt' : 'Chưa đạt'}
                              </span>
                            </div>
                            <div className="p-2 space-y-0.5">
                              <p className="text-[11px] font-bold text-slate-900 truncate">{imgItem.department}</p>
                              <p className="text-[10px] text-slate-600 font-medium truncate">Vị trí: {imgItem.location}</p>
                              <p className="text-[9px] text-slate-400 italic truncate">"{imgItem.note}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Chưa có hình ảnh bằng chứng nào được tải lên cho 5 đơn vị vi phạm của khối này
                      </div>
                    )}
                  </section>

                  {/* 3. TẦNG BẢNG XẾP HẠNG CÁC ĐƠN VỊ */}
                  <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-sm md:text-base text-slate-800 uppercase flex items-center gap-2">
                          <Award size={18} className="text-amber-500" /> Bảng xếp hạng các đơn vị theo vị trí đạt 5S
                        </h3>
                        <p className="text-xs text-slate-500 italic mt-0.5">Đơn vị có nhiều vị trí đạt 5S nhất được xếp đứng đầu danh sách</p>
                      </div>
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                        {currentStats.ranking.length} Đơn vị
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase text-center w-12">Hạng</th>
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase">Khoa / Phòng</th>
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase text-center">Người đánh giá</th>
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase text-center">Vị trí đạt 5S</th>
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase text-center">Tỷ lệ Đạt</th>
                            <th className="p-3 text-xs font-bold text-slate-500 uppercase text-center">Xem Chi Tiết</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStats.ranking.map((unit, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="p-3 text-center">
                                <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                                  idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                  idx === 1 ? 'bg-slate-200 text-slate-700' :
                                  idx === 2 ? 'bg-orange-100 text-orange-800' : 'text-slate-500'
                                }`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-xs md:text-sm text-slate-800">{unit.department}</td>
                              <td className="p-3 text-center text-xs text-slate-600">{unit.inspector}</td>
                              <td className="p-3 text-center text-xs font-bold text-emerald-700">
                                {unit.passed}/{unit.total} vị trí
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                                  parseInt(unit.percentage) >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {unit.percentage}%
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => setSelectedUnitForReport(unit)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {selectedUnitForReport && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                    <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-base">{selectedUnitForReport.department}</h3>
                        <p className="text-xs text-blue-100">Người đánh giá: {selectedUnitForReport.inspector} • Ngày: {selectedUnitForReport.date}</p>
                      </div>
                      <button onClick={() => setSelectedUnitForReport(null)} className="text-white/80 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-4 overflow-y-auto space-y-4 max-h-[70vh]">
                      {/* Mục 1: Vị trí KHÔNG ĐẠT 5S */}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-xs text-red-700 uppercase flex items-center justify-between border-b pb-1">
                          <span>⚠️ Danh sách vị trí KHÔNG ĐẠT 5S ({selectedUnitForReport.rows.filter(r => !(r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false)).length})</span>
                        </h4>
                        {selectedUnitForReport.rows.filter(r => !(r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false)).length === 0 ? (
                          <p className="text-xs text-emerald-700 italic bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">🎉 Đơn vị đạt chuẩn 100% 5S (Không có vị trí vi phạm)</p>
                        ) : (
                          selectedUnitForReport.rows.filter(r => !(r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false)).map((r, i) => (
                            <div key={i} className="bg-red-50/50 p-3 rounded-xl border border-red-100 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-xs text-slate-800">{r.location}</span>
                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Chưa đạt</span>
                              </div>
                              {r.note && <p className="text-xs text-slate-700 bg-white p-2 rounded border border-red-200 font-medium">Ghi chú lỗi: {r.note}</p>}
                              {getRowImages(r).length > 0 && (
                                <div className="flex gap-2 flex-wrap pt-1">
                                  {getRowImages(r).map((imgUrl, imgIdx) => (
                                    <img key={imgIdx} src={imgUrl} alt={r.location} className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:scale-105 transition-transform" onClick={() => setViewImageModal({ department: selectedUnitForReport.department, location: r.location, inspector: selectedUnitForReport.inspector, image: imgUrl, note: r.note })} />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Mục 2: Vị trí ĐẠT 5S (Bao gồm ảnh bằng chứng vị trí đạt) */}
                      <div className="space-y-2 pt-2">
                        <h4 className="font-extrabold text-xs text-emerald-700 uppercase flex items-center justify-between border-b pb-1">
                          <span>✅ Danh sách vị trí ĐẠT 5S ({selectedUnitForReport.rows.filter(r => (r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false)).length})</span>
                        </h4>
                        {selectedUnitForReport.rows.filter(r => (r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false)).length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-2">Chưa có vị trí nào đạt chuẩn 5S trong đợt này.</p>
                        ) : (
                          selectedUnitForReport.rows.filter(r => (r.criteria.slice(0, 6).every(c => c === true) && r.criteria[6] === false)).map((r, i) => (
                            <div key={i} className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-xs text-slate-800">{r.location}</span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Đạt 5S</span>
                              </div>
                              {r.note && <p className="text-xs text-slate-700 bg-white p-2 rounded border border-emerald-200">Ghi chú: {r.note}</p>}
                              {getRowImages(r).length > 0 && (
                                <div className="flex gap-2 flex-wrap pt-1">
                                  {getRowImages(r).map((imgUrl, imgIdx) => (
                                    <img key={imgIdx} src={imgUrl} alt={r.location} className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:scale-105 transition-transform" onClick={() => setViewImageModal({ department: selectedUnitForReport.department, location: r.location, inspector: selectedUnitForReport.inspector, image: imgUrl, note: r.note })} />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => setSelectedUnitForReport(null)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-slate-700 hover:bg-slate-800 rounded-lg"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </>
        )}

        {/* =================================================================================== */}
        {/* RENDER MODULE 2: 83 TIÊU CHÍ CHẤT LƯỢNG BỆNH VIỆN (ĐANG PHÁT TRIỂN) */}
        {/* =================================================================================== */}
        {currentModule === 'MODULE_QUALITY_83' && (
          <main className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in space-y-6">
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                  <Construction size={14} className="animate-bounce" /> Tính năng Đang phát triển
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black leading-tight">
                  Module 2: 83 Tiêu Chí Chất Lượng Bệnh Viện
                </h2>
                
                <p className="text-xs md:text-sm text-blue-200 leading-relaxed font-medium">
                  Bộ tiêu chí đánh giá chất lượng bệnh viện ban hành theo <strong>Quyết định 6858/QĐ-BYT</strong> của Bộ Y tế. Hệ thống đang được tích hợp bộ cơ sở dữ liệu chấm điểm 5 mức độ và đính kèm tài liệu minh chứng.
                </p>

                <div className="pt-4 flex flex-wrap gap-3">
                  <button 
                    onClick={() => setCurrentModule('MODULE_5S')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 active:scale-95"
                  >
                    <ClipboardCheck size={16} /> Chuyển sang Module 5S
                  </button>
                  <button 
                    onClick={() => setCurrentModule('HOME')}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
                  >
                    Quay Về Trang Chủ Overview
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-600" /> Khung 5 Phần Tiêu Chí Chất Lượng Theo Bộ Y Tế (Dự kiến)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center">A</div>
                  <h4 className="font-bold text-xs text-slate-800">Hướng đến Người bệnh</h4>
                  <p className="text-[11px] text-slate-500">19 tiêu chí đánh giá sự hài lòng, đón tiếp, chăm sóc & quyền lợi người bệnh.</p>
                </div>

                <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-black text-sm flex items-center justify-center">B</div>
                  <h4 className="font-bold text-xs text-slate-800">Phát triển Nhân lực</h4>
                  <p className="text-[11px] text-slate-500">14 tiêu chí đào tạo, chế độ chính sách, đời sống & năng lực nhân viên y tế.</p>
                </div>

                <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-800 text-white font-black text-sm flex items-center justify-center">C</div>
                  <h4 className="font-bold text-xs text-slate-800">Hoạt động Chuyên môn</h4>
                  <p className="text-[11px] text-slate-500">35 tiêu chí kiểm soát nhiễm khuẩn, an toàn phẫu thuật, quy trình y khoa.</p>
                </div>

                <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-black text-sm flex items-center justify-center">D</div>
                  <h4 className="font-bold text-xs text-slate-800">Cải tiến Chất lượng</h4>
                  <p className="text-[11px] text-slate-500">11 tiêu chí thiết lập hệ thống quản lý chất lượng & đo lường chỉ số.</p>
                </div>

                <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-800 text-white font-black text-sm flex items-center justify-center">E</div>
                  <h4 className="font-bold text-xs text-slate-800">Tiêu chí Đặc thù</h4>
                  <p className="text-[11px] text-slate-500">4 tiêu chí áp dụng riêng cho các bệnh viện chuyên khoa đặc thù.</p>
                </div>

                <div className="p-4 bg-blue-50/60 border border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
                  <Sparkles size={24} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-800">Tự động báo cáo</span>
                  <span className="text-[10px] text-blue-600">Xuất file Excel/PDF mẫu Bộ Y tế</span>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
