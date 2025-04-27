// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');

// Auth Check and Data Loading
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    try {
        const response = await fetch('/api/auth/check', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Not authenticated');
        }

        const user = await response.json();
        populateUserProfile(user);
        await loadDashboardData(user.id);
    } catch (error) {
        console.error('Auth check failed:', error);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 5000);
    }

    // Initialize UI components after auth check
    initUIComponents();
});

// Initialize all UI components
function initUIComponents() {
    // Handle navigation item clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                link.closest('.nav-item').classList.add('active');
                
                const linkText = link.querySelector('span').textContent;
                document.querySelector('.page-title').textContent = linkText;
            }
        });
    });

    // Initialize buttons
    document.querySelectorAll('.btn-respond, .btn-reschedule, .btn-cancel, .btn-schedule').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert(`${e.target.textContent} button clicked!`);
        });
    });

    // Initialize notifications
    document.querySelector('.notifications').addEventListener('click', () => {
        alert('Notifications clicked!');
    });

    // Initialize user profile with logout functionality
    document.querySelector('.user-profile').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}

// Populate user profile information
function populateUserProfile(user) {
    document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName}`;
    // You can add more profile population logic here
}

// Load dashboard data from API
async function loadDashboardData(userId) {
    try {
        const [statsResponse, appointmentsResponse] = await Promise.all([
            fetch(`/api/donors/${userId}/stats`, { credentials: 'include' }),
            fetch(`/api/donors/${userId}/appointments`, { credentials: 'include' })
        ]);

        if (!statsResponse.ok || !appointmentsResponse.ok) {
            throw new Error('Failed to load dashboard data');
        }

        const stats = await statsResponse.json();
        const appointments = await appointmentsResponse.json();

        // Update stats cards
        document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = stats.bloodType;
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = stats.lastDonation;
        document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = stats.totalDonations;
        document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = stats.nextEligible;

        // Update appointments if available
        if (appointments.length > 0) {
            const nextAppointment = appointments[0];
            document.querySelector('.appointment-info h3').textContent = 'Blood Donation Appointment';
            document.querySelector('.appointment-info p:nth-of-type(1)').innerHTML = 
                `<i class="bi bi-clock"></i> ${nextAppointment.time}`;
            document.querySelector('.appointment-info p:nth-of-type(2)').innerHTML = 
                `<i class="bi bi-geo-alt"></i> ${nextAppointment.location}`;
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to sample data if API fails
        useSampleData();
    }
}

// Fallback to sample data
function useSampleData() {
    const sampleStats = {
        bloodType: 'O+',
        lastDonation: '15 days ago',
        totalDonations: 12,
        nextEligible: '45 days'
    };

    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = sampleStats.bloodType;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = sampleStats.lastDonation;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = sampleStats.totalDonations;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = sampleStats.nextEligible;
}