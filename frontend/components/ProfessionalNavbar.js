export default {
  data() {
    return {
      userId: null
    }
  },
  created() {
    // Get user information from localStorage when component is created
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userId = user.id || user.user_id || user._id;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  },
  template: `
    <nav class="navbar navbar-expand-lg" style="background-color: #0D6EFD;">
      <div class="container-fluid">
        
        <!-- App Name instead of Logo -->
        <a class="navbar-brand" href="#/service_professional/home" style="font-weight: bold; color: white; font-size: 24px;">
          HomeNinjas
        </a>

        <!-- Navbar Links -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#professionalNavbar" 
          aria-controls="professionalNavbar" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon" style="color: white;"></span>
        </button>
        <div class="collapse navbar-collapse" id="professionalNavbar">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/service_professional/requests" style="color: white; font-weight: 500;">Requests</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/service_professional/services" style="color: white; font-weight: 500;">My Services</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="'/service_professional/dashboard/' + userId" style="color: white; font-weight: 500;">Dashboard</router-link>
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
