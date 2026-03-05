import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccessTime, MdCalendarToday } from 'react-icons/md';
import authFetch from '../../utils/authFetch';
import './dashboard.css';
 
const Dashboard = () => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [upcomingDatesCount, setUpcomingDatesCount] = useState(0);

  // Pending items from all forms
  const [pendingItems, setPendingItems] = useState([]);

  // New row stats
  const [todayMassCount, setTodayMassCount] = useState(0);
  const [totalFamilies, setTotalFamilies] = useState(0);
  const [monthBaptisms, setMonthBaptisms] = useState(0);

  // Lists
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const monthStart = `${today.substring(0, 7)}-01`;
      const [allRes, publishedRes, draftRes, upcomingRes, recentRes,
        massPendingRes, massProcessingRes, reqPendingRes, reqProcessingRes,
        massTodayRes, familyRes, baptismRes
      ] = await Promise.all([
        authFetch(`/api/announcement/search?maxRecords=1&page=1`),
        authFetch(`/api/announcement/search?status=Published&maxRecords=1&page=1`),
        authFetch(`/api/announcement/search?status=Draft&maxRecords=1&page=1`),
        authFetch(`/api/announcement/search?status=Published&announcementDateFrom=${today}&sortBy=announcementDate&sortOrder=asc&maxRecords=5&page=1`),
        authFetch(`/api/announcement/search?status=Published&announcementDateFrom=${today}&sortBy=announcementDate&sortOrder=asc&maxRecords=5&page=1`),
        authFetch(`/api/mass-intention/search?status=Pending&maxRecords=1&page=1`),
        authFetch(`/api/mass-intention/search?status=Processing&maxRecords=1&page=1`),
        authFetch(`/api/parish-request/search?status=Pending&maxRecords=1&page=1`),
        authFetch(`/api/parish-request/search?status=Processing&maxRecords=1&page=1`),
        authFetch(`/api/mass-intention/search?slot1Date=${today}&maxRecords=1&page=1`),
        authFetch(`/api/family/search?maxRecords=1&page=1`),
        authFetch(`/api/baptism/search?dateOfBaptismFrom=${monthStart}&dateOfBaptismTo=${today}&maxRecords=1&page=1`),
      ]);

      const [allData, pubData, draftData, upcomingData, recentData,
        massPendData, massProcData, reqPendData, reqProcData,
        massTodayData, familyData, baptismData
      ] = await Promise.all([
        allRes.json(), publishedRes.json(), draftRes.json(), upcomingRes.json(), recentRes.json(),
        massPendingRes.json(), massProcessingRes.json(), reqPendingRes.json(), reqProcessingRes.json(),
        massTodayRes.json(), familyRes.json(), baptismRes.json(),
      ]);

      if (allData.success) setTotalAnnouncements(allData.totalCount || 0);
      if (pubData.success) setPublishedCount(pubData.totalCount || 0);
      if (draftData.success) setDraftCount(draftData.totalCount || 0);
      if (upcomingData.success) {
        setUpcomingDates(upcomingData.data || []);
        setUpcomingDatesCount(upcomingData.totalCount || 0);
      }
      if (recentData.success) setRecentAnnouncements(recentData.data || []);
      setTodayMassCount(massTodayData.success ? (massTodayData.totalCount || 0) : 0);
      setTotalFamilies(familyData.success ? (familyData.totalCount || 0) : 0);
      setMonthBaptisms(baptismData.success ? (baptismData.totalCount || 0) : 0);

      // Build pending items list
      const items = [];
      const massPend = massPendData.success ? (massPendData.totalCount || 0) : 0;
      const massProc = massProcData.success ? (massProcData.totalCount || 0) : 0;
      if (massPend + massProc > 0) items.push({ label: 'Mass Intentions', pending: massPend, processing: massProc, route: '/intentions' });
      const reqPend = reqPendData.success ? (reqPendData.totalCount || 0) : 0;
      const reqProc = reqProcData.success ? (reqProcData.totalCount || 0) : 0;
      if (reqPend + reqProc > 0) items.push({ label: 'Parish Requests', pending: reqPend, processing: reqProc, route: '/requests' });
      const drafts = draftData.success ? (draftData.totalCount || 0) : 0;
      if (drafts > 0) items.push({ label: 'Announcements', pending: drafts, processing: 0, route: '/announcement', statusLabel: 'Draft' });
      setPendingItems(items);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const formatDay = (date) => date.toLocaleDateString('en-US', { weekday: 'long' });
  const formatDate = (date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const formatAnnDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getCurrentSeason = () => {
    const now = new Date();
    const m = now.getMonth();
    const d = now.getDate();
    if (m === 11 && d >= 1) return 'Advent';
    if (m === 0 && d <= 6) return 'Advent';
    if ((m === 1 && d >= 17) || (m === 2) || (m === 3 && d <= 5)) return 'Lent';
    if ((m === 3 && d >= 6) || (m === 4) || (m === 5 && d <= 10)) return 'Easter';
    return 'Ordinary Time';
  };

  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(sunday)} — ${fmt(saturday)}`;
  };

  const getStatusClass = (status) => {
    if (status === 'Published') return 'dash-status-published';
    if (status === 'Draft') return 'dash-status-draft';
    return 'dash-status-scheduled';
  };

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>

      {/* ── Top Row: Welcome + Date/Time ── */}
      <div className="dash-top-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ minWidth: 0 }}>
          <h2 className="dash-welcome-title" style={{ fontSize: '26px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
            Welcome, <span style={{ color: '#1E3A8A' }}>{userName}</span>
          </h2>
          <p className="dash-welcome-sub" style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px', fontWeight: 400 }}>
            Here's what's happening at your parish today
          </p>
        </div>

        <div className="dash-datetime-bar" style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B5EC2 100%)', padding: '14px 20px', borderRadius: '12px',
          border: '1px solid #60A5FA', boxShadow: '0 4px 16px rgba(30, 58, 138, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(96, 165, 250, 0.2)', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdCalendarToday style={{ color: '#93C5FD', fontSize: '20px' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>{formatDate(currentDateTime)}</p>
              <p style={{ fontSize: '13px', color: '#93C5FD', margin: 0, fontWeight: 500 }}>{formatDay(currentDateTime)}</p>
            </div>
          </div>
          <div className="dash-datetime-divider" style={{ width: '1px', height: '36px', background: 'rgba(147, 197, 253, 0.4)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(96, 165, 250, 0.2)', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdAccessTime style={{ color: '#93C5FD', fontSize: '20px' }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '1px' }}>
              {formatTime(currentDateTime)}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280', fontSize: '15px' }}>Loading dashboard...</div>
      ) : (
        <>
          {/* ── Row 1: 3 Cards in one line ── */}
          <div className="dash-top-row">
            {/* Total Announcements */}
            <div className="dash-card" style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #EEF2FF 100%)', border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="dash-card-label">Total Announcements</p>
                <div className="dash-card-icon" style={{ background: '#BFDBFE', color: '#1D4ED8' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
              </div>
              <p className="dash-card-value" style={{ color: '#1D4ED8' }}>{totalAnnouncements}</p>
              <p className="dash-card-sub">{publishedCount} Published, {draftCount} Drafts</p>
            </div>

            {/* Pending Requests */}
            <div className="dash-card" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '1px solid #FED7AA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="dash-card-label">Pending Requests</p>
                <div className="dash-card-icon" style={{ background: '#FED7AA', color: '#C2410C' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <p className="dash-card-value" style={{ color: '#C2410C' }}>{pendingItems.reduce((sum, i) => sum + i.pending + i.processing, 0)}</p>
              {pendingItems.length === 0 ? (
                <p className="dash-card-sub">No pending requests</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  {pendingItems.map((item, i) => (
                    <p key={i} className="dash-card-sub" onClick={() => navigate(item.route, { state: { filterStatus: item.statusLabel || 'Pending' } })}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}
                      onMouseEnter={(e) => { e.target.style.color = '#C2410C'; }}
                      onMouseLeave={(e) => { e.target.style.color = '#6b7280'; }}
                    >
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 700, color: '#C2410C' }}>{item.pending + item.processing}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Important Dates */}
            <div className="dash-card" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', border: '1px solid #C7D2FE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="dash-card-label">Upcoming Important Dates</p>
                <div className="dash-card-icon" style={{ background: '#C7D2FE', color: '#3B5EC2' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              <p className="dash-card-value" style={{ color: '#3B5EC2' }}>{upcomingDatesCount}</p>
              {upcomingDates.length === 0 ? (
                <p className="dash-card-sub">No upcoming dates</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  {upcomingDates.slice(0, 3).map((item) => (
                    <p key={item.id} className="dash-card-sub"
                      style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}
                      onMouseEnter={(e) => { e.target.style.color = '#3B5EC2'; }}
                      onMouseLeave={(e) => { e.target.style.color = '#6b7280'; }}
                    >
                      <span>{item.title}</span>
                      <span style={{ fontWeight: 600, color: '#3B5EC2', fontSize: '12px' }}>{new Date(item.announcementDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Row 2: 2 Cards ── */}
          <div className="dash-second-row">
            {/* Current Liturgical Season */}
            <div className="dash-season-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="dash-card-label">Current Liturgical Season</p>
                <div className="dash-card-icon" style={{ background: '#BBF7D0', color: '#166534' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
              </div>
              <p className="dash-season-name">{getCurrentSeason()}</p>
              <span className="dash-season-badge">Week: {getWeekRange()}</span>
            </div>

            {/* Upcoming Important Dates Count */}
            <div className="dash-card" style={{ background: '#CFFAFE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p className="dash-card-label">Upcoming Important Dates</p>
                <div className="dash-card-icon" style={{ background: '#A5F3FC', color: '#0E7490' }}>
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              <p className="dash-card-value" style={{ color: '#0E7490' }}>{upcomingDatesCount}</p>
              <p className="dash-card-sub">Published events coming up</p>
            </div>
          </div>

          {/* ── Row 3: 3 More Cards ── */}
          <div className="dash-top-row">
            {/* Today's Mass Intentions */}
            <div className="dash-card" style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)', border: '1px solid #FBCFE8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="dash-card-label">Today's Mass Intentions</p>
                <div className="dash-card-icon" style={{ background: '#FBCFE8', color: '#BE185D' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
              </div>
              <p className="dash-card-value" style={{ color: '#BE185D' }}>{todayMassCount}</p>
              <p className="dash-card-sub">Booked for today</p>
            </div>

            {/* Total Families */}
            <div className="dash-card" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="dash-card-label">Total Families</p>
                <div className="dash-card-icon" style={{ background: '#A7F3D0', color: '#047857' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
              </div>
              <p className="dash-card-value" style={{ color: '#047857' }}>{totalFamilies}</p>
              <p className="dash-card-sub">Registered families</p>
            </div>

            {/* This Month's Baptisms */}
            <div className="dash-card" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)', border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="dash-card-label">This Month's Baptisms</p>
                <div className="dash-card-icon" style={{ background: '#FDE68A', color: '#B45309' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
              </div>
              <p className="dash-card-value" style={{ color: '#B45309' }}>{monthBaptisms}</p>
              <p className="dash-card-sub">Baptisms this month</p>
            </div>
          </div>

          {/* ── Upcoming Announcements Cards ── */}
          <div className="dash-ann-wrapper">
            <h3 className="dash-ann-wrapper-title">Upcoming Announcements</h3>
            {recentAnnouncements.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: '14px' }}>No upcoming announcements.</p>
            ) : (
              <div className="dash-ann-cards-grid">
                {recentAnnouncements.map((ann) => {
                  const d = ann.announcementDate ? new Date(ann.announcementDate) : null;
                  return (
                    <div key={ann.id} className="dash-ann-card">
                      <div className="dash-ann-card-date-box">
                        <span className="dash-ann-card-day">{d ? d.getDate() : '--'}</span>
                        <span className="dash-ann-card-month">{d ? d.toLocaleDateString('en-US', { month: 'short' }) : ''}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="dash-ann-card-title">{ann.title}</p>
                        <p className="dash-ann-card-date">{formatAnnDate(ann.announcementDate)}</p>
                      </div>
                      <span className={`dash-status ${getStatusClass(ann.status)}`}>{ann.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
