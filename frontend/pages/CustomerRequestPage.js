import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    components: { CustomerNavbar },
    
    data() {
        return {
            activeTab: "pending",
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
        
        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert("🚨 Only Customers can access this page");
            this.$router.push("/login");
        }
    },
    
    created() {
        this.fetchCustomerRequests();
    },
    
    methods: {
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
                
                const canceledRequest = this.requests.pending.find(req => req.id === requestId) || 
                                       this.requests.active.find(req => req.id === requestId);
                
                if (canceledRequest) {
                    this.requests.pending = this.requests.pending.filter(req => req.id !== requestId);
                    this.requests.active = this.requests.active.filter(req => req.id !== requestId);
                    
                    canceledRequest.status = 'cancelled';  
                    this.requests.rejected.push(canceledRequest);
                }
            } catch (error) {
                console.error("Error cancelling request:", error);
                alert("❌ Failed to cancel the request. Please try again.");
            }
        },
        
        editRequest(requestId) {
            this.$router.push(`/customer/request/edit/${requestId}`);
        },
        
        rateService(requestId) {
            this.$router.push(`/customer/request/rate/${requestId}`);
        }
    },
    
    template: `
    <div>
        <CustomerNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">My Service Requests</h1>
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
                <div v-if="activeTab === 'pending'">
                    <h3 class="text-center mb-3">📌 Pending Requests</h3>
                    <div v-if="requests.pending.length === 0" class="text-muted text-center">No pending requests found.</div>
                    <div v-for="req in requests.pending" :key="req.id" class="card mb-4 shadow-sm border-0 rounded-3">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="fw-bold">{{ req.service_name }}</h5>
                                <p><strong>Date:</strong> {{ req.date }}</p>
                                <p><strong>Time:</strong> {{ req.time }}</p>
                                <p><strong>Remarks:</strong> {{ req.remarks || "No remarks" }}</p>
                            </div>
                            <div>
                                <span class="badge bg-warning fs-6">Pending</span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-0 d-flex justify-content-end pb-3 pe-3">
                            <button @click="editRequest(req.id)" class="btn btn-sm btn-outline-primary me-2">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button @click="cancelRequest(req.id)" class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-x-circle"></i> Cancel
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="activeTab === 'active'">
                    <h3 class="text-center mb-3">🔥 Active Requests</h3>
                    <div v-if="requests.active.length === 0" class="text-muted text-center">No active requests found.</div>
                    <div v-for="req in requests.active" :key="req.id" class="card mb-4 shadow-sm border-0 rounded-3">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="fw-bold">{{ req.service_name }}</h5>
                                <p><strong>Date:</strong> {{ req.date }}</p>
                                <p><strong>Time:</strong> {{ req.time }}</p>
                                <p><strong>Remarks:</strong> {{ req.remarks || "No remarks" }}</p>
                            </div>
                            <div>
                                <span class="badge bg-primary fs-6">Active</span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-0 d-flex justify-content-end pb-3 pe-3">
                            <button @click="editRequest(req.id)" class="btn btn-sm btn-outline-primary me-2">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button @click="cancelRequest(req.id)" class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-x-circle"></i> Cancel
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="activeTab === 'completed'">
                    <h3 class="text-center mb-3">✅ Completed Requests</h3>
                    <div v-if="requests.completed.length === 0" class="text-muted text-center">No completed requests found.</div>
                    <div v-for="req in requests.completed" :key="req.id" class="card mb-4 shadow-sm border-0 rounded-3">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="fw-bold">{{ req.service_name }}</h5>
                                <p><strong>Date:</strong> {{ req.date }}</p>
                                <p><strong>Time:</strong> {{ req.time }}</p>
                                <p><strong>Remarks:</strong> {{ req.remarks || "No remarks" }}</p>
                            </div>
                            <div>
                                <span class="badge bg-success fs-6">Completed</span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-0 d-flex justify-content-end pb-3 pe-3">
                            <button @click="rateService(req.id)" class="btn btn-sm btn-outline-success">
                                <i class="bi bi-star"></i> Rate Service
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="activeTab === 'rejected'">
                    <h3 class="text-center mb-3">🚫 Rejected/Cancelled Requests</h3>
                    <div v-if="requests.rejected.length === 0" class="text-muted text-center">No rejected or cancelled requests found.</div>
                    <div v-for="req in requests.rejected" :key="req.id" class="card mb-4 shadow-sm border-0 rounded-3">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="fw-bold">{{ req.service_name }}</h5>
                                <p><strong>Date:</strong> {{ req.date }}</p>
                                <p><strong>Time:</strong> {{ req.time }}</p>
                                <p><strong>Remarks:</strong> {{ req.remarks || "No remarks" }}</p>
                            </div>
                            <div>
                                <span class="badge" 
                                    :class="req.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'">
                                    {{ req.status }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};