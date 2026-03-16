import React, { useState, useRef, useEffect, useCallback } from 'react';
import './BurialForm.css';
import authFetch from '../../utils/authFetch';
import DatePickerField from '../../components/DatePickerField';
import ActionButton from '../../components/Buttons/ActionButton';
import SearchButton from '../../components/Buttons/SearchButton';
import PageLoader from '../../components/PageLoader/PageLoader';

const initialFormData = {
  burialNo: '',
  dateOfBurial: '',
  fullName: '',
  surname: '',
  age: '',
  nationality: 'Indian',
  address: '',
  profession: '',
  relationship: '',
  causeOfDeath: '',
  lastSacraments: '',
  dateOfDeath: '',
  burialPlace: '',
  minister: '',
  remarks: '',
};

const initialSearchData = {
  burialNo: '',
  dateOfBurialFrom: '',
  dateOfBurialTo: '',
  dateOfDeathFrom: '',
  dateOfDeathTo: '',
  fullName: '',
  surname: '',
  ageFrom: '',
  ageTo: '',
  relationship: '',
  causeOfDeath: '',
  minister: '',
  sortBy: 'burialNo',
  sortOrder: 'asc',
  maxRecords: '5',
};

function BurialForm() {
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
          const res = await authFetch('/api/burial/next-number');
          const result = await res.json();
          if (result.success) {
            setFormData(prev => ({ ...prev, burialNo: result.data.nextNumber }));
            nextNumberRef.current = result.data.nextNumber;
          }
        } catch (e) { console.error(e); }
      };
      fetchNext();
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'age') {
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
      dateOfBurial: 'Date of Burial is required',
      fullName: 'Name is required',
      surname: 'Surname is required',
      nationality: 'Nationality is required',
      address: 'Domicile (Address) is required',
      dateOfDeath: 'Date of Death is required',
      burialPlace: 'Place of Burial is required',
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
    const hasSearchCriteria = searchData.burialNo || searchData.fullName || searchData.surname ||
      searchData.relationship || searchData.causeOfDeath || searchData.minister ||
      searchData.dateOfBurialFrom || searchData.dateOfBurialTo ||
      searchData.dateOfDeathFrom || searchData.dateOfDeathTo ||
      searchData.ageFrom || searchData.ageTo;

    if (!hasSearchCriteria) {
      showToast('Please enter at least one search field.', 'error');
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchData.burialNo) params.append('burialNo', searchData.burialNo);
      if (searchData.fullName) params.append('fullName', searchData.fullName);
      if (searchData.surname) params.append('surname', searchData.surname);
      if (searchData.relationship) params.append('relationship', searchData.relationship);
      if (searchData.causeOfDeath) params.append('causeOfDeath', searchData.causeOfDeath);
      if (searchData.minister) params.append('minister', searchData.minister);
      if (searchData.dateOfBurialFrom) params.append('dateOfBurialFrom', searchData.dateOfBurialFrom);
      if (searchData.dateOfBurialTo) params.append('dateOfBurialTo', searchData.dateOfBurialTo);
      if (searchData.dateOfDeathFrom) params.append('dateOfDeathFrom', searchData.dateOfDeathFrom);
      if (searchData.dateOfDeathTo) params.append('dateOfDeathTo', searchData.dateOfDeathTo);
      if (searchData.ageFrom) params.append('ageFrom', searchData.ageFrom);
      if (searchData.ageTo) params.append('ageTo', searchData.ageTo);
      params.append('sortBy', searchData.sortBy);
      params.append('sortOrder', searchData.sortOrder);
      params.append('maxRecords', searchData.maxRecords);
      params.append('page', page);

      const response = await authFetch(`/api/burial/search?${params.toString()}`);
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
    const printArea = document.getElementById('burial-certificate-print-area');
    if (!printArea) return;
    const printContent = printArea.cloneNode(true);
    printContent.querySelectorAll('.no-print').forEach(el => el.remove());
    printContent.querySelectorAll('.print-only').forEach(el => {
      el.style.display = 'block';
    });
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Burial Certificate</title>');
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
    setFormData({ ...initialFormData, burialNo: nextNumberRef.current || '' });
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
        ? `/api/burial/${editingId}`
        : '/api/burial';
      const method = editingId ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        showToast(editingId ? 'Burial certificate updated successfully.' : 'Burial certificate added successfully.', 'success');
        if (cameFromSearch) {
          if (!editingId) {
            try {
              const nextRes = await authFetch('/api/burial/next-number');
              const nextResult = await nextRes.json();
              if (nextResult.success) {
                nextNumberRef.current = nextResult.data.nextNumber;
                setFormData(prev => ({ ...prev, burialNo: nextResult.data.nextNumber }));
              }
            } catch (e) { /* ignore */ }
          }
          setFormData(initialFormData);
          setEditingId(null);
          setErrors({});
          setCameFromSearch(false);
          setView('search');
          setTimeout(() => handleSearch(currentPage), 50);
        } else {
          if (!editingId) {
            try {
              const nextRes = await authFetch('/api/burial/next-number');
              const nextResult = await nextRes.json();
              if (nextResult.success) {
                nextNumberRef.current = nextResult.data.nextNumber;
                setFormData(prev => ({ ...prev, burialNo: nextResult.data.nextNumber }));
              }
            } catch (e) { /* ignore */ }
          }
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
      {(loading || searchLoading) && <PageLoader />}

      {/* Toast Notification */}
      {toast && (
        <div className="burial-toast" style={{
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
      <div className="burial-card">

        {/* Card Header */}
        <div className="burial-card-header">
          <h2 className="no-print" style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
            {view === 'form'
              ? (editingId ? 'Edit Burial Certificate' : 'Burial Certificate Form')
              : view === 'certificate'
              ? 'Burial Certificate'
              : 'Search Burial Records'}
          </h2>
          <div className="no-print burial-header-btns" style={{ display: 'flex', gap: '10px' }}>
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
            <div className="burial-cert-area" id="burial-certificate-print-area" style={{ width: '700px', maxWidth: '100%', minHeight: '990px', margin: '0 auto', backgroundImage: 'url(/images/f1.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', padding: '155px 60px 50px', fontFamily: "'Times New Roman', Times, serif", position: 'relative', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
              {/* Certificate Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', margin: '0 0 4px', letterSpacing: '1px', fontFamily: "'Times New Roman', Times, serif" }}>
                  BURIAL CERTIFICATE
                </h2>
                <p style={{ fontSize: '12px', color: '#000', margin: '0 0 6px' }}>
                  An Authentic Extract From The Original Burial Registers From The Parish Office.
                </p>
                <p style={{ fontSize: '13px', color: '#000', margin: '0 0 4px' }}>
                  Reg. No. &nbsp;<span style={{ fontWeight: 700 }}>{certificateRecord.burialNo}</span> &nbsp;/ Year : &nbsp;<span style={{ fontWeight: 700 }}>{certificateRecord.dateOfBurial ? new Date(certificateRecord.dateOfBurial).getFullYear() : ''}</span>
                </p>
                <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '4px 0 0' }} />
              </div>

              {/* Certificate Fields 1-15 */}
              <table className="burial-cert-table" style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Times New Roman', Times, serif", width: '100%' }}>
                <tbody>
                  {[
                    { no: 1, label: 'Burial No', value: certificateRecord.burialNo },
                    { no: 2, label: 'Date of Burial', value: formatDate(certificateRecord.dateOfBurial) },
                    { no: 3, label: 'Name', value: certificateRecord.fullName },
                    { no: 4, label: 'Surname', value: certificateRecord.surname },
                    { no: 5, label: 'Age', value: certificateRecord.age },
                    { no: 6, label: 'Nationality', value: certificateRecord.nationality },
                    { no: 7, label: 'Domicile (Address)', value: certificateRecord.address },
                    { no: 8, label: 'Profession', value: certificateRecord.profession },
                    { no: 9, label: 'Relationship', value: certificateRecord.relationship },
                    { no: 10, label: 'Cause of Death', value: certificateRecord.causeOfDeath },
                    { no: 11, label: 'Received Last Sacraments', value: certificateRecord.lastSacraments },
                    { no: 12, label: 'Date of Death', value: formatDate(certificateRecord.dateOfDeath) },
                    { no: 13, label: 'Place of Burial', value: certificateRecord.burialPlace },
                    { no: 14, label: 'Minister', value: certificateRecord.minister },
                    { no: 15, label: 'Remarks', value: certificateRecord.remarks },
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
                <div className="burial-cert-auth-wrap" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <div className="burial-cert-auth-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
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
                      <option value="christopher">Parish Priest</option>
                      <option value="joel">Asst. Parish Priest</option>
                    </select>
                  </div>
                </div>

                {/* Date left + Authority preview right */}
                {signingAuthority && (
                  <div className="burial-cert-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: "'Times New Roman', Times, serif", marginTop: '16px' }}>
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
            <div className="burial-grid">
              <div key="burialNo">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                  Burial No <span style={{ color: '#ef4444', fontSize: '18px', fontWeight: 700, lineHeight: '1' }}>*</span>
                </label>
                <input
                  type="text"
                  name="burialNo"
                  value={formData.burialNo}
                  onChange={handleChange}
                  placeholder="Burial No"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '15px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    border: errors.burialNo ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: '#f3f4f6',
                    cursor: 'not-allowed',
                    color: errors.burialNo ? '#b91c1c' : '#111',
                    transition: 'border-color 0.2s',
                  }}
                />
                {errors.burialNo && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.burialNo}</p>
                )}
              </div>
              {field('dateOfBurial', 'Date of Burial', 'date')}
              {field('fullName', 'Name')}
              {field('surname', 'Surname')}
              {field('age', 'Age (Years)', 'text', false)}
              {field('nationality', 'Nationality')}
              {field('address', 'Domicile (Address)')}
              {field('profession', 'Profession', 'text', false)}
              {field('relationship', 'Relationship', 'text', false)}
              {field('causeOfDeath', 'Cause of Death', 'text', false)}
              {field('lastSacraments', 'Received Last Sacraments', 'text', false)}
              {field('dateOfDeath', 'Date of Death', 'date')}
              {field('burialPlace', 'Place of Burial')}
              {field('minister', 'Minister')}
              {field('remarks', 'Remarks', 'text', false)}
            </div>

            {/* Bottom Buttons */}
            <div className="burial-bottom-btns" style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 24px', borderTop: '1px solid #e5e7eb'
            }}>
              {editingId && (
                <ActionButton variant="secondary" onClick={handleCancel}>Cancel</ActionButton>
              )}
              <ActionButton type="submit" disabled={loading}>{loading ? 'Submitting...' : (editingId ? 'Update Certificate' : 'Submit Certificate')}</ActionButton>
            </div>
          </form>
        ) : (
          <div className="burial-search-section" style={{ padding: '24px 28px' }}>

            {/* Search Form */}
            <div className="burial-grid" key={resetKey} style={{ marginBottom: '20px' }}>
              {searchField('burialNo', 'Burial No')}
              {searchField('dateOfBurialFrom', 'Date of Burial (From)', 'date')}
              {searchField('dateOfBurialTo', 'Date of Burial (To)', 'date')}
              {searchField('dateOfDeathFrom', 'Date of Death (From)', 'date')}
              {searchField('dateOfDeathTo', 'Date of Death (To)', 'date')}
              {searchField('fullName', 'Name')}
              {searchField('surname', 'Surname')}
              {searchField('ageFrom', 'Age (From)')}
              {searchField('ageTo', 'Age (To)')}
              {searchField('relationship', 'Relationship')}
              {searchField('causeOfDeath', 'Cause of Death')}
              {searchField('minister', 'Minister')}

              {/* Sort By */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Sort by
                </label>
                <div className="burial-sort-row" style={{ display: 'flex', gap: '10px' }}>
                  <select
                    name="sortBy"
                    value={searchData.sortBy}
                    onChange={handleSearchChange}
                    style={{ ...selectStyle, flex: 1, minWidth: 0 }}
                  >
                    <option value="burialNo">Burial No</option>
                    <option value="fullName">Name</option>
                    <option value="surname">Surname</option>
                    <option value="dateOfBurial">Date of Burial</option>
                    <option value="dateOfDeath">Date of Death</option>
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
            <div className="burial-search-btns" style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 0', borderTop: '1px solid #e5e7eb'
            }}>
              <ActionButton variant="secondary" onClick={handleSearchReset}>Reset</ActionButton>
              <SearchButton onClick={() => handleSearch()} disabled={searchLoading}>{searchLoading ? 'Searching...' : 'Search Burial'}</SearchButton>
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div ref={resultsRef} style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '12px' }}>
                  Search Results ({totalCount})
                </h3>
                {searchLoading ? null : searchResults.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0', backgroundColor: '#f9fafb', borderRadius: '8px' }}>No records found matching your search criteria.</p>
                ) : (
                  <div className="burial-table-wrap" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Sr.</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Burial No</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Surname</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Date of Burial</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Date of Death</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Minister</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((b, i) => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{(currentPage - 1) * parseInt(searchData.maxRecords) + i + 1}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>{b.burialNo}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{b.fullName}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{b.surname}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{b.dateOfBurial}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{b.dateOfDeath}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{b.minister}</td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleEditClick(b)}
                                  style={{
                                    backgroundColor: '#EEF2FF', color: '#3B5EC2', border: '1px solid #C7D2FE',
                                    borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500,
                                    cursor: 'pointer', whiteSpace: 'nowrap'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleViewClick(b)}
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
                      <div className="burial-pagination" style={{
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

export default BurialForm;
