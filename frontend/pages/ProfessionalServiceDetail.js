import store from "../utils/store.js";
import ProfessionalNavbar from "../components/ProfessionalNavbar.js";

export default {
    components: { ProfessionalNavbar },
    data() {
        return {
            service: null,            // Service details
            loading: true,            // Loading state
            error: null,              // Error message
            countdown: 3              // ✅ Countdown timer
        };
    },

    beforeCreate() {
        console.log("ProfessionalServiceDetail - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });

        // Ensure only logged-in professionals can access
        if (!store.state.loggedIn || store.state.role !== "service_professional") {
            alert("🚨 Only Service Professionals can access this page");
            this.$router.push("/login");
        }
    },

    created() {
        this.fetchServiceDetail();
    },

    methods: {
        async fetchServiceDetail() {
            this.loading = true;
            const serviceId = this.$route.params.id;  // Get service ID from route params
            const token = store.state.auth_token;

            if (!token) {
                this.error = "Authentication failed. Please log in again.";
                this.loading = false;
                return;
            }

            try {
                const response = await fetch(`/service_professional/service/${serviceId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': token
                    }
                });

                if (response.status === 410) {   // ✅ Service flagged case
                    this.error = "The service is no longer available.";

                    // ✅ Start countdown and auto-redirect after 3 seconds
                    const countdownInterval = setInterval(() => {
                        if (this.countdown > 1) {
                            this.countdown--;   // Decrease countdown
                        } else {
                            clearInterval(countdownInterval);
                            this.$router.push('/service_professional/home');  // Redirect after countdown
                        }
                    }, 1000);  // Update every second

                    this.loading = false;
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Failed to load service details. Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Service Detail Fetched:", data);
                this.service = data;
                this.loading = false;

            } catch (error) {
                console.error("Error fetching service details:", error);
                this.error = error.message || "Failed to load service details. Please try again.";
                this.loading = false;
            }
        }
    },

    template: `
    <div>
        <ProfessionalNavbar />
        
        <div class="container mt-5">
            <h1 class="text-center mb-4">Service Details</h1>

            <!-- ✅ Loading State -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading service details...</p>
            </div>

            <!-- ✅ Error or Flagged Service Message -->
            <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }}
                <p v-if="error === 'The service is no longer available.'">
                    Redirecting to home in {{ countdown }} {{ countdown === 1 ? 'second' : 'seconds' }}...
                </p>
            </div>

            <!-- ✅ Service Details -->
            <div v-else-if="service" class="card shadow-lg p-4">
                <div class="card-body">
                    <h2 class="card-title text-primary">{{ service.name }}</h2>
                    <p class="card-text">
                        <strong>Price:</strong> ₹{{ service.price }} <br>
                        <strong>Timings:</strong> {{ service.timing }} <br>
                        <strong>Category:</strong> {{ service.service_category }} <br>
                        <strong>Provider:</strong> {{ service.service_provider }} <br>
                        <strong>Description:</strong> {{ service.description || "No description available" }} <br>
                    </p>
                    <div class="mt-4 d-flex justify-content-between">
                        <button class="btn btn-secondary" @click="$router.push('/service_professional/home')">Back to Home</button>
                    </div>
                    
                </div>
            </div>

            <!-- ✅ No Service Found -->
            <div v-else class="alert alert-warning text-center">
                <p>No service details found.</p>
            </div>
        </div>
    </div>
    `
};
