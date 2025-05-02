// Profile picture functionality removed. No code needed here for profile picture.

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  document.getElementById('profile-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const [firstName, ...lastNameArr] = name.split(' ');
    const lastName = lastNameArr.join(' ');
    const payload = { firstName, lastName, email };
    if (password) payload.password = password;
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      alert('Profile updated successfully');
    } catch (e) {
      alert('Failed to update profile');
    }
  });
});

async function loadProfile() {
  try {
    const res = await fetch('/api/admin/profile', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load profile');
    const user = await res.json();
    document.getElementById('name').value = user.firstName + (user.lastName ? ' ' + user.lastName : '');
    document.getElementById('email').value = user.email;
  } catch (e) {
    console.error('Error loading profile:', e);
  }
}