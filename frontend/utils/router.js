import Home from "../pages/Home.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import CustomerRegister from "../pages/CustomerRegister.js";
import ProfessionalRegister from "../pages/ProfessionalRegister.js";
import AdminHome from "../pages/AdminHome.js";
import AdminApplication from "../pages/AdminApplication.js";
import ProfessionalDetailApp from "../components/ProfessionalDetailApp.js";
import AdminDashboard from "../pages/AdminDashboard.js";
import AdminCustomerPage from "../pages/AdminCustomerPage.js";
import AdminProfPage from "../pages/AdminProfPage.js";
import AdminServicePage from "../pages/AdminServicePage.js";
import AdminServiceAdd from "../pages/AdminServiceAdd.js";
import AdminServiceEdit from "../pages/AdminServiceEdit.js";

// Mapping of routes to components
const routes = [
    { path: '/', component: Home },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/register/customer', component: CustomerRegister },
    { path: '/register/professional', component: ProfessionalRegister },
    { path: '/admin/home', component: AdminHome },
    { path: '/admin/application', component: AdminApplication },
    { path: '/admin/application/:id', component: ProfessionalDetailApp },
    { path: '/admin/dashboard', component: AdminDashboard },
    { path: '/admin/customers', component: AdminCustomerPage },
    { path: '/admin/service-professionals', component: AdminProfPage },
    { path: '/admin/services', component: AdminServicePage },
    {path: '/admin/services/add', component: AdminServiceAdd},
    {path: '/admin/services/edit/:id', component: AdminServiceEdit}
];

// Create a new VueRouter instance
const router = new VueRouter({
    routes
});

export default router;
