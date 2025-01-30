    export default {
        template: `
            <div class="d-flex flex-column justify-content-center align-items-center vh-100">
                <h1 class="mb-4 text-center">Welcome To</h1>
                <img src="/static/logo/logo_svg.svg" alt="App Logo" class="mb-4" style="max-width: 500px; height: auto;">
                <div class="d-flex flex-column">
                
                    <router-link to="/register" class="btn btn-primary mb-3">Register</router-link>
                    
                    <router-link to="/login" class="btn btn-secondary">Login</router-link>
                </div>
            </div>
        `
    };
