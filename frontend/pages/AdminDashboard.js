import AdminNavbar from "../components/AdminNavbar.js";
import store from "../utils/store.js";

export default {
    components: {
        AdminNavbar,
    },
    beforeCreate() {
        if (!store.state.loggedIn || store.state.role !== "admin") {
            alert("🚨 Only Admin can Access this Page");
            this.$router.push("/login");
        }
    },
    template: `
      <div>
        <AdminNavbar />
        <div class="container mt-4">
          <h1 class="text-center mb-4">Admin Dashboard</h1>
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
