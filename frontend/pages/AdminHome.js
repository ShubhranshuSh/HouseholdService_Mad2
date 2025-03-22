import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },

    data() {
        return {
            unflaggedServices: [],    // Services that are not flagged
            flaggedServices: [],      // Flagged services
            activeTab: "unflagged",   // "unflagged" or "flagged"
            loading: {
                unflagged: true,
                flagged: true
            },
            error: null
        };
    },

    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert("🚨 Only Admin can access this page");
            this.$router.push("/login");
        }
    },

    created() {
        this.fetchServices();
    },

    methods: {
        // ✅ Fetch all services and separate into flagged/unflagged
        async fetchServices() {
            this.loading.unflagged = true;
            this.loading.flagged = true;

            try {
                const response = await fetch('/admin/home', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch services: ${response.status}`);
                }

                const data = await response.json();

                // ✅ Separate flagged and unflagged services
                this.unflaggedServices = data.services.filter(service => !service.is_flagged);
                this.flaggedServices = data.services.filter(service => service.is_flagged);

                this.loading.unflagged = false;
                this.loading.flagged = false;

            } catch (error) {
                console.error('Error fetching services:', error);
                this.error = 'Failed to load services. Please try again.';
                this.loading.unflagged = false;
                this.loading.flagged = false;
            }
        },

        // ✅ Toggle flag status and update both lists
        async toggleFlag(service) {
            const confirmAction = service.is_flagged
                ? confirm("Are you sure you want to unflag this service?")
                : confirm("Are you sure you want to flag this service as inappropriate?");

            if (!confirmAction) return;

            try {
                const response = await fetch(`/admin/flag-service/${service.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to toggle flag status: ${response.status}`);
                }

                const result = await response.json();
                alert(result.message);

                // ✅ Refresh the lists dynamically
                this.fetchServices();

            } catch (error) {
                console.error("Error toggling flag status:", error);
                alert("❌ Failed to change flag status.");
            }
        }
    },

    template: `
    <div>
        <!-- ✅ Admin Navbar -->
        <AdminNavbar />

        <div class="container mt-5">
            <h1 class="text-center mb-4">Admin - Services Overview</h1>

            <!-- ✅ Tab Navigation -->
            <div class="d-flex justify-content-center mb-4">
                <button 
                    class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'unflagged' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="activeTab = 'unflagged'"
                >
                    Unflagged Services
                </button>
                <button 
                    class="btn px-4 fw-bold"
                    :class="activeTab === 'flagged' ? 'btn-danger' : 'btn-outline-danger'"
                    @click="activeTab = 'flagged'"
                >
                    Flagged Services
                </button>
            </div>

            <!-- ✅ Unflagged Services Section -->
            <div v-if="activeTab === 'unflagged'" class="col-12">
                <div v-if="loading.unflagged" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p class="mt-2">Loading unflagged services...</p>
                </div>

                <div v-else-if="unflaggedServices.length === 0" class="text-center">
                    <p class="fw-bold text-muted">No Unflagged Services found.</p>
                </div>

                <div v-else class="row g-4">
                    <div v-for="service in unflaggedServices" :key="service.id" class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card shadow-sm border-success h-100">
                            <div class="card-body text-center d-flex flex-column">
                                <h5 class="card-title fw-bold">{{ service.name }}</h5>
                                <p class="card-text"><strong>Category:</strong> {{ service.service_category }}</p>
                                <p class="card-text"><strong>Price:</strong> ₹{{ service.price }}</p>
                                <p class="card-text"><strong>Timing:</strong> {{ service.timing }}</p>
                                <p class="card-text"><strong>Creator:</strong> {{ service.creator_name }}</p>
                                
                                <button 
                                    class="btn btn-danger btn-sm px-3 fw-bold mt-auto" 
                                    @click="toggleFlag(service)"
                                >
                                    <i class="fas fa-flag"></i> Flag
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ✅ Flagged Services Section -->
            <div v-if="activeTab === 'flagged'" class="col-12">
                <div v-if="loading.flagged" class="text-center py-5">
                    <div class="spinner-border text-danger" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p class="mt-2">Loading flagged services...</p>
                </div>

                <div v-else-if="flaggedServices.length === 0" class="text-center">
                    <p class="fw-bold text-muted">No Flagged Services found.</p>
                </div>

                <div v-else class="row g-4">
                    <div v-for="service in flaggedServices" :key="service.id" class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card shadow-sm border-danger h-100 bg-light">
                            <div class="card-body text-center d-flex flex-column">
                                <h5 class="card-title fw-bold text-danger">{{ service.name }}</h5>
                                <p class="card-text"><strong>Category:</strong> {{ service.service_category }}</p>
                                <p class="card-text"><strong>Price:</strong> ₹{{ service.price }}</p>
                                <p class="card-text"><strong>Timing:</strong> {{ service.timing }}</p>
                                <p class="card-text"><strong>Creator:</strong> {{ service.creator_name }}</p>
                                
                                <button 
                                    class="btn btn-success btn-sm px-3 fw-bold mt-auto" 
                                    @click="toggleFlag(service)"
                                >
                                    <i class="fas fa-check"></i> Unflag
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
