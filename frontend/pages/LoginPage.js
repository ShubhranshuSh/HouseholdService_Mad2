import store from '../utils/store.js';  // Adjust the path as needed

export default {
  template: `
      <div class="d-flex justify-content-center align-items-center vh-100">
          <div class="card p-4 shadow" style="width: 24rem;">
              <h2 class="text-center mb-4">Login</h2>
              <div class="form-group mb-3">
                  <label for="email">Email Address</label>
                  <input
                      id="email"
                      type="email"
                      class="form-control"
                      placeholder="Enter email"
                      v-model="email"
                  />
              </div>
              <div class="form-group mb-3">
                  <label for="password">Password</label>
                  <input
                      id="password"
                      type="password"
                      class="form-control"
                      placeholder="Enter password"
                      v-model="password"
                  />
              </div>
              <button 
                  class="btn btn-primary w-100" 
                  :disabled="isSubmitting"
                  @click="submitLogin">
                  Login
              </button>
          </div>
      </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      isSubmitting: false,
    };
  },
  methods: {
    async submitLogin() {
      this.isSubmitting = true;
  
      if (!this.email || !this.password) {
        alert("Please fill in all fields.");
        this.isSubmitting = false;
        return;
      }
  
      try {
        const res = await fetch(location.origin + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });
  
        if (res.ok) {
          const data = await res.json();

          // Save user data persistently
          localStorage.setItem("user", JSON.stringify(data));
  
          // Update Vuex store
          store.commit('setUser');

          alert("Login successful!");

          // Navigate based on role and redirect_url
          if (data.redirect_url) {
            this.$router.push(data.redirect_url);
          } else {
            alert("Unexpected role. Please contact support.");
          }
        } else {
          const errorData = await res.json();
          alert(errorData.message || "Invalid login credentials.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again later.");
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
