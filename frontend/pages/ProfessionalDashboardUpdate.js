import store from "../utils/store.js";
import ProfessionalNavbar from "../components/ProfessionalNavbar.js";

export default {
    components: { ProfessionalNavbar },
    
    data() {
        return {
            profile: {
                name: '',
                email: '',
                phone: '',
                address: '',
                experience: '',
                service_category: ''
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
        console.log("ProfessionalUpdateDashboard - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });

        // Check for authentication and role
        if (!store.state.loggedIn || store.state.role !== "service_professional") {
            alert("Only Service Professionals can access this page");
            this.$router.push("/login");
        }
    },

    created() {
        console.log("ProfessionalUpdateDashboard - created, calling fetchProfile");
        this.fetchProfile();
    },

    methods: {
        // Fetch service professional profile data
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

                const apiUrl = `/service_professional/dashboard/${userId}`;
                const headers = {
                    "Content-Type": "application/json",
                    "Authentication-Token": token
                };

                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: headers,
                    credentials: "include"
                });

                this.debugInfo.responseReceived = true;
                this.debugInfo.responseStatus = response.status;

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || `Failed to fetch profile data (Status: ${response.status})`);
                }

                this.profile = { ...data }; // Set profile data
                console.log("Profile data:", this.profile);
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
            }
        },

        // Save updated profile data
        async saveProfile() {
            try {
                const userId = this.$route.params.id || store.state.user_id;
                const token = store.state.auth_token;

                console.log("Saving profile for user ID:", userId);

                const response = await fetch(`/service_professional/dashboard/${userId}/update`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    },
                    body: JSON.stringify({
                        phone: this.profile.phone,
                        address: this.profile.address,
                        experience: this.profile.experience
                    })
                });

                if (!response.ok) {
                    throw new Error("Failed to update profile");
                }

                const responseData = await response.json();
                console.log("Response data:", responseData);

                this.success = "Profile updated successfully!";
                this.$router.push(`/service_professional/dashboard/${userId}`);
            } catch (error) {
                console.error("Error updating profile:", error);
                this.error = error.message || "Failed to update profile.";
            }
        }
    },

    template: `
    <div>
        <ProfessionalNavbar />
        <div class="container mt-4">
            <h1 class="text-center">Update Profile</h1>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="success" class="alert alert-success">{{ success }}</div>

            <form @submit.prevent="saveProfile">
                
                <div class="mb-3">
                    <label>Name</label>
                    <input type="text" v-model="profile.name" class="form-control" disabled />
                </div>

                <div class="mb-3">
                    <label>Email</label>
                    <input type="email" v-model="profile.email" class="form-control" disabled />
                </div>

                <div class="mb-3">
                    <label>Phone</label>
                    <input type="text" v-model="profile.phone" class="form-control" required />
                </div>

                <div class="mb-3">
                    <label>Address</label>
                    <input type="text" v-model="profile.address" class="form-control" required />
                </div>

                <div class="mb-3">
                    <label>Experience</label>
                    <input type="text" v-model="profile.experience" class="form-control" required />
                </div>

                <div class="mb-3">
                    <label>Service Category</label>
                    <input type="text" v-model="profile.service_category" class="form-control" disabled />
                </div>

                <button type="submit" class="btn btn-primary">Update</button>
            </form>
        </div>
    </div>
    `
};
