document.addEventListener('DOMContentLoaded', () => {
  loadDonationCenters();
  loadBloodRequests();
  
  document.getElementById('request-blood-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const hospitalName = document.getElementById('hospital-name').value;
    const bloodType = document.getElementById('blood-type').value;
    const urgency = document.getElementById('urgency').value;
    
    const newRequest = {
      hospitalName,
      bloodType,
      unitsNeeded: 1,
      urgency,
      status: 'OPEN',
      requestDate: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/admin/blood-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newRequest)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blood request');
      }
      
      loadBloodRequests();
      e.target.reset();
      alert('Blood request created successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create blood request');
    }
  });
});

async function loadDonationCenters() {
  try {
    const response = await fetch('/api/donation-centers', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to load donation centers');
    
    const centers = await response.json();
    const select = document.getElementById('hospital-name');
    
    centers.forEach(center => {
      const option = document.createElement('option');
      option.value = center.name;
      option.textContent = center.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading donation centers:', err);
    alert('Failed to load donation centers. Please refresh the page.');
  }
}

async function loadBloodRequests() {
  try {
    const res = await fetch('/api/admin/blood-requests', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load blood requests');
    const requests = await res.json();
    renderBloodRequests(requests);
  } catch (e) {
    console.error('Error loading blood requests:', e);
  }
}

function renderBloodRequests(requests) {
  const tbody = document.getElementById('blood-requests-table-body');
  tbody.innerHTML = '';
  requests.forEach(request => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${request.bloodType}</td>
      <td>${request.unitsNeeded}</td>
      <td>${request.urgency}</td>
      <td><span class="status ${request.status.toLowerCase()}">${request.status}</span></td>
      <td>${request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}</td>
    `;
    tbody.appendChild(row);
  });
}