const navLinks = document.querySelectorAll('.nav-link');

// DOM Elements for Sections
const bloodRequestsList = document.getElementById('blood-requests-list');
const pendingRequestsList = document.getElementById('pending-requests-list');
const appointmentsList = document.getElementById('appointments-list');

// Auth Check and Data Loading
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await AuthService.checkAuth();
        if (!user) {
            throw new Error('Not authenticated');
        }

        populateUserProfile(user);
        await loadBloodRequests();
        await loadPendingRequests(user.id);
        await loadAppointments(user.id);

        // Poll for updates every 30 seconds
        setInterval(async () => {
            await loadPendingRequests(user.id);
            await loadAppointments(user.id);
        }, 30000);
    } catch (error) {
        console.error('Auth check failed:', error);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 5000);
    }

    initUIComponents();
});

// Initialize all UI components (reused from user_dashboard.js)
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

    document.querySelector('.notifications').addEventListener('click', () => {
        alert('Notifications clicked!');
    });

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
    document.querySelector('.user-name').textContent = user.username || `${user.firstName} ${user.lastName}`;
    if (user.profilePicUrl) {
        document.getElementById('profile-pic-header').src = user.profilePicUrl;
    }
}

// Load blood donation requests from API
async function loadBloodRequests() {
    try {
        const response = await fetch('/api/blood-requests', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load blood requests');
        }

        const requests = await response.json();
        bloodRequestsList.innerHTML = '';

        if (requests.length === 0) {
            bloodRequestsList.innerHTML = '<p>No blood donation requests available.</p>';
            return;
        }

        requests.forEach(request => {
            const requestDiv = document.createElement('div');
            requestDiv.classList.add('blood-request');
            requestDiv.innerHTML = `
                <div class="request-type">${request.bloodType}</div>
                <div class="request-details">
                    <h3>${request.urgency === 'urgent' ? 'Urgent Request' : 'Standard Request'}</h3>
                    <p>${request.hospital}, ${request.distance} miles away</p>
                    <p class="time">Posted ${request.postedTime}</p>
                </div>
                <button class="btn-respond apply-donate" data-request-id="${request.id}">Apply to Donate</button>
            `;
            bloodRequestsList.appendChild(requestDiv);
        });

        // Add event listeners to Apply buttons
        document.querySelectorAll('.apply-donate').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const requestId = e.target.getAttribute('data-request-id');
                await applyToDonate(requestId);
            });
        });
    } catch (error) {
        console.error('Error loading blood requests:', error);
        bloodRequestsList.innerHTML = '<p>Failed to load blood requests.</p>';
    }
}

// Load pending requests for the user
async function loadPendingRequests(userId) {
    try {
        const response = await fetch(`/api/donors/${userId}/pending-requests`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load pending requests');
        }

        const pendingRequests = await response.json();
        pendingRequestsList.innerHTML = '';

        if (pendingRequests.length === 0) {
            pendingRequestsList.innerHTML = '<p>No pending requests.</p>';
            return;
        }

        pendingRequests.forEach(request => {
            const requestDiv = document.createElement('div');
            requestDiv.classList.add('blood-request');
            requestDiv.innerHTML = `
                <div class="request-type">${request.bloodType}</div>
                <div class="request-details">
                    <h3>Pending - ${request.hospital}</h3>
                    <p>Applied: ${request.appliedTime}</p>
                    <p class="time">Status: ${request.status}</p>
                </div>
            `;
            pendingRequestsList.appendChild(requestDiv);
        });
    } catch (error) {
        console.error('Error loading pending requests:', error);
        pendingRequestsList.innerHTML = '<p>Failed to load pending requests.</p>';
    }
}

// Load upcoming appointments for the user
async function loadAppointments(userId) {
    try {
        const response = await fetch(`/api/donors/${userId}/appointments`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load appointments');
        }

        const appointments = await response.json();
        appointmentsList.innerHTML = '';

        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>No upcoming appointments.</p>';
            return;
        }

        appointments.forEach(appointment => {
            const appointmentDiv = document.createElement('div');
            appointmentDiv.classList.add('appointment-details');
            appointmentDiv.innerHTML = `
                <div class="appointment-date">
                    <div class="calendar-icon">
                        <i class="bi bi-calendar-check"></i>
                    </div>
                    <div class="date-info">
                        <p class="month">${appointment.month}</p>
                        <p class="day">${appointment.day}</p>
                    </div>
                </div>
                <div class="appointment-info">
                    <h3>Blood Donation Appointment</h3>
                    <p><i class="bi bi-clock"></i> ${appointment.time}</p>
                    <p><i class="bi bi-geo-alt"></i> ${appointment.hospital}</p>
                </div>
                <div class="appointment-actions">
                    <button class="btn-reschedule">Reschedule</button>
                    <button class="btn-cancel">Cancel</button>
                </div>
            `;
            appointmentsList.appendChild(appointmentDiv);
        });

        // Add event listeners for reschedule and cancel buttons
        document.querySelectorAll('.btn-reschedule, .btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                alert(`${e.target.textContent} button clicked!`);
            });
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
        appointmentsList.innerHTML = '<p>Failed to load appointments.</p>';
    }
}

// Apply to donate blood
async function applyToDonate(requestId) {
    try {
        const response = await fetch('/api/donors/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
            alert('Application submitted successfully! Awaiting hospital approval.');
            // Reload blood requests and pending requests
            await loadBloodRequests();
            await loadPendingRequests(data.userId);
        } else {
            alert(data.message || 'Failed to apply for donation');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}