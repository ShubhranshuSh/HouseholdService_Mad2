import Navbar from "../components/Navbar.js";

export default {
    components: {
        Navbar, // Register Navbar as a component
    },
    template: `
    <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light py-3 shadow-sm">
            <div class="container">
              <!-- Logo -->
              <a class="navbar-brand fw-bold d-flex align-items-center" href="#">
                <img src="/static/logo/logo_svg.svg" alt="App Logo" style="width: 80px; height: auto;" class="me-2">
              </a>
              <!-- Toggler for Mobile View -->
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <!-- Navbar Links -->
              <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                <ul class="navbar-nav">
                  <li class="nav-item">
                    <router-link to="/" class="nav-link fs-5">Home</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link to="/login" class="nav-link fs-5">Login</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link to="/register" class="nav-link active fs-5">Register</router-link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        <!-- Registration Form -->
        <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: 4rem;">
            <div class="card p-4 shadow" style="width: 28rem;">
                <h2 class="text-center mb-4">Register as Customer</h2>
                <div class="form-group mb-3">
                    <label for="name">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        class="form-control"
                        placeholder="Enter full name"
                        v-model="name"
                    />
                </div>
                <div class="form-group mb-3">
                    <label for="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        class="form-control"
                        placeholder="Enter email"
                        v-model="email"
                    />
                </div>
                <div class="form-group mb-3">
                    <label for="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        class="form-control"
                        placeholder="Enter password"
                        v-model="password"
                    />
                </div>
                <div class="form-group mb-3">
                    <label for="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        class="form-control"
                        placeholder="Confirm password"
                        v-model="confirmPassword"
                    />
                </div>
                <div class="form-group mb-3">
                    <label for="phone">Phone Number</label>
                    <input
                        id="phone"
                        type="text"
                        class="form-control"
                        placeholder="Enter phone number"
                        v-model="phone"
                    />
                </div>
                <div class="form-group mb-3">
                    <label for="address">Address</label>
                    <input
                        id="address"
                        type="text"
                        class="form-control"
                        placeholder="Enter address"
                        v-model="address"
                    />
                </div>
                <div class="form-group mb-3">
                    <label for="pincode">Pincode</label>
                    <input
                        id="pincode"
                        type="text"
                        class="form-control"
                        placeholder="Enter pincode"
                        v-model="pincode"
                    />
                </div>
                <button
                    class="btn btn-primary w-100"
                    @click="submitRegister"
                >
                    Register
                </button>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            name: null,
            email: null,
            password: null,
            confirmPassword: null,
            phone: null,
            address: null,
            pincode: null,
        };
    },
    methods: {
        async submitRegister() {
            // Check if passwords match
            if (this.password !== this.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            // Create an object for the form data to send in the request
            const formData = {
                email: this.email,
                password: this.password,
                confirm_password: this.confirmPassword, // Backend expects confirm_password
                name: this.name,
                phone: this.phone,
                address: this.address,
                pincode: this.pincode,
            };

            try {
                // Sending data to backend
                const res = await fetch(location.origin + '/register/customer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Registration failed");
                }

                alert('Registration successful!');
                this.$router.push('/login');

            } catch (error) {
                console.error('Network or Server Error:', error);
                alert("An error occurred while submitting the form. Please check your internet connection or try again later.");
            }
        },
    },
};