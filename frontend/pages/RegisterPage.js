export default {
  template: `
    <div>
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-light bg-light py-3 shadow-sm">
        <div class="container">
          <!-- Logo replaced with text -->
          <a class="navbar-brand fw-bold d-flex align-items-center" href="#/">HomeNinjas</a>
          <!-- Toggler for Mobile View -->
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <!-- Navbar Links -->
          <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <router-link to="/" class="nav-link fs-5">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/login" class="nav-link fs-5">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/register" class="nav-link active fs-5">Register</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="container text-center my-5">
        <h1 class="mb-5 display-4 fw-bold">Register as</h1>
        <div class="row justify-content-center">
          <!-- Customer Card -->
          <div class="col-md-5 col-lg-4 mb-4">
            <div class="card border-0 shadow-lg">
              <div class="card-body p-4 text-center">
                <div class="icon-container mb-3">
                  <i class="fas fa-user-circle text-primary" style="font-size: 4rem;"></i>
                </div>
                <h4 class="fw-bold mb-3">Customer</h4>
                <p class="text-muted">Sign up to find reliable services tailored to your needs.</p>
                <router-link to="/register/customer" class="btn btn-primary w-100">Register as Customer</router-link>
              </div>
            </div>
          </div>

          <!-- Service Professional Card -->
          <div class="col-md-5 col-lg-4 mb-4">
            <div class="card border-0 shadow-lg">
              <div class="card-body p-4 text-center">
                <div class="icon-container mb-3">
                  <i class="fas fa-tools text-success" style="font-size: 4rem;"></i>
                </div>
                <h4 class="fw-bold mb-3">Service Professional</h4>
                <p class="text-muted">Join us to offer your expertise and grow your business.</p>
                <router-link to="/register/professional" class="btn btn-success w-100">Register as Professional</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

