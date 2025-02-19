export default {
  template: `
    <nav class="navbar navbar-expand-lg" style="background-color: #7952b3;">
      <div class="container-fluid">
        <!-- Logo -->
        <a class="navbar-brand" href="#/admin/home" style="font-weight: bold; color: white;">
          <img src="/static/logo/logo_svg.svg" alt="HomeCrew" style="width: 50px; height: 50px;" />
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
              <router-link class="nav-link" to="/admin/application" style="color: white; font-weight: 500;">Application</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/professionals" style="color: white; font-weight: 500;">Professionals</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/profile" style="color: white; font-weight: 500;">Profile</router-link>
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
