document.addEventListener('DOMContentLoaded', () => {
    const pendingRequests = [
      { id: 1, donorName: 'John Doe', bloodType: 'O+', requestDate: '2023-09-20', status: 'Pending' },
      { id: 2, donorName: 'Jane Smith', bloodType: 'A-', requestDate: '2023-09-21', status: 'Pending' },
    ];
  
    function renderRequests() {
      const tbody = document.getElementById('requests-table-body');
      tbody.innerHTML = '';
      pendingRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${request.donorName}</td>
          <td>${request.bloodType}</td>
          <td>${request.requestDate}</td>
          <td><span class="status ${request.status.toLowerCase()}">${request.status}</span></td>
          <td>
            ${request.status === 'Pending' ? `
              <button class="btn-approve" onclick="approveRequest(${request.id})">Approve</button>
              <button class="btn-reject" onclick="rejectRequest(${request.id})">Reject</button>
            ` : ''}
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  
    window.approveRequest = function(id) {
      const request = pendingRequests.find(r => r.id === id);
      if (request) {
        request.status = 'Approved';
        renderRequests();
      }
    };
  
    window.rejectRequest = function(id) {
      const request = pendingRequests.find(r => r.id === id);
      if (request) {
        request.status = 'Rejected';
        renderRequests();
      }
    };
  
    renderRequests();
  });