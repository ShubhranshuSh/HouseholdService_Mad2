import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            customers: [
                {
                    id: 1,
                    name: "Emma Johnson",
                    city: "New York",
                    address: "123 Main Street",
                    phone: "123-456-7890",
                },
                {
                    id: 2,
                    name: "James Smith",
                    city: "Los Angeles",
                    address: "456 Elm Avenue",
                    phone: "987-654-3210",
                },
                {
                    id: 3,
                    name: "Olivia Brown",
                    city: "Chicago",
                    address: "789 Oak Drive",
                    phone: "555-678-1234",
                },
                {
                    id: 4,
                    name: "Liam Wilson",
                    city: "Houston",
                    address: "321 Pine Street",
                    phone: "444-333-2222",
                },
                {
                    id: 5,
                    name: "Sophia Davis",
                    city: "San Francisco",
                    address: "654 Maple Road",
                    phone: "111-222-3333",
                }
            ],
        };
    },
    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert("🚨 Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Admin - Customers</h1>
            <div class="row">
                <div v-for="customer in customers" :key="customer.id" class="col-md-4">
                    <div class="card shadow-sm mb-4">
                        <div class="card-body text-center">
                            <h5 class="card-title">
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
                            <button class="btn btn-danger btn-sm">
                                <i class="fas fa-flag"></i> Flag
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
};
