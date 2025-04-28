document.addEventListener('DOMContentLoaded', () => {
    let requestIdCounter = 3;
    const bloodRequests = [
      { id: 1, bloodType: 'A+', quantity: 5, urgency: 'High', status: 'Open', requestDate: '2025-04-27' },
      { id: 2, bloodType: 'O-', quantity: 2, urgency: 'Critical', status: 'Fulfilled', requestDate: '2025-04-20' },
    ];
  
    function renderBloodRequests() {
      const tbody = document.getElementById('blood-requests-table-body');
      tbody.innerHTML = '';
      bloodRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${request.bloodType}</td>
          <td>${request.quantity}</td>
          <td>${request.urgency}</td>
          <td><span class="status ${request.status.toLowerCase()}">${request.status}</span></td>
          <td>${request.requestDate}</td>
        `;
        tbody.appendChild(row);
      });
    }
  
    document.getElementById('request-blood-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const bloodType = document.getElementById('blood-type').value;
      const quantity = document.getElementById('quantity').value;
      const urgency = document.getElementById('urgency').value;
      const newRequest = {
        id: requestIdCounter++,
        bloodType,
        quantity,
        urgency,
        status: 'Open',
        requestDate: new Date().toISOString().split('T')[0]
      };
      bloodRequests.push(newRequest);
      renderBloodRequests();
      e.target.reset();
    });
  
    renderBloodRequests();
  });