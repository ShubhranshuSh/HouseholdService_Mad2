import store from "../utils/store.js";
import AdminNavbar from "../components/AdminNavbar.js";

export default {
    components: { AdminNavbar },
    
    data() {
        return {
            activeTab: "pending",    // Default tab
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
        console.log("AdminRequest - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });

        // ✅ Redirect unauthorized users to login
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert("🚨 Only Admins can access this page");
            this.$router.push("/login");
        }
    },

    created() {
        this.fetchAdminRequests();
    },

    methods: {
        // ✅ Fetch Service Requests
        async fetchAdminRequests() {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch('/api/service-requests/pending', {
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
                this.requests.pending = data;
            } catch (error) {
                console.error("Error fetching requests:", error);
                this.error = "Failed to load service requests. Please try again.";
            } finally {
                this.loading = false;
            }
        },

        // ✅ Handle Accept Request
        async acceptRequest(requestId) {
            if (!confirm("Are you sure you want to accept this service request?")) return;

            try {
                const response = await fetch(`/api/service-requests/${requestId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    },
                    body: JSON.stringify({ status: "accepted" })
                });

                if (!response.ok) {
                    throw new Error(`Failed to accept request: ${response.status}`);
                }

                alert("✅ Request accepted successfully!");

                // ✅ Move the accepted request to 'Active' tab
                const acceptedRequest = this.requests.pending.find(req => req.id === requestId);
                if (acceptedRequest) {
                    this.requests.pending = this.requests.pending.filter(req => req.id !== requestId);
                    acceptedRequest.service_status = 'active';
                    this.requests.active.push(acceptedRequest);
                }

            } catch (error) {
                console.error("Error accepting request:", error);
                alert("❌ Failed to accept the request.");
            }
        },

        // ✅ Handle Reject Request
        async rejectRequest(requestId) {
            if (!confirm("Are you sure you want to reject this service request?")) return;

            try {
                const response = await fetch(`/api/service-requests/${requestId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    },
                    body: JSON.stringify({ status: "rejected" })
                });

                if (!response.ok) {
                    throw new Error(`Failed to reject request: ${response.status}`);
                }

                alert("❌ Request rejected successfully!");

                // ✅ Move the rejected request to 'Rejected' tab
                const rejectedRequest = this.requests.pending.find(req => req.id === requestId);
                if (rejectedRequest) {
                    this.requests.pending = this.requests.pending.filter(req => req.id !== requestId);
                    rejectedRequest.service_status = 'rejected';
                    this.requests.rejected.push(rejectedRequest);
                }

            } catch (error) {
                console.error("Error rejecting request:", error);
                alert("❌ Failed to reject the request.");
            }
        }
    },

    template: `
    <div>
        <AdminNavbar />
        
        <div class="container mt-5">
            <h1 class="text-center mb-4">Admin Service Requests</h1>

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
                                <p class="mb-1"><strong>Customer:</strong> {{ req.customer_name }}</p>
                                <p class="mb-1"><strong>Email:</strong> {{ req.customer_email }}</p>
                                <p class="mb-1"><strong>Phone:</strong> {{ req.customer_phone }}</p>
                                <p class="mb-1"><strong>Address:</strong> {{ req.customer_address }}</p>
                                <p class="mb-1"><strong>Date:</strong> {{ req.date }}</p>
                                <p class="mb-1"><strong>Time:</strong> {{ req.time }}</p>
                                <p class="mb-1"><strong>Remarks:</strong> {{ req.remarks || "No remarks" }}</p>
                            </div>

                            <!-- ✅ Right Section: Status & Actions -->
                            <div class="d-flex flex-column align-items-end">
                                <div class="mb-3">
                                    <span class="badge bg-warning fs-6 px-4 py-2">Pending</span>
                                </div>

                                <div>
                                    <button 
                                        class="btn btn-outline-success me-2"
                                        @click="acceptRequest(req.id)"
                                    >
                                        ✅ Accept
                                    </button>

                                    <button 
                                        class="btn btn-outline-danger"
                                        @click="rejectRequest(req.id)"
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};
