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
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle) pageTitle.textContent = linkText;
            }
        });
    });

    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', async (e) => {
            e.preventDefault();
            await AuthService.logout();
        });
    }
}

// Populate user profile information
function populateUserProfile(user) {
    const userNameElem = document.querySelector('.user-name');
    if (userNameElem) {
        userNameElem.textContent = user.username || `${user.firstName} ${user.lastName}`;
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

let hasPendingRequest = false;

// Load pending requests for the user
async function loadPendingRequests(userId) {
    try {
        const response = await fetch(`/api/pending-requests/me`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load pending requests');
        }

        const pendingRequests = await response.json();
        pendingRequestsList.innerHTML = '';

        // Track if there is any pending request
        hasPendingRequest = Array.isArray(pendingRequests) && pendingRequests.some(r => r.status === "PENDING");

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
        hasPendingRequest = false;
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
                    <button class="btn-cancel" data-appointment-id="${appointment.id}">Cancel</button>
                </div>
                <div class="appointment-status ${appointment.status.toLowerCase()}">${appointment.status}</div>
            `;
            appointmentsList.appendChild(appointmentDiv);
        }

        setupCancelButtons();
    } catch (error) {
        console.error('Error loading appointments:', error);
        appointmentsList.innerHTML = '<p>Failed to load appointments.</p>';
    }
}

// Apply to donate blood
async function applyToDonate(requestId) {
    if (hasPendingRequest) {
        alert('You already have a pending request. You cannot apply for another until it is resolved.');
        return;
    }
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

// Modal HTML for confirmation
function createCancelModal() {
    let modal = document.getElementById('cancel-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'cancel-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.25)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
      <div style="background:#fff;padding:2rem 2.5rem;border-radius:18px;box-shadow:0 2px 16px rgba(44,62,80,0.13);text-align:center;min-width:320px;">
        <h2 style="margin-bottom:1.2rem;font-size:1.2rem;">Are you sure you want to cancel this appointment?</h2>
        <div style="display:flex;gap:1.5rem;justify-content:center;">
          <button id="modal-cancel-yes" style="background:#ff4d67;color:#fff;border:none;border-radius:999px;padding:0.7rem 2.2rem;font-weight:700;font-size:1rem;cursor:pointer;">Yes</button>
          <button id="modal-cancel-no" style="background:#f5f6fa;color:#222;border:none;border-radius:999px;padding:0.7rem 2.2rem;font-weight:700;font-size:1rem;cursor:pointer;">No</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Override cancel button logic
function setupCancelButtons() {
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        // Remove any previous event listeners by cloning the node
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', (e) => {
            const appointmentId = newBtn.getAttribute('data-appointment-id');
            showCancelModal(appointmentId);
        });
    });
}

function showCancelModal(appointmentId) {
    const modal = createCancelModal();
    modal.style.display = 'flex';
    // Remove previous listeners by replacing the buttons
    const yesBtn = document.getElementById('modal-cancel-yes').cloneNode(true);
    const noBtn = document.getElementById('modal-cancel-no').cloneNode(true);
    document.getElementById('modal-cancel-yes').replaceWith(yesBtn);
    document.getElementById('modal-cancel-no').replaceWith(noBtn);
    yesBtn.onclick = async function() {
        await cancelAppointmentAndMove(appointmentId);
        modal.style.display = 'none';
    };
    noBtn.onclick = function() {
        modal.style.display = 'none';
    };
}

// Cancel appointment and move back to requests
async function cancelAppointmentAndMove(appointmentId) {
    try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            // Optionally, POST to /api/blood-requests/reopen or similar if needed
            alert('Appointment cancelled successfully');
            await loadAppointments();
            await loadBloodRequests();
        } else {
            alert('Failed to cancel appointment');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}