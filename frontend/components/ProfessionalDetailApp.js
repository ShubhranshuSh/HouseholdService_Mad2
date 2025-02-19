import AdminNavbar from "../components/AdminNavbar.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            professional: null,
            loading: true,
            error: null
        };
    },
    template: `
    <div class="container mt-5">
        <AdminNavbar />
        <h1 class="text-center mb-4">Professional Details</h1>
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        <div v-else class="card">
            <div class="card-body">
                <h2 class="card-title">{{ professional.name }}</h2>
                <p><strong>Email:</strong> {{ professional.email }}</p>
                <p><strong>Phone:</strong> {{ professional.phone }}</p>
                <p><strong>Address:</strong> {{ professional.address }}</p>
                <p><strong>Pincode:</strong> {{ professional.pincode }}</p>
                <p><strong>Experience:</strong> {{ professional.experience }} years</p>
                <p><strong>Service Category:</strong> {{ professional.service_category }}</p>
                <button @click="viewResume" class="btn btn-primary">View Resume</button>
            </div>
        </div>
    </div>
    `,
    methods: {
        viewResume() {
            window.open(`/api/admin/application/${this.$route.params.id}/resume`, '_blank');
        }
    },
    async mounted() {
        const id = this.$route.params.id;
        try {
            const response = await fetch(`/api/admin/application/${id}`, {
                headers: {
                    'Authentication-Token': this.$store.state.auth_token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.professional = await response.json();
        } catch (err) {
            console.error('Error:', err);
            this.error = `Failed to fetch professional details: ${err.message}`;
        } finally {
            this.loading = false;
        }
    }
};
