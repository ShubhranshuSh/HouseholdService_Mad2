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

        // Redirect unauthorized users to login
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert(" Only Admins can access this page");
            this.$router.push("/login");
        }
    },

    created() {
        this.fetchRequests();
    },

    methods: {
        //  Fetch Service Requests
        async fetchRequests() {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch('/admin/request', {
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

                //  Assign requests to their respective sections
                this.requests.pending = data.pending || [];
                this.requests.active = data.active || [];
                this.requests.completed = data.completed || [];
                this.requests.rejected = data.rejected || [];

            } catch (error) {
                console.error("Error fetching requests:", error);
                this.error = "Failed to load service requests. Please try again.";
            } finally {
                this.loading = false;
            }
        },

        // Accept Request
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

                // Move request to "Active" tab
                const acceptedRequest = this.requests.pending.find(req => req.id === requestId);
                if (acceptedRequest) {
                    this.requests.pending = this.requests.pending.filter(req => req.id !== requestId);
                    acceptedRequest.status = 'active';   
                    this.requests.active.push(acceptedRequest);
                }

            } catch (error) {
                console.error("Error accepting request:", error);
                alert(" Failed to accept the request.");
            }
        },

        //  Reject Request
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

                //  Move rejected request to "Rejected" tab
                const rejectedRequest = this.requests.pending.find(req => req.id === requestId);
                if (rejectedRequest) {
                    this.requests.pending = this.requests.pending.filter(req => req.id !== requestId);
                    rejectedRequest.status = 'rejected';   
                    this.requests.rejected.push(rejectedRequest);
                }

            } catch (error) {
                console.error("Error rejecting request:", error);
                alert(" Failed to reject the request.");
            }
        },

        //  Mark Request as Completed
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

                //  Move completed request to "Completed" tab
                const completedRequest = this.requests.active.find(req => req.id === requestId);
                if (completedRequest) {
                    this.requests.active = this.requests.active.filter(req => req.id !== requestId);
                    completedRequest.status = 'completed';   
                    this.requests.completed.push(completedRequest);
                }

            } catch (error) {
                console.error("Error marking request as completed:", error);
                alert(" Failed to mark the request as completed.");
            }
        }
    },

    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Admin Service Requests</h1>

            <!--  Tab Navigation -->
            <div class="d-flex justify-content-center mb-4">
                <button class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'pending' ? 'btn-warning' : 'btn-outline-warning'"
                    @click="activeTab = 'pending'">Pending</button>

                <button class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'active' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="activeTab = 'active'">Active</button>

                <button class="btn me-2 px-4 fw-bold"
                    :class="activeTab === 'completed' ? 'btn-success' : 'btn-outline-success'"
                    @click="activeTab = 'completed'">Completed</button>

                <button class="btn px-4 fw-bold"
                    :class="activeTab === 'rejected' ? 'btn-danger' : 'btn-outline-danger'"
                    @click="activeTab = 'rejected'">Rejected</button>
            </div>

            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading service requests...</p>
            </div>

            <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }}
            </div>

            <div v-else>
                <div v-for="req in requests[activeTab]" :key="req.id" class="card mb-4 shadow-sm border-0 rounded-3">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="fw-bold">{{ req.service_name }}</h5>
                            <p><strong>Customer:</strong> {{ req.customer_name }}</p>
                            <p><strong>Date:</strong> {{ req.date }}</p>
                        </div>

                        <!--  Status Badge Rendering -->
                        <div>
                            <span class="badge" 
                                :class="{
                                    'bg-warning': req.status === 'pending',
                                    'bg-primary': req.status === 'active',
                                    'bg-success': req.status === 'completed',
                                    'bg-danger': req.status === 'rejected'
                                }">
                                {{ req.status }}
                            </span>
                        </div>
                    </div>

                    <!--  Buttons -->
                    <div class="card-footer bg-white border-0 d-flex justify-content-end pb-3 pe-3">
                        <button v-if="activeTab === 'pending'" @click="acceptRequest(req.id)" class="btn btn-sm btn-outline-success me-2">Accept</button>
                        <button v-if="activeTab === 'pending'" @click="rejectRequest(req.id)" class="btn btn-sm btn-outline-danger">Reject</button>
                        <button v-if="activeTab === 'active'" @click="completeRequest(req.id)" class="btn btn-sm btn-outline-success">Complete</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};
