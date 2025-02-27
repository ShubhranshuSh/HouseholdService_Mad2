import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            professionals: [
                {
                    id: 1,
                    name: "John Doe",
                    service: "House Cleaning",
                    rating: 4.5,
                    city: "New York",
                },
                {
                    id: 2,
                    name: "Alice Smith",
                    service: "Plumbing Work",
                    rating: 4.2,
                    city: "Los Angeles",
                },
                {
                    id: 3,
                    name: "Michael Brown",
                    service: "Electrician Services",
                    rating: 4.8,
                    city: "Chicago",
                },
                {
                    id: 4,
                    name: "Sophia Johnson",
                    service: "AC Repair",
                    rating: 4.6,
                    city: "Houston",
                },
                {
                    id: 5,
                    name: "David Wilson",
                    service: "Painting",
                    rating: 4.3,
                    city: "San Francisco",
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
            <h1 class="text-center mb-4">Admin - Active Professionals</h1>
            <div class="row">
                <div v-for="prof in professionals" :key="prof.id" class="col-md-4">
                    <div class="card shadow-sm mb-4">
                        <div class="card-body text-center">
                            <h5 class="card-title">
                                <i class="fas fa-user-circle me-2"></i> {{ prof.name }}
                            </h5>
                            <p class="card-text">
                                <i class="fas fa-briefcase me-1"></i> {{ prof.service }}
                            </p>
                            <p class="card-text">
                                <i class="fas fa-star text-warning me-1"></i> {{ prof.rating }} / 5
                            </p>
                            <p class="card-text">
                                <i class="fas fa-map-marker-alt me-1"></i> {{ prof.city }}
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
