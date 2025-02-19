import Home from "../pages/Home.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import CustomerRegister from "../pages/CustomerRegister.js";
import ProfessionalRegister from "../pages/ProfessionalRegister.js";
import AdminHome from "../pages/AdminHome.js";
import AdminRequest from "../pages/AdminRequest.js";


// Mapping of routes to components
const routes = [
    { path: '/', component: Home },
    { path: '/login', component: LoginPage },
    {path: '/register', component: RegisterPage},
    {path: '/register/customer', component: CustomerRegister},
    {path: '/register/professional', component: ProfessionalRegister},
    {path: '/admin/home', component: AdminHome},
    { path: '/admin/requests', component: AdminRequest }
    // You can add the Register route later if needed
];

// Create a new VueRouter instance
const router = new VueRouter({
    routes
});

export default router;
