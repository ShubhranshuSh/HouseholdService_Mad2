import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            services: [],
            loading: true,
            error: null
        };
    },
    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert("🚨 Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    created() {
        this.fetchServices();
    },
    methods: {
        fetchServices() {
            this.loading = true;
            
            fetch('/admin/services', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': store.state.auth_token
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        this.services = [];
                        return;
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // Debugging API response
                if (data && Array.isArray(data)) {
                    this.services = data;
                } else {
                    this.services = [];
                }
                this.loading = false;
            })
            .catch(error => {
                console.error('Error fetching services:', error);
                this.error = 'Failed to load services. Please try again.';
                this.loading = false;
                this.services = [];
            });
        },
        deleteService(serviceId) {
            if (confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
                fetch(`/api/services/${serviceId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": store.state.auth_token
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    alert("✅ Service deleted successfully!");
                    // Remove the deleted service from the services array
                    this.services = this.services.filter(service => service.id !== serviceId);
                })
                .catch(error => {
                    console.error("Error deleting service:", error);
                    alert("Failed to delete service: " + error.message);
                });
            }
        }
    },
    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="text-center">Admin - Services</h1>
                <button class="btn btn-success" @click="$router.push('/admin/services/add')">
                    <i class="fas fa-plus"></i> Add Service
                </button>
            </div>
            
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
                            <h5 class="card-title">
                                <i class="fas fa-tools"></i> {{ service.name }}
                            </h5>
                            <p class="card-text">
                                <strong>Rate:</strong> {{ service.price }} <br>
                                <strong>Timings:</strong> {{ service.timing }} <br>
                                <strong>Description:</strong> {{ service.description }} <br>
                                <strong>Category:</strong> {{ service.service_category }} <br>
                            </p>
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-primary btn-sm me-2" @click="$router.push('/admin/services/edit/' + service.id)">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>
                                <button class="btn btn-danger btn-sm" @click="deleteService(service.id)">
                                    <i class="fas fa-trash"></i>
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