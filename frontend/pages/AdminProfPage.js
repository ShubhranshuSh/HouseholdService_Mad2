import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            professionals: [
                { id: 1, name: "John Doe", service_category: "Plumbing", rating: 4.5, address: "New York", pincode: "10001", accepted: "Yes", active: true },
                { id: 2, name: "Alice Smith", service_category: "Electrician", rating: 4.2, address: "Los Angeles", pincode: "90001", accepted: "Yes", active: true },
                { id: 3, name: "Michael Brown", service_category: "Cleaning", rating: 4.8, address: "Chicago", pincode: "60601", accepted: "Yes", active: false },
                { id: 4, name: "Sophia Johnson", service_category: "AC Repair", rating: 4.6, address: "Houston", pincode: "77001", accepted: "Yes", active: true },
                { id: 5, name: "David Wilson", service_category: "Painting", rating: 4.3, address: "San Francisco", pincode: "94101", accepted: "Yes", active: false }
            ],
            activeTab: "active", // "active" or "flagged"
        };
    },
    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert("🚨 Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    computed: {
        activeProfessionals() {
            return this.professionals.filter(pro => pro.accepted === "Yes" && pro.active);
        },
        flaggedProfessionals() {
            return this.professionals.filter(pro => pro.accepted === "Yes" && !pro.active);
        }
    },
    methods: {
        flagProfessional(id) {
            const prof = this.professionals.find(pro => pro.id === id);
            if (prof) prof.active = false;
        },
        unflagProfessional(id) {
            const prof = this.professionals.find(pro => pro.id === id);
            if (prof) prof.active = true;
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

            <!-- Professionals List -->
            <div class="row g-4">
                <!-- Active Professionals -->
                <div v-if="activeTab === 'active'" class="col-12">
                    <div v-if="activeProfessionals.length === 0" class="text-center">
                        <p class="fw-bold text-muted">No Active Professionals found.</p>
                    </div>
                    <div class="row g-4">
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
                                        <span class="badge bg-success p-2">
                                            <i class="fas fa-star text-warning me-1"></i> {{ prof.rating }} / 5
                                        </span>
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
                    <div v-if="flaggedProfessionals.length === 0" class="text-center">
                        <p class="fw-bold text-muted">No Flagged Professionals found.</p>
                    </div>
                    <div class="row g-4">
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
                                        <span class="badge bg-warning p-2">
                                            <i class="fas fa-star text-dark me-1"></i> {{ prof.rating }} / 5
                                        </span>
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
    </div>
    `
};
