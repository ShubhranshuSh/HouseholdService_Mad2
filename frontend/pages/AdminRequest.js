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
        this.fetchRequests();
    },

    methods: {
        // ✅ Fetch Service Requests with Duplicate Removal
        async fetchRequests() {
            this.loading = true;
            this.error = null;

            try {
                const [simpleRes, apiRes] = await Promise.all([
                    fetch('/admin/request', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': store.state.auth_token
                        }
                    }),
                    fetch('/api/service-requests/pending', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': store.state.auth_token
                        }
                    })
                ]);

                if (!simpleRes.ok || !apiRes.ok) {
                    throw new Error(`Failed to fetch requests: ${simpleRes.status} / ${apiRes.status}`);
                }

                const simpleData = await simpleRes.json();
                const apiData = await apiRes.json();

                // ✅ Combine responses and remove duplicates by `id`
                const combinedPending = [...simpleData.pending, ...apiData];

                // ✅ Remove duplicates using Map (by ID)
                const uniquePending = Array.from(new Map(combinedPending.map(req => [req.id, req])).values());

                // ✅ Assign unique requests to the pending section
                this.requests.pending = uniquePending;
                this.requests.active = [...simpleData.active];
                this.requests.completed = [...simpleData.completed];
                this.requests.rejected = [...simpleData.rejected];

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

                // ✅ Move request to "Active" tab
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
                <p>Loading service requests...</p>
            </div>

            <div v-if="!loading && error" class="alert alert-danger">{{ error }}</div>

            <div v-else>
                <div v-for="req in requests[activeTab]" :key="req.id" class="card mb-4 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">{{ req.service_name }}</h5>
                        <p><strong>Customer:</strong> {{ req.customer_name }}</p>
                        <p><strong>Date:</strong> {{ req.date }}</p>
                        <p><strong>Status:</strong> {{ req.service_status }}</p>

                        <!-- ✅ Buttons -->
                        <div v-if="activeTab === 'pending'" class="mt-3">
                            <button class="btn btn-success me-2" @click="acceptRequest(req.id)">Accept</button>
                            <button class="btn btn-danger" @click="rejectRequest(req.id)">Reject</button>
                        </div>

                        <div v-if="activeTab === 'active'" class="mt-3">
                            <button class="btn btn-success" @click="completeRequest(req.id)">Complete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};
