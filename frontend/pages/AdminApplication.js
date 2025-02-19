import AdminNavbar from "../components/AdminNavbar.js";
import ApplicationCard from "../components/ApplicationCard.js";

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
                />
            </div>
        </div>
    </div>
    `,
    async mounted() {
        try {
            const response = await fetch('/admin/applications', {
                headers: {
                    'Authentication-Token': this.$store.state.auth_token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.applications = await response.json();
        } catch (err) {
            console.error('Error:', err);
            this.error = `Failed to fetch applications: ${err.message}`;
        } finally {
            this.loading = false;
        }
    }
};
