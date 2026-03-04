import React, { useState, useRef, useEffect, useCallback } from 'react';
import './FamilyForm.css';
import authFetch from '../../utils/authFetch';

const initialFormData = {
  scc: '',
  familyId: '',
  registrationDate: '',
  salutation: '',
  firstName: '',
  middleName: '',
  surname: '',
  address1: '',
  address2: '',
  address3: '',
  pincode: '400050',
  res: '',
  office: '',
  mobile: '',
  fax: '',
  email: '',
  familyType: '',
  motherTongue: 'Konkani',
  otherLanguages: '',
  stateOfOrigin: 'Maharashtra',
  previousParish: '',
  sinceMonth: '',
  sinceYear: '',
  housingType: '',
  housingStatus: '',
  remarks: '',
};

const initialSearchData = {
  scc: '',
  firstName: '',
  surname: '',
  registrationDateFrom: '',
  registrationDateTo: '',
  address2: '',
  pincode: '',
  mobile: '',
  email: '',
  stateOfOrigin: '',
  sortBy: 'firstName',
  sortOrder: 'asc',
  maxRecords: '5',
};

const numericFields = ['pincode', 'res', 'office', 'mobile', 'fax'];

const sccOptions = [
  { value: 'St. Jude', label: 'St. Jude' },
  { value: 'St. Agnes', label: 'St. Agnes' },
  { value: 'Elizabeth and Zachariah', label: 'Elizabeth and Zachariah' },
  { value: 'St. Anthony', label: 'St. Anthony' },
  { value: 'St. Sebastian', label: 'St. Sebastian' },
  { value: 'Queen of May', label: 'Queen of May' },
  { value: 'St. Francis Xavier', label: 'St. Francis Xavier' },
  { value: 'St. Valentine', label: 'St. Valentine' },
  { value: 'Our Lady of Lourdes', label: 'Our Lady of Lourdes' },
  { value: 'St. Charles', label: 'St. Charles' },
];

const FamilyForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('form');
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

  useEffect(() => {
    if (!editingId) {
      const fetchNext = async () => {
        try {
          const res = await authFetch('/api/family/next-number');
          const result = await res.json();
          if (result.success) {
            setFormData(prev => ({ ...prev, familyId: result.data.nextNumber }));
          }
        } catch (e) { console.error(e); }
      };
      fetchNext();
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (numericFields.includes(name)) {
      const numericOnly = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: numericOnly });
    } else if (name === 'sinceYear') {
      const yearOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
      setFormData({ ...formData, [name]: yearOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: '' });
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    const required = {
      scc: 'SCC is required',
      registrationDate: 'Registration date is required',
      salutation: 'Salutation is required',
      firstName: 'First name is required',
      surname: 'Surname is required',
      address2: 'Address 2 is required',
      address3: 'Address 3 is required',
      pincode: 'Pincode is required',
      mobile: 'Mobile / Cell is required',
    };
    Object.entries(required).forEach(([key, msg]) => {
      if (!formData[key] || !formData[key].trim()) {
        newErrors[key] = msg;
      }
    });
    for (const f of numericFields) {
      if (formData[f] && formData[f].trim() && !/^\d+$/.test(formData[f].trim())) {
        const label = f === 'res' ? 'Residence' : f.charAt(0).toUpperCase() + f.slice(1);
        newErrors[f] = `${label} must contain only numbers`;
      }
    }
    return newErrors;
  };

  const handleSearch = async (page = 1) => {
    const hasSearchCriteria = searchData.scc || searchData.firstName || searchData.surname ||
      searchData.address2 || searchData.pincode || searchData.mobile || searchData.email ||
      searchData.stateOfOrigin || searchData.registrationDateFrom || searchData.registrationDateTo;

    if (!hasSearchCriteria) {
      showToast('Please enter at least one search field.', 'error');
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchData.scc) params.append('scc', searchData.scc);
      if (searchData.firstName) params.append('firstName', searchData.firstName);
      if (searchData.surname) params.append('surname', searchData.surname);
      if (searchData.address2) params.append('address2', searchData.address2);
      if (searchData.pincode) params.append('pincode', searchData.pincode);
      if (searchData.mobile) params.append('mobile', searchData.mobile);
      if (searchData.email) params.append('email', searchData.email);
      if (searchData.stateOfOrigin) params.append('stateOfOrigin', searchData.stateOfOrigin);
      if (searchData.registrationDateFrom) params.append('registrationDateFrom', searchData.registrationDateFrom);
      if (searchData.registrationDateTo) params.append('registrationDateTo', searchData.registrationDateTo);
      params.append('sortBy', searchData.sortBy);
      params.append('sortOrder', searchData.sortOrder);
      params.append('maxRecords', searchData.maxRecords);
      params.append('page', page);

      const response = await authFetch(`/api/family/search?${params.toString()}`);
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
    } catch (error) {
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
    setView('search');
    setSearchData({ ...initialSearchData });
    setSearchResults([]);
    setHasSearched(false);
    setResetKey(prev => prev + 1);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalCount(0);
  };

  const handleEditClick = (record) => {
    const { id, created_at, updated_at, ...fields } = record;
    setFormData(fields);
    setEditingId(id);
    setErrors({});
    setCameFromSearch(true);
    setView('form');
  };

  const handleViewClick = (record) => {
    setDetailRecord(record);
    setSigningAuthority('');
    setView('detail');
  };

  const handleBackToSearch = () => {
    setDetailRecord(null);
    setSigningAuthority('');
    setView('search');
    if (hasSearched) {
      setTimeout(() => handleSearch(currentPage), 50);
    }
  };

  const getTodayFormatted = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const suffix = date === 1 || date === 21 || date === 31 ? 'st' : date === 2 || date === 22 ? 'nd' : date === 3 || date === 23 ? 'rd' : 'th';
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return { dayName, dateStr: date + suffix + ' ' + month + ',' + year };
  };

  const handlePrint = () => {
    const printArea = document.getElementById('detail-print-area');
    if (!printArea) return;
    const printContent = printArea.cloneNode(true);
    printContent.querySelectorAll('.no-print').forEach((el) => el.remove());
    printContent.querySelectorAll('.print-only').forEach((el) => {
      el.style.display = 'block';
    });
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Family Registration</title>');
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
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleNewClick = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setErrors({});
    setCameFromSearch(false);
    setView('form');
    const fetchNextNumber = async () => {
      try {
        const res = await authFetch('/api/family/next-number');
        const result = await res.json();
        if (result.success) {
          setFormData(prev => ({ ...prev, familyId: result.data.nextNumber }));
        }
      } catch (e) { console.error(e); }
    };
    fetchNextNumber();
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setErrors({});
    setView('search');
    setCameFromSearch(false);
    if (hasSearched) {
      setTimeout(() => handleSearch(currentPage), 50);
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
      const url = editingId ? `/api/family/${editingId}` : '/api/family';
      const method = editingId ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        showToast(editingId ? 'Family registration updated successfully.' : 'Family registration submitted successfully.', 'success');
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
        }
      } else {
        showToast(result.message || 'Failed to submit', 'error');
      }
    } catch (error) {
      showToast('Server error. Make sure backend is running.', 'error');
    } finally {
      setLoading(false);
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
        style={{ fontStyle: 'normal' }}
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

  const radioGroup = (name, label, options) => (
    <div key={name}>
      <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
        {label}
      </label>
      <div className="flex gap-4 flex-wrap py-2.5">
        {options.map((opt) => (
          <label key={opt.value} className="text-sm font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={formData[name] === opt.value}
              onChange={handleChange}
            />
            {opt.label}
          </label>
        ))}
      </div>
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
        <div className="family-toast" style={{
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
              <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto',
            color: 'rgba(255,255,255,0.7)', fontSize: '20px', lineHeight: 1, padding: '0 0 0 8px'
          }}>&times;</button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_4px_20px_rgba(30,58,138,0.18)]" style={{ maxWidth: '1100px' }}>

        {/* Header */}
        <div className="family-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', borderRadius: '12px 12px 0 0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
            {view === 'form'
              ? (editingId ? 'Edit Family Registration' : 'Family Registration Form')
              : view === 'detail'
              ? 'Family Details'
              : 'Search Family Records'}
          </h2>
          <div className="family-header-btns" style={{ display: 'flex', gap: '10px' }}>
            {view === 'search' ? (
              <button className="form-btn" onClick={handleNewClick} style={{ backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}><span style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1' }}>+</span> New Registration</button>
            ) : view === 'detail' ? (
              <button className="form-btn family-view-btn" onClick={handleBackToSearch} style={{ padding: '7px 18px', fontSize: '13px' }}>Back to Search</button>
            ) : (
              <>
                <button className="form-btn family-view-btn" onClick={handleSearchClick} style={{ padding: '7px 18px', fontSize: '13px' }}>Search</button>
                <button className="form-btn" onClick={handleSubmit} disabled={loading} style={{ backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Detail View */}
        {view === 'detail' && detailRecord ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="family-detail-area" id="detail-print-area" style={{ width: '700px', maxWidth: '100%', minHeight: '990px', margin: '0 auto', backgroundImage: 'url(/images/f1.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', padding: '155px 60px 50px', fontFamily: "'Times New Roman', Times, serif", position: 'relative', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', margin: '0 0 4px', letterSpacing: '1px', fontFamily: "'Times New Roman', Times, serif" }}>FAMILY REGISTRATION</h2>
                <p style={{ fontSize: '12px', color: '#000', margin: '0 0 6px' }}>An Authentic Extract From The Parish Office Records.</p>
                <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '4px 0 0' }} />
              </div>

              <table className="family-detail-table" style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Times New Roman', Times, serif", width: '100%' }}>
                <tbody>
                  {[
                    { no: 1, label: 'SCC', value: detailRecord.scc },
                    { no: 2, label: 'Family ID', value: detailRecord.familyId },
                    { no: 3, label: 'Registration Date', value: formatDate(detailRecord.registrationDate) },
                    { no: 4, label: 'Salutation', value: detailRecord.salutation },
                    { no: 5, label: 'First Name', value: detailRecord.firstName },
                    { no: 6, label: 'Middle Name', value: detailRecord.middleName },
                    { no: 7, label: 'Surname', value: detailRecord.surname },
                    { no: 8, label: 'Address 1', value: detailRecord.address1 },
                    { no: 9, label: 'Address 2', value: detailRecord.address2 },
                    { no: 10, label: 'Address 3', value: detailRecord.address3 },
                    { no: 11, label: 'Pincode', value: detailRecord.pincode },
                    { no: 12, label: 'Residence', value: detailRecord.res },
                    { no: 13, label: 'Office', value: detailRecord.office },
                    { no: 14, label: 'Mobile / Cell', value: detailRecord.mobile },
                    { no: 15, label: 'Fax', value: detailRecord.fax },
                    { no: 16, label: 'Email', value: detailRecord.email },
                    { no: 17, label: 'Family Type', value: detailRecord.familyType },
                    { no: 18, label: 'Mother Tongue', value: detailRecord.motherTongue },
                    { no: 19, label: 'Other Languages', value: detailRecord.otherLanguages },
                    { no: 20, label: 'State of Origin', value: detailRecord.stateOfOrigin },
                    { no: 21, label: 'Previous Parish', value: detailRecord.previousParish },
                    { no: 22, label: 'Since When in Parish', value: detailRecord.sinceMonth ? `${detailRecord.sinceMonth} ${detailRecord.sinceYear}` : detailRecord.sinceYear || '' },
                    { no: 23, label: 'Housing Type', value: detailRecord.housingType },
                    { no: 24, label: 'Housing Status', value: detailRecord.housingStatus },
                    { no: 25, label: 'Remarks', value: detailRecord.remarks },
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

              <div className="no-print" style={{ marginTop: '30px' }}>
                <div className="family-cert-auth-wrap" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <div className="family-cert-auth-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Signing Authority</label>
                    <select value={signingAuthority} onChange={(e) => setSigningAuthority(e.target.value)} style={{ padding: '10px 14px', fontSize: '15px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: '#111' }}>
                      <option value="">-- Select Authority --</option>
                      <option value="christopher">Fr. Christopher Jayakumar</option>
                      <option value="joel">Joel Savio Fernandes</option>
                    </select>
                  </div>
                </div>

                {signingAuthority && (
                  <div className="family-cert-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: "'Times New Roman', Times, serif", marginTop: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#000' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>Date :</p>
                      <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>{getTodayFormatted().dayName},</p>
                      <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>{getTodayFormatted().dateStr}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {signingAuthority === 'christopher' && (<div><p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#000' }}>Parish Priest</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#000' }}>(FR. CHRISTOPHER</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#000' }}>DEVASAHAYAM JEYAKUMAR)</p></div>)}
                      {signingAuthority === 'joel' && (<div><p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#000' }}>Asst. Parish Priest</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#000' }}>(FR. JOEL SAVIO FERNANDES)</p></div>)}
                    </div>
                  </div>
                )}

                {signingAuthority && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <button onClick={handlePrint} style={{ backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 40px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      Print
                    </button>
                  </div>
                )}
              </div>

              <div className="print-only" style={{ display: 'none', marginTop: '16px' }}>
                <div className="family-cert-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: "'Times New Roman', Times, serif", color: '#000' }}>
                  <div style={{ fontSize: '13px', color: '#000' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>Date :</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>{getTodayFormatted().dayName},</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#000' }}>{getTodayFormatted().dateStr}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    {signingAuthority === 'christopher' && (<div><p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#000' }}>Parish Priest</p><p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#000' }}>(FR. CHRISTOPHER</p><p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#000' }}>DEVASAHAYAM JEYAKUMAR)</p></div>)}
                    {signingAuthority === 'joel' && (<div><p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#000' }}>Asst. Parish Priest</p><p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#000' }}>(FR. JOEL SAVIO FERNANDES)</p></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'form' ? (
          <form onSubmit={handleSubmit} noValidate>

            {/* SCC & Registration */}
            <div className="family-form-section pt-5 px-7 pb-2 border-b border-gray-200">
              <div className="family-grid">
                {selectField('scc', 'SCC', sccOptions)}
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
                    Family ID
                  </label>
                  <input
                    type="text"
                    name="familyId"
                    value={formData.familyId}
                    readOnly
                    placeholder="Auto-generated"
                    className="w-full py-2.5 px-3.5 text-[15px] rounded-lg outline-none border border-gray-300 text-gray-900"
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', fontStyle: 'normal', fontWeight: 500 }}
                  />
                </div>
                {field('registrationDate', 'Registration Date', 'date')}
              </div>
            </div>

            {/* Head of the Family */}
            <div className="family-form-section pt-5 px-7 pb-2 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-700 mb-4">Head of the Family</h3>
              <div className="family-grid">
                {selectField('salutation', 'Salutation', [
                  { value: 'Mr', label: 'Mr' },
                  { value: 'Mrs', label: 'Mrs' },
                  { value: 'Ms', label: 'Ms' },
                  { value: 'Dr', label: 'Dr' },
                  { value: 'Rev', label: 'Rev' },
                ])}
                {field('firstName', 'First Name')}
                {field('middleName', 'Middle Name', 'text', false)}
                {field('surname', 'Surname')}
              </div>
            </div>

            {/* Address */}
            <div className="family-form-section pt-5 px-7 pb-2 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-700 mb-4">Address</h3>
              <div className="family-grid">
                {field('address1', 'Address 1', 'text', false)}
                {field('address2', 'Address 2')}
                {field('address3', 'Address 3')}
                {field('pincode', 'Pincode')}
              </div>
            </div>

            {/* Contact Info */}
            <div className="family-form-section pt-5 px-7 pb-2 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-700 mb-4">Contact Info</h3>
              <div className="family-grid">
                {field('res', 'Res (Residence)', 'tel', false)}
                {field('office', 'Office', 'tel', false)}
                {field('mobile', 'Mobile / Cell', 'tel', true)}
                {field('fax', 'Fax', 'tel', false)}
                {field('email', 'Email Address', 'email', false)}
              </div>
            </div>

            {/* Other Details */}
            <div className="family-form-section pt-5 px-7 pb-2 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-700 mb-4">Other Details</h3>
              <div className="family-grid">
                {radioGroup('familyType', 'Family Type', [
                  { value: 'Nuclear', label: 'Nuclear' },
                  { value: 'Joint', label: 'Joint' },
                ])}
                {field('motherTongue', 'Mother Tongue', 'text', false)}
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
                    Other Languages Known
                  </label>
                  <input
                    type="text"
                    name="otherLanguages"
                    value={formData.otherLanguages}
                    onChange={handleChange}
                    placeholder="Separate multiple values with comma"
                    className="w-full py-2.5 px-3.5 text-[15px] border border-gray-300 rounded-lg outline-none bg-white text-gray-900 transition-colors duration-200 focus:border-[#1E3A8A]"
                  />
                  <p className="text-gray-500 text-xs mt-1">Separate multiple values with comma</p>
                </div>
                {field('stateOfOrigin', 'State of Origin', 'text', false)}
                {field('previousParish', 'Previous Parish', 'text', false)}
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
                    Since When in Parish
                  </label>
                  <div className="family-since-row flex gap-3">
                    <select
                      name="sinceMonth"
                      value={formData.sinceMonth}
                      onChange={handleChange}
                      className="flex-1 py-2.5 px-3.5 text-[15px] border border-gray-300 rounded-lg outline-none bg-white text-gray-900 transition-colors duration-200 focus:border-[#1E3A8A]"
                    >
                      <option value="">Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="sinceYear"
                      value={formData.sinceYear}
                      onChange={handleChange}
                      placeholder="Year"
                      maxLength={4}
                      className="flex-1 py-2.5 px-3.5 text-[15px] border border-gray-300 rounded-lg outline-none bg-white text-gray-900 transition-colors duration-200 focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>
                {radioGroup('housingType', 'Housing Type', [
                  { value: 'Bungalow', label: 'Bungalow' },
                  { value: 'Flat', label: 'Flat' },
                  { value: 'Chawl', label: 'Chawl' },
                  { value: 'Hut', label: 'Hut' },
                  { value: 'Squatter', label: 'Squatter' },
                  { value: 'House', label: 'House' },
                ])}
                {radioGroup('housingStatus', 'Housing Status', [
                  { value: 'Owned', label: 'Owned' },
                  { value: 'Rental', label: 'Rental' },
                  { value: 'PayingGuest', label: 'Paying Guest' },
                  { value: 'Caretaker', label: 'Caretaker' },
                ])}
                <div className="col-span-full">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2 leading-5">
                    Remarks / Suggestions
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Remarks / Suggestions"
                    rows={3}
                    className="w-full py-2.5 px-3.5 text-[15px] border border-gray-300 rounded-lg outline-none bg-white text-gray-900 transition-colors duration-200 resize-y font-[inherit] focus:border-[#1E3A8A]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Submit */}
            <div className="family-bottom-btns flex justify-end gap-3 px-6 py-3 border-t border-gray-200">
              {editingId && (
                <button className="form-btn" type="button" onClick={handleCancel} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#3B5EC2'; e.target.style.color = '#fff'; e.target.style.borderColor = '#3B5EC2'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#374151'; e.target.style.borderColor = '#d1d5db'; }}
                >Cancel</button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="form-btn"
                style={{ backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}
              </button>
            </div>
          </form>
        ) : (
          /* Search View */
          <div className="family-search-section" style={{ padding: '24px 28px' }}>
            <div className="family-grid" key={resetKey} style={{ marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>SCC</label>
                <select name="scc" value={searchData.scc} onChange={handleSearchChange} style={{ ...selectStyle, width: '100%' }}>
                  <option value="">-- All --</option>
                  {sccOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {searchField('firstName', 'First Name')}
              {searchField('surname', 'Surname')}
              {searchField('registrationDateFrom', 'Registration Date (From)', 'date')}
              {searchField('registrationDateTo', 'Registration Date (To)', 'date')}
              {searchField('address2', 'Address 2')}
              {searchField('pincode', 'Pincode')}
              {searchField('mobile', 'Mobile')}
              {searchField('email', 'Email')}
              {searchField('stateOfOrigin', 'State of Origin')}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Sort by</label>
                <div className="family-sort-row" style={{ display: 'flex', gap: '10px' }}>
                  <select name="sortBy" value={searchData.sortBy} onChange={handleSearchChange} style={{ ...selectStyle, flex: 1, minWidth: 0 }}>
                    <option value="firstName">First Name</option>
                    <option value="surname">Surname</option>
                    <option value="registrationDate">Registration Date</option>
                    <option value="scc">SCC</option>
                  </select>
                  <select name="sortOrder" value={searchData.sortOrder} onChange={handleSearchChange} style={{ ...selectStyle, flex: 1, minWidth: 0 }}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Max Records</label>
                <select name="maxRecords" value={searchData.maxRecords} onChange={handleSearchChange} style={{ ...selectStyle, width: '100%' }}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="family-search-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 0', borderTop: '1px solid #e5e7eb' }}>
              <button className="form-btn" type="button" onClick={handleSearchReset} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#3B5EC2'; e.target.style.color = '#fff'; e.target.style.borderColor = '#3B5EC2'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#374151'; e.target.style.borderColor = '#d1d5db'; }}
              >Reset</button>
              <button className="form-btn" type="button" onClick={handleSearch} disabled={searchLoading} style={{ backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', opacity: searchLoading ? 0.7 : 1 }}>
                {searchLoading ? 'Searching...' : 'Search Family'}
              </button>
            </div>

            {hasSearched && (
              <div ref={resultsRef} style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '12px' }}>Search Results ({totalCount})</h3>
                {searchLoading ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', backgroundColor: '#f9fafb', borderRadius: '8px' }}>No records found matching your search criteria.</p>
                ) : (
                  <div className="family-table-wrap" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          {['Sr.', 'SCC', 'Family ID', 'Reg Date', 'Salutation', 'First Name', 'Middle Name', 'Surname',
                            'Address 1', 'Address 2', 'Address 3', 'Pincode', 'Res', 'Office', 'Mobile', 'Fax', 'Email',
                            'Family Type', 'Mother Tongue', 'Other Languages', 'State of Origin', 'Previous Parish',
                            'Since Month', 'Since Year', 'Housing Type', 'Housing Status', 'Remarks', 'Action'
                          ].map((h) => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((r, i) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{(currentPage - 1) * parseInt(searchData.maxRecords) + i + 1}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.scc || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.familyId || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.registrationDate || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.salutation || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.firstName || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.middleName || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.surname || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.address1 || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.address2 || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.address3 || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.pincode || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.res || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.office || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.mobile || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.fax || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.email || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.familyType || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.motherTongue || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.otherLanguages || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.stateOfOrigin || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.previousParish || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.sinceMonth || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.sinceYear || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.housingType || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.housingStatus || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#111827', whiteSpace: 'nowrap' }}>{r.remarks || '-'}</td>
                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleEditClick(r)} style={{ backgroundColor: '#EEF2FF', color: '#3B5EC2', border: '1px solid #C7D2FE', borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Edit</button>
                                <button onClick={() => handleViewClick(r)} style={{ backgroundColor: '#F0FDF4', color: '#16a34a', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>View</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {totalPages > 1 && (
                      <div className="family-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '16px 0', marginTop: '12px', borderTop: '1px solid #e5e7eb' }}>
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
    </div>
  );
};

export default FamilyForm;
