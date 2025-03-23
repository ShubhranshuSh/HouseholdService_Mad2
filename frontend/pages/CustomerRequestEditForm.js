import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    components: { CustomerNavbar },
    data() {
        return {
            requestId: null,
            serviceId: null,
            serviceName: '',
            dateOfRequest: '',
            time: '',
            remarks: '',
            loading: false,
            fetchingData: true,
            error: null
        };
    },
    beforeCreate() {
        console.log("CustomerRequestEditForm - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });
        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert("🚨 Only Customers can access this page");
            this.$router.push("/login");
        }
    },
    created() {
        this.requestId = this.$route.params.id;  // Get request ID from route
        this.fetchRequestDetails();
    },
    methods: {
        // Fetch the existing request details to pre-fill the form
        async fetchRequestDetails() {
            this.fetchingData = true;
            this.error = null;
            
            try {
                // Find the request in the existing data stored in customer requests page
                // First, get all customer requests
                const response = await fetch('/customer/requests', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch request details: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Look for the request in all categories
                const allRequests = [
                    ...data.pending, 
                    ...data.active, 
                    ...data.completed, 
                    ...data.rejected
                ];
                
                const requestToEdit = allRequests.find(req => req.id == this.requestId);
                
                if (!requestToEdit) {
                    throw new Error('Request not found');
                }
                
                // Pre-fill the form with the existing data
                this.serviceName = requestToEdit.service_name;
                this.dateOfRequest = requestToEdit.date;
                this.time = requestToEdit.time;
                this.remarks = requestToEdit.remarks || '';
                
                // Get the service ID (needed for the API call)
                this.serviceId = requestToEdit.service_id;
                
            } catch (error) {
                console.error("Error fetching request details:", error);
                this.error = "Failed to load service request details. Please try again.";
            } finally {
                this.fetchingData = false;
            }
        },
        
        // Submit the edited request
        async updateRequest() {
            if (!this.dateOfRequest || !this.time) {
                alert("Please fill all required fields.");
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
                const response = await fetch(`/api/customer/service/request/edit/${this.requestId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to update request");
                }
                
                const data = await response.json();
                console.log("Update successful:", data);
                alert("✅ Service request updated successfully!");
                this.$router.push('/customer/requests');  // Redirect to requests page
                
            } catch (error) {
                console.error('Error updating request:', error);
                this.error = error.message || "Failed to update service request. Please try again.";
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div>
        <CustomerNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Edit Service Request</h1>
            
            <!-- Loading State -->
            <div v-if="fetchingData" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading request details...</p>
            </div>
            
            <!-- Error Message -->
            <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
            
            <!-- Edit Form -->
            <form v-else @submit.prevent="updateRequest" class="card shadow p-4">
                <!-- Service Name (read-only) -->
                <div class="mb-3">
                    <label class="form-label">Service</label>
                    <input 
                        type="text" 
                        v-model="serviceName" 
                        class="form-control" 
                        readonly
                        disabled
                    />
                </div>
                
                <!-- Date Field -->
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
                
                <!-- Time Field -->
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
                
                <!-- Remarks Field -->
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
                
                <!-- Action Buttons -->
                <div class="d-flex justify-content-between">
                    <button 
                        type="button" 
                        class="btn btn-outline-secondary" 
                        @click="$router.push('/customer/requests')"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        class="btn btn-primary" 
                        :disabled="loading"
                    >
                        {{ loading ? 'Updating...' : 'Update Request' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
    `
};