export default {
    props: ["application"],
    data() {
        return {
            resumeUrl: null,
            loading: false,
            error: null
        };
    },
    template: `
    <div class="card shadow-lg p-4 mb-4 border-0 rounded-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0 fw-bold">
                <router-link :to="'/admin/application/' + application.id" class="text-dark text-decoration-none">
                    {{ application.name }}
                </router-link>
            </h4>
            <span class="badge bg-primary fs-6">{{ application.service_category }}</span>
        </div>
        
        <div class="mb-3">
            <p class="text-muted mb-1"><i class="bi bi-envelope-fill me-2"></i> <strong>Email:</strong> {{ application.email }}</p>
            <p class="text-muted mb-1"><i class="bi bi-telephone-fill me-2"></i> <strong>Phone:</strong> {{ application.phone }}</p>
            <p class="text-muted"><i class="bi bi-calendar-check me-2"></i> <strong>Date of Request:</strong> {{ formattedDate }}</p>
        </div>

        <div class="d-flex justify-content-end gap-2">
            <button 
                @click="viewResume" 
                class="btn btn-outline-primary btn-sm"
                :disabled="loading"
            >
                <i class="bi bi-file-earmark-text me-1"></i> 
                {{ loading ? 'Loading...' : 'View Resume' }}
            </button>
            <button @click="updateStatus('No')" class="btn btn-outline-danger btn-sm">
                <i class="bi bi-x-circle"></i> Reject
            </button>
            <button @click="updateStatus('Yes')" class="btn btn-success btn-sm">
                <i class="bi bi-check-circle"></i> Accept
            </button>
        </div>

        <!-- Resume Modal -->
        <div v-if="resumeUrl" class="modal fade show" tabindex="-1" style="display: block; background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Resume - {{ application.name }}</h5>
                        <button type="button" class="btn-close" @click="closeResume"></button>
                    </div>
                    <div class="modal-body p-0">
                        <iframe 
                            :src="resumeUrl" 
                            width="100%" 
                            height="500" 
                            frameborder="0"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    methods: {
        async viewResume() {
            this.loading = true;
            this.error = null;
            
            try {
                const token = this.$store.state.auth_token;
                const response = await fetch(`/admin/application/${this.application.id}/resume`, {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': token
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch resume');
                }

                // Create a blob URL for the PDF
                const blob = await response.blob();
                this.resumeUrl = URL.createObjectURL(blob);
            } catch (err) {
                console.error('Resume fetch error:', err);
                this.error = err.message;
                alert(`Failed to load resume: ${err.message}`);
            } finally {
                this.loading = false;
            }
        },
        closeResume() {
            if (this.resumeUrl) {
                URL.revokeObjectURL(this.resumeUrl);
            }
            this.resumeUrl = null;
        },
        async updateStatus(status) {
            try {
                const response = await fetch(`/api/admin/application/${this.application.id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify({ status })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                alert(result.message);
                this.$emit("application-updated");
            } catch (error) {
                console.error('Error:', error);
                alert(`Failed to update application status: ${error.message}`);
            }
        }
    },
    computed: {
        formattedDate() {
            if (!this.application.date_applied) return "Invalid Date"; 
            const date = new Date(this.application.date_applied);
            return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }
    },
    beforeUnmount() {
        // Ensure blob URL is revoked when component is destroyed
        if (this.resumeUrl) {
            URL.revokeObjectURL(this.resumeUrl);
        }
    }
};