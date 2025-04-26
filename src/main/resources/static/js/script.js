document.addEventListener("DOMContentLoaded", function () {
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

    // Handle Signup
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
            bloodType: document.getElementById("bloodType")?.value || "A+"
        };

        if (formData.password !== document.getElementById("confirmPassword").value) {
            alert("Passwords don't match!");
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();
            if (response.ok) {
                alert("Signup successful! Please login.");
                btnLogin.click();
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
});