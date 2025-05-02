const navLinks = document.querySelectorAll('.nav-link');

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await AuthService.checkAuth();
        if (!user) {
            throw new Error('Not authenticated');
        }

        // Initialize everything only after authentication is successful
        initializeNavigation();
        populateUserProfile(user);
        await loadDashboardData(user.id);
    } catch (error) {
        console.error('Auth check failed:', error);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }
});

// Initialize navigation and sidebar functionality
function initializeNavigation() {
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarToggleDesktop = document.getElementById('sidebar-toggle-desktop');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar?.classList.toggle('collapsed');
        });
    }

    if (sidebarToggleDesktop) {
        sidebarToggleDesktop.addEventListener('click', () => {
            sidebar?.classList.toggle('collapsed');
        });
    }

    // Navigation link handling
    document.querySelectorAll('.nav-item .nav-link').forEach(link => {
        if (!link) return;
        
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked nav item
                const navItem = link.closest('.nav-item');
                if (navItem) {
                    navItem.classList.add('active');
                }
                
                // Update page title
                const span = link.querySelector('span');
                const pageTitle = document.querySelector('.page-title');
                if (span && pageTitle) {
                    pageTitle.textContent = span.textContent;
                }
            }
        });
    });

    // Action buttons
    document.querySelectorAll('.btn-respond, .btn-reschedule, .btn-cancel, .btn-schedule').forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert(`${e.target.textContent} button clicked!`);
        });
    });
}

// Populate user profile information
function populateUserProfile(user) {
    if (!user) return;

    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = 'Dashboard';
    }
}

// Load dashboard data from API
async function loadDashboardData(userId) {
    if (!userId) return;

    try {
        // First get the user's profile to get their donor information
        const profileResponse = await fetch('/api/donors/me/profile', { 
            credentials: 'include' 
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to load profile data');
        }

        const profile = await profileResponse.json();
        userId = profile.id; // Get the correct user ID from profile

        const [statsResponse, appointmentsResponse] = await Promise.all([
            fetch(`/api/donors/${userId}/stats`, { credentials: 'include' }),
            fetch(`/api/appointments/me`, { credentials: 'include' })
        ]);

        if (!statsResponse.ok || !appointmentsResponse.ok) {
            throw new Error('Failed to load dashboard data');
        }

        const stats = await statsResponse.json();
        const appointments = await appointmentsResponse.json();

        // Format the last donation date
        const lastDonationText = stats.lastDonationDate ? 
            formatLastDonationDate(new Date(stats.lastDonationDate)) : 'Never';

        // Format next eligible date
        const nextEligibleText = calculateNextEligible(stats.lastDonationDate);

        const formattedStats = {
            bloodType: stats.bloodType || 'N/A',
            lastDonationText: lastDonationText,
            totalDonations: stats.totalDonations || 0,
            nextEligibleText: nextEligibleText
        };

        updateDashboardStats(formattedStats);
        updateAppointmentInfo(appointments);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        useSampleData();
    }
}

// Format last donation date
function formatLastDonationDate(lastDonationDate) {
    const now = new Date();
    const diffTime = Math.abs(now - lastDonationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
        return `${diffDays} days ago`;
    } else {
        const months = Math.floor(diffDays / 30);
        return `${months} months ago`;
    }
}

// Calculate next eligible date
function calculateNextEligible(lastDonationDate) {
    if (!lastDonationDate) {
        return 'Eligible now';
    }

    const lastDonation = new Date(lastDonationDate);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + 56); // 56 days = 8 weeks

    const now = new Date();
    const diffTime = nextEligible - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return 'Eligible now';
    } else {
        return `${diffDays} days`;
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    const statElements = {
        bloodType: document.querySelector('.stat-card:nth-child(1) .stat-value'),
        lastDonation: document.querySelector('.stat-card:nth-child(2) .stat-value'),
        totalDonations: document.querySelector('.stat-card:nth-child(3) .stat-value'),
        nextEligible: document.querySelector('.stat-card:nth-child(4) .stat-value')
    };

    if (statElements.bloodType) statElements.bloodType.textContent = stats.bloodType || 'N/A';
    if (statElements.lastDonation) statElements.lastDonation.textContent = stats.lastDonationText || 'Never';
    if (statElements.totalDonations) statElements.totalDonations.textContent = stats.totalDonations || '0';
    if (statElements.nextEligible) statElements.nextEligible.textContent = stats.nextEligibleText || 'N/A';
}

// Update appointment information
function updateAppointmentInfo(appointments) {
    const appointmentsList = document.getElementById('appointments-list');
    if (!appointmentsList) return;

    if (!appointments || appointments.length === 0) {
        appointmentsList.innerHTML = '<li class="no-appointments">No upcoming appointments</li>';
        return;
    }

    appointmentsList.innerHTML = appointments
        .map(appointment => `
            <li class="appointment-item">
                <div class="appointment-date">${new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                <div class="appointment-time">${new Date(appointment.appointmentDate).toLocaleTimeString()}</div>
                <div class="appointment-location">${appointment.center.name}</div>
                <div class="appointment-status ${appointment.status.toLowerCase()}">${appointment.status}</div>
            </li>
        `)
        .join('');
}

// Fallback to sample data
function useSampleData() {
    const sampleStats = {
        bloodType: 'O+',
        lastDonationText: '15 days ago',
        totalDonations: 12,
        nextEligibleText: '45 days'
    };

    updateDashboardStats(sampleStats);
    
    const sampleAppointments = [{
        appointmentDate: new Date(),
        center: { name: 'Sample Blood Bank' },
        status: 'SCHEDULED'
    }];
    
    updateAppointmentInfo(sampleAppointments);
}