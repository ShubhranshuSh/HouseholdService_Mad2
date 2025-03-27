import AdminNavbar from "../components/AdminNavbar.js";
import ApplicationCard from "../components/ApplicationCard.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
        ApplicationCard
    },
    data() {
        return {
            applications: [],
            loading: true,
            error: null
        };
    },
    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert("Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">Pending Applications</h1>
            <div v-if="loading" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div v-else-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>
            <div v-else>
                <ApplicationCard 
                    v-for="app in applications" 
                    :key="app.id" 
                    :application="app"
                    @application-updated="fetchApplications"
                />
            </div>
        </div>
    </div>
    `,
    async mounted() {
        this.fetchApplications();
    },
    methods: {
        async fetchApplications() {
            this.loading = true;
            this.error = null;
            const token = store.state.auth_token;
            if (!token) {
                this.error = "Authentication token is missing. Please log in again.";
                this.loading = false;
                return;
            }
            try {
                const response = await fetch('/admin/applications', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                this.applications = result.map(app => ({
                    ...app,
                    resume: app.resume || ''
                }));
            } catch (err) {
                console.error("Error:", err);
                this.error = `Failed to fetch applications: ${err.message}`;
            } finally {
                this.loading = false;
            }
        }
    }
};