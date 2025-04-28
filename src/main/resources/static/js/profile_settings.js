document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('profile-pic-input').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          document.getElementById('profile-pic').src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  
    document.getElementById('profile-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      if (password && password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      alert('Profile updated successfully');
    });
  });