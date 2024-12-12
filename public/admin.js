// document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const username = document.getElementById('adminUsername').value;
//   const password = document.getElementById('adminPassword').value;

//   try {
//     const response = await fetch('/admin/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ username, password }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       document.getElementById('loginMessage').textContent = data.message;
//       // Redirect to admin dashboard or enable admin features
//       window.location.href = '/admin-dashboard.html';
//     } else {
//       document.getElementById('loginMessage').textContent = data.error;
//     }
//   } catch (error) {
//     console.error('Admin login error:', error);
//     document.getElementById('loginMessage').textContent = 'An error occurred. Please try again.';
//   }
// });

















// async function adminLogin(username, password) {
//   // const username = document.getElementById('adminUsername').value;
//   // const password = document.getElementById('adminPassword').value;

//   try {
//     const response = await fetch('/api/admin/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ username, password }),
//     });
//     if(response) console.log(response);
//     if (response.ok) {
//       const data = await response.json();
//       console.log(data.message);
//       // Update UI to show admin is logged in
//       showAdminUI();
//     } else {
//       const error = await response.json();
//       console.error('Admin login failed:', error.error);
//       // Show error message to the user
//     }
//   } catch (error) {
//     console.error('Admin login error:', error);
//   }
// }

// async function adminLogout() {
//   try {
//     const response = await fetch('/api/admin/logout', {
//       method: 'POST',
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log(data.message);
//       // Update UI to show admin is logged out
//       hideAdminUI();
//     } else {
//       const error = await response.json();
//       console.error('Admin logout failed:', error.error);
//     }
//   } catch (error) {
//     console.error('Admin logout error:', error);
//   }
// }


// function showAdminUI() {
//   // Show admin-only elements
//   document.getElementById('adminControls').style.display = 'block';
//   document.getElementById('loginForm').style.display = 'none';
// }

// function hideAdminUI() {
//   // Hide admin-only elements
//   document.getElementById('adminControls').style.display = 'none';
//   document.getElementById('loginForm').style.display = 'block';
// }