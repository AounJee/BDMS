document.addEventListener("DOMContentLoaded", function () {
    // Toggle between login/signup forms
    const btnLogin = document.getElementById("btnLogin");
    const btnSignup = document.getElementById("btnSignup");
    const loginPanel = document.getElementById("loginForm");
    const signupPanel = document.getElementById("signupForm");

    btnLogin.addEventListener("click", function () {
        loginPanel.classList.remove("hidden");
        signupPanel.classList.add("hidden");
    });

    btnSignup.addEventListener("click", function () {
        signupPanel.classList.remove("hidden");
        loginPanel.classList.add("hidden");
    });

    // Handle Signup - UPDATED VERSION
    document.getElementById("signup-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById("fname").value,
            lastName: document.getElementById("lname").value,
            username: document.getElementById("username").value,
            dob: document.getElementById("dob").value,
            gender: document.getElementById("gender").value,
            email: document.getElementById("signupEmail").value,
            password: document.getElementById("signupPassword").value,
            // Add bloodType to your form or set a default
            bloodType: document.getElementById("bloodType")?.value || "A+" 
        };

        // Password confirmation check
        if (formData.password !== document.getElementById("confirmPassword").value) {
            alert("Passwords don't match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registration failed");
            }

            const data = await response.json();
            alert("Signup successful! Please login.");
            btnLogin.click(); // Switch to login panel
            
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error("Signup error:", error);
        }
    });

    // Handle Login - UPDATED VERSION
    document.getElementById("loginForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        };

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            
            // Redirect to dashboard
            window.location.href = "dashboard.html";
            
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error("Login error:", error);
        }
    });
});