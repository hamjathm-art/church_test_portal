import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './intentions.css';
import authFetch from '../../utils/authFetch';

const intentionTypeOptions = [
  { value: 'ForTheDeceased', label: 'For the Deceased' },
  { value: 'SpecialIntention', label: 'Special Intention (e.g., health, success, thanksgiving)' },
  { value: 'BirthdayAnniversary', label: 'Birthday / Anniversary' },
  { value: 'Other', label: 'Other (Specify)' },
];

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Rejected', label: 'Rejected' },
];

const massTimeSlots = [
  { label: '6:30 AM' },
  { label: '9:00 AM' },
  { label: '5:30 PM' },
  { label: '7:00 PM (Sunday)' },
];

const intentionTypeLabel = (val) => {
  const found = intentionTypeOptions.find((o) => o.value === val);
  return found ? found.label : val;
};

const initialFormData = {
  intentionNo: '',
  fullName: '',
  contactNumber: '',
  emailAddress: '',
  typeOfIntention: '',
  otherIntention: '',
  nameOfPersonForIntention: '',
  intentionDetails: '',
  slot1Date: '',
  slot1Status: '',
  slot2Date: '',
  slot2Status: '',
  slot3Date: '',
  slot3Status: '',
  slot4Date: '',
  slot4Status: '',
  preferredDateTime: '',
  offeringAmount: '',
  paymentStatus: '',
  paymentMode: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  referenceNumber: '',
  specialNotes: '',
  status: 'Pending',
  receivedBy: '',
  receivedDate: '',
  confirmedDateTime: '',
  paymentReceived: '',
  receiptNo: '',
};

const initialSearchData = {
  fullName: '',
  contactNumber: '',
  typeOfIntention: '',
  status: '',
  receivedDateFrom: '',
  receivedDateTo: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  maxRecords: '5',
};

function Intentions() {
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
  const [bookedSlots, setBookedSlots] = useState({ slot1: false, slot2: false, slot3: false, slot4: false });
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
          const res = await authFetch('/api/mass-intention/next-number');
          const result = await res.json();
          if (result.success) {
            setFormData(prev => ({ ...prev, intentionNo: result.data.nextNumber }));
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
      authFetch(`/api/mass-intention/search?${params.toString()}`)
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
      // Clear the state so refresh doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state, showToast]);

  const checkSlotAvailability = useCallback(async (slotDates, excludeId = null) => {
    try {
      const params = new URLSearchParams();
      for (let i = 1; i <= 4; i++) {
        if (slotDates[`slot${i}Date`]) params.append(`slot${i}Date`, slotDates[`slot${i}Date`]);
      }
      if (excludeId) params.append('excludeId', excludeId);
      const response = await authFetch(`/api/mass-intention/check-availability?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setBookedSlots(result.data);
        return result.data;
      }
    } catch {
      // silently fail availability check
    }
    return null;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactNumber') {
      const phoneOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: phoneOnly });
    } else if (name === 'offeringAmount') {
      const numOnly = value.replace(/[^0-9.]/g, '');
      setFormData({ ...formData, [name]: numOnly });
    } else if (name === 'typeOfIntention') {
      setFormData({
        ...formData,
        typeOfIntention: value,
        otherIntention: value === 'Other' ? formData.otherIntention : '',
      });
    } else if (/^slot\dDate$/.test(name)) {
      const updatedForm = { ...formData, [name]: value };
      setFormData(updatedForm);
      // Check availability when a slot date changes
      if (value) {
        const slotDates = {};
        for (let i = 1; i <= 4; i++) {
          slotDates[`slot${i}Date`] = updatedForm[`slot${i}Date`];
        }
        checkSlotAvailability(slotDates, editingId).then((result) => {
          if (result) {
            // Auto-set booked status for slots that are already taken
            const autoUpdate = {};
            for (let i = 1; i <= 4; i++) {
              if (result[`slot${i}`] && updatedForm[`slot${i}Date`]) {
                autoUpdate[`slot${i}Status`] = 'booked';
              }
            }
            if (Object.keys(autoUpdate).length > 0) {
              setFormData((prev) => ({ ...prev, ...autoUpdate }));
            }
          }
        });
      }
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

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact Number must be exactly 10 digits';
    }
    if (formData.emailAddress && !/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Enter a valid email address';
    }
    if (!formData.typeOfIntention) newErrors.typeOfIntention = 'Type of Intention is required';
    if (formData.typeOfIntention === 'Other' && !formData.otherIntention.trim()) {
      newErrors.otherIntention = 'Please specify the intention';
    }
    if (!formData.nameOfPersonForIntention.trim()) {
      newErrors.nameOfPersonForIntention = 'Name(s) of Person(s) for Intention is required';
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
        ? `/api/mass-intention/${editingId}`
        : '/api/mass-intention';
      const method = editingId ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        showToast(editingId ? 'Mass intention updated successfully.' : 'Mass intention submitted successfully.', 'success');
        if (cameFromSearch) {
          setFormData(initialFormData);
          setEditingId(null);
          setErrors({});
          setCameFromSearch(false);
          setView('search');
          setTimeout(() => handleSearch(currentPage), 50);
          if (!editingId) {
            try {
              const nextRes = await authFetch('/api/mass-intention/next-number');
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
              const nextRes = await authFetch('/api/mass-intention/next-number');
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
    const hasSearchCriteria = searchData.fullName || searchData.contactNumber ||
      searchData.typeOfIntention || searchData.status ||
      searchData.receivedDateFrom || searchData.receivedDateTo;

    if (!hasSearchCriteria) {
      showToast('Please enter at least one search field.', 'error');
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchData.fullName) params.append('fullName', searchData.fullName);
      if (searchData.contactNumber) params.append('contactNumber', searchData.contactNumber);
      if (searchData.typeOfIntention) params.append('typeOfIntention', searchData.typeOfIntention);
      if (searchData.status) params.append('status', searchData.status);
      if (searchData.receivedDateFrom) params.append('receivedDateFrom', searchData.receivedDateFrom);
      if (searchData.receivedDateTo) params.append('receivedDateTo', searchData.receivedDateTo);
      params.append('sortBy', searchData.sortBy);
      params.append('sortOrder', searchData.sortOrder);
      params.append('maxRecords', searchData.maxRecords);
      params.append('page', page);

      const response = await authFetch(`/api/mass-intention/search?${params.toString()}`);
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
    // Check availability for existing slot dates
    const slotDates = {};
    let hasSlotDate = false;
    for (let i = 1; i <= 4; i++) {
      if (fields[`slot${i}Date`]) {
        slotDates[`slot${i}Date`] = fields[`slot${i}Date`];
        hasSlotDate = true;
      }
    }
    if (hasSlotDate) {
      checkSlotAvailability(slotDates, id);
    } else {
      setBookedSlots({ slot1: false, slot2: false, slot3: false, slot4: false });
    }
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
    setFormData({ ...initialFormData, intentionNo: nextNumberRef.current || '' });
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
    printWindow.document.write('<html><head><title>Mass Intention Booking</title>');
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
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={type === 'date' || type === 'datetime-local' ? '' : label}
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

  // Build detail rows
  const getDetailRows = (r) => {
    const rows = [
      { label: 'Full Name', value: r.fullName },
      { label: 'Contact Number', value: r.contactNumber },
      { label: 'Email Address', value: r.emailAddress },
      { label: 'Type of Intention', value: intentionTypeLabel(r.typeOfIntention) },
    ];

    if (r.typeOfIntention === 'Other' && r.otherIntention) {
      rows.push({ label: 'Other Intention', value: r.otherIntention });
    }

    rows.push(
      { label: 'Name(s) for Intention', value: r.nameOfPersonForIntention },
      { label: 'Intention Details', value: r.intentionDetails },
    );

    // Mass time slots
    const slotLabels = ['6:30 AM', '9:00 AM', '5:30 PM', '7:00 PM (Sunday)'];
    slotLabels.forEach((timeLabel, idx) => {
      const num = idx + 1;
      const slotDate = r[`slot${num}Date`];
      const slotStatus = r[`slot${num}Status`];
      if (slotDate || slotStatus) {
        const statusText = slotStatus === 'available' ? 'Available' : slotStatus === 'booked' ? 'Booked' : '';
        rows.push({ label: `Mass Slot ${timeLabel}`, value: `${formatDate(slotDate)} - ${statusText}` });
      }
    });

    if (r.preferredDateTime) {
      rows.push({ label: 'Preferred Date & Time', value: r.preferredDateTime });
    }

    // Donation
    if (r.offeringAmount || r.paymentStatus || r.paymentMode) {
      rows.push(
        { label: 'Offering Amount', value: r.offeringAmount ? '₹' + r.offeringAmount : '' },
        { label: 'Payment Status', value: r.paymentStatus === 'paid' ? 'Paid' : r.paymentStatus === 'toBePaid' ? 'To be Paid' : r.paymentStatus },
        { label: 'Mode of Payment', value: r.paymentMode === 'cash' ? 'Cash' : r.paymentMode === 'onlineTransfer' ? 'Online Transfer' : r.paymentMode === 'cheque' ? 'Cheque' : r.paymentMode },
      );
    }
    if (r.paymentMode === 'onlineTransfer') {
      rows.push(
        { label: 'Bank Name', value: r.bankName },
        { label: 'Account Number', value: r.accountNumber },
        { label: 'IFSC Code', value: r.ifscCode },
        { label: 'Reference Number', value: r.referenceNumber },
      );
    }

    if (r.specialNotes) {
      rows.push({ label: 'Special Notes', value: r.specialNotes });
    }

    rows.push({ label: 'Status', value: r.status });

    // Office Use
    if (r.receivedBy || r.receivedDate || r.confirmedDateTime) {
      rows.push(
        { label: 'Received By', value: r.receivedBy },
        { label: 'Date Received', value: formatDate(r.receivedDate) },
        { label: 'Confirmed Date/Time', value: r.confirmedDateTime },
        { label: 'Payment Received', value: r.paymentReceived },
        { label: 'Receipt No.', value: r.receiptNo },
      );
    }

    return rows.filter((row) => row.value);
  };

  return (
    <div style={{ width: '100%', padding: '24px 16px', minWidth: 0 }}>

      {/* Toast Notification */}
      {toast && (
        <div className="mass-toast" style={{
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
      <div className="mass-card">

        {/* Card Header */}
        <div className="mass-card-header">
          <div>
            <h2 className="no-print" style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              {view === 'form'
                ? (editingId ? 'Edit Mass Intention' : 'Mass Intention Booking')
                : view === 'detail'
                ? 'Mass Intention Details'
                : 'Search Mass Intentions'}
            </h2>
            {view === 'form' && !editingId && (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>Offering prayers for our loved ones and special intentions.</p>
            )}
          </div>
          <div className="no-print mass-header-btns" style={{ display: 'flex', gap: '10px' }}>
            {view === 'search' ? (
              <button
                className="form-btn"
                onClick={handleNewClick}
                style={{
                  backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '8px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '20px', fontWeight: 700, lineHeight: '1' }}>+</span> New Booking
              </button>
            ) : view === 'detail' ? (
              <button className="form-btn mass-view-btn" onClick={handleBackToSearch}>
                Back to Search
              </button>
            ) : (
              <>
                <button className="form-btn mass-view-btn" onClick={handleSearchClick}>
                  Search
                </button>
                <button
                  className="form-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '8px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ========== DETAIL VIEW ========== */}
        {view === 'detail' && detailRecord ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div id="detail-print-area" className="mass-detail-area" style={{ width: '700px', maxWidth: '100%', minHeight: '990px', margin: '0 auto', backgroundImage: 'url(/images/f1.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', padding: '155px 60px 50px', fontFamily: "'Times New Roman', Times, serif", position: 'relative', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000', margin: '0 0 4px', letterSpacing: '1px', fontFamily: "'Times New Roman', Times, serif" }}>
                  MASS INTENTION BOOKING
                </h2>
                <p style={{ fontSize: '12px', color: '#000', margin: '0 0 6px' }}>
                  Parish Office Record
                </p>
                <p style={{ fontSize: '13px', color: '#000', margin: '0 0 4px' }}>
                  Intention Type :&nbsp;<span style={{ fontWeight: 700 }}>{intentionTypeLabel(detailRecord.typeOfIntention)}</span>
                  &nbsp;&nbsp;/&nbsp;&nbsp;Status :&nbsp;<span style={{ fontWeight: 700 }}>{detailRecord.status}</span>
                </p>
                <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '4px 0 0' }} />
              </div>

              {/* Detail Rows */}
              <table className="mass-detail-table" style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '13px', width: '100%', fontFamily: "'Times New Roman', Times, serif" }}>
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
                    <div className="mass-cert-auth-wrap" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <div className="mass-cert-auth-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Signing Authority</label>
                        <select
                          value={signingAuthority}
                          onChange={(e) => setSigningAuthority(e.target.value)}
                          style={{ padding: '10px 14px', fontSize: '15px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: '#111' }}
                        >
                          <option value="">-- Select Authority --</option>
                          <option value="christopher">Fr. Christopher Jayakumar</option>
                          <option value="joel">Joel Savio Fernandes</option>
                        </select>
                      </div>
                    </div>

                    {signingAuthority && (
                      <div className="mass-cert-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: "'Times New Roman', Times, serif", marginTop: '16px' }}>
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
                          Print Booking
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
                        {detailRecord.status === 'Rejected' ? 'Booking Rejected' : `Booking ${detailRecord.status}`}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: detailRecord.status === 'Rejected' ? '#b91c1c' : '#a16207' }}>
                        {detailRecord.status === 'Rejected'
                          ? 'This mass intention booking has been rejected. Print is not available.'
                          : 'Print and signing are only available once the booking status is marked as "Completed".'}
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
              <div className="mass-grid">
                <div key="intentionNo">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                    Intention No
                  </label>
                  <input type="text" name="intentionNo" value={formData.intentionNo} readOnly
                    style={{ width: '100%', padding: '10px 14px', fontSize: '15px', fontStyle: 'normal', fontWeight: 500, border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#f3f4f6', color: '#111', cursor: 'not-allowed' }}
                  />
                </div>
                {field('fullName', 'Full Name')}
                {field('contactNumber', 'Contact Number')}
                {field('emailAddress', 'Email Address', 'email', false)}
              </div>
            </div>

            {/* Section 2: Mass Intention Details */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>2. Mass Intention Details</h3>
              <div className="mass-grid">
                {selectField('typeOfIntention', 'Type of Intention', intentionTypeOptions)}
                {formData.typeOfIntention === 'Other' &&
                  field('otherIntention', 'Other Intention (Specify)')
                }
                {field('nameOfPersonForIntention', 'Name(s) of Person(s) for Intention')}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                    Intention Details
                  </label>
                  <textarea
                    name="intentionDetails"
                    value={formData.intentionDetails}
                    onChange={handleChange}
                    placeholder="e.g., specific prayer request"
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 14px', fontSize: '15px',
                      border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none',
                      backgroundColor: '#fff', color: '#111',
                      transition: 'border-color 0.2s', resize: 'vertical', fontFamily: 'inherit',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Preferred Mass Date and Time */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>3. Preferred Mass Date and Time</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                Please check the dates and times below and select your preference. Availability is updated weekly.
              </p>
              <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <table className="mass-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Mass Time</th>
                      <th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {massTimeSlots.map((slot, idx) => {
                      const slotNum = idx + 1;
                      const dateField = `slot${slotNum}Date`;
                      const statusField = `slot${slotNum}Status`;
                      const isBooked = bookedSlots[`slot${slotNum}`] && formData[dateField];
                      return (
                        <tr key={idx} style={isBooked ? { backgroundColor: '#fef2f2' } : {}}>
                          <td>
                            <input
                              type="date"
                              name={dateField}
                              value={formData[dateField]}
                              onChange={handleChange}
                              style={{
                                width: '100%', padding: '8px 10px', fontSize: '14px',
                                border: isBooked ? '2px solid #ef4444' : '1px solid #d1d5db', borderRadius: '8px',
                                outline: 'none', backgroundColor: isBooked ? '#fef2f2' : '#fff', color: '#111',
                              }}
                            />
                          </td>
                          <td>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: isBooked ? '#dc2626' : '#374151' }}>{slot.label}</span>
                            {isBooked && (
                              <span style={{ display: 'block', fontSize: '11px', color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
                                Already Booked
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                              <label style={{
                                fontSize: '14px', fontWeight: 500,
                                color: isBooked ? '#9ca3af' : '#374151',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                cursor: isBooked ? 'not-allowed' : 'pointer',
                              }}>
                                <input
                                  type="radio"
                                  name={statusField}
                                  value="available"
                                  checked={formData[statusField] === 'available'}
                                  onChange={handleChange}
                                  disabled={isBooked}
                                /> Available
                              </label>
                              <label style={{
                                fontSize: '14px', fontWeight: 500,
                                color: isBooked ? '#dc2626' : '#374151',
                                display: 'flex', alignItems: 'center', gap: '4px',
                              }}>
                                <input
                                  type="radio"
                                  name={statusField}
                                  value="booked"
                                  checked={formData[statusField] === 'booked'}
                                  onChange={handleChange}
                                /> Booked
                              </label>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                If none of the listed dates or times work, please specify your preferred date and time. We will contact you to confirm availability.
              </p>
              <div className="mass-grid">
                {field('preferredDateTime', 'Preferred Date and Time', 'datetime-local', false)}
              </div>
            </div>

            {/* Section 4: Donation Information */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>4. Donation Information</h3>
              <div className="mass-grid">
                {field('offeringAmount', 'Offering for Mass Intention (₹)', 'text', false)}
                {selectField('paymentStatus', 'Payment Status', [
                  { value: 'paid', label: 'Paid' },
                  { value: 'toBePaid', label: 'To be Paid' },
                ], false)}
                {selectField('paymentMode', 'Mode of Payment', [
                  { value: 'cash', label: 'Cash' },
                  { value: 'onlineTransfer', label: 'Online Transfer' },
                  { value: 'cheque', label: 'Cheque' },
                ], false)}
              </div>
              {formData.paymentMode === 'onlineTransfer' && (
                <div className="mass-grid">
                  {field('bankName', 'Bank Name', 'text', false)}
                  {field('accountNumber', 'Account Number', 'text', false)}
                  {field('ifscCode', 'IFSC Code', 'text', false)}
                  {field('referenceNumber', 'Reference Number', 'text', false)}
                </div>
              )}
            </div>

            {/* Section 5: Notes or Special Requests */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>5. Notes or Special Requests</h3>
              <div style={{ paddingBottom: '20px' }}>
                <textarea
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleChange}
                  placeholder="Any additional notes or special requests..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: '15px',
                    border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none',
                    backgroundColor: '#fff', color: '#111',
                    transition: 'border-color 0.2s', resize: 'vertical', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; }}
                />
              </div>
            </div>

            {/* Section 6: Status */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>6. Status</h3>
              <div className="mass-grid">
                {selectField('status', 'Booking Status', statusOptions, false)}
              </div>
            </div>

            {/* Section 7: Parish Office Use Only */}
            <div style={{ padding: '20px 28px 8px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Parish Office Use Only</h3>
              <div className="mass-grid">
                {field('receivedBy', 'Request Received By', 'text', false)}
                {field('receivedDate', 'Date', 'date', false)}
                {field('confirmedDateTime', 'Mass Intention Date/Time Confirmed', 'datetime-local', false)}
                {selectField('paymentReceived', 'Payment Received', [
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ], false)}
                {field('receiptNo', 'Receipt No.', 'text', false)}
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="mass-bottom-btns" style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 24px', borderTop: '1px solid #e5e7eb'
            }}>
              {editingId && (
                <button
                  className="form-btn"
                  type="button"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px',
                    padding: '10px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', width: 'auto'
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#3B5EC2'; e.target.style.color = '#fff'; e.target.style.borderColor = '#3B5EC2'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#374151'; e.target.style.borderColor = '#d1d5db'; }}
                >
                  Cancel
                </button>
              )}
              <button
                className="form-btn"
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '10px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  width: 'auto', opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Submitting...' : (editingId ? 'Update Booking' : 'Submit Booking')}
              </button>
            </div>
          </form>

        ) : (
          /* ========== SEARCH VIEW ========== */
          <div className="mass-search-section" style={{ padding: '24px 28px' }}>

            {/* Search Form */}
            <div className="mass-grid" key={resetKey} style={{ marginBottom: '20px' }}>
              {searchField('fullName', 'Full Name')}
              {searchField('contactNumber', 'Contact Number')}

              {/* Intention Type Filter */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '20px' }}>
                  Type of Intention
                </label>
                <select
                  name="typeOfIntention"
                  value={searchData.typeOfIntention}
                  onChange={handleSearchChange}
                  style={{ ...selectStyle, width: '100%' }}
                >
                  <option value="">-- All Types --</option>
                  {intentionTypeOptions.map((opt) => (
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

              {searchField('receivedDateFrom', 'Date Received (From)', 'date')}
              {searchField('receivedDateTo', 'Date Received (To)', 'date')}

              {/* Sort By */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Sort by
                </label>
                <div className="mass-sort-row" style={{ display: 'flex', gap: '10px' }}>
                  <select
                    name="sortBy"
                    value={searchData.sortBy}
                    onChange={handleSearchChange}
                    style={{ ...selectStyle, flex: 1, minWidth: 0 }}
                  >
                    <option value="created_at">Date Created</option>
                    <option value="fullName">Full Name</option>
                    <option value="typeOfIntention">Intention Type</option>
                    <option value="status">Status</option>
                    <option value="receivedDate">Date Received</option>
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
            <div className="mass-search-btns" style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 0', borderTop: '1px solid #e5e7eb'
            }}>
              <button
                className="form-btn"
                type="button"
                onClick={handleSearchReset}
                style={{
                  backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px',
                  padding: '10px 28px', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#3B5EC2'; e.target.style.color = '#fff'; e.target.style.borderColor = '#3B5EC2'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#374151'; e.target.style.borderColor = '#d1d5db'; }}
              >
                Reset
              </button>
              <button
                className="form-btn"
                type="button"
                onClick={() => handleSearch(1)}
                disabled={searchLoading}
                style={{
                  backgroundColor: '#3B5EC2', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '10px 28px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  opacity: searchLoading ? 0.7 : 1
                }}
              >
                {searchLoading ? 'Searching...' : 'Search Bookings'}
              </button>
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
                  <div className="mass-table-wrap" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Sr.</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Full Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Contact</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Intention Type</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Date Received</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((r, i) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{(currentPage - 1) * parseInt(searchData.maxRecords) + i + 1}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.fullName}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{r.contactNumber}</td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{intentionTypeLabel(r.typeOfIntention)}</td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                                backgroundColor: r.status === 'Completed' ? '#dcfce7' : r.status === 'Rejected' ? '#fef2f2' : r.status === 'Processing' ? '#fef9c3' : '#f0f9ff',
                                color: r.status === 'Completed' ? '#16a34a' : r.status === 'Rejected' ? '#dc2626' : r.status === 'Processing' ? '#ca8a04' : '#3b82f6',
                              }}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#111827', whiteSpace: 'nowrap' }}>{r.receivedDate || '-'}</td>
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
                      <div className="mass-pagination" style={{
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

export default Intentions;
