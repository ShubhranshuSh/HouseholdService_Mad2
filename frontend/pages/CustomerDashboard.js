import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    components: { CustomerNavbar },
    data() {
        return {
            profile: null,
            loading: true,
            error: null,
            debugInfo: {
                userId: null,
                responseReceived: false,
                responseStatus: null
            }
        };
    },
    beforeCreate() {
        console.log("CustomerDashboard - beforeCreate");
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
        console.log("CustomerDashboard - created, calling fetchProfile");
        this.fetchProfile();
    },
    methods: {
        async fetchProfile() {
            try {
                const userId = this.$route.params.id || store.state.user_id;
                this.debugInfo.userId = userId;
                const token = store.state.auth_token;

                if (!userId) {
                    throw new Error("User ID not found in store or route params");
                }
                console.log("Fetching profile for user ID:", userId);
                console.log("Using token:", token ? "Token exists" : "No token found");

                const apiUrl = `/customer/dashboard/${userId}`;
                console.log("API URL:", apiUrl);
                
                const headers = {
                    "Content-Type": "application/json",
                    "Authentication-Token": token
                };

                console.log("Request headers:", headers);
                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: headers,
                    credentials: "include"
                });

                this.debugInfo.responseReceived = true;
                this.debugInfo.responseStatus = response.status;

                console.log("Response status:", response.status);
                const data = await response.json();
                console.log("Response data:", data);

                if (!response.ok) {
                    throw new Error(data.message || `Failed to fetch profile data (Status: ${response.status})`);
                }

                this.profile = data;
                console.log("Profile set:", this.profile);
            } catch (error) {
                console.error("Error fetching profile:", error);
                this.error = error.message || "Failed to load profile.";

                if (error.message && (
                    error.message.includes("Login required") || 
                    error.message.includes("Access Denied"))) {
                    store.commit("logout");
                    this.$router.push("/login");
                }
            } finally {
                this.loading = false;
                console.log("Loading complete, state:", {
                    profile: !!this.profile,
                    error: this.error,
                    loading: this.loading
                });
            }
        },

        // ✅ Navigate to the profile update page
        editProfile() {
            const userId = this.$route.params.id || store.state.user_id;
            this.$router.push(`/customer/dashboard/update/${userId}`);
        }
    },
    template: `
      <div>
        <CustomerNavbar />
        <div class="container mt-4">
            <h1 class="text-center mb-4">Customer Dashboard</h1>
            
            <div v-if="loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p>Loading profile...</p>
            </div>
            
            <div v-else-if="error" class="alert alert-danger text-center">
              <p>{{ error }}</p>
              <button @click="fetchProfile" class="btn btn-sm btn-outline-danger me-2 mt-2">Try Again</button>
            </div>
            
            <div v-else-if="profile" class="card shadow p-4 mb-4">
              <h2 class="mb-3">Customer Information</h2>
              <p><strong>Name:</strong> {{ profile.name || 'Not available' }}</p>
              <p><strong>Email:</strong> {{ profile.email || 'Not available' }}</p>
              <p><strong>Phone:</strong> {{ profile.phone || 'Not available' }}</p>
              <p><strong>Address:</strong> {{ profile.address || 'Not available' }}</p>
              <p><strong>Pincode:</strong> {{ profile.pincode || 'Not available' }}</p>
              
              <div class="mt-4">
                <button class="btn btn-primary me-2" @click="editProfile">Edit Profile</button>
              </div>
            </div>
            
            <div v-else class="alert alert-warning text-center">
              <p>No profile data available. Please try refreshing the page.</p>
              <button @click="fetchProfile" class="btn btn-sm btn-outline-warning mt-2">Reload Data</button>
            </div>
        </div>
      </div>
    `
};
