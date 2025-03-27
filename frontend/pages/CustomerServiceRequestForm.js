import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    components: { CustomerNavbar },
    data() {
        return {
            serviceId: null,
            dateOfRequest: '',
            time: '',
            remarks: '',
            loading: false,
            error: null,
            serviceDetails: {
                name: '',
                price: '',
                category: '',
                provider: ''
            }
        };
    },
    beforeCreate() {
        console.log("CustomerServiceRequestForm - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });

        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert(" Only Customers can access this page");
            this.$router.push("/login");
        }
    },
    async created() {
        this.serviceId = this.$route.params.id;  // Get service ID from route
        await this.fetchServiceDetails();         // Fetch service details
    },
    methods: {
        async fetchServiceDetails() {
            
            const token = store.state.auth_token;
            
            try {
                const response = await fetch(`/api/services/${this.serviceId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch service details");
                }

                const data = await response.json();
                this.serviceDetails = {
                    name: data.name,
                    price: data.price,
                    category: data.category,
                    provider: data.professional_name
                };

            } catch (error) {
                console.error("Error fetching service details:", error);
                this.error = "Failed to load service details. Please try again.";
            }
        },
        
        async submitRequest() {
            if (!this.dateOfRequest || !this.time) {
                alert("Please fill all fields.");
                return;
            }

            // ✅ Validate date (present or future)
            const selectedDate = new Date(this.dateOfRequest);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                alert(" You cannot select a past date. Please choose today or a future date.");
                return;
            }

            this.loading = true;
            const token = store.state.auth_token;

            const payload = {
                date_of_request: this.dateOfRequest,
                time: this.time,
                remarks: this.remarks
            };

            try {
                const response = await fetch(`/api/customer/service/request/${this.serviceId}`, {   
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 410) {
                        alert(" Service is no longer available.");
                    } else {
                        alert(` ${data.message || "Failed to create request"}`);
                    }
                    throw new Error(data.message || "Failed to create request");
                }

                console.log("Request successful:", data);
                alert("Service request created successfully!");
                this.$router.push('/customer/dashboard/' + store.state.user_id);   // Redirect to dashboard

            } catch (error) {
                console.error('Error submitting request:', error);
                this.error = error.message || "Failed to create service request. Please try again.";
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div>
        <CustomerNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Book Service Request</h1>
            
            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <form @submit.prevent="submitRequest" class="card shadow p-4">

                
                <div class="mb-3">
                    <label class="form-label">Service Name</label>
                    <input 
                        type="text" 
                        v-model="serviceDetails.name" 
                        class="form-control" 
                        readonly
                    />
                </div>

                <div class="mb-3">
                    <label class="form-label">Service Price</label>
                    <input 
                        type="text" 
                        v-model="serviceDetails.price" 
                        class="form-control" 
                        readonly
                    />
                </div>


                <!--  Editable form fields -->
                <div class="mb-3">
                    <label for="date" class="form-label">Date of Request</label>
                    <input 
                        type="date" 
                        id="date" 
                        v-model="dateOfRequest" 
                        class="form-control" 
                        required
                    />
                </div>
                <div class="mb-3">
                    <label for="time" class="form-label">Time</label>
                    <input 
                        type="time" 
                        id="time" 
                        v-model="time" 
                        class="form-control" 
                        required
                    />
                </div>
                <div class="mb-3">
                    <label for="remarks" class="form-label">Remarks</label>
                    <textarea 
                        id="remarks" 
                        v-model="remarks" 
                        class="form-control" 
                        rows="4" 
                        placeholder="Any special instructions or remarks..."
                    ></textarea>
                </div>

                <div class="d-flex justify-content-end">
                    <button 
                        type="submit" 
                        class="btn btn-primary" 
                        :disabled="loading"
                    >
                        {{ loading ? 'Submitting...' : 'Submit Request' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
    `
};
