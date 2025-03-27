import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";
export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            activeCustomers: [],
            flaggedCustomers: [],
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
            alert("Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    created() {
        this.fetchActiveCustomers();
        this.fetchFlaggedCustomers();
    },
    methods: {
        fetchActiveCustomers() {
            this.loading.active = true;
            
            fetch('/admin/customers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': store.state.auth_token
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        this.activeCustomers = [];
                        return;
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && Array.isArray(data)) {
                    this.activeCustomers = data;
                } else {
                    this.activeCustomers = [];
                }
                this.loading.active = false;
            })
            .catch(error => {
                console.error('Error fetching active customers:', error);
                this.error = 'Failed to load active customers. Please try again.';
                this.loading.active = false;
                this.activeCustomers = [];
            });
        },
        fetchFlaggedCustomers() {
            this.loading.flagged = true;
            
            fetch('/admin/flagged-customers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': store.state.auth_token
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        this.flaggedCustomers = [];
                        return;
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && Array.isArray(data)) {
                    this.flaggedCustomers = data;
                } else {
                    this.flaggedCustomers = [];
                }
                this.loading.flagged = false;
            })
            .catch(error => {
                console.error('Error fetching flagged customers:', error);
                this.error = 'Failed to load flagged customers. Please try again.';
                this.loading.flagged = false;
                this.flaggedCustomers = [];
            });
        },
        flagCustomer(id) {
            fetch(`/admin/flag-customer/${id}`, {
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
                this.activeCustomers = this.activeCustomers.filter(cust => cust.id !== id);
                alert(data.message || 'Customer has been flagged successfully.');
                this.fetchFlaggedCustomers();
            })
            .catch(error => {
                console.error('Error flagging customer:', error);
                alert('Failed to flag customer. Please try again.');
            });
        },
        unflagCustomer(id) {
            fetch(`/admin/unflag-customer/${id}`, {
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
                this.flaggedCustomers = this.flaggedCustomers.filter(cust => cust.id !== id);
                this.fetchActiveCustomers();
                alert(data.message || 'Customer has been unflagged successfully.');
            })
            .catch(error => {
                console.error('Error unflagging customer:', error);
                alert('Failed to unflag customer. Please try again.');
            });
        }
    },
    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Admin - Customers</h1>
            
            <!-- Tab Buttons -->
            <div class="d-flex justify-content-center mb-4">
                <button 
                    class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'active' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="activeTab = 'active'"
                >
                    Active Customers
                </button>
                <button 
                    class="btn px-4 fw-bold"
                    :class="activeTab === 'flagged' ? 'btn-danger' : 'btn-outline-danger'"
                    @click="activeTab = 'flagged'"
                >
                    Flagged Customers
                </button>
            </div>
            
            <!-- Customers List -->
            <div class="row g-4">
                <!-- Active Customers -->
                <div v-if="activeTab === 'active'" class="col-12">
                    <div v-if="loading.active" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <p class="mt-2">Loading active customers...</p>
                    </div>
                    
                    <div v-else-if="error" class="alert alert-danger text-center">
                        {{ error }}
                    </div>
                    
                    <div v-else-if="activeCustomers.length === 0" class="text-center">
                        <p class="fw-bold text-muted">No Active Customers found.</p>
                    </div>
                    
                    <div v-else class="row g-4">
                        <div v-for="customer in activeCustomers" :key="customer.id" class="col-lg-4 col-md-6 col-sm-12">
                            <div class="card shadow-sm border-primary h-100">
                                <div class="card-body text-center d-flex flex-column">
                                    <h5 class="card-title fw-bold">
                                        <i class="fas fa-user-circle me-2 text-primary"></i> {{ customer.name }}
                                    </h5>
                                    <p class="card-text">
                                        <i class="fas fa-map-marker-alt me-1"></i> {{ customer.address }}, {{ customer.pincode }}
                                    </p>
                                    <p class="card-text">
                                        <i class="fas fa-envelope me-1"></i> {{ customer.email }}
                                    </p>
                                    <p class="card-text">
                                        <i class="fas fa-phone me-1"></i> {{ customer.phone }}
                                    </p>
                                    <button class="btn btn-danger btn-sm px-3 fw-bold mt-auto" @click="flagCustomer(customer.id)">
                                        <i class="fas fa-flag"></i> Flag
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Flagged Customers -->
                <div v-if="activeTab === 'flagged'" class="col-12">
                    <div v-if="loading.flagged" class="text-center py-5">
                        <div class="spinner-border text-danger" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <p class="mt-2">Loading flagged customers...</p>
                    </div>
                    
                    <div v-else-if="flaggedCustomers.length === 0" class="text-center">
                        <p class="fw-bold text-muted">No Flagged Customers found.</p>
                    </div>
                    
                    <div v-else class="row g-4">
                        <div v-for="customer in flaggedCustomers" :key="customer.id" class="col-lg-4 col-md-6 col-sm-12">
                            <div class="card shadow-sm border-danger h-100 bg-light">
                                <div class="card-body text-center d-flex flex-column">
                                    <h5 class="card-title fw-bold text-danger">
                                        <i class="fas fa-user-circle me-2"></i> {{ customer.name }}
                                    </h5>
                                    <p class="card-text">
                                        <i class="fas fa-map-marker-alt me-1"></i> {{ customer.address }}, {{ customer.pincode }}
                                    </p>
                                    <p class="card-text">
                                        <i class="fas fa-envelope me-1"></i> {{ customer.email }}
                                    </p>
                                    <p class="card-text">
                                        <i class="fas fa-phone me-1"></i> {{ customer.phone }}
                                    </p>
                                    <button class="btn btn-success btn-sm px-3 fw-bold mt-auto" @click="unflagCustomer(customer.id)">
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