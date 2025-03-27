import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            isExporting: false,    // To track export status
            taskId: null,          // Store the celery task ID
            pollInterval: null,    // For polling
        };
    },
    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert("🚨 Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    methods: {
        async exportCSV() {
            try {
                this.isExporting = true;

                // ✅ Step 1: Trigger CSV export
                const response = await fetch("http://127.0.0.1:5000/create-csv");
                const data = await response.json();
                this.taskId = data.task_id;

                // ✅ Step 2: Start polling until CSV is ready
                this.pollInterval = setInterval(async () => {
                    const pollResponse = await fetch(`http://127.0.0.1:5000/get-csv/${this.taskId}`);
                    
                    if (pollResponse.status === 200) {
                        clearInterval(this.pollInterval);  // Stop polling once ready

                        // ✅ Download the CSV
                        const blob = await pollResponse.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "service_requests.csv";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);

                        alert("✅ CSV downloaded successfully!");
                        this.isExporting = false;
                    } 
                    else if (pollResponse.status === 404) {
                        clearInterval(this.pollInterval);
                        alert("❌ CSV file not found.");
                        this.isExporting = false;
                    }
                }, 2000);  // Poll every 2 seconds

            } catch (error) {
                console.error("Error exporting CSV:", error);
                alert("❌ Failed to export CSV.");
                this.isExporting = false;
            }
        }
    },
    template: `
      <div>
        <AdminNavbar />
        <div class="container mt-4">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="text-center mb-4">Admin Dashboard</h1>
            <button 
                class="btn btn-success" 
                @click="exportCSV" 
                :disabled="isExporting"
            >
                {{ isExporting ? 'Exporting...' : 'Download CSV' }}
            </button>
          </div>
          <div class="card shadow p-4 mb-4">
            <h2 class="mb-3">Admin Information</h2>
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> admin@example.com</p>
            <p><strong>Role:</strong> Super Admin</p>
          </div>
          <div class="card shadow p-4">
            <h2 class="mb-3">Stats Overview</h2>
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="card text-white bg-primary shadow p-3">
                  <h5>Total Professionals</h5>
                  <p class="fs-4">120</p>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card text-white bg-warning shadow p-3">
                  <h5>Pending Applications</h5>
                  <p class="fs-4">30</p>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card text-white bg-success shadow p-3">
                  <h5>Total Customers</h5>
                  <p class="fs-4">500</p>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card text-white bg-danger shadow p-3">
                  <h5>Total Services</h5>
                  <p class="fs-4">75</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
};
