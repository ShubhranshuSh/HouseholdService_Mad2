import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    components: { CustomerNavbar },

    data() {
        return {
            profile: {
                name: '',         // Non-editable
                email: '',
                phone: '',
                address: '',      // ✅ Added Address
                pincode: ''       // ✅ Added Pincode
            },
            loading: true,
            error: null,
            success: null,
            debugInfo: {
                userId: null,
                responseReceived: false,
                responseStatus: null
            }
        };
    },

    beforeCreate() {
        console.log("CustomerDashboardUpdate - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });

        // ✅ Check for authentication and role
        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert("🚨 Only Customers can access this page");
            this.$router.push("/login");
        }
    },

    created() {
        console.log("CustomerDashboardUpdate - created, calling fetchProfile");
        this.fetchProfile();
    },

    methods: {
        // ✅ Fetch customer profile data
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

                this.profile = { ...data };
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

        // ✅ Save updated profile
        async saveProfile() {
            try {
                const userId = this.$route.params.id || store.state.user_id;
                const token = store.state.auth_token;

                console.log("Saving profile for user ID:", userId);
                console.log("Using token:", token ? "Token exists" : "No token found");

                const response = await fetch(`/customer/dashboard/${userId}/update`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    },
                    body: JSON.stringify({
                        email: this.profile.email,
                        phone: this.profile.phone,
                        address: this.profile.address,   // ✅ Added address
                        pincode: this.profile.pincode   // ✅ Added pincode
                    })
                });

                console.log("Response status:", response.status);
                if (!response.ok) {
                    throw new Error("Failed to update profile");
                }

                const responseData = await response.json();
                console.log("Response data:", responseData);

                this.success = "Profile updated successfully!";
                this.$router.push(`/customer/dashboard/${userId}`);
            } catch (error) {
                console.error("Error updating profile:", error);
                this.error = error.message || "Failed to update profile.";
            }
        }
    },

    template: `
    <div>
        <CustomerNavbar />
        <div class="container mt-4">
            <h1 class="text-center">Update Profile</h1>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="success" class="alert alert-success">{{ success }}</div>

            <form @submit.prevent="saveProfile">
                
                <div class="mb-3">
                    <label>Name (Non-editable)</label>
                    <input type="text" v-model="profile.name" class="form-control" disabled />
                </div>

                <div class="mb-3">
                    <label>Email</label>
                    <input type="email" v-model="profile.email" class="form-control" required />
                </div>

                <div class="mb-3">
                    <label>Phone</label>
                    <input type="text" v-model="profile.phone" class="form-control" required />
                </div>

                <div class="mb-3">
                    <label>Address</label>   <!-- ✅ Added address field -->
                    <input type="text" v-model="profile.address" class="form-control" required />
                </div>

                <div class="mb-3">
                    <label>Pincode</label>   <!-- ✅ Added pincode field -->
                    <input type="text" v-model="profile.pincode" class="form-control" required />
                </div>

                <button type="submit" class="btn btn-primary">Update</button>
            </form>
        </div>
    </div>
    `
};
