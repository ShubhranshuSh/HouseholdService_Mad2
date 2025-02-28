import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            customers: [
                { id: 1, name: "Emma Johnson", city: "New York", address: "123 Main Street", phone: "123-456-7890", flagged: false },
                { id: 2, name: "James Smith", city: "Los Angeles", address: "456 Elm Avenue", phone: "987-654-3210", flagged: false },
                { id: 3, name: "Olivia Brown", city: "Chicago", address: "789 Oak Drive", phone: "555-678-1234", flagged: true },
                { id: 4, name: "Liam Wilson", city: "Houston", address: "321 Pine Street", phone: "444-333-2222", flagged: false },
                { id: 5, name: "Sophia Davis", city: "San Francisco", address: "654 Maple Road", phone: "111-222-3333", flagged: true }
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
        activeCustomers() {
            return this.customers.filter(customer => !customer.flagged);
        },
        flaggedCustomers() {
            return this.customers.filter(customer => customer.flagged);
        }
    },
    methods: {
        flagCustomer(id) {
            const customer = this.customers.find(cust => cust.id === id);
            if (customer) customer.flagged = true;
        },
        unflagCustomer(id) {
            const customer = this.customers.find(cust => cust.id === id);
            if (customer) customer.flagged = false;
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
                    <div v-if="activeCustomers.length === 0" class="text-center">
                        <p class="fw-bold text-muted">No Active Customers found.</p>
                    </div>
                    <div class="row g-4">
                        <div v-for="customer in activeCustomers" :key="customer.id" class="col-lg-4 col-md-6 col-sm-12">
                            <div class="card shadow-sm border-primary h-100">
                                <div class="card-body text-center d-flex flex-column">
                                    <h5 class="card-title fw-bold">
                                        <i class="fas fa-user-circle me-2 text-primary"></i> {{ customer.name }}
                                    </h5>
                                    <p class="card-text">
                                        <i class="fas fa-map-marker-alt me-1"></i> {{ customer.city }}
                                    </p>
                                    <p class="card-text">
                                        <i class="fas fa-home me-1"></i> {{ customer.address }}
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
                    <div v-if="flaggedCustomers.length === 0" class="text-center">
                        <p class="fw-bold text-muted">No Flagged Customers found.</p>
                    </div>
                    <div class="row g-4">
                        <div v-for="customer in flaggedCustomers" :key="customer.id" class="col-lg-4 col-md-6 col-sm-12">
                            <div class="card shadow-sm border-danger h-100 bg-light">
                                <div class="card-body text-center d-flex flex-column">
                                    <h5 class="card-title fw-bold text-danger">
                                        <i class="fas fa-user-circle me-2"></i> {{ customer.name }}
                                    </h5>
                                    <p class="card-text">
                                        <i class="fas fa-map-marker-alt me-1"></i> {{ customer.city }}
                                    </p>
                                    <p class="card-text">
                                        <i class="fas fa-home me-1"></i> {{ customer.address }}
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
