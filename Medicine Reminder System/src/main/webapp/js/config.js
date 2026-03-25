// --- EMAILJS CONFIGURATION ---
// PASTE YOUR EMAILJS KEYS HERE!
// You can find these keys strictly in your emailjs.com dashboard.

const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';

// Initialize EmailJS when this file loads
if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}
