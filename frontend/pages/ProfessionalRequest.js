import store from "../utils/store.js";
import ProfessionalNavbar from "../components/ProfessionalNavbar.js";

export default {
    components: { ProfessionalNavbar },
    data() {
        return {
            loading: true,
            error: null
        };
    },
    beforeCreate() {
        console.log("ProfessionalRequest - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });

        if (!store.state.loggedIn || store.state.role !== "professional") {
            alert("🚨 Only Service Professionals can access this page");
            this.$router.push("/login");
        }
    },
    created() {
        console.log("ProfessionalRequest - created");
        this.loading = false;
    },
    template: `
    <div>
        <ProfessionalNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Professional Requests</h1>
            
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading...</p>
            </div>
            
            <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }}
            </div>
            
            <div v-else class="text-center">
                <p>No request data to display yet.</p>
            </div>
        </div>
    </div>
    `
};
