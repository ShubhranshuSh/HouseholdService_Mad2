import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    components: { CustomerNavbar },
    data() {
        return {
            loading: true,
            error: null
        };
    },
    beforeCreate() {
        console.log("CustomerHome - beforeCreate");
        console.log("Auth state:", {
            loggedIn: store.state.loggedIn,
            role: store.state.role,
            userId: store.state.user_id
        });

        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert("🚨 Only Customers can access this page");
            this.$router.push("/login");
        }
    },
    created() {
        console.log("CustomerHome - created");
        this.loading = false;
    },
    template: `
      <div>
        <CustomerNavbar />
        <div class="container mt-4">
            <h1 class="text-center mb-4">Customer Home Page</h1>
        </div>
      </div>
    `
};
