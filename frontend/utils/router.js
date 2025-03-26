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
import ProfessionalDashboard from "../pages/ProfessionalDashboard.js";
import CustomerDashboard from "../pages/CustomerDashboard.js";
import CustomerHome from "../pages/CustomerHome.js";
import CustomerServiceDetail from "../pages/CustomerServiceDetail.js";
import AdminRequest from "../pages/AdminRequest.js";
import CustomerServiceRequestForm from "../pages/CustomerServiceRequestForm.js";
import CustomerRequestEditForm from "../pages/CustomerRequestEditForm.js";
import CustomerRequestPage from "../pages/CustomerRequestPage.js";
import ProfessionalServicePage from "../pages/ProfessionalServicePage.js";
import ProfessionalServiceAdd from "../pages/ProfessionalServiceAdd.js";
import ProfessionalServiceEdit from "../pages/ProfessionalServiceEdit.js";
import ProfessionalRequestPage from "../pages/ProfessionalRequestPage.js";
import CustomerServiceRate from "../pages/CustomerServiceRate.js";
import CustomerDashboardUpdate from "../pages/CustomerDashboardUpdate.js";
import ProfessionalHome from "../pages/ProfessionalHome.js";
import ProfessionalServiceDetail from "../pages/ProfessionalServiceDetail.js";

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
    {path: '/admin/services/edit/:id', component: AdminServiceEdit},
    {path: '/service_professional/dashboard/:id', component: ProfessionalDashboard},
    {path: '/customer/dashboard/:id', component: CustomerDashboard},
    {path: '/customer/home', component: CustomerHome},
    {path: '/customer/service/:id', component: CustomerServiceDetail},
    {path: '/admin/request', component: AdminRequest},
    {path: '/customer/service/request/:id', component: CustomerServiceRequestForm},
    {path: '/customer/request/edit/:id', component: CustomerRequestEditForm},
    {path: '/customer/requests', component: CustomerRequestPage},
    {path: '/service_professional/services', component: ProfessionalServicePage},
    {path: '/service_professional/services/add', component: ProfessionalServiceAdd},
    {path: '/service_professional/services/edit/:id', component: ProfessionalServiceEdit},
    {path: '/service_professional/requests', component: ProfessionalRequestPage},
    {path: '/customer/request/rate/:id', component: CustomerServiceRate},
    {path: '/customer/dashboard/update/:id', component: CustomerDashboardUpdate},
    {path: '/service_professional/home', component: ProfessionalHome},
    {path: '/service_professional/service/:id', component: ProfessionalServiceDetail}
    
];

// Create a new VueRouter instance
const router = new VueRouter({
    routes
});

export default router;
