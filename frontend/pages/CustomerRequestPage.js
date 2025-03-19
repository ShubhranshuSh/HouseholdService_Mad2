import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    components: { CustomerNavbar },
    
    data() {
        return {
            activeTab: "pending",   // Default tab
            requests: {
                pending: [],
                active: [],
                completed: [],
                rejected: []
            },
            loading: true,
            error: null
        };
    },

    beforeCreate() {
        console.log("CustomerRequestPage - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });

        // ✅ Redirect unauthorized users to login
        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert("🚨 Only Customers can access this page");
            this.$router.push("/login");
        }
    },

    created() {
        this.fetchCustomerRequests();
    },

    methods: {

        // ✅ Fetch All Customer Requests
        async fetchCustomerRequests() {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch('/customer/requests', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch requests: ${response.status}`);
                }

                const data = await response.json();
                this.requests = data;
            } catch (error) {
                console.error("Error fetching requests:", error);
                this.error = "Failed to load service requests. Please try again.";
            } finally {
                this.loading = false;
            }
        },

        // ✅ Cancel Service Request
        async cancelRequest(requestId) {
            const confirmCancel = window.confirm("Are you sure you want to cancel this service?");
            
            if (!confirmCancel) return;

            try {
                const response = await fetch(`/api/customer/service/request/cancel/${requestId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to cancel request: ${response.status}`);
                }

                const result = await response.json();
                alert(result.message);

                // ✅ Move the canceled request to 'rejected' section
                const canceledRequest = this.requests.pending.find(req => req.id === requestId);
                
                if (canceledRequest) {
                    this.requests.pending = this.requests.pending.filter(req => req.id !== requestId);
                    canceledRequest.status = 'cancelled'; 
                    this.requests.rejected.push(canceledRequest);
                }

            } catch (error) {
                console.error("Error cancelling request:", error);
                alert("❌ Failed to cancel the request. Please try again.");
            }
        }
    },

    template: `
    <div>
        <CustomerNavbar />
        
        <div class="container mt-5">
            <h1 class="text-center mb-4">My Service Requests</h1>

            <!-- ✅ Tab Navigation -->
            <div class="d-flex justify-content-center mb-4">
                <button 
                    class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'pending' ? 'btn-warning' : 'btn-outline-warning'"
                    @click="activeTab = 'pending'"
                >
                    Pending Requests
                </button>

                <button 
                    class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'active' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="activeTab = 'active'"
                >
                    Active Requests
                </button>

                <button 
                    class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'completed' ? 'btn-success' : 'btn-outline-success'"
                    @click="activeTab = 'completed'"
                >
                    Completed Requests
                </button>

                <button 
                    class="btn px-4 fw-bold"
                    :class="activeTab === 'rejected' ? 'btn-danger' : 'btn-outline-danger'"
                    @click="activeTab = 'rejected'"
                >
                    Rejected/Cancelled Requests
                </button>
            </div>

            <!-- ✅ Loading Indicator -->
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading service requests...</p>
            </div>

            <!-- ✅ Error Message -->
            <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }}
            </div>

            <!-- ✅ Display Requests -->
            <div v-else>
                
                <!-- Pending Requests -->
                <div v-if="activeTab === 'pending'">
                    <h3 class="text-center mb-3">📌 Pending Requests</h3>
                    <div v-if="requests.pending.length === 0" class="text-muted text-center">No pending requests found.</div>
                    
                    <div v-for="req in requests.pending" :key="req.id" class="card mb-4 shadow-sm border-0 rounded-3">
                        <div class="card-body d-flex justify-content-between align-items-center">

                            <!-- ✅ Left Section: Service Details -->
                            <div>
                                <h5 class="fw-bold">{{ req.service_name }}</h5>
                                <p class="mb-1"><strong>Date:</strong> {{ req.date }}</p>
                                <p class="mb-1"><strong>Time:</strong> {{ req.time }}</p>
                                <p class="mb-1"><strong>Remarks:</strong> {{ req.remarks || "No remarks" }}</p>
                            </div>

                            <!-- ✅ Right Section: Status and Buttons -->
                            <div class="d-flex flex-column align-items-end">
                                
                                <!-- ✅ Status Badge -->
                                <div class="mb-3">
                                    <span class="badge bg-warning fs-6 px-4 py-2">Pending</span>
                                </div>

                                <!-- ✅ Bottom Right: Buttons -->
                                <div>
                                    <button 
                                        class="btn btn-outline-danger me-2"
                                        @click="cancelRequest(req.id)"
                                    >
                                        Cancel
                                    </button>

                                    <button 
                                        class="btn btn-outline-secondary"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Requests -->
                <div v-if="activeTab === 'active'">
                    <h3 class="text-center mb-3">🔥 Active Requests</h3>
                    <div v-if="requests.active.length === 0" class="text-muted text-center">No active requests found.</div>

                    <div v-for="req in requests.active" :key="req.id" class="card mb-4 shadow-sm border-0 rounded-3">
                        <div class="card-body d-flex justify-content-between align-items-center">

                            <div>
                                <h5 class="fw-bold">{{ req.service_name }}</h5>
                                <p class="mb-1"><strong>Date:</strong> {{ req.date }}</p>
                                <p class="mb-1"><strong>Time:</strong> {{ req.time }}</p>
                                <p class="mb-1"><strong>Remarks:</strong> {{ req.remarks || "No remarks" }}</p>
                            </div>

                            <div class="d-flex flex-column align-items-end">
                                <div class="mb-3">
                                    <span class="badge bg-primary fs-6 px-4 py-2">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ✅ Rejected/Cancelled Requests -->
                <div v-if="activeTab === 'rejected'">
                    <h3 class="text-center mb-3">🚫 Rejected/Cancelled Requests</h3>
                    <div v-if="requests.rejected.length === 0" class="text-muted text-center">No rejected requests found.</div>

                    <div v-for="req in requests.rejected" :key="req.id" class="card mb-4 shadow-sm border-0 rounded-3">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            
                            <!-- ✅ Left: Service Details -->
                            <div>
                                <h5 class="fw-bold">{{ req.service_name }}</h5>
                                <p><strong>Cancelled on:</strong> {{ req.date }}</p>
                            </div>

                            <!-- ✅ Right: Status -->
                            <div>
                                <span class="badge bg-danger fs-6">Cancelled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};
