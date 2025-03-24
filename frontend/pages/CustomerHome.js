import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";
import ServiceSearchBar from "../components/ServiceSearchBar.js";   // ✅ Importing the search bar component

export default {
    components: { CustomerNavbar, ServiceSearchBar },   // ✅ Registering the component
    data() {
        return {
            services: [],            // List of services
            loading: true,           // Loading state
            error: null              // Error message
        };
    },

    beforeCreate() {
        console.log("CustomerHome - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });
        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert("🚨 Only Customers can access this page");
            this.$router.push("/login");
        }
    },

    created() {
        this.fetchServices();
    },

    methods: {
        // 🔥 Fetch all services when the page loads
        fetchServices() {
            this.loading = true;
            const token = store.state.auth_token;

            if (!token) {
                this.error = "Authentication failed. Please log in again.";
                this.loading = false;
                return;
            }

            fetch('/customer/home', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': token
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        this.services = [];
                        return { services: [] };
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Services fetched:", data);
                if (data && Array.isArray(data.services)) {
                    this.services = data.services;
                } else {
                    this.services = [];
                }
                this.loading = false;
            })
            .catch(error => {
                console.error('Error fetching services:', error);
                this.error = 'Failed to load services. Please try again.';
                this.services = [];
                this.loading = false;
            });
        },

        // ✅ View Service Details
        viewServiceDetails(serviceId) {
            this.$router.push(`/customer/service/${serviceId}`);
        },

        // ✅ Book a Service
        bookNow(serviceId) {
            console.log("Navigating to request form for service:", serviceId);
            this.$router.push(`/customer/service/request/${serviceId}`);
        },

        // ✅ Update services from the search bar
        updateServices(services) {
            this.services = services;
        }
    },

    template: `
    <div>
        <CustomerNavbar />

        <div class="container mt-5">
            <h1 class="text-center mb-4">Available Services</h1>

            <!-- ✅ Added SearchBar component -->
            <ServiceSearchBar @updateServices="updateServices" />

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading services...</p>
            </div>

            <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }}
            </div>

            <div v-else-if="services.length === 0" class="text-center">
                <p class="fw-bold text-muted">No Services found.</p>
            </div>

            <div v-else class="row g-4">
                <div v-for="service in services" :key="service.id" class="col-lg-4 col-md-6 col-sm-12">
                    <div class="card shadow-sm border-primary h-100">
                        <div class="card-body">
                            <h5 class="card-title text-primary">
                                <i class="fas fa-tools"></i> 
                                <a href="#" @click.prevent="viewServiceDetails(service.id)" class="text-primary text-decoration-none hover-underline">
                                    {{ service.name }}
                                </a>
                            </h5>
                            <p class="card-text">
                                <strong>Price:</strong> ₹{{ service.price }} <br>
                                <strong>Timings:</strong> {{ service.timing }} <br>
                                <strong>Category:</strong> {{ service.category }} <br>
                                <strong>Provider:</strong> {{ service.provider }} <br>
                                <strong>Pincode:</strong> {{ service.pincode }} <br>
                            </p>
                            <div class="d-flex justify-content-end">
                                <button 
                                    class="btn btn-success w-100" 
                                    @click="bookNow(service.id)"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};
