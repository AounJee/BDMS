document.addEventListener('DOMContentLoaded', () => {
  loadBloodRequests();
  document.getElementById('request-blood-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const hospitalName = document.getElementById('hospital-name').value;
    const bloodType = document.getElementById('blood-type').value;
    const quantity = document.getElementById('quantity').value;
    const urgency = document.getElementById('urgency').value;
    // You may want to add more fields as needed
    const newRequest = {
      hospitalName,
      bloodType,
      unitsNeeded: quantity,
      urgency,
      status: 'OPEN',
      requestDate: new Date().toISOString()
    };
    try {
      await fetch('/api/admin/blood-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newRequest)
      });
      loadBloodRequests();
      e.target.reset();
    } catch (err) {
      alert('Failed to create blood request');
    }
  });
});

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