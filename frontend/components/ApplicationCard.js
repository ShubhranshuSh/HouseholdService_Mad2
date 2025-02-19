export default {
    props: ["application"],
    template: `
    <div class="card shadow-lg p-4 mb-4 border-0 rounded-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0 fw-bold">
                <router-link :to="'/admin/application/' + application.id" class="text-dark text-decoration-none">{{ application.name }}</router-link>
            </h4>
            <span class="badge bg-primary fs-6">{{ application.service_category }}</span>
        </div>
        
        <div class="mb-3">
            <p class="text-muted mb-1"><i class="bi bi-envelope-fill me-2"></i> <strong>Email:</strong> {{ application.email }}</p>
            <p class="text-muted mb-1"><i class="bi bi-telephone-fill me-2"></i> <strong>Phone:</strong> {{ application.phone }}</p>
            <p class="text-muted"><i class="bi bi-calendar-check me-2"></i> <strong>Date of Request:</strong> {{ formattedDate }}</p>
        </div>

        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-outline-primary btn-sm">
                <i class="bi bi-file-earmark-text"></i> View Resume
            </button>
            <button class="btn btn-outline-danger btn-sm">
                <i class="bi bi-x-circle"></i> Reject
            </button>
            <button class="btn btn-success btn-sm">
                <i class="bi bi-check-circle"></i> Accept
            </button>
        </div>
    </div>
    `,
    computed: {
        formattedDate() {
            if (!this.application.date_applied) return "Invalid Date"; 

            const date = new Date(this.application.date_applied);
            if (isNaN(date.getTime())) return "Invalid Date";

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
};
