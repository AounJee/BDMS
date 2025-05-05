const navLinks = document.querySelectorAll('.nav-link');

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await AuthService.checkAuth();
        if (!user) {
            throw new Error('Not authenticated');
        }

        populateUserProfile(user);
        await loadDashboardData(user.id);
        await loadUrgentRequests();
        await loadRecentDonations();
        await loadHealthTips();

        // Poll for updates every 30 seconds
        setInterval(async () => {
            await loadUrgentRequests();
            await loadRecentDonations();
        }, 30000);
    } catch (error) {
        console.error('Auth check failed:', error);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 5000);
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

        // Get donor stats
        const statsResponse = await fetch(`/api/donors/${userId}/stats`, { 
            credentials: 'include' 
        });

        if (!statsResponse.ok) {
            throw new Error('Failed to load donor stats');
        }

        const stats = await statsResponse.json();

        // Log for debugging
        console.log('Profile:', profile);
        console.log('Stats:', stats);

        // Get total donations by counting the user's donations
        let totalDonations = 0;
        try {
            const donationsResponse = await fetch('/api/donations/me', { credentials: 'include' });
            if (donationsResponse.ok) {
                const donations = await donationsResponse.json();
                totalDonations = Array.isArray(donations) ? donations.length : 0;
            }
        } catch (e) {
            console.warn('Could not fetch donations for total count:', e);
        }

        // Format the last donation date
        const lastDonationText = stats.lastDonationDate ? 
            formatLastDonationDate(new Date(stats.lastDonationDate)) : 'Never';

        // Format next eligible date
        const nextEligibleText = calculateNextEligible(stats.lastDonationDate);

        const formattedStats = {
            bloodType: profile.bloodType || 'N/A',
            lastDonationText: lastDonationText,
            totalDonations: totalDonations,
            nextEligibleText: nextEligibleText
        };

        updateDashboardStats(formattedStats);

        // Get appointments
        const appointmentsResponse = await fetch('/api/appointments/me', { 
            credentials: 'include' 
        });

        if (!appointmentsResponse.ok) {
            throw new Error('Failed to load appointments');
        }

        const appointments = await appointmentsResponse.json();
        console.log('Appointments:', appointments);
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
    const nextAppointmentDiv = document.getElementById('next-appointment');
    if (!nextAppointmentDiv) return;

    if (!appointments || appointments.length === 0) {
        nextAppointmentDiv.innerHTML = `
            <div class="no-appointment">
                <p>No upcoming appointments</p>
            </div>
        `;
        return;
    }

    // Sort appointments by date and get the next one
    const nextAppointment = appointments
        .filter(apt => apt && apt.appointmentDate && new Date(apt.appointmentDate) > new Date())
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

    if (!nextAppointment) {
        nextAppointmentDiv.innerHTML = `
            <div class="no-appointment">
                <p>No upcoming appointments</p>
            </div>
        `;
        return;
    }

    const appointmentDate = new Date(nextAppointment.appointmentDate);
    const centerName = nextAppointment.center && nextAppointment.center.name ? nextAppointment.center.name : 'Unknown Center';
    const status = nextAppointment.status || '';
    nextAppointmentDiv.innerHTML = `
        <div class="appointment-details">
            <div class="appointment-info">
                <h3>${centerName}</h3>
                <p>${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}</p>
                <p class="status ${status.toLowerCase()}">${status}</p>
            </div>
            <div class="appointment-actions">
                <button class="btn-reschedule" onclick="window.location.href='donate_blood.html'">Reschedule</button>
                <button class="btn-cancel" onclick="cancelAppointment(${nextAppointment.id})">Cancel</button>
            </div>
        </div>
    `;
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

// Load urgent blood requests (only CRITICAL urgency)
async function loadUrgentRequests() {
    try {
        const response = await fetch('/api/blood-requests', { 
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load blood requests');
        }

        const requests = await response.json();
        const urgentRequestsList = document.getElementById('urgent-requests-list');
        if (!urgentRequestsList) return;
        
        urgentRequestsList.innerHTML = '';

        // Filter for only CRITICAL urgency
        const urgentRequests = requests
            .filter(request => request.urgency === 'CRITICAL')
            .slice(0, 3); // Show only top 3 critical requests

        if (urgentRequests.length === 0) {
            urgentRequestsList.innerHTML = '<p>No critical blood requests at the moment.</p>';
            return;
        }

        urgentRequests.forEach(request => {
            const requestDiv = document.createElement('div');
            requestDiv.classList.add('blood-request');
            const postedTime = new Date(request.requestDate).toLocaleString();
            requestDiv.innerHTML = `
                <div class="request-type">${request.bloodType}</div>
                <div class="request-details">
                    <h3>${request.urgency} Need</h3>
                    <p>${request.hospitalName}</p>
                    <p class="time">Posted ${postedTime}</p>
                </div>
                <button class="btn-respond" onclick="window.location.href='donate_blood.html'">Respond</button>
            `;
            urgentRequestsList.appendChild(requestDiv);
        });
    } catch (error) {
        console.error('Error loading urgent requests:', error);
        const urgentRequestsList = document.getElementById('urgent-requests-list');
        if (urgentRequestsList) {
            urgentRequestsList.innerHTML = '<p>Failed to load urgent requests.</p>';
        }
    }
}

// Load recent donations
async function loadRecentDonations() {
    try {
        const response = await fetch('/api/donations/me', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load donations');
        }

        const donations = await response.json();
        const recentDonationsList = document.getElementById('recent-donations-list');
        recentDonationsList.innerHTML = '';

        // Show only the 3 most recent donations
        const recentDonations = donations.slice(0, 3);

        if (recentDonations.length === 0) {
            recentDonationsList.innerHTML = '<tr><td colspan="5">No donation history available.</td></tr>';
            return;
        }

        for (const donation of recentDonations) {
            const centerResponse = await fetch(`/api/donation-centers/${donation.centerId}`, { credentials: 'include' });
            const center = await centerResponse.json();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(donation.donationDate).toLocaleDateString()}</td>
                <td>${center.name}</td>
                <td>${donation.donor.bloodType}</td>
                <td>${donation.amountMl} ml</td>
                <td><span class="status ${donation.status.toLowerCase()}">${donation.status}</span></td>
            `;
            recentDonationsList.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading recent donations:', error);
        document.getElementById('recent-donations-list').innerHTML = 
            '<tr><td colspan="5">Failed to load donation history.</td></tr>';
    }
}

// Load health tips
async function loadHealthTips() {
    try {
        const response = await fetch('/api/health-tips', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load health tips');
        }

        const tips = await response.json();
        const tipsContainer = document.getElementById('health-tips-list');
        tipsContainer.innerHTML = '';

        if (tips.length === 0) {
            tipsContainer.innerHTML = '<p>No health tips available.</p>';
            return;
        }

        tips.forEach(tip => {
            const tipDiv = document.createElement('div');
            tipDiv.classList.add('health-tip');
            tipDiv.innerHTML = `
                <div class="tip-icon">
                    <i class="bi bi-heart-pulse"></i>
                </div>
                <div class="tip-content">
                    <h3>${tip.title}</h3>
                    <p>${tip.content}</p>
                </div>
            `;
            tipsContainer.appendChild(tipDiv);
        });
    } catch (error) {
        console.error('Error loading health tips:', error);
        useSampleHealthTips();
    }
}

// Fallback to sample health tips
function useSampleHealthTips() {
    const sampleTips = [
        { title: 'Stay Hydrated', content: 'Drink plenty of water before and after donation to help your body recover quickly.' },
        { title: 'Eat Iron-Rich Foods', content: 'Include foods like spinach, red meat, and beans in your diet to maintain healthy iron levels.' },
        { title: 'Rest Properly', content: 'Get a good night\'s sleep before donation and avoid strenuous activity for 24 hours after.' }
    ];

    const tipsContainer = document.getElementById('health-tips-list');
    tipsContainer.innerHTML = '';

    sampleTips.forEach(tip => {
        const tipDiv = document.createElement('div');
        tipDiv.classList.add('health-tip');
        tipDiv.innerHTML = `
            <div class="tip-icon">
                <i class="bi bi-heart-pulse"></i>
            </div>
            <div class="tip-content">
                <h3>${tip.title}</h3>
                <p>${tip.content}</p>
            </div>
        `;
        tipsContainer.appendChild(tipDiv);
    });
}