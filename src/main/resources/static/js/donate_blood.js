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
            const postedTime = new Date(request.requestDate).toLocaleString();
            const urgency = request.urgency.toLowerCase() === 'critical' || request.urgency.toLowerCase() === 'high' ? 'Urgent Request' : 'Standard Request';
            requestDiv.innerHTML = `
                <div class="request-type">${request.bloodType}</div>
                <div class="request-details">
                    <h3>${urgency}</h3>
                    <p>${request.hospitalName}</p>
                    <p class="time">Posted ${postedTime}</p>
                </div>
                <button class="btn-respond apply-donate" data-request-id="${request.id}">Apply to Donate</button>
            `;
            bloodRequestsList.appendChild(requestDiv);
        });

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
        const response = await fetch(`/api/pending-requests/me`, { credentials: 'include' });
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
            const appliedTime = new Date(request.appliedTime).toLocaleString();
            requestDiv.innerHTML = `
                <div class="request-type">${request.bloodRequest.bloodType}</div>
                <div class="request-details">
                    <h3>Pending - ${request.bloodRequest.hospitalName}</h3>
                    <p>Applied: ${appliedTime}</p>
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
        const response = await fetch(`/api/appointments/me`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load appointments');
        }

        const appointments = await response.json();
        appointmentsList.innerHTML = '';

        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>No upcoming appointments.</p>';
            return;
        }

        for (const appointment of appointments) {
            const centerResponse = await fetch(`/api/donation-centers/${appointment.centerId}`, { credentials: 'include' });
            const center = await centerResponse.json();
            const appointmentDiv = document.createElement('div');
            appointmentDiv.classList.add('appointment-details');
            const date = new Date(appointment.appointmentDate);
            appointmentDiv.innerHTML = `
                <div class="appointment-date">
                    <div class="calendar-icon">
                        <i class="bi bi-calendar-check"></i>
                    </div>
                    <div class="date-info">
                        <p class="month">${date.toLocaleString('default', { month: 'short' })}</p>
                        <p class="day">${date.getDate()}</p>
                    </div>
                </div>
                <div class="appointment-info">
                    <h3>Blood Donation Appointment</h3>
                    <p><i class="bi bi-clock"></i> ${date.toLocaleTimeString()}</p>
                    <p><i class="bi bi-geo-alt"></i> ${center.name}</p>
                </div>
                <div class="appointment-actions">
                    <button class="btn-reschedule" data-appointment-id="${appointment.id}">Reschedule</button>
                    <button class="btn-cancel" data-appointment-id="${appointment.id}">Cancel</button>
                </div>
            `;
            appointmentsList.appendChild(appointmentDiv);
        }

        document.querySelectorAll('.btn-reschedule').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appointmentId = e.target.getAttribute('data-appointment-id');
                await rescheduleAppointment(appointmentId);
            });
        });

        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appointmentId = e.target.getAttribute('data-appointment-id');
                await cancelAppointment(appointmentId);
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
        const response = await fetch('/api/pending-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
            alert('Application submitted successfully! Awaiting hospital approval.');
            await loadBloodRequests();
            await loadPendingRequests(data.userId);
        } else {
            alert(data.message || 'Failed to apply for donation');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Reschedule appointment (placeholder)
async function rescheduleAppointment(appointmentId) {
    alert(`Reschedule appointment ${appointmentId} - Implement modal for date selection`);
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
    try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            alert('Appointment cancelled successfully');
            await loadAppointments();
        } else {
            alert('Failed to cancel appointment');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}