import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";
import ServiceRequestsChart from "../components/charts/ServiceRequestsChart.js";
import ServicesByCategoryChart from "../components/charts/ServicesByCategoryChart.js";

export default {
    components: {
        AdminNavbar,
        ServiceRequestsChart,
        ServicesByCategoryChart,
    },
    data() {
        return {
            profile: null,
            stats: {
                totalProfessionals: 0,
                totalCustomers: 0,
                totalServices: 0,
            },
            serviceRequestsData: null,
            servicesByCategoryData: null,
            loading: true,
            error: null,
            isExporting: false,    // To track export status
            taskId: null,          // Store the celery task ID
            pollInterval: null,    // For polling
        };
    },
    beforeCreate() {
        console.log("AdminDashboard - beforeCreate");
        if (!store.state.loggedIn) {
            alert("🚨 Please login to access this page");
            this.$router.push("/login");
            return;
        }
        if (store.state.role !== "admin") {
            alert("🚨 Access Denied: Admin privileges required");
            this.$router.push("/login");
        }
    },
    created() {
        console.log("AdminDashboard - created, calling fetchData");
        this.fetchAllData();
    },
    methods: {
        async fetchAllData() {
            this.loading = true;
            this.error = null;
            try {
                await Promise.all([
                    this.fetchProfile(),
                    this.fetchStats(),
                    this.fetchServiceRequests(),
                    this.fetchServicesByCategory(),
                ]);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                this.error = error.message || "Failed to load dashboard data.";
            } finally {
                this.loading = false;
            }
        },
        async fetchProfile() {
            const token = store.state.auth_token;
            if (!token) throw new Error("Authentication token not found.");
            const response = await fetch("/admin/dashboard", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": token,
                },
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch profile (Status: ${response.status})`);
            }
            this.profile = await response.json();
        },
        async fetchStats() {
            const token = store.state.auth_token;
            const headers = {
                "Content-Type": "application/json",
                "Authentication-Token": token,
            };

            // Total Professionals
            const profResponse = await fetch("/admin/service-professionals", { method: "GET", headers });
            if (!profResponse.ok) throw new Error("Failed to fetch professionals");
            const profData = await profResponse.json();
            this.stats.totalProfessionals = Array.isArray(profData) ? profData.length : 0;

            // Total Customers
            const custResponse = await fetch("/admin/customers", { method: "GET", headers });
            if (!custResponse.ok) throw new Error("Failed to fetch customers");
            const custData = await custResponse.json();
            this.stats.totalCustomers = Array.isArray(custData) ? custData.length : 0;

            // Total Services
            const servResponse = await fetch("/admin/home", { method: "GET", headers });
            if (!servResponse.ok) throw new Error("Failed to fetch services");
            const servData = await servResponse.json();
            this.stats.totalServices = servData.services ? servData.services.length : 0;
        },
        async fetchServiceRequests() {
            const token = store.state.auth_token;
            const response = await fetch("/admin/request/monthly", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": token,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch service requests");
            this.serviceRequestsData = await response.json();
        },
        async fetchServicesByCategory() {
            const token = store.state.auth_token;
            const response = await fetch("/admin/home", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": token,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch services by category");
            const data = await response.json();
            // Aggregate services by category
            const categoryMap = {};
            data.services.forEach(service => {
                categoryMap[service.service_category] = (categoryMap[service.service_category] || 0) + 1;
            });
            this.servicesByCategoryData = {
                labels: Object.keys(categoryMap),
                data: Object.values(categoryMap),
            };
        },
        async exportCSV() {
            try {
                this.isExporting = true;

                // Step 1: Trigger CSV export
                const response = await fetch("http://127.0.0.1:5000/create-csv");
                const data = await response.json();
                this.taskId = data.task_id;

                // Step 2: Start polling until CSV is ready
                this.pollInterval = setInterval(async () => {
                    const pollResponse = await fetch(`http://127.0.0.1:5000/get-csv/${this.taskId}`);
                    
                    if (pollResponse.status === 200) {
                        clearInterval(this.pollInterval);  // Stop polling once ready

                        // Download the CSV
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
        },
    },
    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="text-center">Admin Dashboard</h1>
                <button 
                    class="btn btn-success" 
                    @click="exportCSV" 
                    :disabled="isExporting"
                >
                    {{ isExporting ? 'Exporting...' : 'Download CSV' }}
                </button>
            </div>
            <!-- Loading State -->
            <div v-if="loading" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading dashboard...</p>
            </div>
            <!-- Error Message -->
            <div v-else-if="error" class="alert alert-danger text-center">
                <p>{{ error }}</p>
                <button @click="fetchAllData" class="btn btn-sm btn-outline-danger me-2 mt-2">Try Again</button>
            </div>
            <!-- Dashboard Content -->
            <div v-else>
                <!-- Admin Profile Info -->
                <div class="card shadow p-4 mb-4">
                    <h2 class="mb-3">Admin Information</h2>
                    <p><strong>Name:</strong> {{ profile.name || 'Not available' }}</p>
                    <p><strong>Email:</strong> {{ profile.email || 'Not available' }}</p>
                    <p><strong>Phone:</strong> {{ profile.phone || 'Not available' }}</p>
                    <p><strong>Address:</strong> {{ profile.address || 'Not available' }}</p>
                    <p><strong>Role:</strong> {{ profile.role || 'Not available' }}</p>
                </div>
                <!-- Stats Overview Cards -->
                <div class="card shadow p-4">
                    <h2 class="mb-3">Stats Overview</h2>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <div class="card text-white bg-primary shadow p-3">
                                <h5>Total Professionals</h5>
                                <p class="fs-4">{{ stats.totalProfessionals }}</p>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="card text-white bg-success shadow p-3">
                                <h5>Total Customers</h5>
                                <p class="fs-4">{{ stats.totalCustomers }}</p>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="card text-white bg-danger shadow p-3">
                                <h5>Total Services</h5>
                                <p class="fs-4">{{ stats.totalServices }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Chart Section -->
                <div class="row mt-4">
                    <div class="col-lg-6 mb-4">
                        <ServiceRequestsChart :data="serviceRequestsData" />
                    </div>
                    <div class="col-lg-6 mb-4">
                        <ServicesByCategoryChart :data="servicesByCategoryData" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
};