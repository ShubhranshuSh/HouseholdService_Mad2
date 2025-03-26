export default {
  template: `
    <nav class="navbar navbar-expand-lg" style="background-color: #7952b3;">
      <div class="container-fluid">
        <!-- Logo (Replaced with Text) -->
        <a class="navbar-brand" href="#/admin/home" style="font-weight: bold; color: white; font-size: 1.5rem;">
          HomeNinjas
        </a>
  
        <!-- Navbar Links -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#adminNavbar" 
          aria-controls="adminNavbar" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon" style="color: white;"></span>
        </button>
        <div class="collapse navbar-collapse" id="adminNavbar">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/service-professionals" style="color: white; font-weight: 500;">Professionals</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/services" style="color: white; font-weight: 500;">Services</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/customers" style="color: white; font-weight: 500;">Customers</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/application" style="color: white; font-weight: 500;">Applications</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/request" style="color: white; font-weight: 500;">Requests</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/dashboard" style="color: white; font-weight: 500;">Dashboard</router-link>
            </li>
          </ul>
          <!-- Logout Button -->
          <button 
            class="btn btn-danger" 
            style="font-weight: 500;" 
            @click="logoutUser">
            Logout
          </button>
        </div>
      </div>
    </nav>
  `,
  methods: {
    logoutUser() {
      localStorage.removeItem('user');
      alert('Logged out successfully!');
      this.$router.push('/login');
    },
  },
};
