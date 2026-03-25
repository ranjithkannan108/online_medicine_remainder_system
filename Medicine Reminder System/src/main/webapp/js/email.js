// --- EMAILJS ALERT LOGIC ---

/**
 * Sends an automated email alert using EmailJS
 * @param {Object} medicine - The medicine object
 * @param {String} alertType - 'MISSED_DOSE' or 'LOW_STOCK'
 * @param {String} extraInfo - Additional info like the missed time
 */
function sendEmailAlert(medicine, alertType, extraInfo = '') {
  // Check if keys are actually pasted in config.js
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY_HERE') {
    console.log('Skipping email alert: EmailJS keys not configured yet.');
    return;
  }

  const user = getCurrentUser();
  const userName = user ? (user.name || user.username) : 'User';

  let subject = '';
  let message = '';

  if (alertType === 'MISSED_DOSE') {
    subject = `Missed Medicine: ${medicine.name}`;
    message = `Hi ${userName},\n\nYou missed your scheduled dose of ${medicine.name} (${medicine.dosage}) at ${extraInfo}.\n\nPlease check your Medicine Reminder Dashboard.`;
  } else if (alertType === 'LOW_STOCK') {
    subject = `Low Stock Alert: ${medicine.name}`;
    message = `Hi ${userName},\n\nYou are running low on ${medicine.name}.\n\nYou currently have exactly ${medicine.quantity} doses remaining. Please order a refill soon!`;
  } else {
    return;
  }

  // Define template parameters exactly as expected by EmailJS template
  const templateParams = {
    to_name: userName,
    subject: subject,
    message: message,
    medicine_name: medicine.name
  };

  // Trigger EmailJS!
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(function(response) {
       console.log('EMAIL SENT SUCCESSFULLY!', response.status, response.text);
    }, function(error) {
       console.log('FAILED TO SEND EMAIL:', error);
    });
}
