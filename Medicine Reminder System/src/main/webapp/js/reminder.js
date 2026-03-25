// ===== Reminder Module (Connected to Java Backend) =====

let reminderInterval = null;
let activePopup = null;

// Start checking reminders every 60 seconds
function startReminders() {
  checkMissedReminders(); // check on startup
  checkLowStockEmails(); // check low stock startup
  checkReminders();
  reminderInterval = setInterval(checkReminders, 60000);
}

// Check low stock and send emails once per day
function checkLowStockEmails() {
  const medicines = typeof getMedicines === 'function' ? getMedicines() : [];
  const today = new Date().toDateString();
  const emailed = JSON.parse(localStorage.getItem('mrs_lowstock_emailed') || '{}');
  
  if (emailed.date !== today) {
    emailed.date = today;
    emailed.meds = [];
  }

  medicines.forEach(m => {
    const minStock = m.minStockAlert || 5;
    if (m.quantity <= minStock && m.quantity > 0) { // don't email forever if it's 0, maybe just once when it hits threshold
      if (!emailed.meds.includes(m.id)) {
        if (typeof sendEmailAlert === 'function') sendEmailAlert(m, 'LOW_STOCK');
        emailed.meds.push(m.id);
      }
    }
  });
  
  localStorage.setItem('mrs_lowstock_emailed', JSON.stringify(emailed));
}

// Check on load if any are missed and not taken
// Check on load if any are missed and not taken
// Check on load if any are missed and not taken
function checkMissedReminders() {
  const shown = JSON.parse(localStorage.getItem('mrs_shown_missed') || '{}');
  const today = new Date().toDateString();
  
  if (shown.date !== today) {
    shown.date = today;
    shown.meds = [];
  }

  const reminders = getTodayReminders();
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  
  const historyToday = typeof getHistory === 'function' ? getHistory().filter(h => {
    return new Date(h.takenAt).toDateString() === new Date().toDateString();
  }) : [];

  reminders.forEach(medicine => {
    const times = typeof medicine.times === 'string' ? medicine.times.split(',') : medicine.times;
    if (!times) return;

    times.forEach(time => {
      const [h, m] = time.trim().split(':');
      const medMins = parseInt(h) * 60 + parseInt(m);
      const isTaken = historyToday.some(h => h.medicineName === medicine.name);
      
      const reminderId = medicine.id + '_' + time.trim();
      
      if (!isTaken && nowMins > medMins && medicine.quantity > 0) {
        if (!shown.meds.includes(reminderId)) {
          showReminderPopup(medicine, time.trim());
          if (typeof sendEmailAlert === 'function') {
            sendEmailAlert(medicine, 'MISSED_DOSE', formatTime(time.trim()));
          }
          shown.meds.push(reminderId);
          localStorage.setItem('mrs_shown_missed', JSON.stringify(shown));
        }
      }
    });
  });
}

// Stop reminders
function stopReminders() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}

// Check if any medicine is due now
function checkReminders() {
  const shown = JSON.parse(localStorage.getItem('mrs_shown_missed') || '{}');
  const today = new Date().toDateString();
  
  if (shown.date !== today) {
    shown.date = today;
    shown.meds = [];
  }

  const reminders = getTodayReminders();
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  reminders.forEach(medicine => {
    const times = typeof medicine.times === 'string' ? medicine.times.split(',') : medicine.times;
    if (!times) return;

    times.forEach(time => {
      const trimmedTime = time.trim();
      const reminderId = medicine.id + '_' + trimmedTime;

      if (trimmedTime === currentTime && medicine.quantity > 0) {
        if (!shown.meds.includes(reminderId)) {
          showReminderPopup(medicine, trimmedTime);
          playAlertSound();
          sendBrowserNotification(medicine, trimmedTime);
          
          if (typeof sendEmailAlert === 'function') {
            sendEmailAlert(medicine, 'MISSED_DOSE', formatTime(trimmedTime));
          }
          
          shown.meds.push(reminderId);
          localStorage.setItem('mrs_shown_missed', JSON.stringify(shown));
        }
      }
    });
  });
}

// Format time for display
function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hr = parseInt(h);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const displayHr = hr % 12 || 12;
  return displayHr + ':' + m + ' ' + ampm;
}

// Show reminder popup modal
function showReminderPopup(medicine, time) {
  if (activePopup) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-icon">💊</div>
      <h2>Time for Your Medicine!</h2>
      <p>It's time to take your medication. Don't skip this dose.</p>
      <div class="med-details">
        <div class="detail-row">
          <span>Medicine</span>
          <span style="color: #1e293b; font-weight: 600;">${medicine.name}</span>
        </div>
        <div class="detail-row">
          <span>Dosage</span>
          <span style="color: #1e293b;">${medicine.dosage || 'As prescribed'}</span>
        </div>
        <div class="detail-row">
          <span>Scheduled Time</span>
          <span style="color: #0f766e; font-weight: 600;">${formatTime(time)}</span>
        </div>
        <div class="detail-row">
          <span>Remaining Stock</span>
          <span style="color: ${medicine.quantity <= 5 ? '#ef4444' : '#1e293b'};">${medicine.quantity} doses</span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-success" id="popup-btn-${medicine.id}" onclick="takeFromPopup('${medicine.id}', this)">Mark as Taken</button>
        <button class="btn btn-secondary" onclick="dismissPopup()">Snooze</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  activePopup = overlay;
}

// Take medicine from popup
async function takeFromPopup(medicineId, btnElement) {
  if (btnElement) {
    btnElement.disabled = true;
    btnElement.innerHTML = "Already Taken &#10003;";
    btnElement.style.backgroundColor = "#6c757d";
    btnElement.style.cursor = "not-allowed";
  }
  const medicines = getMedicines();
  const medicine = medicines.find(m => m.id == medicineId);
  if (medicine) {
    await addToHistory(medicine);
    showToast('Medicine Taken', medicine.name + ' marked as taken', 'success');
  }
  setTimeout(() => {
    dismissPopup();
    if (typeof loadDashboard === 'function') loadDashboard();
  }, 1000);
}

// Dismiss popup
function dismissPopup() {
  if (activePopup) {
    activePopup.remove();
    activePopup = null;
  }
}

// Play alert sound
function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    oscillator.start();
    setTimeout(() => { oscillator.stop(); audioCtx.close(); }, 500);
  } catch (e) {}
}

// Browser notification
function sendBrowserNotification(medicine, time) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('MedReminder', {
      body: 'Time to take ' + medicine.name + ' (' + (medicine.dosage || '') + ') at ' + formatTime(time),
      icon: '💊'
    });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

// Toast notification
function showToast(title, message, type) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'info');
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}
