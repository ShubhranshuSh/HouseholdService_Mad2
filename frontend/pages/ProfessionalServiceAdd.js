import ProfessionalNavbar from "../components/ProfessionalNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        ProfessionalNavbar,
    },
    data() {
        return {
            error: "",
            newService: {
                name: "",
                price: "",
                timing: "",
                description: "",
                service_category: ""  // Autofill from backend
            },
            loading: true
        };
    },
    beforeCreate() {
        // Ensure only logged-in professionals can access
        if (!store.state.loggedIn || store.state.role !== "service_professional") {
            alert("🚨 Only Service Professionals can access this page.");
            this.$router.push("/login");
        }
    },
    created() {
        this.fetchProfessionalCategory();
    },
    methods: {
        /**
         * Fetches the category of the logged-in professional
         * from the backend and autofills it in the form.
         */
        async fetchProfessionalCategory() {
            this.loading = true;

            // Retrieve user ID from localStorage
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                this.error = "User not found. Please login again.";
                this.loading = false;
                return;
            }

            const user = JSON.parse(userStr);
            const userId = user.id || user.user_id || user._id;

            try {
                const response = await fetch(`/service_professional/dashboard/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": store.state.auth_token
                    }
                });

                if (!response.ok) {
                    const errorMsg = await response.json();
                    throw new Error(errorMsg.message || "Failed to fetch profile details.");
                }

                const data = await response.json();
                console.log("Professional Profile:", data);  // Debugging output

                // Autofill the service category
                this.newService.service_category = data.service_category;
                this.loading = false;

            } catch (error) {
                console.error("Error fetching category:", error);
                this.error = "Failed to load category. Please try again.";
                this.loading = false;
            }
        },

        /**
         * Submits the new service form data to the backend.
         */
        async addService() {
            if (!this.newService.name || !this.newService.price || !this.newService.timing || !this.newService.description) {
                this.error = "All fields are required!";
                return;
            }

            try {
                // Ensure price is sent as a number
                this.newService.price = parseInt(this.newService.price);

                const response = await fetch("/api/services", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": store.state.auth_token
                    },
                    body: JSON.stringify(this.newService)
                });

                const data = await response.json();
                if (response.ok) {
                    alert("✅ Service Added Successfully!");
                    // Reset the form after adding the service
                    this.newService = {
                        name: "",
                        price: "",
                        timing: "",
                        description: "",
                        service_category: data.service_category  // Autofill again after submission
                    };
                    this.$router.push("/service_professional/services");  // Redirect to services page
                } else {
                    this.error = data.message || `Error ${response.status}: ${response.statusText}`;
                }
            } catch (error) {
                this.error = "Failed to add service. Please try again.";
            }
        }
    },
    template: `
    <div>
        <ProfessionalNavbar />
        <div class="container mt-5">
            <h1 class="text-center">Add New Service</h1>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading professional category...</p>
            </div>

            <div v-else class="card p-4 shadow-sm">
                <div class="mb-3">
                    <label class="form-label">Service Name</label>
                    <input v-model="newService.name" type="text" class="form-control" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Price</label>
                    <input v-model="newService.price" type="number" class="form-control" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Timing</label>
                    <input v-model="newService.timing" type="text" class="form-control" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea v-model="newService.description" class="form-control"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Category (Auto-filled)</label>
                    <input v-model="newService.service_category" type="text" class="form-control" disabled />
                </div>

                <button @click="addService" class="btn btn-primary w-100">Submit</button>
            </div>
        </div>
    </div>
    `,
};
