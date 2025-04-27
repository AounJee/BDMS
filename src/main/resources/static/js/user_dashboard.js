const navLinks = document.querySelectorAll('.nav-link');

// Auth Check and Data Loading
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await AuthService.checkAuth();
        if (!user) {
            throw new Error('Not authenticated');
        }

        populateUserProfile(user);
        await loadDashboardData(user.id);
    } catch (error) {
        console.error('Auth check failed:', error);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 5000);
    }

    initUIComponents();
});

// Initialize all UI components
function initUIComponents() {
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

    document.querySelectorAll('.btn-respond, .btn-reschedule, .btn-cancel, .btn-schedule').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert(`${e.target.textContent} button clicked!`);
        });
    });

    document.querySelector('.notifications').addEventListener('click', () => {
        alert('Notifications clicked!');
    });

    document.querySelector('.user-profile').addEventListener('click', async (e) => {
        e.preventDefault();
        await AuthService.logout();
    });
}

// Populate user profile information
function populateUserProfile(user) {
    document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName}`;
}

// Load dashboard data from API
async function loadDashboardData(userId) {
    try {
        const [statsResponse, appointmentsResponse] = await Promise.all([
            fetch(`/api/donors/${userId}/stats`, { credentials: 'include' }),
            fetch(`/api/appointments/me`, { credentials: 'include' })
        ]);

        if (!statsResponse.ok || !appointmentsResponse.ok) {
            throw new Error('Failed to load dashboard data');
        }

        const stats = await statsResponse.json();
        const appointments = await appointmentsResponse.json();

        document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = stats.bloodType;
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = stats.lastDonationText;
        document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = stats.totalDonations;
        document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = stats.nextEligibleText;

        if (appointments.length > 0) {
            const nextAppointment = appointments[0];
            const centerResponse = await fetch(`/api/donation-centers/${nextAppointment.centerId}`, { credentials: 'include' });
            const center = await centerResponse.json();
            const date = new Date(nextAppointment.appointmentDate);
            document.querySelector('.appointment-info h3').textContent = 'Blood Donation Appointment';
            document.querySelector('.appointment-info p:nth-of-type(1)').innerHTML = 
                `<i class="bi bi-clock"></i> ${date.toLocaleTimeString()}`;
            document.querySelector('.appointment-info p:nth-of-type(2)').innerHTML = 
                `<i class="bi bi-geo-alt"></i> ${center.name}`;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        useSampleData();
    }
}

// Fallback to sample data
function useSampleData() {
    const sampleStats = {
        bloodType: 'O+',
        lastDonationText: '15 days ago',
        totalDonations: 12,
        nextEligibleText: '45 days'
    };

    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = sampleStats.bloodType;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = sampleStats.lastDonationText;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = sampleStats.totalDonations;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = sampleStats.nextEligibleText;
}