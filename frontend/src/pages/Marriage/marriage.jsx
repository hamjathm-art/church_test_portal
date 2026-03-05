import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MarriageForm.css';
import authFetch from '../../utils/authFetch';
import DatePickerField from '../../components/DatePickerField';
import ActionButton from '../../components/Buttons/ActionButton';
import SearchButton from '../../components/Buttons/SearchButton';

const initialFormData = {
  marriageNo: '',
  marriageDate: '',
  marriagePlace: 'St. Francis Of Assisi Church, Bandra',
  groomName: '',
  groomSurname: '',
  groomFatherName: '',
  groomMotherName: '',
  groomDateOfBirth: '',
  groomAge: '',
  groomChurchOfBaptism: '',
  groomNationality: 'Indian',
  groomAddress: '',
  groomProfession: '',
  groomMaritalStatus: 'Bachelor',
  groomIfWidowerWhose: '',
  brideName: '',
  brideSurname: '',
  brideFatherName: '',
  brideMotherName: '',
  brideDateOfBirth: '',
  brideAge: '',
  brideChurchOfBaptism: '',
  brideNationality: 'Indian',
  brideAddress: '',
  brideProfession: '',
  brideMaritalStatus: 'Spinster',
  brideIfWidowWhose: '',
  dateOfFirstBanns: '',
  dateOfSecondBanns: '',
  dispensation: '',
  firstWitnessName: '',
  firstWitnessSurname: '',
  firstWitnessAddress: '',
  secondWitnessName: '',
  secondWitnessSurname: '',
  secondWitnessAddress: '',
  minister: '',
  remarks: '',
};

const initialSearchData = {
  marriageNo: '',
  marriageDateFrom: '',
  marriageDateTo: '',
  groomName: '',
  groomSurname: '',
  groomDateOfBirthFrom: '',
  groomDateOfBirthTo: '',
  brideName: '',
  brideSurname: '',
  brideDateOfBirthFrom: '',
  brideDateOfBirthTo: '',
  sortBy: 'marriageNo',
  sortOrder: 'asc',
  maxRecords: '5',
};

function MarriageForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('form');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search state
  const [searchData, setSearchData] = useState(initialSearchData);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [cameFromSearch, setCameFromSearch] = useState(false);
  const [certificateRecord, setCertificateRecord] = useState(null);
  const [signingAuthority, setSigningAuthority] = useState('');
  const resultsRef = useRef(null);
  const toastTimer = useRef(null);
  const nextNumberRef = useRef(null);

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
          const res = await authFetch('/api/marriage/next-number');
          const result = await res.json();
          if (result.success) {
            setFormData(prev => ({ ...prev, marriageNo: result.data.nextNumber }));
            nextNumberRef.current = result.data.nextNumber;
          }
        } catch (e) { console.error(e); }
      };
      fetchNext();
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'groomAge' || name === 'brideAge') {
      const ageOnly = value.replace(/[^0-9]/g, '').slice(0, 3);
      setFormData({ ...formData, [name]: ageOnly });
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
      marriageDate: 'Date of Marriage is required',
      marriagePlace: 'Place of Marriage is required',
      groomName: "Bridegroom's Name is required",
      groomSurname: "Bridegroom's Surname is required",
      groomFatherName: "Bridegroom's Father's Name is required",
      groomMotherName: "Bridegroom's Mother's Name is required",
      groomChurchOfBaptism: "Bridegroom's Church of Baptism is required",
      groomNationality: "Bridegroom's Nationality is required",
      groomAddress: "Bridegroom's Address is required",
      groomProfession: "Bridegroom's Profession is required",
      brideName: "Bride's Name is required",
      brideSurname: "Bride's Surname is required",
      brideFatherName: "Bride's Father's Name is required",
      brideMotherName: "Bride's Mother's Name is required",
      brideChurchOfBaptism: "Bride's Church of Baptism is required",
      brideNationality: "Bride's Nationality is required",
      brideAddress: "Bride's Address is required",
      firstWitnessName: "First Witness' Name is required",
      firstWitnessSurname: "First Witness' Surname is required",
      firstWitnessAddress: "First Witness' Address is required",
      minister: 'Minister is required',
    };
    Object.entries(required).forEach(([key, msg]) => {
      if (!formData[key] || !formData[key].trim()) {
        newErrors[key] = msg;
      }
    });
    return newErrors;
  };

  const handleSearch = async (page = 1) => {
    const hasSearchCriteria = searchData.marriageNo || searchData.groomName || searchData.groomSurname ||
      searchData.brideName || searchData.brideSurname ||
      searchData.marriageDateFrom || searchData.marriageDateTo ||
      searchData.groomDateOfBirthFrom || searchData.groomDateOfBirthTo ||
      searchData.brideDateOfBirthFrom || searchData.brideDateOfBirthTo;

    if (!hasSearchCriteria) {
      showToast('Please enter at least one search field.', 'error');
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchData.marriageNo) params.append('marriageNo', searchData.marriageNo);
      if (searchData.groomName) params.append('groomName', searchData.groomName);
      if (searchData.groomSurname) params.append('groomSurname', searchData.groomSurname);
      if (searchData.brideName) params.append('brideName', searchData.brideName);
      if (searchData.brideSurname) params.append('brideSurname', searchData.brideSurname);
      if (searchData.marriageDateFrom) params.append('marriageDateFrom', searchData.marriageDateFrom);
      if (searchData.marriageDateTo) params.append('marriageDateTo', searchData.marriageDateTo);
      if (searchData.groomDateOfBirthFrom) params.append('groomDateOfBirthFrom', searchData.groomDateOfBirthFrom);
      if (searchData.groomDateOfBirthTo) params.append('groomDateOfBirthTo', searchData.groomDateOfBirthTo);
      if (searchData.brideDateOfBirthFrom) params.append('brideDateOfBirthFrom', searchData.brideDateOfBirthFrom);
      if (searchData.brideDateOfBirthTo) params.append('brideDateOfBirthTo', searchData.brideDateOfBirthTo);
      params.append('sortBy', searchData.sortBy);
      params.append('sortOrder', searchData.sortOrder);
      params.append('maxRecords', searchData.maxRecords);
      params.append('page', page);

      const response = await authFetch(`/api/marriage/search?${params.toString()}`);
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
    setCertificateRecord(record);
    setSigningAuthority('');
    setView('certificate');
  };

  const handleBackToSearch = () => {
    setCertificateRecord(null);
    setSigningAuthority('');
    setView('search');
    if (hasSearched) {
      setTimeout(() => handleSearch(currentPage), 50);
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById('marriage-certificate-print-area');
    if (!printArea) return;
    const printContent = printArea.cloneNode(true);
    printContent.querySelectorAll('.no-print').forEach(el => el.remove());
    printContent.querySelectorAll('.print-only').forEach(el => {
      el.style.display = 'block';
    });
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Marriage Certificate</title>');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return day + ' ' + month + ', ' + year;
  };

  const handleNewClick = () => {
    setFormData({ ...initialFormData, marriageNo: nextNumberRef.current || '' });
    setEditingId(null);
    setErrors({});
    setCameFromSearch(false);
    setView('form');
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
      const url = editingId
        ? `/api/marriage/${editingId}`
        : '/api/marriage';
      const method = editingId ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        showToast(editingId ? 'Marriage certificate updated successfully.' : 'Marriage certificate added successfully.', 'success');
        if (cameFromSearch) {
          setFormData(initialFormData);
          setEditingId(null);
          setErrors({});
          setCameFromSearch(false);
          setView('search');
          setTimeout(() => handleSearch(currentPage), 50);
          if (!editingId) {
            try {
              const nextRes = await authFetch('/api/marriage/next-number');
              const nextResult = await nextRes.json();
              if (nextResult.success) {
                nextNumberRef.current = nextResult.data.nextNumber;
                setFormData(prev => ({ ...prev, marriageNo: nextResult.data.nextNumber }));
              }
            } catch (e) { /* ignore */ }
          }
        } else {
          setFormData(initialFormData);
          setEditingId(null);
          setErrors({});
          if (!editingId) {
            try {
              const nextRes = await authFetch('/api/marriage/next-number');
              const nextResult = await nextRes.json();
              if (nextResult.success) {
                nextNumberRef.current = nextResult.data.nextNumber;
                setFormData(prev => ({ ...prev, marriageNo: nextResult.data.nextNumber }));
              }
            } catch (e) { /* ignore */ }
          }
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

  const field = (name, label, type = 'text', required = true) => (
    <div key={name}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
        {label} {required && <span style={{ color: '#ef4444', fontSize: '18px', fontWeight: 700, lineHeight: '1' }}>*</span>}
      </label>
      {type === 'date' || type === 'datetime-local' ? (
        <DatePickerField
          name={name}
          value={formData[name]}
          onChange={(n, v) => { setFormData(prev => ({ ...prev, [n]: v })); setErrors(prev => ({ ...prev, [n]: '' })); }}
          showTime={type === 'datetime-local'}
          hasError={!!errors[name]}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={type === 'date' ? '' : label}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '15px',
            fontStyle: 'normal',
            border: errors[name] ? '2px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: errors[name] ? '#fef2f2' : '#fff',
            color: errors[name] ? '#b91c1c' : '#111',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            if (!errors[name]) e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            if (!errors[name]) e.target.style.borderColor = '#d1d5db';
          }}
        />
      )}
      {errors[name] && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors[name]}</p>
      )}
    </div>
  );

  const selectField = (name, label, options, required = true) => (
    <div key={name}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
        {label} {required && <span style={{ color: '#ef4444', fontSize: '18px', fontWeight: 700, lineHeight: '1' }}>*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '15px',
          fontStyle: 'normal',
          border: errors[name] ? '2px solid #ef4444' : '1px solid #d1d5db',
          borderRadius: '8px',
          outline: 'none',
          backgroundColor: errors[name] ? '#fef2f2' : '#fff',
          color: errors[name] ? '#b91c1c' : '#111',
          transition: 'border-color 0.2s',
        }}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {errors[name] && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors[name]}</p>
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
      {type === 'date' || type === 'datetime-local' ? (
        <DatePickerField
          name={name}
          value={searchData[name]}
          onChange={(n, v) => setSearchData(prev => ({ ...prev, [n]: v }))}
          showTime={type === 'datetime-local'}
          hasError={false}
        />
      ) : (
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
      )}
    </div>
  );

  return (
    <div style={{ width: '100%', padding: '24px 16px', minWidth: 0 }}>

      {/* Toast Notification */}
      {toast && (
        <div className="marriage-toast" style={{
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
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
            {toast.message}
          </span>
          <button onClick={() => setToast(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto',
            color: 'rgba(255,255,255,0.7)', fontSize: '20px', lineHeight: 1, padding: '0 0 0 8px'
          }}>&times;</button>
        </div>
      )}

      {/* Single Card */}
      <div className="marriage-card">

        {/* Card Header */}
        <div className="marriage-card-header">
          <h2 className="no-print" style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
            {view === 'form'
              ? (editingId ? 'Edit Marriage Certificate' : 'Marriage Certificate Form')
              : view === 'certificate'
              ? 'Marriage Certificate'
              : 'Search Marriage Records'}
          </h2>
          <div className="no-print marriage-header-btns" style={{ display: 'flex', gap: '10px' }}>
            {view === 'search' ? (
              <ActionButton onClick={handleNewClick}><span style={{ fontSize: '20px', fontWeight: 700, lineHeight: '1' }}>+</span> New Certificate</ActionButton>
            ) : view === 'certificate' ? (
              <SearchButton onClick={handleBackToSearch}>Back to Search</SearchButton>
            ) : (
              <>
                <SearchButton onClick={handleSearchClick}>Search</SearchButton>
                <ActionButton onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}</ActionButton>
              </>
            )}
          </div>
        </div>

        {view === 'certificate' && certificateRecord ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="marriage-cert-area" id="marriage-certificate-print-area" style={{ width: '700px', maxWidth: '100%', minHeight: '990px', margin: '0 auto', backgroundImage: 'url(/images/f1.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', padding: '155px 60px 50px', fontFamily: "'Times New Roman', Times, serif", position: 'relative', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
              {/* Certificate Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', margin: '0 0 4px', letterSpacing: '1px', fontFamily: "'Times New Roman', Times, serif" }}>
                  MARRIAGE CERTIFICATE
                </h2>
                <p style={{ fontSize: '12px', color: '#000', margin: '0 0 6px' }}>
                  An Authentic Extract From The Original Marriage Registers From The Parish Office.
                </p>
                <p style={{ fontSize: '13px', color: '#000', margin: '0 0 4px' }}>
                  Reg. No. &nbsp;<span style={{ fontWeight: 700 }}>{certificateRecord.marriageNo}</span> &nbsp;/ Year : &nbsp;<span style={{ fontWeight: 700 }}>{certificateRecord.marriageDate ? new Date(certificateRecord.marriageDate).getFullYear() : ''}</span>
                </p>
                <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '4px 0 0' }} />
              </div>

              {/* Certificate Fields */}
              <table className="marriage-cert-table" style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Times New Roman', Times, serif", width: '100%' }}>
                <tbody>
                  {[
                    { no: 1, label: 'Date of Marriage', value: formatDate(certificateRecord.marriageDate) },
                    { no: 2, label: 'Place of Marriage', value: certificateRecord.marriagePlace },
                    { no: 3, label: "The Bridegroom's Name", value: certificateRecord.groomName },
                    { no: 4, label: 'His Surname', value: certificateRecord.groomSurname },
                    { no: 5, label: "His Father's Name", value: certificateRecord.groomFatherName },
                    { no: 6, label: "His Mother's Name", value: certificateRecord.groomMotherName },
                    { no: 7, label: 'His Date of Birth / Age', value: certificateRecord.groomAge ? formatDate(certificateRecord.groomDateOfBirth) + ' / ' + certificateRecord.groomAge : formatDate(certificateRecord.groomDateOfBirth) },
                    { no: 8, label: 'His Church of Baptism', value: certificateRecord.groomChurchOfBaptism },
                    { no: 9, label: 'His Nationality', value: certificateRecord.groomNationality },
                    { no: 10, label: 'His Domicile (Address)', value: certificateRecord.groomAddress },
                    { no: 11, label: 'His Profession', value: certificateRecord.groomProfession },
                    { no: 12, label: 'Whether Bachelor or Widower', value: certificateRecord.groomMaritalStatus },
                    { no: 13, label: 'If Widower, Whose', value: certificateRecord.groomIfWidowerWhose },
                    { no: 14, label: "The Bride's Name", value: certificateRecord.brideName },
                    { no: 15, label: 'Her Surname', value: certificateRecord.brideSurname },
                    { no: 16, label: "Her Father's Name", value: certificateRecord.brideFatherName },
                    { no: 17, label: "Her Mother's Name", value: certificateRecord.brideMotherName },
                    { no: 18, label: 'Her Date of Birth / Age', value: certificateRecord.brideAge ? formatDate(certificateRecord.brideDateOfBirth) + ' / ' + certificateRecord.brideAge : formatDate(certificateRecord.brideDateOfBirth) },
                    { no: 19, label: 'Church of her Baptism', value: certificateRecord.brideChurchOfBaptism },
                    { no: 20, label: 'Her Nationality', value: certificateRecord.brideNationality },
                    { no: 21, label: 'Her Domicile (Address)', value: certificateRecord.brideAddress },
                    { no: 22, label: 'Her Profession', value: certificateRecord.brideProfession },
                    { no: 23, label: 'Whether Spinster or Widow', value: certificateRecord.brideMaritalStatus },
                    { no: 24, label: 'If Widow, Whose', value: certificateRecord.brideIfWidowWhose },
                    { no: 25, label: 'Date of First Banns', value: formatDate(certificateRecord.dateOfFirstBanns) },
                    { no: 26, label: 'Date of Second Banns', value: formatDate(certificateRecord.dateOfSecondBanns) },
                    { no: 27, label: 'Dispensation from Impediments', value: certificateRecord.dispensation },
                    { no: 28, label: "First Witness' Name", value: certificateRecord.firstWitnessName },
                    { no: 29, label: "First Witness' Surname", value: certificateRecord.firstWitnessSurname },
                    { no: 30, label: "First Witness' Address", value: certificateRecord.firstWitnessAddress },
                    { no: 31, label: "Second Witness' Name", value: certificateRecord.secondWitnessName },
                    { no: 32, label: "Second Witness' Surname", value: certificateRecord.secondWitnessSurname },
                    { no: 33, label: "Second Witness' Address", value: certificateRecord.secondWitnessAddress },
                    { no: 34, label: 'Minister', value: certificateRecord.minister },
                    { no: 35, label: 'Remarks', value: certificateRecord.remarks },
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

              {/* Bottom: Date left + Signing Authority right */}
              <div className="no-print" style={{ marginTop: '30px' }}>
                {/* Dropdown */}
                <div className="marriage-cert-auth-wrap" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <div className="marriage-cert-auth-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Signing Authority</label>
                    <select
                      value={signingAuthority}
                      onChange={(e) => setSigningAuthority(e.target.value)}
                      style={{
                        padding: '10px 14px', fontSize: '15px', border: '1px solid #d1d5db',
                        borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: '#111',
                      }}
                    >
                      <option value="">-- Select Authority --</option>
                      <option value="christopher">Fr. Christopher Jayakumar</option>
                      <option value="joel">Joel Savio Fernandes</option>
                    </select>
                  </div>
                </div>

                {/* Date left + Authority preview right */}
                {signingAuthority && (
                  <div className="marriage-cert-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: "'Times New Roman', Times, serif", marginTop: '16px' }}>
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

                {/* Print Button */}
                {signingAuthority && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <button
                      onClick={handlePrint}
                      style={{
                        backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px',
                        padding: '10px 40px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Certificate
                    </button>
                  </div>
                )}
              </div>

              {/* Print-only footer: date left + authority right */}
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
            <div className="marriage-grid">
              <div key="marriageNo">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                  Marriage No <span style={{ color: '#ef4444', fontSize: '18px', fontWeight: 700, lineHeight: '1' }}>*</span>
                </label>
                <input
                  type="text"
                  name="marriageNo"
                  value={formData.marriageNo}
                  onChange={handleChange}
                  placeholder="Marriage No"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '15px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    border: errors.marriageNo ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: '#f3f4f6',
                    color: errors.marriageNo ? '#b91c1c' : '#111',
                    transition: 'border-color 0.2s',
                    cursor: 'not-allowed',
                  }}
                />
                {errors.marriageNo && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.marriageNo}</p>
                )}
              </div>
              {field('marriageDate', 'Date of Marriage', 'date')}
              {field('marriagePlace', 'Place of Marriage')}
              {field('groomName', "The Bridegroom's Name")}
              {field('groomSurname', 'His Surname')}
              {field('groomFatherName', "His Father's Name")}
              {field('groomMotherName', "His Mother's Name")}
              {field('groomDateOfBirth', 'His Date of Birth', 'date', false)}
              {field('groomAge', 'OR Age', 'text', false)}
              {field('groomChurchOfBaptism', 'His Church of Baptism')}
              {field('groomNationality', 'His Nationality')}
              {field('groomAddress', 'His Domicile (Address)')}
              {field('groomProfession', 'His Profession')}
              {selectField('groomMaritalStatus', 'Whether Bachelor or Widower', ['Bachelor', 'Widower'])}
              {field('groomIfWidowerWhose', 'If Widower, Whose', 'text', false)}
              {field('brideName', "The Bride's Name")}
              {field('brideSurname', 'Her Surname')}
              {field('brideFatherName', "Her Father's Name")}
              {field('brideMotherName', "Her Mother's Name")}
              {field('brideDateOfBirth', 'Her Date of Birth', 'date', false)}
              {field('brideAge', 'OR Age', 'text', false)}
              {field('brideChurchOfBaptism', 'Church of her Baptism')}
              {field('brideNationality', 'Her Nationality')}
              {field('brideAddress', 'Her Domicile (Address)')}
              {field('brideProfession', 'Her Profession')}
              {selectField('brideMaritalStatus', 'Whether Spinster or Widow', ['Spinster', 'Widow'])}
              {field('brideIfWidowWhose', 'If Widow, Whose', 'text', false)}
              {field('dateOfFirstBanns', 'Date of First Banns', 'date', false)}
              {field('dateOfSecondBanns', 'Date of Second Banns', 'date', false)}
              {field('dispensation', 'Dispensation from Impediments', 'text', false)}
              {field('firstWitnessName', "First Witness' Name")}
              {field('firstWitnessSurname', 'His/Her Surname')}
              {field('firstWitnessAddress', 'His/Her Domicile (Address)')}
              {field('secondWitnessName', "Second Witness' Name", 'text', false)}
              {field('secondWitnessSurname', 'His/Her Surname', 'text', false)}
              {field('secondWitnessAddress', 'His/Her Domicile (Address)', 'text', false)}
              {field('minister', 'Minister')}
              {field('remarks', 'Remarks', 'text', false)}
            </div>

            {/* Bottom Submit */}
            <div className="marriage-bottom-btns" style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 24px', borderTop: '1px solid #e5e7eb'
            }}>
              {cameFromSearch && (
                <ActionButton variant="secondary" onClick={handleCancel}>Cancel</ActionButton>
              )}
              <ActionButton type="submit" disabled={loading}>{loading ? 'Submitting...' : (editingId ? 'Update Certificate' : 'Submit Certificate')}</ActionButton>
            </div>
          </form>
        ) : (
          <div className="marriage-search-section" style={{ padding: '24px 28px' }}>

            {/* Search Form */}
            <div className="marriage-grid" key={resetKey} style={{ marginBottom: '20px' }}>
              {searchField('marriageNo', 'Marriage No')}
              {searchField('marriageDateFrom', 'Date of Marriage (From)', 'date')}
              {searchField('marriageDateTo', 'Date of Marriage (To)', 'date')}
              {searchField('groomName', "Bridegroom's Name")}
              {searchField('groomSurname', 'His Surname')}
              {searchField('groomDateOfBirthFrom', 'His Date of Birth (From)', 'date')}
              {searchField('groomDateOfBirthTo', 'His Date of Birth (To)', 'date')}
              {searchField('brideName', "Bride's Name")}
              {searchField('brideSurname', 'Her Surname')}
              {searchField('brideDateOfBirthFrom', 'Her Date of Birth (From)', 'date')}
              {searchField('brideDateOfBirthTo', 'Her Date of Birth (To)', 'date')}

              {/* Sort By */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Sort by
                </label>
                <div className="marriage-sort-row" style={{ display: 'flex', gap: '10px' }}>
                  <select
                    name="sortBy"
                    value={searchData.sortBy}
                    onChange={handleSearchChange}
                    style={{ ...selectStyle, flex: 1, minWidth: 0 }}
                  >
                    <option value="marriageNo">Marriage No</option>
                    <option value="groomName">Groom Name</option>
                    <option value="groomSurname">Groom Surname</option>
                    <option value="brideName">Bride Name</option>
                    <option value="brideSurname">Bride Surname</option>
                    <option value="marriageDate">Date of Marriage</option>
                  </select>
                  <select
                    name="sortOrder"
                    value={searchData.sortOrder}
                    onChange={handleSearchChange}
                    style={{ ...selectStyle, flex: 1, minWidth: 0 }}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              {/* Max Records */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Max Records
                </label>
                <select
                  name="maxRecords"
                  value={searchData.maxRecords}
                  onChange={handleSearchChange}
                  style={{ ...selectStyle, width: '100%' }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            {/* Search Buttons */}
            <div className="marriage-search-btns" style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 0', borderTop: '1px solid #e5e7eb'
            }}>
              <ActionButton variant="secondary" onClick={handleSearchReset}>Reset</ActionButton>
              <SearchButton onClick={() => handleSearch()} disabled={searchLoading}>{searchLoading ? 'Searching...' : 'Search Marriage'}</SearchButton>
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div ref={resultsRef} style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '12px' }}>
                  Search Results ({totalCount})
                </h3>
                {searchLoading ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', backgroundColor: '#f9fafb', borderRadius: '8px' }}>No records found matching your search criteria.</p>
                ) : (
                  <div className="marriage-table-wrap" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Sr.</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Marriage No</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Date</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Groom Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Groom Surname</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Bride Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Bride Surname</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Minister</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((m, i) => (
                          <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{(currentPage - 1) * parseInt(searchData.maxRecords) + i + 1}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>{m.marriageNo}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{m.marriageDate}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{m.groomName}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{m.groomSurname}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{m.brideName}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{m.brideSurname}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{m.minister}</td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleEditClick(m)}
                                  style={{
                                    backgroundColor: '#EEF2FF', color: '#3B5EC2', border: '1px solid #C7D2FE',
                                    borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500,
                                    cursor: 'pointer', whiteSpace: 'nowrap'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleViewClick(m)}
                                  style={{
                                    backgroundColor: '#F0FDF4', color: '#16a34a', border: '1px solid #BBF7D0',
                                    borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500,
                                    cursor: 'pointer', whiteSpace: 'nowrap'
                                  }}
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="marriage-pagination" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '16px', padding: '16px 0', marginTop: '12px', borderTop: '1px solid #e5e7eb'
                      }}>
                        <button
                          onClick={() => handleSearch(currentPage - 1)}
                          disabled={currentPage <= 1 || searchLoading}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            backgroundColor: currentPage <= 1 ? '#f3f4f6' : '#EEF2FF',
                            color: currentPage <= 1 ? '#9ca3af' : '#3B5EC2',
                            border: `1px solid ${currentPage <= 1 ? '#e5e7eb' : '#C7D2FE'}`,
                            borderRadius: '6px', padding: '8px 20px', fontSize: '14px', fontWeight: 500,
                            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>
                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => handleSearch(currentPage + 1)}
                          disabled={currentPage >= totalPages || searchLoading}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            backgroundColor: currentPage >= totalPages ? '#f3f4f6' : '#EEF2FF',
                            color: currentPage >= totalPages ? '#9ca3af' : '#3B5EC2',
                            border: `1px solid ${currentPage >= totalPages ? '#e5e7eb' : '#C7D2FE'}`,
                            borderRadius: '6px', padding: '8px 20px', fontSize: '14px', fontWeight: 500,
                            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Next
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
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
}

export default MarriageForm;
