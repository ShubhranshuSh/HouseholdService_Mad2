import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";
export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            serviceId: null,
            service: {
                name: "",
                price: "",
                timing: "",
                description: "",
                service_category: "",
            },
            categories: [
                "House Cleaning",
                "Bathroom Cleaning",
                "Kitchen Cleaning",
                "Sofa Cleaning",
                "AC Repair",
                "Fridge Repair",
                "Washing Machine Repair",
                "Microwave Repair",
                "TV Installation",
                "Plumbing Work",
                "Electrician Services",
                "Painting",
                "Furniture Repair",
                "Packers and Movers",
                "Handyman Services"
            ],
            loading: false,
            error: null
        };
    },
    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert(" Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    created() {
        this.serviceId = this.$route.params.id;
        this.fetchService();
    },
    methods: {
        fetchService() {
            this.loading = true;
            fetch(`/api/services/${this.serviceId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": store.state.auth_token
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.service = data;
                // Ensure price is a string for input field
                this.service.price = this.service.price.toString();
                this.loading = false;
            })
            .catch(error => {
                console.error("Error fetching service:", error);
                this.error = "Failed to load service details.";
                this.loading = false;
            });
        },
        updateService() {
            if (!this.service.name || !this.service.price || !this.service.timing || !this.service.description || !this.service.service_category) {
                this.error = "All fields are required!";
                return;
            }

            this.loading = true;
            
            // Ensure price is sent as a number
            const serviceData = {
                ...this.service,
                price: parseInt(this.service.price)
            };

            fetch(`/api/services/${this.serviceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": store.state.auth_token
                },
                body: JSON.stringify(serviceData)
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
                alert(" Service updated successfully!");
                this.$router.push("/admin/services");
            })
            .catch(error => {
                console.error("Error updating service:", error);
                this.error = typeof error === "string" ? error : "Failed to update service.";
            })
            .finally(() => {
                this.loading = false;
            });
        }
    },
    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-5">
            <h1 class="text-center">Edit Service</h1>
            
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading service details...</p>
            </div>
            <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }}
            </div>
            <div v-else class="card p-4 shadow-sm">
                <form @submit.prevent="updateService">
                    <div class="mb-3">
                        <label class="form-label">Service Name</label>
                        <input type="text" class="form-control" v-model="service.name" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Price</label>
                        <input type="number" class="form-control" v-model="service.price" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Timings</label>
                        <input type="text" class="form-control" v-model="service.timing" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" v-model="service.description" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Category</label>
                        <select v-model="service.service_category" class="form-control" required>
                            <option disabled value="">Select a category</option>
                            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                        </select>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="submit" class="btn btn-primary">Update Service</button>
                        <button type="button" class="btn btn-secondary" @click="$router.push('/admin/services')">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,
};