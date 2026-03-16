import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './ParishRequestForm.css';
import authFetch from '../../utils/authFetch';
import ActionButton from '../../components/Buttons/ActionButton';
import SearchButton from '../../components/Buttons/SearchButton';
import DatePickerField from '../../components/DatePickerField';
import PageLoader from '../../components/PageLoader/PageLoader';

const requestTypeOptions = [
  { value: 'baptism', label: 'Baptism Certificate' },
  { value: 'confirmation', label: 'Confirmation Certificate' },
  { value: 'marriage_cert', label: 'Marriage Certificate' },
  { value: 'burial', label: 'Burial Certificate' },
  { value: 'no_objection', label: 'No Objection Letter' },
  { value: 'mass', label: 'Mass Intention Booking' },
  { value: 'marriage_prep', label: 'Marriage Preparation Request' },
  { value: 'other', label: 'Other (Please specify)' },
];

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Rejected', label: 'Rejected' },
];

const requestTypeLabel = (val) => {
  const found = requestTypeOptions.find((o) => o.value === val);
  return found ? found.label : val;
};

const initialFormData = {
  requestNo: '',
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  pinCode: '',
  requestType: '',
  status: '',
  baptismFullName: '',
  baptismDateOfBirth: '',
  baptismDate: '',
  baptismParents: '',
  baptismGodparents: '',
  confirmationFullName: '',
  confirmationDate: '',
  marriageBrideName: '',
  marriageGroomName: '',
  marriageDate: '',
  marriageChurch: '',
  burialDeceasedName: '',
  burialDateOfDeath: '',
  burialDate: '',
  massType: '',
  massDateTimePreference: '',
  proposedWeddingDate: '',
  prepBrideName: '',
  prepGroomName: '',
  weddingLocation: '',
  coupleContact: '',
  noObjectionFullName: '',
  noObjectionDateOfBirth: '',
  noObjectionPlaceOfBirth: '',
  noObjectionReason: '',
  otherDetails: '',
  fee: '',
  paymentMode: '',
  paymentDetails: '',
  receivedBy: '',
  dateReceived: '',
  actionTaken: '',
  certificateIssuedDate: '',
  paymentReceived: '',
  amountReceived: '',
};

const initialSearchData = {
  requestNo: '',
  fullName: '',
  phone: '',
  requestType: '',
  status: '',
  dateReceivedFrom: '',
  dateReceivedTo: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  maxRecords: '5',
};

function ParishRequestForm() {
  const location = useLocation();
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
          const res = await authFetch('/api/parish-request/next-number');
          const result = await res.json();
          if (result.success) {
            setFormData(prev => ({ ...prev, requestNo: result.data.nextNumber }));
            nextNumberRef.current = result.data.nextNumber;
          }
        } catch (e) { console.error(e); }
      };
      fetchNext();
    }
  }, [editingId]);

  // Auto-filter when navigated from dashboard with pending status
  useEffect(() => {
    if (location.state?.filterStatus) {
      const status = location.state.filterStatus;
      const newSearch = { ...initialSearchData, status, maxRecords: '25' };
      setSearchData(newSearch);
      setView('search');
      setHasSearched(true);
      setSearchLoading(true);
      const params = new URLSearchParams();
      params.append('status', status);
      params.append('sortBy', newSearch.sortBy);
      params.append('sortOrder', newSearch.sortOrder);
      params.append('maxRecords', newSearch.maxRecords);
      params.append('page', '1');
      authFetch(`/api/parish-request/search?${params.toString()}`)
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
      window.history.replaceState({}, '');
    }
  }, [location.state, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const phoneOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: phoneOnly });
    } else if (name === 'pinCode') {
      const pinOnly = value.replace(/[^0-9]/g, '').slice(0, 6);
      setFormData({ ...formData, [name]: pinOnly });
    } else if (name === 'amountReceived' || name === 'fee') {
      const numOnly = value.replace(/[^0-9.]/g, '');
      setFormData({ ...formData, [name]: numOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: '' });
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      setSearchData({ ...searchData, [name]: numOnly });
    } else {
      setSearchData({ ...searchData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.requestType) newErrors.requestType = 'Request Type is required';
    if (!formData.status) newErrors.status = 'Status is required';

    if (formData.requestType === 'baptism') {
      if (!formData.baptismFullName.trim()) newErrors.baptismFullName = 'Full Name of Baptized is required';
      if (!formData.baptismDateOfBirth) newErrors.baptismDateOfBirth = 'Date of Birth is required';
      if (!formData.baptismDate) newErrors.baptismDate = 'Date of Baptism is required';
      if (!formData.baptismParents.trim()) newErrors.baptismParents = 'Name of Parents is required';
    }
    if (formData.requestType === 'confirmation') {
      if (!formData.confirmationFullName.trim()) newErrors.confirmationFullName = 'Full Name is required';
      if (!formData.confirmationDate) newErrors.confirmationDate = 'Date of Confirmation is required';
    }
    if (formData.requestType === 'marriage_cert') {
      if (!formData.marriageBrideName.trim()) newErrors.marriageBrideName = "Bride's Name is required";
      if (!formData.marriageGroomName.trim()) newErrors.marriageGroomName = "Groom's Name is required";
      if (!formData.marriageDate) newErrors.marriageDate = 'Date of Marriage is required';
    }
    if (formData.requestType === 'burial') {
      if (!formData.burialDeceasedName.trim()) newErrors.burialDeceasedName = "Deceased's Name is required";
      if (!formData.burialDateOfDeath) newErrors.burialDateOfDeath = 'Date of Death is required';
      if (!formData.burialDate) newErrors.burialDate = 'Date of Burial is required';
    }
    if (formData.requestType === 'mass') {
      if (!formData.massType) newErrors.massType = 'Type of Mass is required';
      if (!formData.massDateTimePreference) newErrors.massDateTimePreference = 'Date/Time Preference is required';
    }
    if (formData.requestType === 'marriage_prep') {
      if (!formData.proposedWeddingDate) newErrors.proposedWeddingDate = 'Proposed Wedding Date is required';
      if (!formData.prepBrideName.trim()) newErrors.prepBrideName = "Bride's Name is required";
      if (!formData.prepGroomName.trim()) newErrors.prepGroomName = "Groom's Name is required";
    }
    if (formData.requestType === 'no_objection') {
      if (!formData.noObjectionFullName.trim()) newErrors.noObjectionFullName = 'Full Name is required';
      if (!formData.noObjectionReason.trim()) newErrors.noObjectionReason = 'Reason is required';
    }
    if (formData.requestType === 'other') {
      if (!formData.otherDetails.trim()) newErrors.otherDetails = 'Please specify your request';
    }

    return newErrors;
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
        ? `/api/parish-request/${editingId}`
        : '/api/parish-request';
      const method = editingId ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        showToast(editingId ? 'Parish request updated successfully.' : 'Parish request submitted successfully.', 'success');
        if (cameFromSearch) {
          setFormData(initialFormData);
          setEditingId(null);
          setErrors({});
          setCameFromSearch(false);
          setView('search');
          setTimeout(() => handleSearch(currentPage), 50);
          if (!editingId) {
            try {
              const nextRes = await authFetch('/api/parish-request/next-number');
              const nextResult = await nextRes.json();
              if (nextResult.success) nextNumberRef.current = nextResult.data.nextNumber;
            } catch (e) { /* ignore */ }
          }
        } else {
          setFormData(initialFormData);
          setEditingId(null);
          setErrors({});
          if (!editingId) {
            try {
              const nextRes = await authFetch('/api/parish-request/next-number');
              const nextResult = await nextRes.json();
              if (nextResult.success) nextNumberRef.current = nextResult.data.nextNumber;
            } catch (e) { /* ignore */ }
          }
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

  const handleSearch = async (page = 1) => {
    const hasSearchCriteria = searchData.requestNo || searchData.fullName || searchData.phone ||
      searchData.requestType || searchData.status ||
      searchData.dateReceivedFrom || searchData.dateReceivedTo;

    if (!hasSearchCriteria) {
      showToast('Please enter at least one search field.', 'error');
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchData.requestNo) params.append('requestNo', searchData.requestNo);
      if (searchData.fullName) params.append('fullName', searchData.fullName);
      if (searchData.phone) params.append('phone', searchData.phone);
      if (searchData.requestType) params.append('requestType', searchData.requestType);
      if (searchData.status) params.append('status', searchData.status);
      if (searchData.dateReceivedFrom) params.append('dateReceivedFrom', searchData.dateReceivedFrom);
      if (searchData.dateReceivedTo) params.append('dateReceivedTo', searchData.dateReceivedTo);
      params.append('sortBy', searchData.sortBy);
      params.append('sortOrder', searchData.sortOrder);
      params.append('maxRecords', searchData.maxRecords);
      params.append('page', page);

      const response = await authFetch(`/api/parish-request/search?${params.toString()}`);
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
    setResetKey((prev) => prev + 1);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalCount(0);
  };

  const handleSearchClick = () => {
    setView('search');
    setSearchData({ ...initialSearchData });
    setSearchResults([]);
    setHasSearched(false);
    setResetKey((prev) => prev + 1);
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

  const handleNewClick = () => {
    setFormData({ ...initialFormData, requestNo: nextNumberRef.current || '' });
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

  const handlePrint = () => {
    const printArea = document.getElementById('detail-print-area');
    if (!printArea) return;
    const printContent = printArea.cloneNode(true);
    printContent.querySelectorAll('.no-print').forEach((el) => el.remove());
    printContent.querySelectorAll('.print-only').forEach((el) => {
      el.style.display = 'block';
    });
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Parish Request</title>');
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

  // --- Reusable field helpers ---
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
          placeholder={label}
          style={{
            width: '100%', padding: '10px 14px', fontSize: '15px', fontStyle: 'normal',
            border: errors[name] ? '2px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '8px', outline: 'none',
            backgroundColor: errors[name] ? '#fef2f2' : '#fff',
            color: errors[name] ? '#b91c1c' : '#111',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { if (!errors[name]) e.target.style.borderColor = '#3b82f6'; }}
          onBlur={(e) => { if (!errors[name]) e.target.style.borderColor = '#d1d5db'; }}
        />
      )}
      {errors[name] && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors[name]}</p>}
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
          width: '100%', padding: '10px 14px', fontSize: '15px',
          border: errors[name] ? '2px solid #ef4444' : '1px solid #d1d5db',
          borderRadius: '8px', outline: 'none',
          backgroundColor: errors[name] ? '#fef2f2' : '#fff',
          color: errors[name] ? '#b91c1c' : '#111',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { if (!errors[name]) e.target.style.borderColor = '#3b82f6'; }}
        onBlur={(e) => { if (!errors[name]) e.target.style.borderColor = '#d1d5db'; }}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {errors[name] && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors[name]}</p>}
    </div>
  );

  const selectStyle = {
    padding: '10px 14px', fontSize: '15px', border: '1px solid #d1d5db',
    borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: '#111',
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
          placeholder={label}
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

  // Build detail rows based on request type
  const getDetailRows = (r) => {
    const rows = [
      { label: 'Request No', value: r.requestNo },
      { label: 'Full Name', value: r.fullName },
      { label: 'Phone', value: r.phone },
      { label: 'Email', value: r.email },
      { label: 'Address', value: r.address },
      { label: 'City', value: r.city },
      { label: 'Pin Code', value: r.pinCode },
      { label: 'Request Type', value: requestTypeLabel(r.requestType) },
      { label: 'Status', value: r.status },
    ];

    if (r.requestType === 'baptism') {
      rows.push(
        { label: 'Name of Person Baptized', value: r.baptismFullName },
        { label: 'Date of Birth', value: formatDate(r.baptismDateOfBirth) },
        { label: 'Date of Baptism', value: formatDate(r.baptismDate) },
        { label: 'Parents', value: r.baptismParents },
        { label: 'Godparents', value: r.baptismGodparents },
      );
    }
    if (r.requestType === 'confirmation') {
      rows.push(
        { label: 'Confirmed Person', value: r.confirmationFullName },
        { label: 'Date of Confirmation', value: formatDate(r.confirmationDate) },
      );
    }
    if (r.requestType === 'marriage_cert') {
      rows.push(
        { label: "Bride's Name", value: r.marriageBrideName },
        { label: "Groom's Name", value: r.marriageGroomName },
        { label: 'Date of Marriage', value: formatDate(r.marriageDate) },
        { label: 'Church', value: r.marriageChurch },
      );
    }
    if (r.requestType === 'burial') {
      rows.push(
        { label: 'Deceased Name', value: r.burialDeceasedName },
        { label: 'Date of Death', value: formatDate(r.burialDateOfDeath) },
        { label: 'Date of Burial', value: formatDate(r.burialDate) },
      );
    }
    if (r.requestType === 'mass') {
      rows.push(
        { label: 'Type of Mass', value: r.massType === 'sundayMass' ? 'Sunday Mass' : r.massType === 'weekdayMass' ? 'Weekday Mass' : r.massType === 'specialIntentions' ? 'Special Intentions' : r.massType },
        { label: 'Date/Time Preference', value: r.massDateTimePreference },
      );
    }
    if (r.requestType === 'marriage_prep') {
      rows.push(
        { label: 'Proposed Wedding Date', value: formatDate(r.proposedWeddingDate) },
        { label: "Bride's Name", value: r.prepBrideName },
        { label: "Groom's Name", value: r.prepGroomName },
        { label: 'Wedding Location', value: r.weddingLocation },
        { label: 'Couple Contact', value: r.coupleContact },
      );
    }
    if (r.requestType === 'no_objection') {
      rows.push(
        { label: 'Full Name', value: r.noObjectionFullName },
        { label: 'Date of Birth', value: formatDate(r.noObjectionDateOfBirth) },
        { label: 'Place of Birth', value: r.noObjectionPlaceOfBirth },
        { label: 'Reason', value: r.noObjectionReason },
      );
    }
    if (r.requestType === 'other') {
      rows.push({ label: 'Details', value: r.otherDetails });
    }

    // Payment
    if (r.fee || r.paymentMode) {
      rows.push(
        { label: 'Fee', value: r.fee },
        { label: 'Payment Mode', value: r.paymentMode },
        { label: 'Payment Details', value: r.paymentDetails },
      );
    }

    // Office Use
    if (r.receivedBy || r.dateReceived || r.actionTaken) {
      rows.push(
        { label: 'Received By', value: r.receivedBy },
        { label: 'Date Received', value: formatDate(r.dateReceived) },
        { label: 'Action Taken', value: r.actionTaken },
        { label: 'Certificate Issued Date', value: formatDate(r.certificateIssuedDate) },
        { label: 'Payment Received', value: r.paymentReceived },
        { label: 'Amount Received', value: r.amountReceived },
      );
    }

    return rows.filter((row) => row.value);
  };

  return (
    <div style={{ width: '100%', padding: '24px 16px', minWidth: 0 }}>
      {(loading || searchLoading) && <PageLoader />}

      {/* Toast Notification */}
      {toast && (
        <div className="request-toast" style={{
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

      {/* Main Card */}
      <div className="request-card">

        {/* Card Header */}
        <div className="request-card-header">
          <div>
            <h2 className="no-print" style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              {view === 'form'
                ? (editingId ? 'Edit Parish Request' : 'Parish Request Form')
                : view === 'detail'
                ? 'Parish Request Details'
                : 'Search Parish Requests'}
            </h2>
            {view === 'form' && !editingId && (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>Serving the Faith Community with Love and Care</p>
            )}
          </div>
          <div className="no-print request-header-btns" style={{ display: 'flex', gap: '10px' }}>
            {view === 'search' ? (
              <ActionButton onClick={handleNewClick}><span style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1' }}>+</span> New Request</ActionButton>
            ) : view === 'detail' ? (
              <SearchButton onClick={handleBackToSearch}>Back to Search</SearchButton>
            ) : (
              <>
                <SearchButton onClick={handleSearchClick}>Search</SearchButton>
                <ActionButton onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}</ActionButton>
              </>
            )}
          </div>
        </div>

        {/* ========== DETAIL VIEW ========== */}
        {view === 'detail' && detailRecord ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div id="detail-print-area" className="request-detail-area" style={{ width: '700px', maxWidth: '100%', minHeight: '990px', margin: '0 auto', backgroundImage: 'url(/images/f1.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', padding: '155px 60px 50px', fontFamily: "'Times New Roman', Times, serif", position: 'relative', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', margin: '0 0 4px', letterSpacing: '1px', fontFamily: "'Times New Roman', Times, serif" }}>
                  PARISH REQUEST FORM
                </h2>
                <p style={{ fontSize: '12px', color: '#000', margin: '0 0 6px' }}>
                  Parish Office Record
                </p>
                <p style={{ fontSize: '13px', color: '#000', margin: '0 0 4px' }}>
                  Request Type :&nbsp;<span style={{ fontWeight: 700 }}>{requestTypeLabel(detailRecord.requestType)}</span>
                  &nbsp;&nbsp;/&nbsp;&nbsp;Status :&nbsp;<span style={{ fontWeight: 700 }}>{detailRecord.status}</span>
                </p>
                <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '4px 0 0' }} />
              </div>

              {/* Detail Rows */}
              <table className="request-detail-table" style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '13px', fontFamily: "'Times New Roman', Times, serif", width: '100%' }}>
                <tbody>
                  {getDetailRows(detailRecord).map((item, idx) => (
                    <tr key={idx} style={{ verticalAlign: 'top' }}>
                      <td style={{ padding: '3px 6px 3px 0', color: '#000', textAlign: 'right', whiteSpace: 'nowrap' }}>{idx + 1}.</td>
                      <td style={{ padding: '3px 6px', color: '#000', whiteSpace: 'nowrap' }}>{item.label}</td>
                      <td style={{ padding: '3px 8px', color: '#000' }}>:</td>
                      <td style={{ padding: '3px 6px', color: '#000', fontWeight: 700, textTransform: 'uppercase' }}>{item.value || 'NIL'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signing Authority & Print - Only for Completed status */}
              <div className="no-print" style={{ marginTop: '30px' }}>
                {detailRecord.status === 'Completed' ? (
                  <>
                    <div className="request-cert-auth-wrap" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <div className="request-cert-auth-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Signing Authority</label>
                        <select
                          value={signingAuthority}
                          onChange={(e) => setSigningAuthority(e.target.value)}
                          style={{ padding: '10px 14px', fontSize: '15px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: '#111' }}
                        >
                          <option value="">-- Select Authority --</option>
                          <option value="christopher">Parish Priest</option>
                          <option value="joel">Asst. Parish Priest</option>
                        </select>
                      </div>
                    </div>

                    {signingAuthority && (
                      <div className="request-cert-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: "'Times New Roman', Times, serif", marginTop: '16px' }}>
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
                          Print Request
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '16px 20px', borderRadius: '8px',
                    backgroundColor: detailRecord.status === 'Rejected' ? '#fef2f2' : '#fef9c3',
                    border: `1px solid ${detailRecord.status === 'Rejected' ? '#fecaca' : '#fde68a'}`,
                  }}>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={detailRecord.status === 'Rejected' ? '#dc2626' : '#ca8a04'}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: detailRecord.status === 'Rejected' ? '#dc2626' : '#92400e' }}>
                        {detailRecord.status === 'Rejected' ? 'Request Rejected' : `Request ${detailRecord.status}`}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: detailRecord.status === 'Rejected' ? '#b91c1c' : '#a16207' }}>
                        {detailRecord.status === 'Rejected'
                          ? 'This request has been rejected. Print is not available.'
                          : 'Print and signing are only available once the request status is marked as "Completed".'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Print-only footer - only for Completed */}
              {detailRecord.status === 'Completed' && (
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
              )}
            </div>
          </div>

        ) : view === 'form' ? (
          /* ========== FORM VIEW ========== */
          <form onSubmit={handleSubmit} noValidate>
            {/* Section 1: Personal Information */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>1. Personal Information</h3>
              <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                <div key="requestNo">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                    Request No
                  </label>
                  <input type="text" name="requestNo" value={formData.requestNo} readOnly
                    style={{ width: '100%', padding: '10px 14px', fontSize: '15px', fontStyle: 'normal', fontWeight: 500, border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#f3f4f6', color: '#111', cursor: 'not-allowed' }}
                  />
                </div>
                {field('fullName', 'Full Name')}
                {field('phone', 'Phone Number')}
                {field('email', 'Email Address', 'email', false)}
                {field('address', 'Address', 'text', false)}
                {field('city', 'City', 'text', false)}
                {field('pinCode', 'Pin Code', 'text', false)}
              </div>
            </div>

            {/* Section 2: Type of Request */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>2. Type of Request</h3>
              <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                {selectField('requestType', 'Request Type', requestTypeOptions)}
                {selectField('status', 'Status', statusOptions)}
              </div>
            </div>

            {/* Section 3: Conditional Details */}
            {formData.requestType === 'baptism' && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Baptism Certificate Details</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  {field('baptismFullName', 'Full Name of Person Baptized')}
                  {field('baptismDateOfBirth', 'Date of Birth', 'date')}
                  {field('baptismDate', 'Date of Baptism', 'date')}
                  {field('baptismParents', 'Name of Parents')}
                  {field('baptismGodparents', 'Godparents', 'text', false)}
                </div>
              </div>
            )}

            {formData.requestType === 'confirmation' && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Confirmation Certificate Details</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  {field('confirmationFullName', 'Full Name of Confirmed Person')}
                  {field('confirmationDate', 'Date of Confirmation', 'date')}
                </div>
              </div>
            )}

            {formData.requestType === 'marriage_cert' && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Marriage Certificate Details</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  {field('marriageBrideName', 'Full Name of Bride')}
                  {field('marriageGroomName', 'Full Name of Groom')}
                  {field('marriageDate', 'Date of Marriage', 'date')}
                  {field('marriageChurch', 'Church Name and Location', 'text', false)}
                </div>
              </div>
            )}

            {formData.requestType === 'burial' && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Burial Certificate Details</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  {field('burialDeceasedName', 'Full Name of Deceased')}
                  {field('burialDateOfDeath', 'Date of Death', 'date')}
                  {field('burialDate', 'Date of Burial', 'date')}
                </div>
              </div>
            )}

            {formData.requestType === 'mass' && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Mass Intention Booking</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  {selectField('massType', 'Type of Mass', [
                    { value: 'sundayMass', label: 'Sunday Mass' },
                    { value: 'weekdayMass', label: 'Weekday Mass' },
                    { value: 'specialIntentions', label: 'Special Intentions (e.g., Anniversary, Birthday)' },
                  ])}
                  {field('massDateTimePreference', 'Date/Time Preference', 'datetime-local')}
                </div>
              </div>
            )}

            {formData.requestType === 'marriage_prep' && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Marriage Preparation Details</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  {field('proposedWeddingDate', 'Proposed Wedding Date', 'date')}
                  {field('prepBrideName', "Bride's Name")}
                  {field('prepGroomName', "Groom's Name")}
                  {field('weddingLocation', 'Wedding Location', 'text', false)}
                  {field('coupleContact', 'Contact Details of the Couple', 'text', false)}
                </div>
              </div>
            )}

            {formData.requestType === 'no_objection' && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>No Objection Letter Details</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  {field('noObjectionFullName', 'Full Name')}
                  {field('noObjectionDateOfBirth', 'Date of Birth', 'date', false)}
                  {field('noObjectionPlaceOfBirth', 'Place of Birth', 'text', false)}
                  {field('noObjectionReason', 'Reason for Request')}
                </div>
              </div>
            )}

            {formData.requestType === 'other' && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Other Request Details</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                      Please Specify <span style={{ color: '#ef4444', fontSize: '18px', fontWeight: 700, lineHeight: '1' }}>*</span>
                    </label>
                    <textarea
                      name="otherDetails"
                      value={formData.otherDetails}
                      onChange={handleChange}
                      placeholder="Please describe your request in detail"
                      rows={4}
                      style={{
                        width: '100%', padding: '10px 14px', fontSize: '15px',
                        border: errors.otherDetails ? '2px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '8px', outline: 'none',
                        backgroundColor: errors.otherDetails ? '#fef2f2' : '#fff',
                        color: errors.otherDetails ? '#b91c1c' : '#111',
                        transition: 'border-color 0.2s', resize: 'vertical', fontFamily: 'inherit',
                      }}
                      onFocus={(e) => { if (!errors.otherDetails) e.target.style.borderColor = '#3b82f6'; }}
                      onBlur={(e) => { if (!errors.otherDetails) e.target.style.borderColor = '#d1d5db'; }}
                    />
                    {errors.otherDetails && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.otherDetails}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Fee & Payment */}
            {formData.requestType && (
              <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Fee & Payment</h3>
                <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                  {field('fee', 'Fee (if any)', 'text', false)}
                  {selectField('paymentMode', 'Mode of Payment', [
                    { value: 'cash', label: 'Cash' },
                    { value: 'cheque', label: 'Cheque' },
                    { value: 'bankTransfer', label: 'Bank Transfer' },
                    { value: 'onlinePayment', label: 'Online Payment' },
                  ], false)}
                  {(formData.paymentMode === 'bankTransfer' || formData.paymentMode === 'onlinePayment') &&
                    field('paymentDetails', 'Payment Details', 'text', false)
                  }
                </div>
              </div>
            )}

            {/* Section 5: Parish Office Use */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Parish Office Use Only</h3>
              <div className="request-grid" style={{ padding: 0, paddingBottom: '20px' }}>
                {field('receivedBy', 'Request Received By', 'text', false)}
                {field('dateReceived', 'Date Received', 'date', false)}
                {field('actionTaken', 'Action Taken', 'text', false)}
                {field('certificateIssuedDate', 'Certificate Issued Date', 'date', false)}
                {selectField('paymentReceived', 'Payment Received', [
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ], false)}
                {field('amountReceived', 'Amount Received', 'text', false)}
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="request-bottom-btns" style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 24px', borderTop: '1px solid #e5e7eb'
            }}>
              {editingId && (
                <ActionButton variant="secondary" onClick={handleCancel}>Cancel</ActionButton>
              )}
              <ActionButton type="submit" disabled={loading}>{loading ? 'Submitting...' : (editingId ? 'Update Request' : 'Submit Request')}</ActionButton>
            </div>
          </form>

        ) : (
          /* ========== SEARCH VIEW ========== */
          <div className="request-search-section" style={{ padding: '24px 28px' }}>

            {/* Search Form */}
            <div className="request-grid" key={resetKey} style={{ marginBottom: '20px' }}>
              {searchField('requestNo', 'Request No')}
              {searchField('fullName', 'Full Name')}
              {searchField('phone', 'Phone Number')}

              {/* Request Type Filter */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                  Request Type
                </label>
                <select
                  name="requestType"
                  value={searchData.requestType}
                  onChange={handleSearchChange}
                  style={{ ...selectStyle, width: '100%' }}
                >
                  <option value="">-- All Types --</option>
                  {requestTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                  Status
                </label>
                <select
                  name="status"
                  value={searchData.status}
                  onChange={handleSearchChange}
                  style={{ ...selectStyle, width: '100%' }}
                >
                  <option value="">-- All Statuses --</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {searchField('dateReceivedFrom', 'Date Received (From)', 'date')}
              {searchField('dateReceivedTo', 'Date Received (To)', 'date')}

              {/* Sort By */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Sort by
                </label>
                <div className="request-sort-row" style={{ display: 'flex', gap: '10px' }}>
                  <select
                    name="sortBy"
                    value={searchData.sortBy}
                    onChange={handleSearchChange}
                    style={{ ...selectStyle, flex: 1, minWidth: 0 }}
                  >
                    <option value="created_at">Date Created</option>
                    <option value="fullName">Full Name</option>
                    <option value="requestType">Request Type</option>
                    <option value="status">Status</option>
                    <option value="dateReceived">Date Received</option>
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
            <div className="request-search-btns" style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 0', borderTop: '1px solid #e5e7eb'
            }}>
              <ActionButton variant="secondary" onClick={handleSearchReset}>Reset</ActionButton>
              <SearchButton onClick={() => handleSearch()} disabled={searchLoading}>{searchLoading ? 'Searching...' : 'Search Requests'}</SearchButton>
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
                  <div className="request-table-wrap" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Sr.</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Request No</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Full Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Phone</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Request Type</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Date Received</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((r, i) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{(currentPage - 1) * parseInt(searchData.maxRecords) + i + 1}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.requestNo}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.fullName}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{r.phone}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{requestTypeLabel(r.requestType)}</td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                                backgroundColor: r.status === 'Completed' ? '#dcfce7' : r.status === 'Rejected' ? '#fef2f2' : r.status === 'Processing' ? '#fef9c3' : '#f0f9ff',
                                color: r.status === 'Completed' ? '#16a34a' : r.status === 'Rejected' ? '#dc2626' : r.status === 'Processing' ? '#ca8a04' : '#3b82f6',
                              }}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{r.dateReceived || '-'}</td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleEditClick(r)}
                                  style={{
                                    backgroundColor: '#EEF2FF', color: '#3B5EC2', border: '1px solid #C7D2FE',
                                    borderRadius: '6px', padding: '5px 16px', fontSize: '13px', fontWeight: 500,
                                    cursor: 'pointer', whiteSpace: 'nowrap'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleViewClick(r)}
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
                      <div className="request-pagination" style={{
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

export default ParishRequestForm;
