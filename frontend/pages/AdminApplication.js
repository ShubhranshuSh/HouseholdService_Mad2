import AdminNavbar from "../components/AdminNavbar.js";

export default {
    components: {
        AdminNavbar,
    },
    data() {
        return {
            applications: [
                {
                    id: 1,
                    name: "John Doe",
                    category: "Plumber",
                    date: "2025-02-19"
                },
                {
                    id: 2,
                    name: "Jane Smith",
                    category: "Electrician",
                    date: "2025-02-18"
                },
                {
                    id: 3,
                    name: "Michael Johnson",
                    category: "Carpenter",
                    date: "2025-02-17"
                }
            ]
        };
    },
    template: `
    <div>
        <AdminNavbar />
        <div class="container mt-5">
            <h1 class="text-center mb-4">You have Requests</h1>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="thead-dark">
                        <tr>
                            <th>Professional Name</th>
                            <th>Category</th>
                            <th>Date of Request</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="app in applications" :key="app.id">
                            <td><a href="#" class="text-primary">{{ app.name }}</a></td>
                            <td class="text-muted">{{ app.category }}</td>
                            <td>{{ app.date }}</td>
                            <td>
                                <button class="btn btn-sm btn-primary">Resume</button>
                                <button class="btn btn-sm btn-danger mx-2">Reject</button>
                                <button class="btn btn-sm btn-success">Accept</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
};