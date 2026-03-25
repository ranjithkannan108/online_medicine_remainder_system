// ===== Auth Module (Connected to Java Backend) =====

const API_BASE = '';  // Same origin when deployed to servlet container

// Login — calls POST /api/login
async function login(username, password) {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(API_BASE + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      // Store session info locally for UI display
      localStorage.setItem('mrs_auth', JSON.stringify({
        username: data.username,
        name: data.name,
        loggedIn: true
      }));
      return { success: true };
    } else {
      return { success: false, message: data.message || 'Invalid username or password' };
    }
  } catch (error) {
    console.error('Login error:', error);
    // Fallback to offline mode
    return loginOffline(username, password);
  }
}

// Offline login fallback (when server not running)
function loginOffline(username, password) {
  initUsersOffline();
  const users = JSON.parse(localStorage.getItem('mrs_users') || '[]');
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem('mrs_auth', JSON.stringify({
      username: user.username,
      name: user.name,
      loggedIn: true
    }));
    return { success: true };
  }
  return { success: false, message: 'Invalid username or password' };
}

// Register — calls POST /api/register
async function register(username, name, password) {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('name', name);
    formData.append('password', password);

    const res = await fetch(API_BASE + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Register error:', error);
    // Fallback to offline mode
    return registerOffline(username, name, password);
  }
}

// Offline register fallback
function registerOffline(username, name, password) {
  initUsersOffline();
  const users = JSON.parse(localStorage.getItem('mrs_users') || '[]');
  
  if (users.find(u => u.username === username)) {
    return { success: false, message: 'Username already exists' };
  }
  
  users.push({ username, name, password });
  localStorage.setItem('mrs_users', JSON.stringify(users));
  return { success: true, message: 'Registration successful' };
}

function initUsersOffline() {
  if (!localStorage.getItem('mrs_users')) {
    localStorage.setItem('mrs_users', JSON.stringify([
      { username: 'admin', password: '123', name: 'Admin User' }
    ]));
  }
}

// Check if logged in
function isLoggedIn() {
  const session = JSON.parse(localStorage.getItem('mrs_auth') || '{}');
  return session.loggedIn === true;
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('mrs_auth') || '{}');
}

// Logout — calls GET /api/logout
async function logout() {
  try {
    await fetch(API_BASE + '/api/logout');
  } catch (e) {
    // Server might not be running, continue with local logout
  }
  localStorage.removeItem('mrs_auth');
  window.location.href = 'login.html';
}

// Protect pages
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Redirect if already logged in
function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }
}

// Init offline users on load
initUsersOffline();
