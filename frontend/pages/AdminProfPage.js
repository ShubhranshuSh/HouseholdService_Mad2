import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            activeProfessionals: [],
            flaggedProfessionals: [],
            activeTab: "active", // "active" or "flagged"
            loading: {
                active: true,
                flagged: true
            },
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
        this.fetchActiveProfessionals();
        this.fetchFlaggedProfessionals();
    },
    methods: {
        fetchActiveProfessionals() {
            this.loading.active = true;
            
            // Fetch active professionals from the backend
            fetch('/admin/service-professionals', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': store.state.auth_token
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        // If no professionals found, set empty array
                        this.activeProfessionals = [];
                        return;
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && Array.isArray(data)) {
                    this.activeProfessionals = data;
                } else {
                    this.activeProfessionals = [];
                }
                this.loading.active = false;
            })
            .catch(error => {
                console.error('Error fetching active professionals:', error);
                this.error = 'Failed to load active professionals. Please try again.';
                this.loading.active = false;
                this.activeProfessionals = [];
            });
        },
        fetchFlaggedProfessionals() {
            this.loading.flagged = true;
            
            // We need to create a way to get flagged professionals
            // Since your backend doesn't have a direct route for flagged professionals,
            // we'll simulate this for now with an empty array
            
            // In real implementation, you would want to add a backend route to fetch flagged professionals
            // For now we're showing how to structure this, but the array will be empty
            this.flaggedProfessionals = [];
            this.loading.flagged = false;
        },
        flagProfessional(id) {
            fetch(`/admin/flag-professional/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': store.state.auth_token
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Remove the professional from active list
                this.activeProfessionals = this.activeProfessionals.filter(pro => pro.id !== id);
                alert(data.message || 'Professional has been flagged successfully.');
            })
            .catch(error => {
                console.error('Error flagging professional:', error);
                alert('Failed to flag professional. Please try again.');
            });
        },
        unflagProfessional(id) {
            fetch(`/admin/unflag-professional/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': store.state.auth_token
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Remove the professional from flagged list
                this.flaggedProfessionals = this.flaggedProfessionals.filter(pro => pro.id !== id);
                
                // Refresh the active professionals list
                this.fetchActiveProfessionals();
                
                alert(data.message || 'Professional has been unflagged successfully.');
            })
            .catch(error => {
                console.error('Error unflagging professional:', error);
                alert('Failed to unflag professional. Please try again.');
            });
        }
    },
    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Admin - Service Professionals</h1>
            <!-- Tab Buttons -->
            <div class="d-flex justify-content-center mb-4">
                <button 
                    class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'active' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="activeTab = 'active'"
                >
                    Active Professionals
                </button>
                <button 
                    class="btn px-4 fw-bold"
                    :class="activeTab === 'flagged' ? 'btn-danger' : 'btn-outline-danger'"
                    @click="activeTab = 'flagged'"
                >
                    Flagged Professionals
                </button>
            </div>
            
            <!-- Active Professionals -->
            <div v-if="activeTab === 'active'" class="col-12">
                <!-- Loading State -->
                <div v-if="loading.active" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p class="mt-2">Loading active professionals...</p>
                </div>
                
                <!-- Error State -->
                <div v-else-if="error" class="alert alert-danger text-center">
                    {{ error }}
                </div>
                
                <!-- Empty State -->
                <div v-else-if="activeProfessionals.length === 0" class="text-center">
                    <p class="fw-bold text-muted">No Active Professionals found.</p>
                </div>
                
                <!-- Active Professionals List -->
                <div v-else class="row g-4">
                    <div v-for="prof in activeProfessionals" :key="prof.id" class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card shadow-sm border-primary h-100">
                            <div class="card-body text-center d-flex flex-column">
                                <h5 class="card-title fw-bold">
                                    <i class="fas fa-user-circle me-2 text-primary"></i> {{ prof.name }}
                                </h5>
                                <p class="card-text">
                                    <i class="fas fa-briefcase me-1"></i> {{ prof.service_category }}
                                </p>
                                <p class="card-text">
                                    <i class="fas fa-envelope me-1"></i> {{ prof.email }}
                                </p>
                                <p class="card-text">
                                    <i class="fas fa-phone me-1"></i> {{ prof.phone }}
                                </p>
                                <p class="card-text">
                                    <i class="fas fa-map-marker-alt me-1"></i> {{ prof.address }}, {{ prof.pincode }}
                                </p>
                                <button class="btn btn-danger btn-sm px-3 fw-bold mt-auto" @click="flagProfessional(prof.id)">
                                    <i class="fas fa-flag"></i> Flag
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Flagged Professionals -->
            <div v-if="activeTab === 'flagged'" class="col-12">
                <!-- Loading State -->
                <div v-if="loading.flagged" class="text-center py-5">
                    <div class="spinner-border text-danger" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p class="mt-2">Loading flagged professionals...</p>
                </div>
                
                <!-- Empty State -->
                <div v-else-if="flaggedProfessionals.length === 0" class="text-center">
                    <p class="fw-bold text-muted">No Flagged Professionals found.</p>
                </div>
                
                <!-- Flagged Professionals List -->
                <div v-else class="row g-4">
                    <div v-for="prof in flaggedProfessionals" :key="prof.id" class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card shadow-sm border-danger h-100 bg-light">
                            <div class="card-body text-center d-flex flex-column">
                                <h5 class="card-title fw-bold text-danger">
                                    <i class="fas fa-user-circle me-2"></i> {{ prof.name }}
                                </h5>
                                <p class="card-text">
                                    <i class="fas fa-briefcase me-1"></i> {{ prof.service_category }}
                                </p>
                                <p class="card-text">
                                    <i class="fas fa-envelope me-1"></i> {{ prof.email }}
                                </p>
                                <p class="card-text">
                                    <i class="fas fa-phone me-1"></i> {{ prof.phone }}
                                </p>
                                <p class="card-text">
                                    <i class="fas fa-map-marker-alt me-1"></i> {{ prof.address }}, {{ prof.pincode }}
                                </p>
                                <button class="btn btn-success btn-sm px-3 fw-bold mt-auto" @click="unflagProfessional(prof.id)">
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