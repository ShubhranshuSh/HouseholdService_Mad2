import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";
export default {
    components: { CustomerNavbar },
    data() {
        return {
            service: null,
            loading: true,
            error: null
        };
    },
    beforeCreate() {
        console.log("CustomerServiceDetail - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });
        // Ensure only logged-in customers can access
        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert("🚨 Only Customers can access this page");
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
                const response = await fetch(`/customer/service/${serviceId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': token
                    }
                });
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
        <CustomerNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Service Details</h1>
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading service details...</p>
            </div>
            <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }}
            </div>
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
                        <button class="btn btn-secondary" @click="$router.push('/customer/home')">Back to Home</button>
                        <button class="btn btn-success">Book Service</button>
                    </div>
                </div>
            </div>
            <div v-else class="alert alert-warning text-center">
                <p>No service details found.</p>
            </div>
        </div>
    </div>
    `
};