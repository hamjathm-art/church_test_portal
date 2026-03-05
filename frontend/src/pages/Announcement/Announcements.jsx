import React, { useState, useRef, useEffect, useCallback } from 'react';
import './WeeklyAnnouncement.css';
import authFetch from '../../utils/authFetch';
import ActionButton from '../../components/Buttons/ActionButton';
import SearchButton from '../../components/Buttons/SearchButton';

const initialFormData = {
  title: '',
  description: '',
  category: '',
  liturgicalSeason: '',
  announcementDate: '',
  status: 'Draft',
  isRecurring: 'No',
};

const initialSearchData = {
  title: '',
  category: '',
  liturgicalSeason: '',
  status: '',
  announcementDateFrom: '',
  announcementDateTo: '',
  sortBy: 'announcementDate',
  sortOrder: 'desc',
  maxRecords: '100',
}; 

const categoryOptions = [
  { value: 'Feast', label: 'Feast' },
  { value: 'Sacrament', label: 'Sacrament' },
  { value: 'Ministry', label: 'Ministry' },
  { value: 'Community', label: 'Community' },
  { value: 'General', label: 'General' },
];

const seasonOptions = [
  { value: 'Advent', label: 'Advent' },
  { value: 'Lent', label: 'Lent' },
  { value: 'Easter', label: 'Easter' },
  { value: 'Ordinary Time', label: 'Ordinary Time' },
];

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
];

const WeeklyAnnouncement = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('dashboard');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchData, setSearchData] = useState(initialSearchData);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [cameFromSearch, setCameFromSearch] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [signingAuthority, setSigningAuthority] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [dashboardAnnouncements, setDashboardAnnouncements] = useState([]);
  const [sidebarFeasts, setSidebarFeasts] = useState([]);
  const [sidebarSacraments, setSidebarSacraments] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const resultsRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    const required = {
      title: 'Title is required',
      category: 'Category is required',
      announcementDate: 'Announcement Date is required',
      description: 'Description is required',
    };
    Object.entries(required).forEach(([key, msg]) => {
      if (!formData[key] || !formData[key].trim()) {
        newErrors[key] = msg;
      }
    });
    return newErrors;
  };

  const handleSearch = async (page = 1) => {
    const hasSearchCriteria = searchData.title || searchData.category ||
      searchData.liturgicalSeason || searchData.status ||
      searchData.announcementDateFrom || searchData.announcementDateTo;

    if (!hasSearchCriteria) {
      showToast('Please enter at least one search field.', 'error');
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchData.title) params.append('title', searchData.title);
      if (searchData.category) params.append('category', searchData.category);
      if (searchData.liturgicalSeason) params.append('liturgicalSeason', searchData.liturgicalSeason);
      if (searchData.status) params.append('status', searchData.status);
      if (searchData.announcementDateFrom) params.append('announcementDateFrom', searchData.announcementDateFrom);
      if (searchData.announcementDateTo) params.append('announcementDateTo', searchData.announcementDateTo);
      params.append('sortBy', searchData.sortBy);
      params.append('sortOrder', searchData.sortOrder);
      params.append('maxRecords', searchData.maxRecords);
      params.append('page', page);

      const response = await authFetch(`/api/announcement/search?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        showToast(result.message || 'Search failed', 'error');
      }
    } catch {
      showToast('Server error. Make sure backend is running.', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchReset = () => {
    setSearchData({ ...initialSearchData });
    setSearchResults([]);
    setHasSearched(false);
    setResetKey(prev => prev + 1);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalCount(0);
  };

  const handleSearchClick = () => {
    setSearchTitle('');
    setView('search');
    setSearchData({ ...initialSearchData });
    setSearchResults([]);
    setHasSearched(false);
    setResetKey(prev => prev + 1);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalCount(0);
  };

  const handleViewAllSearch = (filters = {}) => {
    // Set title based on which "View All" was clicked
    if (filters.category === 'Feast') setSearchTitle('Upcoming Feast Days');
    else if (filters.category === 'Sacrament') setSearchTitle('Upcoming Sacraments');
    else setSearchTitle('All Announcements');

    const newSearchData = {
      ...initialSearchData,
      status: filters.status || 'Published',
      category: filters.category || '',
      announcementDateFrom: filters.announcementDateFrom || '',
      sortBy: filters.sortBy || 'announcementDate',
      sortOrder: filters.sortOrder || 'desc',
      maxRecords: '25',
    };
    setSearchData(newSearchData);
    setView('search');
    setResetKey(prev => prev + 1);
    setHasSearched(true);
    setSearchLoading(true);

    const params = new URLSearchParams();
    if (newSearchData.status) params.append('status', newSearchData.status);
    if (newSearchData.category) params.append('category', newSearchData.category);
    if (newSearchData.announcementDateFrom) params.append('announcementDateFrom', newSearchData.announcementDateFrom);
    params.append('sortBy', newSearchData.sortBy);
    params.append('sortOrder', newSearchData.sortOrder);
    params.append('maxRecords', newSearchData.maxRecords);
    params.append('page', '1');

    authFetch(`/api/announcement/search?${params.toString()}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setSearchResults(result.data);
          setCurrentPage(result.page);
          setTotalPages(result.totalPages);
          setTotalCount(result.totalCount);
        }
      })
      .catch(() => showToast('Search failed.', 'error'))
      .finally(() => setSearchLoading(false));
  };

  const handleEditClick = (record) => {
    const { id, created_at, updated_at, slug, ...fields } = record;
    setFormData(fields);
    setEditingId(id);
    setErrors({});
    setCameFromSearch(true);
    setView('form');
  };

  const handleViewClick = (record) => {
    setDetailRecord(record);
    setSigningAuthority('');
    setCameFromSearch(true);
    setView('detail');
  };

  const handleBackToSearch = () => {
    setDetailRecord(null);
    setSigningAuthority('');
    if (cameFromSearch) {
      setView('search');
      if (hasSearched) {
        setTimeout(() => handleSearch(currentPage), 50);
      }
    } else {
      setView('dashboard');
      fetchDashboardData();
    }
  };

  const handleNewClick = (prefillCategory) => {
    setFormData(prefillCategory
      ? { ...initialFormData, category: prefillCategory, status: 'Published' }
      : initialFormData
    );
    setEditingId(null);
    setErrors({});
    setCameFromSearch(false);
    setView('form');
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setErrors({});
    if (cameFromSearch) {
      setCameFromSearch(false);
      setView('search');
      if (hasSearched) {
        setTimeout(() => handleSearch(currentPage), 50);
      }
    } else {
      setCameFromSearch(false);
      setView('dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `/api/announcement/${editingId}` : '/api/announcement';
      const method = editingId ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        showToast(editingId ? 'Announcement updated successfully.' : 'Announcement submitted successfully.', 'success');
        if (cameFromSearch) {
          setFormData(initialFormData);
          setEditingId(null);
          setErrors({});
          setCameFromSearch(false);
          setView('search');
          setTimeout(() => handleSearch(currentPage), 50);
        } else {
          setFormData(initialFormData);
          setEditingId(null);
          setErrors({});
          setView('dashboard');
          fetchDashboardData();
        }
      } else {
        showToast(result.message || 'Failed to submit', 'error');
      }
    } catch {
      showToast('Server error. Make sure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      const response = await authFetch(`/api/announcement/${deleteConfirmId}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        showToast('Announcement deleted.', 'success');
        handleSearch(currentPage);
      } else {
        showToast(result.message || 'Delete failed.', 'error');
      }
    } catch {
      showToast('Server error.', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Toggle status
  const handleToggleStatus = async (record) => {
    const newStatus = record.status === 'Published' ? 'Draft' : 'Published';
    try {
      const response = await authFetch(`/api/announcement/${record.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        showToast(`Announcement ${newStatus === 'Published' ? 'published' : 'unpublished'}.`, 'success');
        handleSearch(currentPage);
      } else {
        showToast(result.message || 'Status update failed.', 'error');
      }
    } catch {
      showToast('Server error.', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return day + ' ' + months[d.getMonth()] + ', ' + d.getFullYear();
  };

  const getTodayFormatted = () => {
    const d = new Date();
    const day = d.getDate();
    const suffix = (day === 1 || day === 21 || day === 31) ? 'st' : (day === 2 || day === 22) ? 'nd' : (day === 3 || day === 23) ? 'rd' : 'th';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return { dayName: days[d.getDay()], dateStr: `${day}${suffix} ${months[d.getMonth()]}, ${d.getFullYear()}` };
  };

  // Dashboard helpers
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const fmt = (d) => `${months[d.getMonth()]} ${d.getDate()}`;
    return `${fmt(sunday)} – ${fmt(saturday)}, ${saturday.getFullYear()}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Feast: { bg: '#FFF7ED', color: '#C2410C', border: '#FDBA74' },
      Sacrament: { bg: '#F5F3FF', color: '#6D28D9', border: '#C4B5FD' },
      Ministry: { bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD' },
      Community: { bg: '#F0FDF4', color: '#15803D', border: '#86EFAC' },
      General: { bg: '#F9FAFB', color: '#374151', border: '#D1D5DB' },
    };
    return colors[category] || colors.General;
  };

  const fetchDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [mainRes, feastsRes, sacramentsRes] = await Promise.all([
        authFetch(`/api/announcement/search?status=Published&sortBy=announcementDate&sortOrder=desc&maxRecords=20&page=1`),
        authFetch(`/api/announcement/search?status=Published&category=Feast&announcementDateFrom=${today}&sortBy=announcementDate&sortOrder=asc&maxRecords=5&page=1`),
        authFetch(`/api/announcement/search?status=Published&category=Sacrament&announcementDateFrom=${today}&sortBy=announcementDate&sortOrder=asc&maxRecords=5&page=1`),
      ]);
      const [mainData, feastsData, sacramentsData] = await Promise.all([
        mainRes.json(), feastsRes.json(), sacramentsRes.json(),
      ]);
      if (mainData.success) setDashboardAnnouncements(mainData.data);
      if (feastsData.success) setSidebarFeasts(feastsData.data);
      if (sacramentsData.success) setSidebarSacraments(sacramentsData.data);
    } catch {
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setDashboardLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDashboardReadMore = (record) => {
    setDetailRecord(record);
    setSigningAuthority('');
    setCameFromSearch(false);
    setView('detail');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    fetchDashboardData();
  };

  const handlePrint = () => {
    const printArea = document.getElementById('detail-print-area');
    if (!printArea) return;
    const printContent = printArea.cloneNode(true);
    printContent.querySelectorAll('.no-print').forEach(el => el.remove());
    printContent.querySelectorAll('.print-only').forEach(el => { el.style.display = 'block'; });
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Announcement</title>');
    printWindow.document.write('<style>');
    printWindow.document.write("@page { size: A4; margin: 0; }");
    printWindow.document.write("body { margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif; color: #000; }");
    printWindow.document.write("body * { color: #000; }");
    printWindow.document.write(".letterhead-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }");
    printWindow.document.write(".letterhead-bg img { width: 100%; height: 100%; display: block; }");
    printWindow.document.write(".content { position: relative; z-index: 1; padding: 145px 50px 40px; }");
    printWindow.document.write("table { border-collapse: collapse; font-size: 14px; }");
    printWindow.document.write("td { padding: 2px 6px; color: #000; }");
    printWindow.document.write("p { margin: 0; }");
    printWindow.document.write("hr { border: none; border-top: 1px solid #000; }");
    printWindow.document.write("-webkit-print-color-adjust: exact; print-color-adjust: exact;");
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<div class="letterhead-bg"><img src="/images/f1.png" /></div>');
    printWindow.document.write('<div class="content">');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close(); };
  };

  const field = (name, label, type = 'text', required = true) => (
    <div key={name}>
      <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
        {label} {required && <span className="text-red-500 text-lg font-bold leading-none">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={type === 'date' ? '' : label}
        className={`w-full py-2.5 px-3.5 text-[15px] rounded-lg outline-none transition-colors duration-200 focus:border-[#1E3A8A] ${
          errors[name]
            ? 'border-2 border-red-500 bg-red-50 text-red-800'
            : 'border border-gray-300 bg-white text-gray-900'
        }`}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1.5">{errors[name]}</p>
      )}
    </div>
  );

  const selectField = (name, label, options, required = true) => (
    <div key={name}>
      <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
        {label} {required && <span className="text-red-500 text-lg font-bold leading-none">*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full py-2.5 px-3.5 text-[15px] rounded-lg outline-none transition-colors duration-200 focus:border-[#1E3A8A] ${
          errors[name]
            ? 'border-2 border-red-500 bg-red-50 text-red-800'
            : 'border border-gray-300 bg-white text-gray-900'
        }`}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1.5">{errors[name]}</p>
      )}
    </div>
  );

  const selectStyle = {
    padding: '10px 14px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#111',
  };

  const searchField = (name, label, type = 'text') => (
    <div key={name}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={searchData[name]}
        onChange={handleSearchChange}
        placeholder={type === 'date' ? '' : label}
        style={{
          width: '100%', padding: '10px 14px', fontSize: '15px',
          border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none',
          backgroundColor: '#fff', color: '#111', transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
        onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; }}
      />
    </div>
  );

  return (
    <div className="w-full py-6 px-4">

      {toast && (
        <div className="ann-toast" style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 24px', borderRadius: '10px',
          backgroundColor: toast.type === 'success' ? '#1E3A8A' : '#dc2626',
          boxShadow: '0 8px 30px rgba(30, 58, 138, 0.35)',
          animation: 'slideIn 0.3s ease-out',
          minWidth: '300px', maxWidth: '440px',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {toast.type === 'success' ? (
              <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto',
            color: 'rgba(255,255,255,0.7)', fontSize: '20px', lineHeight: 1, padding: '0 0 0 8px'
          }}>&times;</button>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="ann-confirm-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="ann-confirm-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>Delete Announcement</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px' }}>Are you sure you want to delete this announcement? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '8px 20px', fontSize: '14px', fontWeight: 500, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={{ padding: '8px 20px', fontSize: '14px', fontWeight: 500, backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dashboard View ── */}
      {view === 'dashboard' ? (
        <div>
          {/* Hero Section */}
          <div className="ann-dash-hero" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h1 className="ann-dash-hero-title" style={{ fontSize: '32px', fontStyle: 'normal', fontFamily: 'inherit' }}>Weekly Announcements</h1>
            <p className="ann-dash-hero-subtitle" style={{ fontSize: '17px' }}>Week: {getWeekRange()}</p>
            <div className="ann-dash-hero-actions" style={{ marginTop: '16px' }}>
              <button className="ann-dash-btn-new" onClick={() => handleNewClick()}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                New Announcement
              </button>
              <button className="ann-dash-btn-search" onClick={handleSearchClick}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Search
              </button>
            </div>
          </div>

          {/* Dashboard Body */}
          {dashboardLoading ? (
            <div className="ann-dash-loading">Loading announcements...</div>
          ) : dashboardAnnouncements.length === 0 ? (
            <div className="ann-dash-empty">
              <svg width="48" height="48" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ margin: '0 auto 12px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p style={{ margin: 0 }}>No published announcements yet.</p>
            </div>
          ) : (
            <div className="ann-dash-body">
              {/* Main Cards */}
              <div className="ann-dash-main">
                <div className="ann-dash-cards-grid">
                  {dashboardAnnouncements.slice(0, 4).map((ann) => {
                    const catColor = getCategoryColor(ann.category);
                    return (
                      <div key={ann.id} className="ann-dash-card">
                        <div className="ann-dash-card-top">
                          <span className="ann-dash-card-category" style={{ backgroundColor: catColor.bg, color: catColor.color, border: `1px solid ${catColor.border}` }}>
                            {ann.category || 'General'}
                          </span>
                          {ann.liturgicalSeason && (
                            <span className="ann-dash-card-season">{ann.liturgicalSeason}</span>
                          )}
                          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginLeft: 'auto' }}>{formatDate(ann.announcementDate)}</span>
                        </div>
                        <h3 className="ann-dash-card-title">{ann.title}</h3>
                        <div className="ann-dash-card-date">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {formatDate(ann.announcementDate)}
                        </div>
                        <p className="ann-dash-card-desc">
                          {ann.description && ann.description.length > 120
                            ? ann.description.substring(0, 120) + '...'
                            : ann.description || 'No description available.'}
                        </p>
                        <button className="ann-dash-card-readmore" onClick={() => handleDashboardReadMore(ann)}>
                          Read More
                        </button>
                      </div>
                    );
                  })}
                </div>
                {dashboardAnnouncements.length > 4 && (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <SearchButton onClick={() => handleViewAllSearch({ status: 'Published' })}>
                      View All Announcements ({dashboardAnnouncements.length})
                    </SearchButton>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="ann-dash-sidebar">
                {/* Upcoming Feast Days */}
                <div className="ann-dash-sidebar-section">
                  <div className="ann-dash-sidebar-header" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" fill="none" stroke="#1E3A8A" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                      <h4>Upcoming Feast Days</h4>
                    </div>
                    <button onClick={() => handleNewClick('Feast')} title="Add Feast Day" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #C7D2FE', backgroundColor: '#EEF2FF', color: '#1E3A8A', fontSize: '18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}>+</button>
                  </div>
                  {sidebarFeasts.length === 0 ? (
                    <p className="ann-dash-sidebar-empty">No upcoming feast days</p>
                  ) : (
                    <>
                      <ul className="ann-dash-sidebar-list">
                        {sidebarFeasts.slice(0, 3).map((f) => (
                          <li key={f.id} className="ann-dash-sidebar-item" onClick={() => handleDashboardReadMore(f)}>
                            <div className="ann-dash-sidebar-item-icon">
                              <svg width="16" height="16" fill="none" stroke="#3B5EC2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="ann-dash-sidebar-item-title">{f.title}</span>
                            </div>
                            <span className="ann-dash-sidebar-item-date" style={{ paddingLeft: '24px' }}>{formatDate(f.announcementDate)}</span>
                          </li>
                        ))}
                      </ul>
                      {sidebarFeasts.length > 3 && (
                        <button onClick={() => handleViewAllSearch({ status: 'Published', category: 'Feast', announcementDateFrom: new Date().toISOString().split('T')[0], sortOrder: 'asc' })} style={{ display: 'block', width: '100%', marginTop: '12px', padding: '8px', fontSize: '13px', fontWeight: 600, color: '#1E3A8A', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '6px', cursor: 'pointer', textAlign: 'center' }}>
                          View All ({sidebarFeasts.length})
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Upcoming Sacraments */}
                <div className="ann-dash-sidebar-section">
                  <div className="ann-dash-sidebar-header" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" fill="none" stroke="#1E3A8A" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      <h4>Upcoming Sacraments</h4>
                    </div>
                    <button onClick={() => handleNewClick('Sacrament')} title="Add Sacrament" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #C7D2FE', backgroundColor: '#EEF2FF', color: '#1E3A8A', fontSize: '18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}>+</button>
                  </div>
                  {sidebarSacraments.length === 0 ? (
                    <p className="ann-dash-sidebar-empty">No upcoming sacraments</p>
                  ) : (
                    <>
                      <ul className="ann-dash-sidebar-list">
                        {sidebarSacraments.slice(0, 3).map((s) => (
                          <li key={s.id} className="ann-dash-sidebar-item" onClick={() => handleDashboardReadMore(s)}>
                            <div className="ann-dash-sidebar-item-icon">
                              <svg width="16" height="16" fill="none" stroke="#3B5EC2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                              <span className="ann-dash-sidebar-item-title">{s.title}</span>
                            </div>
                            <span className="ann-dash-sidebar-item-date" style={{ paddingLeft: '24px' }}>{formatDate(s.announcementDate)}</span>
                          </li>
                        ))}
                      </ul>
                      {sidebarSacraments.length > 3 && (
                        <button onClick={() => handleViewAllSearch({ status: 'Published', category: 'Sacrament', announcementDateFrom: new Date().toISOString().split('T')[0], sortOrder: 'asc' })} style={{ display: 'block', width: '100%', marginTop: '12px', padding: '8px', fontSize: '13px', fontWeight: 600, color: '#1E3A8A', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '6px', cursor: 'pointer', textAlign: 'center' }}>
                          View All ({sidebarSacraments.length})
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_4px_20px_rgba(30,58,138,0.18)]">

        {/* Header */}
        <div className="ann-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', borderRadius: '12px 12px 0 0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
            {view === 'form'
              ? (editingId ? 'Edit Announcement' : 'Weekly Announcement')
              : view === 'detail'
              ? 'Announcement Details'
              : 'Search Announcements'}
          </h2>
          <div className="ann-header-btns" style={{ display: 'flex', gap: '10px' }}>
            <button className="form-btn announcement-view-btn" onClick={handleBackToDashboard}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
              Dashboard
            </button>
            {view === 'search' ? (
              <ActionButton onClick={() => handleNewClick()}><span style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1' }}>+</span> New Announcement</ActionButton>
            ) : view === 'detail' ? (
              <SearchButton onClick={handleBackToSearch}>{cameFromSearch ? 'Back to Search' : 'Back'}</SearchButton>
            ) : (
              <>
                <SearchButton onClick={handleSearchClick}>Search</SearchButton>
                <ActionButton onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}
                </ActionButton>
              </>
            )}
          </div>
        </div>

        {/* Detail View */}
        {view === 'detail' && detailRecord ? (
          <div className="ann-detail-area" style={{ display: 'flex', justifyContent: 'center' }}>
            <div id="detail-print-area" style={{ width: '700px', minHeight: '990px', margin: '0 auto', backgroundImage: 'url(/images/f1.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', padding: '155px 60px 50px', fontFamily: "'Times New Roman', Times, serif", position: 'relative', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', margin: '0 0 4px', letterSpacing: '1px', fontFamily: "'Times New Roman', Times, serif" }}>WEEKLY ANNOUNCEMENT</h2>
                <p style={{ fontSize: '12px', color: '#000', margin: '0 0 6px' }}>Parish Office Record</p>
                <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '4px 0 0' }} />
              </div>

              <table style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Times New Roman', Times, serif" }}>
                <tbody>
                  {[
                    { no: 1, label: 'Title', value: detailRecord.title },
                    { no: 2, label: 'Category', value: detailRecord.category },
                    { no: 3, label: 'Liturgical Season', value: detailRecord.liturgicalSeason },
                    { no: 4, label: 'Announcement Date', value: formatDate(detailRecord.announcementDate) },
                    { no: 5, label: 'Description', value: detailRecord.description },
                    { no: 6, label: 'Recurring', value: detailRecord.isRecurring },
                    { no: 7, label: 'Status', value: detailRecord.status },
                  ].map((item) => (
                    <tr key={item.no} style={{ verticalAlign: 'top' }}>
                      <td style={{ padding: '3px 6px 3px 0', color: '#000', textAlign: 'right', whiteSpace: 'nowrap' }}>{item.no}.</td>
                      <td style={{ padding: '3px 6px', color: '#000', whiteSpace: 'nowrap' }}>{item.label}</td>
                      <td style={{ padding: '3px 8px', color: '#000' }}>:</td>
                      <td style={{ padding: '3px 6px', color: '#000', fontWeight: 700, textTransform: 'uppercase' }}>{item.value || 'NIL'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signing Authority - no-print */}
              <div className="no-print" style={{ marginTop: '30px' }}>
                <div className="ann-cert-auth-wrap" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <div className="ann-cert-auth-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Signing Authority</label>
                    <select value={signingAuthority} onChange={e => setSigningAuthority(e.target.value)} style={{ padding: '10px 14px', fontSize: '15px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: '#111' }}>
                      <option value="">-- Select Authority --</option>
                      <option value="christopher">Fr. Christopher Jayakumar</option>
                      <option value="joel">Joel Savio Fernandes</option>
                    </select>
                  </div>
                </div>

                {signingAuthority && (
                  <div className="ann-cert-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: "'Times New Roman', Times, serif", marginTop: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#000' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>Date :</p>
                      <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>{getTodayFormatted().dayName},</p>
                      <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>{getTodayFormatted().dateStr}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {signingAuthority === 'christopher' && (
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#000' }}>Parish Priest</p>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#000' }}>(FR. CHRISTOPHER</p>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#000' }}>DEVASAHAYAM JEYAKUMAR)</p>
                        </div>
                      )}
                      {signingAuthority === 'joel' && (
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#000' }}>Asst. Parish Priest</p>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#000' }}>(FR. JOEL SAVIO FERNANDES)</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {signingAuthority && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <button onClick={handlePrint} style={{ backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 40px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      Print Announcement
                    </button>
                  </div>
                )}
              </div>

              {/* Print-only footer */}
              <div className="print-only" style={{ display: 'none', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: "'Times New Roman', Times, serif", color: '#000' }}>
                  <div style={{ fontSize: '13px', color: '#000' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>Date :</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>{getTodayFormatted().dayName},</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>{getTodayFormatted().dateStr}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    {signingAuthority === 'christopher' && (
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#000' }}>Parish Priest</p>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#000' }}>(FR. CHRISTOPHER</p>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#000' }}>DEVASAHAYAM JEYAKUMAR)</p>
                      </div>
                    )}
                    {signingAuthority === 'joel' && (
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#000' }}>Asst. Parish Priest</p>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#000' }}>(FR. JOEL SAVIO FERNANDES)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'form' ? (
          <form onSubmit={handleSubmit} noValidate>

            {/* Announcement Info */}
            <div className="ann-form-section pt-5 px-7 pb-2 border-b border-gray-200">
              <div className="announcement-grid">
                {field('title', 'Title')}
                {field('announcementDate', 'Announcement Date', 'date')}
                {selectField('category', 'Category', categoryOptions)}
                {selectField('liturgicalSeason', 'Liturgical Season', seasonOptions, false)}
                {selectField('status', 'Status', statusOptions, false)}
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
                    Recurring
                  </label>
                  <div className="flex gap-4 flex-wrap py-2.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={formData.isRecurring === 'Yes'} onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked ? 'Yes' : 'No' })} style={{ width: '18px', height: '18px', accentColor: '#3B5EC2' }} />
                      Recurring Announcement
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="ann-form-section pt-5 px-7 pb-5 border-b border-gray-200">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
                Description <span className="text-red-500 text-lg font-bold leading-none">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Announcement details..."
                rows={4}
                className={`w-full py-2.5 px-3.5 text-[15px] rounded-lg outline-none transition-colors duration-200 resize-y font-[inherit] focus:border-[#1E3A8A] ${
                  errors.description
                    ? 'border-2 border-red-500 bg-red-50 text-red-800'
                    : 'border border-gray-300 bg-white text-gray-900'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>
              )}
            </div>

            {/* Bottom Submit */}
            <div className="ann-bottom-btns flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              {editingId && (
                <ActionButton variant="secondary" onClick={handleCancel}>Cancel</ActionButton>
              )}
              <ActionButton type="submit" disabled={loading}>
                {loading ? 'Submitting...' : (editingId ? 'Update Announcement' : 'Submit Announcement')}
              </ActionButton>
            </div>
          </form>
        ) : (
          /* Search View */
          <div className="ann-search-section" style={{ padding: '24px 28px' }}>
            <div className="announcement-grid" key={resetKey} style={{ marginBottom: '20px' }}>
              {searchField('title', 'Title')}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Category</label>
                <select name="category" value={searchData.category} onChange={handleSearchChange} style={{ ...selectStyle, width: '100%' }}>
                  <option value="">-- All --</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Liturgical Season</label>
                <select name="liturgicalSeason" value={searchData.liturgicalSeason} onChange={handleSearchChange} style={{ ...selectStyle, width: '100%' }}>
                  <option value="">-- All --</option>
                  {seasonOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Status</label>
                <select name="status" value={searchData.status} onChange={handleSearchChange} style={{ ...selectStyle, width: '100%' }}>
                  <option value="">-- All --</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {searchField('announcementDateFrom', 'Date From', 'date')}
              {searchField('announcementDateTo', 'Date To', 'date')}

              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>Sort by</label>
                <div className="ann-sort-row" style={{ display: 'flex', gap: '10px', minWidth: 0 }}>
                  <select name="sortBy" value={searchData.sortBy} onChange={handleSearchChange} style={{ ...selectStyle, flex: 1, minWidth: 0 }}>
                    <option value="announcementDate">Date</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                    <option value="liturgicalSeason">Season</option>
                    <option value="status">Status</option>
                  </select>
                  <select name="sortOrder" value={searchData.sortOrder} onChange={handleSearchChange} style={{ ...selectStyle, flex: 1, minWidth: 0 }}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>Max Records</label>
                <select name="maxRecords" value={searchData.maxRecords} onChange={handleSearchChange} style={{ ...selectStyle, width: '100%' }}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="ann-search-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 0', borderTop: '1px solid #e5e7eb' }}>
              <ActionButton variant="secondary" onClick={handleSearchReset}>Reset</ActionButton>
              <SearchButton onClick={() => handleSearch()} disabled={searchLoading}>
                {searchLoading ? 'Searching...' : 'Search Announcements'}
              </SearchButton>
            </div>

            {hasSearched && (
              <div ref={resultsRef} style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '12px' }}>{searchTitle ? `${searchTitle} (${totalCount})` : `Search Results (${totalCount})`}</h3>
                {searchLoading ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', backgroundColor: '#f9fafb', borderRadius: '8px' }}>No records found matching your search criteria.</p>
                ) : (
                  <div className="ann-table-wrap" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          {['Sr.', 'Title', 'Category', 'Season', 'Date', 'Status', 'Action'].map((h) => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((r, i) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{(currentPage - 1) * parseInt(searchData.maxRecords) + i + 1}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', fontWeight: 500 }}>{r.title || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.category || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.liturgicalSeason || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{formatDate(r.announcementDate) || '-'}</td>
                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                              <span className={`ann-badge ${r.status === 'Published' ? 'ann-badge-published' : 'ann-badge-draft'}`}>
                                {r.status || 'Draft'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleEditClick(r)} style={{ backgroundColor: '#EEF2FF', color: '#3B5EC2', border: '1px solid #C7D2FE', borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Edit</button>
                                <button onClick={() => handleViewClick(r)} style={{ backgroundColor: '#F0FDF4', color: '#16a34a', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>View</button>
                                <button onClick={() => handleToggleStatus(r)} style={{ backgroundColor: r.status === 'Published' ? '#FEF3C7' : '#DBEAFE', color: r.status === 'Published' ? '#92400E' : '#1E40AF', border: `1px solid ${r.status === 'Published' ? '#FDE68A' : '#93C5FD'}`, borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>{r.status === 'Published' ? 'Unpublish' : 'Publish'}</button>
                                <button onClick={() => setDeleteConfirmId(r.id)} style={{ backgroundColor: '#FEF2F2', color: '#dc2626', border: '1px solid #FECACA', borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {totalPages > 1 && (
                      <div className="ann-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '16px 0', marginTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                        <button onClick={() => handleSearch(currentPage - 1)} disabled={currentPage <= 1 || searchLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: currentPage <= 1 ? '#f3f4f6' : '#EEF2FF', color: currentPage <= 1 ? '#9ca3af' : '#3B5EC2', border: `1px solid ${currentPage <= 1 ? '#e5e7eb' : '#C7D2FE'}`, borderRadius: '6px', padding: '8px 20px', fontSize: '14px', fontWeight: 500, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>Previous
                        </button>
                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => handleSearch(currentPage + 1)} disabled={currentPage >= totalPages || searchLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: currentPage >= totalPages ? '#f3f4f6' : '#EEF2FF', color: currentPage >= totalPages ? '#9ca3af' : '#3B5EC2', border: `1px solid ${currentPage >= totalPages ? '#e5e7eb' : '#C7D2FE'}`, borderRadius: '6px', padding: '8px 20px', fontSize: '14px', fontWeight: 500, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}>
                          Next<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default WeeklyAnnouncement;
