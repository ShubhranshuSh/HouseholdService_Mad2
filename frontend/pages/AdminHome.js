import AdminNavbar from "../components/AdminNavbar.js";

export default {
    components: {
        AdminNavbar,
    },
    template: `
    <div>
    
        <AdminNavbar />
        
        <div class="container mt-5">
            <h1 class="text-center">Admin Home</h1>
            <p class="text-center">Welcome to the admin panel.</p>
        </div>
    </div>
    `,
}