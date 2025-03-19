import store from "../utils/store.js";
import AdminNavbar from "../components/AdminNavbar.js";
export default {
    components: { AdminNavbar },
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
        // ✅ Fetch Service Requests with Proper `/api` Prefix
        async fetchAdminRequests() {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch('/api/service-requests/pending', {   // ✅ Correct endpoint
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
                // ✅ Categorize requests by status
                this.requests.pending = data.filter(req => req.service_status === "requested");
                this.requests.active = data.filter(req => req.service_status === "accepted");
                this.requests.completed = data.filter(req => req.service_status === "completed");
                this.requests.rejected = data.filter(req => req.service_status === "rejected");
            } catch (error) {
                console.error("Error fetching requests:", error);
                this.error = "Failed to load service requests. Please try again.";
            } finally {
                this.loading = false;
            }
        },
        // ✅ Accept Request
        async acceptRequest(requestId) {
            if (!confirm("Are you sure you want to accept this service request?")) return;
            try {
                const response = await fetch(`/api/service-requests/${requestId}/action`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    },
                    body: JSON.stringify({ action: "accept" })
                });
                if (!response.ok) {
                    throw new Error(`Failed to accept request: ${response.status}`);
                }
                const result = await response.json();
                alert(result.message);
                // ✅ Move accepted request to "Active" tab
                const acceptedRequest = this.requests.pending.find(req => req.id === requestId);
                if (acceptedRequest) {
                    this.requests.pending = this.requests.pending.filter(req => req.id !== requestId);
                    acceptedRequest.service_status = 'accepted';
                    this.requests.active.push(acceptedRequest);
                }
            } catch (error) {
                console.error("Error accepting request:", error);
                alert("❌ Failed to accept the request.");
            }
        },
        // ✅ Reject Request
        async rejectRequest(requestId) {
            if (!confirm("Are you sure you want to reject this service request?")) return;
            try {
                const response = await fetch(`/api/service-requests/${requestId}/action`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    },
                    body: JSON.stringify({ action: "reject" })
                });
                if (!response.ok) {
                    throw new Error(`Failed to reject request: ${response.status}`);
                }
                const result = await response.json();
                alert(result.message);
                // ✅ Move rejected request to "Rejected" tab
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
        },
        // ✅ Mark Request as Completed
        async completeRequest(requestId) {
            if (!confirm("Are you sure you want to mark this service request as completed?")) return;
            try {
                const response = await fetch(`/api/service-requests/${requestId}/complete`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to complete request: ${response.status}`);
                }
                const result = await response.json();
                alert(result.message);
                // ✅ Move completed request to "Completed" tab
                const completedRequest = this.requests.active.find(req => req.id === requestId);
                if (completedRequest) {
                    this.requests.active = this.requests.active.filter(req => req.id !== requestId);
                    completedRequest.service_status = 'completed';
                    this.requests.completed.push(completedRequest);
                }
            } catch (error) {
                console.error("Error marking request as completed:", error);
                alert("❌ Failed to mark the request as completed.");
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
                <button class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'pending' ? 'btn-warning' : 'btn-outline-warning'"
                    @click="activeTab = 'pending'">
                    Pending Requests
                </button>
                <button class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'active' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="activeTab = 'active'">
                    Active Requests
                </button>
                <button class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'completed' ? 'btn-success' : 'btn-outline-success'"
                    @click="activeTab = 'completed'">
                    Completed Requests
                </button>
                <button class="btn px-4 fw-bold"
                    :class="activeTab === 'rejected' ? 'btn-danger' : 'btn-outline-danger'"
                    @click="activeTab = 'rejected'">
                    Rejected Requests
                </button>
            </div>
            <!-- ✅ Display Service Requests -->
            <div v-if="loading" class="text-center">
                <p>Loading service requests...</p>
            </div>
            <div v-if="!loading && error" class="alert alert-danger">{{ error }}</div>
            <div v-else>
                <div v-for="req in requests[activeTab]" :key="req.id" class="card mb-4 shadow-sm position-relative">
                    <!-- Status badge at top-right corner outside the card body -->
                    <div class="position-absolute" style="top: 15px; right: 15px;">
                        <span class="badge rounded-pill px-3 py-2" 
                            :class="{
                                'bg-warning text-dark': req.service_status === 'requested',
                                'bg-primary': req.service_status === 'accepted',
                                'bg-success': req.service_status === 'completed',
                                'bg-danger': req.service_status === 'rejected'
                            }"
                            style="font-size: 14px;">
                            {{ req.service_status }}
                        </span>
                    </div>
                    
                    <div class="card-body">
                        <h5 class="card-title">{{ req.service_name }}</h5>
                        <p><strong>Customer:</strong> {{ req.customer_name }}</p>
                        <p><strong>Email:</strong> {{ req.customer_email }}</p>
                        <p><strong>Phone:</strong> {{ req.customer_phone }}</p>
                        <p><strong>Address:</strong> {{ req.customer_address }}</p>
                        <p><strong>Requested On:</strong> {{ new Date(req.date_of_request).toLocaleString() }}</p>
                        
                        <!-- Buttons at bottom-right -->
                        <div class="d-flex justify-content-end mt-3">
                            <div v-if="activeTab === 'pending'">
                                <button class="btn btn-outline-success me-2" @click="acceptRequest(req.id)">Accept</button>
                                <button class="btn btn-outline-danger" @click="rejectRequest(req.id)">Reject</button>
                            </div>
                            <div v-if="activeTab === 'active'">
                                <button class="btn btn-outline-success" @click="completeRequest(req.id)">Complete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};