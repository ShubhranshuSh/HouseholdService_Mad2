import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            services: [
                { id: 1, name: "House Cleaning", rate: "$30/hr", timings: "9 AM - 6 PM", city: "New York" },
                { id: 2, name: "Plumbing Work", rate: "$50/hr", timings: "8 AM - 5 PM", city: "Los Angeles" },
                { id: 3, name: "AC Repair", rate: "$40/hr", timings: "10 AM - 7 PM", city: "Chicago" },
                { id: 4, name: "Electrician Services", rate: "$35/hr", timings: "7 AM - 4 PM", city: "Houston" },
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
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="text-center">Admin - Services</h1>
                <button class="btn btn-success" @click="$router.push('/admin/services/add')">
                    <i class="fas fa-plus"></i> Add Service
                </button>
            </div>
            
            <div class="row">
                <div v-for="service in services" :key="service.id" class="col-md-6 col-lg-4 mb-4">
                    <div class="card shadow-sm p-3">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="fas fa-tools"></i> {{ service.name }}
                            </h5>
                            <p class="card-text">
                                <strong>Rate:</strong> {{ service.rate }} <br>
                                <strong>Timings:</strong> {{ service.timings }} <br>
                                <strong>City:</strong> {{ service.city }}
                            </p>
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-primary btn-sm me-2">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>
                                <button class="btn btn-danger btn-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
};
