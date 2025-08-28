// Enhanced Fuel Pricing Optimization Platform JavaScript

// Application state and data from JSON
const appData = {
  "users": [
    {
      "id": "admin-001",
      "username": "admin@fuelco.com",
      "role": "admin",
      "name": "Rajesh Kumar",
      "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      "permissions": ["all"],
      "lastLogin": "2025-08-28T15:30:00Z"
    },
    {
      "id": "manager-001", 
      "username": "manager@station1.com",
      "role": "station_manager",
      "name": "Priya Sharma",
      "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b547?w=150",
      "stationId": "station-001",
      "permissions": ["station_management"],
      "lastLogin": "2025-08-28T14:45:00Z"
    }
  ]
};

// Application state
let currentUser = null;
let currentPage = 'admin';
let charts = {};
let notifications = [];
let isDarkMode = false;

// Initialize application - wait for DOM to be fully loaded
(function() {
  console.log('Script loading...');
  
  function initApp() {
    console.log('DOM ready, initializing FuelCo Platform...');
    
    try {
      setupEventListeners();
      checkTheme();
      showLoginScreen();
      
      // Test toast system
      setTimeout(() => {
        createToast('Welcome to FuelCo Platform! Use demo accounts to login.', 'info');
      }, 1000);
      
      console.log('FuelCo Platform initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  try {
    // Wait a moment for elements to be available
    setTimeout(() => {
      setupLoginListeners();
      setupThemeToggle();
      setupNavigationListeners();
    }, 100);
    
  } catch (error) {
    console.error('Error setting up listeners:', error);
  }
}

function setupLoginListeners() {
  console.log('Setting up login listeners...');
  
  // Login button
  const loginBtn = document.getElementById('login-btn');
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');
  
  console.log('Login elements:', {
    loginBtn: !!loginBtn,
    loginUsername: !!loginUsername,
    loginPassword: !!loginPassword
  });
  
  if (loginBtn) {
    // Remove any existing listeners first
    loginBtn.replaceWith(loginBtn.cloneNode(true));
    const newLoginBtn = document.getElementById('login-btn');
    
    newLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login button clicked!');
      handleLogin();
    });
    
    console.log('Login button listener attached successfully');
  } else {
    console.error('Login button not found!');
  }
  
  // Enter key support
  if (loginUsername && loginPassword) {
    [loginUsername, loginPassword].forEach((input, index) => {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          console.log('Enter pressed in input', index);
          handleLogin();
        }
      });
      
      // Fix focus issues
      input.addEventListener('click', function() {
        this.focus();
      });
    });
    
    console.log('Input listeners attached successfully');
  } else {
    console.error('Login inputs not found!');
  }
  
  // Demo buttons
  setupDemoButtons();
}

function setupDemoButtons() {
  console.log('Setting up demo buttons...');
  
  const demoBtns = document.querySelectorAll('.demo-btn');
  console.log('Found demo buttons:', demoBtns.length);
  
  demoBtns.forEach((btn, index) => {
    // Clone button to remove existing listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const role = this.dataset.role;
      console.log('Demo button clicked for role:', role);
      
      const loginUsername = document.getElementById('login-username');
      const loginPassword = document.getElementById('login-password');
      
      if (!loginUsername || !loginPassword) {
        console.error('Login fields not found for demo button');
        return;
      }
      
      let user;
      if (role === 'admin') {
        user = appData.users.find(u => u.role === 'admin');
      } else if (role === 'manager') {
        user = appData.users.find(u => u.role === 'station_manager');
      }
      
      if (user) {
        loginUsername.value = user.username;
        loginPassword.value = 'demo123';
        
        // Focus the fields to ensure they're interactive
        loginUsername.focus();
        loginPassword.focus();
        loginUsername.focus(); // Return focus to username
        
        console.log('Demo credentials filled:', user.username);
        createToast(`Demo credentials filled for ${user.name}`, 'success');
      } else {
        console.error('User not found for role:', role);
      }
    });
    
    console.log(`Demo button ${index + 1} (${btn.dataset.role}) listener attached`);
  });
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTheme();
    });
    console.log('Theme toggle listener attached');
  }
}

function setupNavigationListeners() {
  console.log('Setting up navigation listeners...');
  
  const navTabs = document.querySelectorAll('.nav-tab');
  console.log('Found nav tabs:', navTabs.length);
  
  navTabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.dataset.page;
      console.log('Navigation clicked:', page);
      
      if (currentUser && page && hasPermission(page)) {
        showPage(page);
      } else if (!currentUser) {
        createToast('Please login first', 'warning');
      } else {
        createToast('Access denied to this section', 'error');
      }
    });
  });
}

function handleLogin() {
  console.log('=== HANDLING LOGIN ===');
  
  const usernameField = document.getElementById('login-username');
  const passwordField = document.getElementById('login-password');
  const loginBtn = document.getElementById('login-btn');
  
  if (!usernameField || !passwordField) {
    console.error('Login form fields not found!');
    createToast('Login form error. Please refresh the page.', 'error');
    return;
  }
  
  const username = usernameField.value.trim();
  const password = passwordField.value.trim();
  
  console.log('Login attempt:', {
    username: username,
    passwordLength: password.length,
    hasUsername: !!username,
    hasPassword: !!password
  });
  
  if (!username || !password) {
    createToast('Please enter both username and password', 'error');
    return;
  }
  
  // Show loading state
  if (loginBtn) {
    loginBtn.textContent = 'Signing In...';
    loginBtn.disabled = true;
  }
  
  // Find user
  const user = appData.users.find(u => u.username === username);
  console.log('User lookup result:', user ? `Found: ${user.name}` : 'Not found');
  
  // Simulate slight delay for better UX
  setTimeout(() => {
    if (user && password === 'demo123') {
      console.log('=== LOGIN SUCCESS ===');
      currentUser = user;
      
      // Update UI with user info
      const userNameElement = document.getElementById('user-name');
      const userAvatarElement = document.getElementById('user-avatar');
      
      if (userNameElement) userNameElement.textContent = user.name;
      if (userAvatarElement) userAvatarElement.src = user.avatar;
      
      // Hide login screen and show main app
      const loginScreen = document.getElementById('login-screen');
      const appContainer = document.getElementById('app-container');
      
      if (loginScreen) {
        loginScreen.classList.add('hidden');
        console.log('Login screen hidden');
      }
      if (appContainer) {
        appContainer.classList.remove('hidden');
        console.log('App container shown');
      }
      
      // Setup navigation based on role
      setupRoleBasedNavigation();
      
      // Setup post-login event listeners
      setupPostLoginListeners();
      
      // Show default page
      const defaultPage = user.role === 'admin' ? 'admin' : 'station';
      console.log('Showing default page:', defaultPage);
      showPage(defaultPage);
      
      createToast(`Welcome back, ${user.name}!`, 'success');
      
      // Start real-time updates
      startRealTimeUpdates();
      
    } else {
      console.log('=== LOGIN FAILED ===');
      createToast('Invalid credentials. Use demo accounts or password: demo123', 'error');
    }
    
    // Reset login button
    if (loginBtn) {
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
  }, 500);
}

function setupPostLoginListeners() {
  console.log('Setting up post-login listeners...');
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
    console.log('Logout button listener attached');
  }
  
  // Station selector
  const stationSelect = document.getElementById('station-select');
  if (stationSelect) {
    stationSelect.addEventListener('change', handleStationChange);
  }
  
  // Advanced simulation button
  const advancedSimBtn = document.getElementById('run-advanced-simulation');
  if (advancedSimBtn) {
    advancedSimBtn.addEventListener('click', function(e) {
      e.preventDefault();
      runAdvancedSimulation();
    });
  }
  
  // Setup other interactive elements
  setTimeout(() => {
    setupAlertActions();
    setupReportActions();
    setupRecommendationActions();
  }, 100);
}

function setupRoleBasedNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  
  navTabs.forEach(tab => {
    const page = tab.dataset.page;
    if (hasPermission(page)) {
      tab.style.display = 'block';
      tab.style.opacity = '1';
    } else {
      tab.style.display = 'none';
    }
  });
  
  console.log('Role-based navigation configured for:', currentUser.role);
}

function hasPermission(page) {
  if (!currentUser) return false;
  if (currentUser.permissions.includes('all')) return true;
  
  const pagePermissions = {
    'admin': ['all'],
    'station': ['all', 'station_management'],
    'analytics': ['all', 'station_management'],
    'alerts': ['all', 'station_management'],
    'inventory': ['all', 'station_management'],
    'reports': ['all', 'station_management'],
    'simulation': ['all']
  };
  
  const required = pagePermissions[page] || [];
  return required.some(perm => currentUser.permissions.includes(perm));
}

function handleLogout() {
  console.log('Logging out...');
  
  currentUser = null;
  
  // Clear charts
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  charts = {};
  
  // Show login screen
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (appContainer) appContainer.classList.add('hidden');
  
  // Clear forms
  const usernameField = document.getElementById('login-username');
  const passwordField = document.getElementById('login-password');
  
  if (usernameField) usernameField.value = '';
  if (passwordField) passwordField.value = '';
  
  createToast('You have been logged out', 'info');
}

function showLoginScreen() {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (appContainer) appContainer.classList.add('hidden');
}

function showPage(pageName) {
  console.log('Showing page:', pageName);
  
  // Hide all pages
  const pages = document.querySelectorAll('.page-content');
  pages.forEach(page => {
    page.classList.remove('active');
  });
  
  // Remove active class from all tabs
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  // Show target page
  const targetPage = document.getElementById(`${pageName}-page`);
  const targetTab = document.querySelector(`[data-page="${pageName}"]`);
  
  if (targetPage) {
    targetPage.classList.add('active');
    targetPage.classList.add('animate-in');
    console.log('Page shown:', pageName);
  } else {
    console.error('Target page not found:', pageName);
  }
  
  if (targetTab) {
    targetTab.classList.add('active');
    console.log('Tab activated:', pageName);
  }
  
  currentPage = pageName;
  
  // Initialize page-specific content
  setTimeout(() => {
    initializePage(pageName);
  }, 100);
  
  createToast(`Switched to ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} page`, 'info');
}

function initializePage(pageName) {
  console.log('Initializing page:', pageName);
  
  try {
    switch (pageName) {
      case 'admin':
        initializeAdminDashboard();
        break;
      case 'station':
        initializeStationDashboard();
        break;
      case 'analytics':
        initializeAnalytics();
        break;
      case 'alerts':
        initializeAlerts();
        break;
      case 'inventory':
        initializeInventory();
        break;
      case 'reports':
        initializeReports();
        break;
      case 'simulation':
        initializeSimulation();
        break;
    }
  } catch (error) {
    console.error('Error initializing page:', pageName, error);
  }
}

function initializeAdminDashboard() {
  console.log('Initializing Admin Dashboard...');
  createRevenueChart();
  createRegionalChart();
}

function initializeStationDashboard() {
  console.log('Initializing Station Dashboard...');
  createStationProfitChart();
}

function initializeAnalytics() {
  console.log('Initializing Analytics...');
  createDemandForecastChart();
}

function initializeAlerts() {
  console.log('Initializing Alerts...');
  setupAlertActions();
}

function initializeInventory() {
  console.log('Initializing Inventory...');
}

function initializeReports() {
  console.log('Initializing Reports...');
  setupReportActions();
}

function initializeSimulation() {
  console.log('Initializing Simulation...');
}

// Chart creation functions
function createRevenueChart() {
  const ctx = document.getElementById('revenue-chart');
  if (!ctx) {
    console.log('Revenue chart canvas not found');
    return;
  }
  
  if (charts.revenueChart) {
    charts.revenueChart.destroy();
  }
  
  const data = [2.1, 2.3, 2.0, 2.5, 2.4, 2.2, 2.8];
  
  try {
    charts.revenueChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Revenue (₹ Crores)',
          data: data,
          borderColor: '#1FB8CD',
          backgroundColor: '#1FB8CD20',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1FB8CD',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue (₹ Crores)'
            }
          }
        }
      }
    });
    
    console.log('Revenue chart created successfully');
    createToast('Revenue chart loaded', 'success');
  } catch (error) {
    console.error('Error creating revenue chart:', error);
  }
}

function createRegionalChart() {
  const ctx = document.getElementById('regional-chart');
  if (!ctx) {
    console.log('Regional chart canvas not found');
    return;
  }
  
  if (charts.regionalChart) {
    charts.regionalChart.destroy();
  }
  
  try {
    charts.regionalChart = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
        datasets: [{
          label: 'Performance Score',
          data: [92, 88, 94, 86, 83],
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
          borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Performance Score'
            }
          }
        }
      }
    });
    
    console.log('Regional chart created successfully');
    createToast('Regional chart loaded', 'success');
  } catch (error) {
    console.error('Error creating regional chart:', error);
  }
}

function createStationProfitChart() {
  const ctx = document.getElementById('station-profit-chart');
  if (!ctx) {
    console.log('Station profit chart canvas not found');
    return;
  }
  
  if (charts.stationProfitChart) {
    charts.stationProfitChart.destroy();
  }
  
  const pricePoints = [104, 105, 106, 107, 108, 109, 110];
  const profitPoints = [8000, 10000, 11500, 12500, 13000, 12800, 12200];
  
  try {
    charts.stationProfitChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: pricePoints.map(p => `₹${p}`),
        datasets: [{
          label: 'Expected Profit (₹)',
          data: profitPoints,
          borderColor: '#1FB8CD',
          backgroundColor: '#1FB8CD20',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1FB8CD',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Price per Liter'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Expected Profit (₹)'
            }
          }
        }
      }
    });
    
    console.log('Station profit chart created successfully');
    createToast('Profit chart loaded', 'success');
  } catch (error) {
    console.error('Error creating station profit chart:', error);
  }
}

function createDemandForecastChart() {
  const ctx = document.getElementById('demand-forecast-chart');
  if (!ctx) {
    console.log('Demand forecast chart canvas not found');
    return;
  }
  
  if (charts.demandForecastChart) {
    charts.demandForecastChart.destroy();
  }
  
  const forecastData = [2450, 2520, 2380, 2650, 2480, 2300, 2420];
  
  try {
    charts.demandForecastChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Today', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        datasets: [
          {
            label: 'Predicted Demand',
            data: forecastData,
            borderColor: '#1FB8CD',
            backgroundColor: '#1FB8CD20',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Confidence Interval',
            data: forecastData.map(v => v * 1.1),
            borderColor: '#FFC185',
            backgroundColor: '#FFC18520',
            tension: 0.4,
            fill: false,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Demand (Liters)'
            }
          }
        }
      }
    });
    
    console.log('Demand forecast chart created successfully');
    createToast('Forecast chart loaded', 'success');
  } catch (error) {
    console.error('Error creating demand forecast chart:', error);
  }
}

// Interactive features
function setupAlertActions() {
  const alertItems = document.querySelectorAll('.alert-item');
  
  alertItems.forEach(item => {
    const acknowledgeBtn = item.querySelector('.btn--outline');
    const investigateBtn = item.querySelector('.btn--primary');
    
    if (acknowledgeBtn && !acknowledgeBtn.hasAttribute('data-listener')) {
      acknowledgeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        item.classList.add('acknowledged');
        this.textContent = 'Acknowledged';
        this.disabled = true;
        createToast('Alert acknowledged', 'success');
      });
      acknowledgeBtn.setAttribute('data-listener', 'true');
    }
    
    if (investigateBtn && !investigateBtn.hasAttribute('data-listener')) {
      investigateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        createToast('Investigation initiated', 'info');
      });
      investigateBtn.setAttribute('data-listener', 'true');
    }
  });
}

function setupReportActions() {
  const reportBtns = document.querySelectorAll('.report-actions .btn, .export-options .btn');
  
  reportBtns.forEach(btn => {
    if (!btn.hasAttribute('data-listener')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const action = this.textContent.trim();
        createToast(`${action} initiated`, 'info');
      });
      btn.setAttribute('data-listener', 'true');
    }
  });
}

function setupRecommendationActions() {
  const applyBtn = document.querySelector('.recommendation-actions .btn--primary');
  const scheduleBtn = document.querySelector('.recommendation-actions .btn--outline');
  
  if (applyBtn && !applyBtn.hasAttribute('data-listener')) {
    applyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      createToast('Price applied successfully!', 'success');
    });
    applyBtn.setAttribute('data-listener', 'true');
  }
  
  if (scheduleBtn && !scheduleBtn.hasAttribute('data-listener')) {
    scheduleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      createToast('Price scheduled for tomorrow', 'info');
    });
    scheduleBtn.setAttribute('data-listener', 'true');
  }
}

function handleStationChange() {
  const stationSelect = document.getElementById('station-select');
  if (!stationSelect) return;
  
  createToast('Station data updated', 'info');
  
  setTimeout(() => {
    createStationProfitChart();
  }, 100);
}

function runAdvancedSimulation() {
  const button = document.getElementById('run-advanced-simulation');
  const resultsSection = document.getElementById('advanced-simulation-results');
  
  if (!button) return;
  
  button.textContent = 'Running Simulation...';
  button.disabled = true;
  
  createToast('Starting advanced Monte Carlo simulation...', 'info');
  
  setTimeout(() => {
    if (resultsSection) {
      resultsSection.style.display = 'block';
      resultsSection.scrollIntoView({ behavior: 'smooth' });
      
      createSimulationChart();
    }
    
    button.textContent = 'Run Advanced Simulation';
    button.disabled = false;
    
    createToast('Simulation completed successfully!', 'success');
  }, 3000);
}

function createSimulationChart() {
  const ctx = document.getElementById('simulation-results-chart');
  if (!ctx) return;
  
  if (charts.simulationChart) {
    charts.simulationChart.destroy();
  }
  
  const pricePoints = [];
  const frequencies = [];
  
  for (let price = 105; price <= 109; price += 0.1) {
    pricePoints.push(price.toFixed(1));
    const x = (price - 106.8) / 0.8;
    const freq = Math.exp(-0.5 * x * x) * 100;
    frequencies.push(Math.round(freq));
  }
  
  try {
    charts.simulationChart = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: pricePoints,
        datasets: [{
          label: 'Frequency',
          data: frequencies,
          backgroundColor: '#1FB8CD',
          borderColor: '#1FB8CD',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Optimal Price Distribution (Monte Carlo)'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Price (₹/L)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Frequency'
            }
          }
        }
      }
    });
    
    console.log('Simulation chart created successfully');
  } catch (error) {
    console.error('Error creating simulation chart:', error);
  }
}

// Theme management
function checkTheme() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (prefersDark) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
}

function toggleTheme() {
  if (isDarkMode) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
}

function enableDarkMode() {
  document.documentElement.setAttribute('data-color-scheme', 'dark');
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.textContent = '☀️';
  isDarkMode = true;
  createToast('Dark mode enabled', 'info');
  console.log('Dark mode enabled');
}

function disableDarkMode() {
  document.documentElement.setAttribute('data-color-scheme', 'light');
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.textContent = '🌙';
  isDarkMode = false;
  createToast('Light mode enabled', 'info');
  console.log('Light mode enabled');
}

// Toast notification system
function createToast(message, type = 'info') {
  console.log(`Toast: ${type.toUpperCase()} - ${message}`);
  
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">${icons[type] || icons.info}</span>
      <span>${message}</span>
    </div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
  
  toast.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  });
}

// Real-time updates simulation
function startRealTimeUpdates() {
  console.log('Starting real-time updates...');
  
  // Periodic updates
  setInterval(() => {
    if (Math.random() < 0.3) {
      const updates = [
        'Price recommendation updated',
        'Market data refreshed',
        'Competitor analysis updated'
      ];
      const update = updates[Math.floor(Math.random() * updates.length)];
      createToast(update, 'info');
    }
  }, 30000);
}

// Error handling
window.addEventListener('error', function(e) {
  console.error('Application error:', e.error);
  createToast('An error occurred. Check console for details.', 'error');
});

// Responsive behavior
window.addEventListener('resize', function() {
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.resize === 'function') {
      chart.resize();
    }
  });
});

console.log('FuelCo Platform JavaScript fully loaded and ready!');