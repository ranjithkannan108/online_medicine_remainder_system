// ===== Medicine Module (Connected to Java Backend) =====

const MED_API = '/api/medicines';
const MED_KEY = 'mrs_medicines';  // localStorage fallback

// ===== API Functions (Server) =====

async function fetchMedicinesFromServer() {
  try {
    const res = await fetch(MED_API);
    const data = await res.json();
    if (data.success) {
      // Cache locally
      localStorage.setItem(MED_KEY, JSON.stringify(data.medicines));
      return data.medicines;
    }
  } catch (e) {
    console.log('Server unavailable, using local data');
  }
  return null;
}

async function addMedicineToServer(medicine) {
  try {
    const formData = new URLSearchParams();
    formData.append('name', medicine.name);
    formData.append('dosage', medicine.dosage || '');
    formData.append('quantity', medicine.quantity || 0);
    formData.append('frequency', medicine.frequency || '');
    formData.append('startDate', medicine.startDate || '');
    formData.append('endDate', medicine.endDate || '');
    formData.append('times', medicine.times || '');
    formData.append('notes', medicine.notes || '');
    formData.append('minStockAlert', medicine.minStockAlert !== undefined && medicine.minStockAlert !== null ? medicine.minStockAlert : 5);

    const res = await fetch(MED_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.log('Server unavailable');
    return null;
  }
}

async function updateMedicineOnServer(medicine) {
  try {
    const formData = new URLSearchParams();
    formData.append('id', medicine.id);
    formData.append('name', medicine.name);
    formData.append('dosage', medicine.dosage || '');
    formData.append('quantity', medicine.quantity || 0);
    formData.append('frequency', medicine.frequency || '');
    formData.append('startDate', medicine.startDate || '');
    formData.append('endDate', medicine.endDate || '');
    formData.append('times', medicine.times || '');
    formData.append('notes', medicine.notes || '');
    formData.append('minStockAlert', medicine.minStockAlert !== undefined && medicine.minStockAlert !== null ? medicine.minStockAlert : 5);

    const res = await fetch(MED_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.log('Server unavailable');
    return null;
  }
}

async function deleteMedicineFromServer(id) {
  try {
    const res = await fetch(MED_API + '?id=' + id, { method: 'DELETE' });
    const data = await res.json();
    return data;
  } catch (e) {
    console.log('Server unavailable');
    return null;
  }
}

// ===== Local Storage Functions (Offline Fallback) =====

function getMedicines() {
  return JSON.parse(localStorage.getItem(MED_KEY) || '[]');
}

function getMedicineById(id) {
  return getMedicines().find(m => m.id == id);
}

function saveMedicines(medicines) {
  localStorage.setItem(MED_KEY, JSON.stringify(medicines));
}

// Add medicine — tries server first, falls back to local
async function addMedicine(medicine) {
  const serverResult = await addMedicineToServer(medicine);
  if (serverResult && serverResult.success) {
    medicine.id = serverResult.id;
  } else {
    // Offline: generate local ID
    medicine.id = medicine.id || Date.now().toString();
  }

  // Always save locally too
  const medicines = getMedicines();
  medicines.push(medicine);
  saveMedicines(medicines);
  
  await addToHistory(medicine, '', 'Added');
  
  return medicine;
}

// Update medicine — tries server first, falls back to local
async function updateMedicine(id, updates) {
  updates.id = id;
  await updateMedicineOnServer(updates);

  // Update locally
  const medicines = getMedicines();
  const idx = medicines.findIndex(m => m.id == id);
  if (idx !== -1) {
    medicines[idx] = { ...medicines[idx], ...updates };
    saveMedicines(medicines);
    
    await addToHistory(medicines[idx], '', 'Updated');
    
    return medicines[idx];
  }
  return null;
}

// Delete medicine — tries server first, falls back to local
async function deleteMedicine(id) {
  const medicines = getMedicines();
  const med = medicines.find(m => m.id == id);

  await deleteMedicineFromServer(id);

  // Delete locally
  const filtered = medicines.filter(m => m.id != id);
  saveMedicines(filtered);
  
  if (med) {
    await addToHistory(med, '', 'Deleted');
  }
  
  return true;
}

// Get today's reminders
function getTodayReminders() {
  const medicines = getMedicines();
  const today = new Date().toISOString().split('T')[0];

  return medicines.filter(med => {
    if (med.startDate && today < med.startDate) return false;
    if (med.endDate && today > med.endDate) return false;
    return med.times && med.times.length > 0;
  });
}

// History functions
const HISTORY_KEY = 'mrs_history';
const HISTORY_API = '/api/history';

function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

async function addToHistory(medicine, scheduledTime = '', actionType = 'Taken') {
  // Try server
  try {
    const formData = new URLSearchParams();
    formData.append('medicineId', medicine.id);
    formData.append('medicineName', medicine.name);
    formData.append('dosage', medicine.dosage || '');
    formData.append('actionType', actionType);
    if (scheduledTime) formData.append('scheduledTime', scheduledTime);
    await fetch(HISTORY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
  } catch (e) {
    console.log('Server unavailable for history');
  }

  // Save locally too
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    medicineName: medicine.name,
    dosage: medicine.dosage,
    actionType: actionType,
    scheduledTime: scheduledTime,
    takenAt: new Date().toISOString()
  });
  saveHistory(history);

  // Reduce local quantity only if action is literally "Taken"
  if (actionType === 'Taken') {
    const medicines = getMedicines();
    const med = medicines.find(m => m.id == medicine.id);
    if (med && med.quantity > 0) {
      med.quantity--;
      saveMedicines(medicines);
    }
  }
}

async function clearHistory() {
  try {
    await fetch(HISTORY_API, { method: 'DELETE' });
  } catch (e) {
    console.log('Server unavailable');
  }
  localStorage.removeItem(HISTORY_KEY);
}

// Sync from server on load
async function syncFromServer() {
  const serverMedicines = await fetchMedicinesFromServer();
  if (serverMedicines) {
    console.log('Synced medicines from server');
  }

  try {
    const res = await fetch(HISTORY_API);
    const data = await res.json();
    if (data.success) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
      console.log('Synced history from server');
    }
  } catch (e) {
    console.log('History sync: server unavailable');
  }
}

// Get low stock medicines
function getLowStockMedicines() {
  return getMedicines().filter(m => m.quantity > 0 && m.quantity <= (m.minStockAlert !== undefined ? m.minStockAlert : 5));
}

// Get out of stock medicines
function getOutOfStockMedicines() {
  return getMedicines().filter(m => m.quantity === 0);
}

// ===== Calendar File Generation (Offline Support) =====
function downloadICS(medicineName, timeStr, dosage) {
  // timeStr format expected: "HH:MM" (e.g. "08:00")
  const now = new Date();
  const [hours, minutes] = timeStr.split(':');
  
  // Create Date object for the reminder time today
  const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes), 0);
  
  // Format dates for ICS: YYYYMMDDTHHMMSS
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startDTS = formatICSDate(reminderDate);
  // Default end time to 15 minutes after start
  const endDate = new Date(reminderDate.getTime() + 15 * 60000); 
  const endDTS = formatICSDate(endDate);

  const dosageStr = dosage ? dosage : 'prescribed dosage';
  const icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MedReminder//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@medreminder.local`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${startDTS}`,
    `DTEND:${endDTS}`,
    `SUMMARY:Medicine Reminder: ${medicineName}`,
    `DESCRIPTION:It is time to take your ${medicineName} (${dosageStr}).`,
    "BEGIN:VALARM",
    "TRIGGER:-PT0M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${medicineName}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\\r\\n");

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `MedReminder_${medicineName.replace(/\\s+/g, '_')}_${timeStr.replace(':', '')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
