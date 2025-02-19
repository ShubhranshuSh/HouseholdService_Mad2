export default {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: 4rem;">
      <div class="card p-4 shadow" style="width: 28rem;">
        <h2 class="text-center mb-4">Register as Service Professional</h2>
        <div class="form-group mb-3">
          <label for="name">Full Name</label>
          <input id="name" type="text" class="form-control" placeholder="Enter full name" v-model="name" />
        </div>
        <div class="form-group mb-3">
          <label for="email">Email Address</label>
          <input id="email" type="email" class="form-control" placeholder="Enter email" v-model="email" />
        </div>
        <div class="form-group mb-3">
          <label for="password">Password</label>
          <input id="password" type="password" class="form-control" placeholder="Enter password" v-model="password" />
        </div>
        <div class="form-group mb-3">
          <label for="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" class="form-control" placeholder="Confirm password" v-model="confirm_password" />
        </div>
        <div class="form-group mb-3">
          <label for="phone">Phone Number</label>
          <input id="phone" type="text" class="form-control" placeholder="Enter phone number" v-model="phone" />
        </div>
        <div class="form-group mb-3">
          <label for="address">Address</label>
          <input id="address" type="text" class="form-control" placeholder="Enter address" v-model="address" />
        </div>
        <div class="form-group mb-3">
          <label for="pincode">Pincode</label>
          <input id="pincode" type="text" class="form-control" placeholder="Enter pincode" v-model="pincode" />
        </div>
        <div class="form-group mb-3">
          <label for="experience">Experience (Years)</label>
          <input id="experience" type="number" class="form-control" placeholder="Enter years of experience" v-model="experience" />
        </div>
        <div class="form-group mb-3">
          <label for="resume">Upload Resume (PDF)</label>
          <input id="resume" type="file" class="form-control" @change="handleFileUpload" accept="application/pdf" />
        </div>
        <div class="form-group mb-4">
          <label for="serviceCategory">Select Service Category</label>
          <select id="serviceCategory" class="form-select" v-model="service_category">
            <option disabled value="">Select Service Category</option>
            <option v-for="service in services" :key="service" :value="service">{{ service }}</option>
          </select>
        </div>
        <button class="btn btn-primary w-100" :disabled="isSubmitting" @click="submitRegister">
          Register
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      confirm_password: "",
      name: "",
      phone: "",
      address: "",
      pincode: "",
      experience: "",
      resume: null,
      service_category: "",
      services: [
        "House Cleaning",
        "Bathroom Cleaning",
        "Kitchen Cleaning",
        "Sofa Cleaning",
        "AC Repair",
        "Fridge Repair",
        "Washing Machine Repair",
        "Microwave Repair",
        "TV Installation",
        "Plumbing Work",
        "Electrician Services",
        "Painting",
        "Furniture Repair",
        "Packers and Movers",
        "Handyman Services",
      ],
      isSubmitting: false,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.resume = event.target.files[0];
    },
    async submitRegister() {
      if (!this.email || !this.password || !this.name || !this.phone || !this.address || !this.pincode || !this.experience || !this.service_category) {
        alert("Please fill all fields.");
        return;
      }

      if (this.password !== this.confirm_password) {
        alert("Passwords do not match!");
        return;
      }

      if (!this.resume) {
        alert("Please upload your resume in PDF format.");
        return;
      }

      const formData = new FormData();
      formData.append("email", this.email);
      formData.append("password", this.password);
      formData.append("confirm_password", this.confirm_password);
      formData.append("name", this.name);
      formData.append("phone", this.phone);
      formData.append("address", this.address);
      formData.append("pincode", this.pincode);
      formData.append("experience", this.experience);
      formData.append("resume", this.resume);
      formData.append("service_category", this.service_category);

      this.isSubmitting = true;

      try {
        const res = await fetch(location.origin + "/register/service_professional", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          alert("Registration successful! Your application is under review.");
          this.resetForm();

          // Redirect to login page after successful registration
          window.location.hash = "#/login";
        } else {
          const errorData = await res.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while submitting the form. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.email = "";
      this.password = "";
      this.confirm_password = "";
      this.name = "";
      this.phone = "";
      this.address = "";
      this.pincode = "";
      this.experience = "";
      this.resume = null;
      this.service_category = "";
    },
  },
};