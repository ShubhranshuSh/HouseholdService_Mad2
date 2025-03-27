import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            error: "",
            newService: {
                name: "",
                price: "",
                timing: "",
                description: "",
                service_category: ""
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
            ]
        };
    },
    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert(" Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    methods: {
        async addService() {
            if (!this.newService.name || !this.newService.price || !this.newService.timing || !this.newService.description || !this.newService.service_category) {
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
                        "Authentication-Token": store.state.auth_token  // FIXED HEADER ISSUE
                    },
                    body: JSON.stringify(this.newService)
                });

                const data = await response.json();
                if (response.ok) {
                    alert(" Service Added Successfully!");
                    this.newService = { name: "", price: "", timing: "", description: "", service_category: "" };
                    this.$router.push("/admin/services"); // Redirect after success
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
        <AdminNavbar />
        <div class="container mt-5">
            <h1 class="text-center">Add New Service</h1>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <div class="card p-4 shadow-sm">
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
                    <label class="form-label">Category</label>
                    <select v-model="newService.service_category" class="form-control">
                        <option disabled value="">Select a category</option>
                        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                    </select>
                </div>

                <button @click="addService" class="btn btn-primary w-100">Submit</button>
            </div>
        </div>
    </div>
    `,
};
