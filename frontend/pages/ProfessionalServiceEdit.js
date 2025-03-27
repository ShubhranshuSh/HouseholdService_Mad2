import ProfessionalNavbar from "../components/ProfessionalNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        ProfessionalNavbar,
    },
    data() {
        return {
            serviceId: null,
            service: {
                name: "",
                price: "",
                timing: "",
                description: "",
                service_category: ""  // Auto-filled from DB
            },
            loading: false,
            error: null
        };
    },
    beforeCreate() {
        // Check if the user is logged in and is a professional
        if (!store.state.loggedIn || store.state.role !== "service_professional") {
            alert("Only Service Professionals can access this page.");
            this.$router.push("/login");
        }
    },
    async created() {
        this.serviceId = this.$route.params.id;
        await this.fetchProfessionalCategory();  // Fetch the professional's category first
        await this.fetchService();
    },
    methods: {
        // Fetch the logged-in professional's category
        async fetchProfessionalCategory() {
            this.loading = true;

            try {
                const response = await fetch(`/service_professional/dashboard/${store.state.user_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": store.state.auth_token
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch professional category. Status: ${response.status}`);
                }

                const data = await response.json();
                this.service.service_category = data.service_category;  // Autofill category
                this.loading = false;

            } catch (error) {
                console.error("Error fetching professional category:", error);
                this.error = "Failed to fetch service category.";
                this.loading = false;
            }
        },

        // Fetch the existing service details
        async fetchService() {
            this.loading = true;

            try {
                const response = await fetch(`/api/services/${this.serviceId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": store.state.auth_token
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Populate service details, but keep the category from the professional's data
                this.service = {
                    ...data,
                    service_category: this.service.service_category  // Ensure category is not overwritten
                };

                // Ensure price is displayed as a string for the input field
                this.service.price = this.service.price.toString();
                this.loading = false;

            } catch (error) {
                console.error("Error fetching service:", error);
                this.error = "Failed to load service details.";
                this.loading = false;
            }
        },

        // Update the service
        async updateService() {
            if (!this.service.name || !this.service.price || !this.service.timing || !this.service.description) {
                this.error = "All fields except category are required!";
                return;
            }

            this.loading = true;

            // Prepare service data with the price as an integer
            const serviceData = {
                ...this.service,
                price: parseInt(this.service.price),  // Ensure price is sent as number
                service_category: this.service.service_category  // Keep category consistent
            };

            try {
                const response = await fetch(`/api/services/${this.serviceId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": store.state.auth_token
                    },
                    body: JSON.stringify(serviceData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }

                alert("Service updated successfully!");
                this.$router.push("/service_professional/services");

            } catch (error) {
                console.error("Error updating service:", error);
                this.error = "Failed to update service. Please try again.";

            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div>
        <ProfessionalNavbar />
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

                    <!-- Non-editable category field -->
                    <div class="mb-3">
                        <label class="form-label">Category</label>
                        <input type="text" class="form-control" v-model="service.service_category" readonly />
                    </div>

                    <div class="d-flex justify-content-between">
                        <button type="submit" class="btn btn-primary">Update Service</button>
                        <button type="button" class="btn btn-secondary" @click="$router.push('/service_professional/services')">Cancel</button>
                    </div>

                </form>
            </div>
        </div>
    </div>
    `
};
