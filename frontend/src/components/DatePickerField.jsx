import React from 'react';
import DatePicker from 'react-datepicker';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);
const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const getDaysInMonth = (month, year) => {
  if (!month) return 31;
  if ([1,3,5,7,8,10,12].includes(month)) return 31;
  if ([4,6,9,11].includes(month)) return 30;
  if (month === 2) {
    if (!year) return 29;
    return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
  }
  return 31;
};

const handleRawInput = (e) => {
  const nav = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
  if (nav.includes(e.key) || e.ctrlKey || e.metaKey) return;
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    return;
  }
  const digits = e.target.value.replace(/\D/g, '');
  const newDigit = e.key;
  const pos = digits.length; // position of the digit being typed (0-indexed)

  // Max 8 digits
  if (pos >= 8) { e.preventDefault(); return; }

  // Month validation (pos 4 = first digit, pos 5 = second digit)
  if (pos === 4 && parseInt(newDigit) > 1) { e.preventDefault(); return; }
  if (pos === 5) {
    const m = parseInt(digits[4] + newDigit);
    if (m < 1 || m > 12) { e.preventDefault(); return; }
  }

  // Day validation (pos 6 = first digit, pos 7 = second digit)
  if (pos === 6) {
    const month = parseInt(digits.slice(4, 6));
    const year = parseInt(digits.slice(0, 4));
    const maxDay = getDaysInMonth(month, year);
    if (parseInt(newDigit) > 3) { e.preventDefault(); return; }
    // If first digit is 3 but max days is < 30, block 3
    if (parseInt(newDigit) === 3 && maxDay < 30) { e.preventDefault(); return; }
  }
  if (pos === 7) {
    const month = parseInt(digits.slice(4, 6));
    const year = parseInt(digits.slice(0, 4));
    const maxDay = getDaysInMonth(month, year);
    const d = parseInt(digits[6] + newDigit);
    if (d < 1 || d > maxDay) { e.preventDefault(); return; }
  }
};

const handleRawChange = (e, showTime, name, onChange) => {
  let raw = e.target.value;
  if (!raw) {
    onChange(name, '');
    return;
  }
  // Strip everything except digits
  let digits = raw.replace(/\D/g, '');
  if (digits.length > 8) digits = digits.slice(0, 8);
  // Auto-format: add dashes after 4th and 6th digit
  let formatted = '';
  for (let i = 0; i < digits.length; i++) {
    if (i === 4 || i === 6) formatted += '-';
    formatted += digits[i];
  }
  e.target.value = formatted;
  // Only update state when we have a complete valid date
  if (digits.length === 8) {
    const y = parseInt(digits.slice(0, 4), 10);
    const m = parseInt(digits.slice(4, 6), 10);
    const d = parseInt(digits.slice(6, 8), 10);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1) {
      const maxDay = getDaysInMonth(m, y);
      if (d <= maxDay) {
        onChange(name, `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
      }
    }
  }
};

const DatePickerField = ({ name, value, onChange, showTime, hasError }) => {
  const parsed = value ? new Date(value) : null;
  const selected = parsed && !isNaN(parsed) ? parsed : null;

  const handleChange = (date) => {
    if (!date) {
      onChange(name, '');
      return;
    }
    if (showTime) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      onChange(name, `${y}-${m}-${d}T${h}:${min}`);
    } else {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      onChange(name, `${y}-${m}-${d}`);
    }
  };

  return (
    <div className="datepicker-wrapper">
      <DatePicker
        selected={selected}
        onChange={handleChange}
        onChangeRaw={(e) => handleRawChange(e, showTime, name, onChange)}
        onKeyDown={handleRawInput}
        dateFormat={showTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'}
        showTimeSelect={!!showTime}
        timeFormat="HH:mm"
        timeIntervals={15}
        className={`datepicker-input${hasError ? ' datepicker-error' : ''}`}
        placeholderText={showTime ? 'YYYY-MM-DD HH:MM' : 'YYYY-MM-DD'}
        isClearable
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
        }) => (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '4px 0' }}>
            <select
              value={date.getFullYear()}
              onChange={({ target: { value: v } }) => changeYear(Number(v))}
              style={{ padding: '2px 4px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13 }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={months[date.getMonth()]}
              onChange={({ target: { value: v } }) => changeMonth(months.indexOf(v))}
              style={{ padding: '2px 4px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13 }}
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}
      />
      <svg className="datepicker-calendar-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    </div>
  );
};

export default DatePickerField;
