export default {
  template: `
    <div>
      <h2>Professional Registration</h2>
      <form @submit.prevent="submitRegister">
        <input type="email" v-model="email" placeholder="Email" required />
        <input type="password" v-model="password" placeholder="Password" required />
        <input type="password" v-model="confirm_password" placeholder="Confirm Password" required />
        <input type="text" v-model="name" placeholder="Full Name" required />
        <input type="tel" v-model="phone" placeholder="Phone Number" required />
        <input type="text" v-model="address" placeholder="Address" required />
        <input type="text" v-model="pincode" placeholder="Pincode" required />
        <input type="number" v-model="experience" placeholder="Years of Experience" required />
        <select v-model="service_category" required>
          <option value="">Select Service Category</option>
          <option value="Plumber">Plumber</option>
          <option value="Electrician">Electrician</option>
          <option value="Carpenter">Carpenter</option>
        </select>
        <input type="file" @change="handleFileUpload" accept="application/pdf" required />
        <button type="submit" :disabled="isSubmitting">Register</button>
      </form>
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
      service_category: "",
      resume: null,
      isSubmitting: false,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.resume = event.target.files[0];
    },
    async submitRegister() {
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
          this.$router.push("/login");  // Redirecting to login page after successful registration
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
      this.service_category = "";
      this.resume = null;
    },
  },
};
