// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarToggleDesktop = document.getElementById('sidebar-toggle-desktop');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle sidebar on mobile
if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

// Toggle sidebar on desktop
if (sidebarToggleDesktop) {
  sidebarToggleDesktop.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    
    // Update toggle icon
    const icon = sidebarToggleDesktop.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
      icon.classList.remove('bi-list');
      icon.classList.add('bi-list-nested');
    } else {
      icon.classList.remove('bi-list-nested');
      icon.classList.add('bi-list');
    }
  });
}

// Handle navigation item clicks
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // For demonstration purposes - prevents actual navigation
    if (link.getAttribute('href').startsWith('#')) {
      e.preventDefault();
      
      // Remove active class from all nav items
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Add active class to clicked nav item
      link.closest('.nav-item').classList.add('active');
      
      // Update page title based on clicked link
      const linkText = link.querySelector('span').textContent;
      document.querySelector('.page-title').textContent = linkText;
      
      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
      }
    }
  });
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

// Responsive adjustments on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('collapsed');
  }
});

// Initialize buttons and other interactive elements
document.querySelectorAll('.btn-respond, .btn-reschedule, .btn-cancel, .btn-schedule').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // This would be where you'd handle the button clicks
    // For demo purposes we'll just show an alert
    alert(`${e.target.textContent} button clicked!`);
  });
});

// Initialize notifications
document.querySelector('.notifications').addEventListener('click', () => {
  alert('Notifications clicked! This would show your notification panel.');
});

// Initialize user profile
document.querySelector('.user-profile').addEventListener('click', () => {
  alert('Profile clicked! This would show your user profile menu.');
});

// Sample data handling function - modular setup for future React integration
const dataService = {
  getUserStats: () => {
    // In a real app, this would fetch from an API
    return {
      bloodType: 'O+',
      lastDonation: '15 days ago',
      totalDonations: 12,
      nextEligible: '45 days'
    };
  },
  
  getAppointments: () => {
    // Placeholder for appointment data
    return [
      {
        date: '2023-10-25',
        time: '10:30 AM - 11:30 AM',
        location: 'Central Blood Bank, 123 Health St.'
      }
    ];
  }
};

// This function would update the UI with real data
// Structured this way to make future React migration easier
function updateDashboardData() {
  // This could be expanded to update all dynamic content
  // For now it's just a placeholder to show the pattern
  const userStats = dataService.getUserStats();
  
  // Example of updating content - commented out since we're using static data for demo
  // document.querySelector('.bloodType .stat-value').textContent = userStats.bloodType;
}

// Call this once on page load
// updateDashboardData();
