document.addEventListener('DOMContentLoaded', () => {
  loadPendingRequests();
});

async function loadPendingRequests() {
  try {
    const res = await fetch('/api/admin/pending-requests', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load pending requests');
    const requests = await res.json();
    renderRequests(requests);
  } catch (e) {
    console.error('Error loading pending requests:', e);
  }
}

function renderRequests(requests) {
  const tbody = document.getElementById('requests-table-body');
  tbody.innerHTML = '';
  requests.forEach(request => {
    const donorName = request.donor && request.donor.userId ? `Donor #${request.donor.userId}` : 'N/A';
    const bloodType = request.bloodRequest && request.bloodRequest.bloodType ? request.bloodRequest.bloodType : 'N/A';
    const requestDate = request.appliedTime ? new Date(request.appliedTime).toLocaleDateString() : 'N/A';
    const status = request.status.charAt(0) + request.status.slice(1).toLowerCase();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${donorName}</td>
      <td>${bloodType}</td>
      <td>${requestDate}</td>
      <td><span class="status ${request.status.toLowerCase()}">${status}</span></td>
      <td>
        ${request.status === 'PENDING' ? `
          <button class="btn-approve" onclick="approveRequest(${request.id})">Approve</button>
          <button class="btn-reject" onclick="rejectRequest(${request.id})">Reject</button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.approveRequest = async function(id) {
  try {
    await fetch(`/api/admin/pending-requests/${id}/approve`, { method: 'POST', credentials: 'include' });
    loadPendingRequests();
  } catch (e) {
    alert('Failed to approve request');
  }
};

window.rejectRequest = async function(id) {
  try {
    await fetch(`/api/admin/pending-requests/${id}/reject`, { method: 'POST', credentials: 'include' });
    loadPendingRequests();
  } catch (e) {
    alert('Failed to reject request');
  }
};