export default {
  template: `
    <div class="container mt-3 mb-4">
      <div class="d-flex flex-wrap align-items-center gap-2 p-3 border rounded shadow-sm bg-light">

        <!-- Service Category Dropdown -->
        <select class="form-select flex-grow-1" v-model="selectedCategory" style="max-width: 300px; height: 40px;">
          <option value="">All Categories</option>
          <option v-for="service in services" :key="service" :value="service">
            {{ service }}
          </option>
        </select>

        <!-- Pincode Input -->
        <input 
          type="text" 
          class="form-control" 
          v-model="pincode" 
          placeholder="Enter Pincode" 
          style="max-width: 200px; height: 40px;"
        />

        <!-- Search Button -->
        <button 
          class="btn btn-primary" 
          @click="performSearch"
          :disabled="loading"
          style="height: 40px; padding: 0 20px;"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm"></span>
          <span v-else>Search</span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
    </div>
  `,

  data() {
    return {
      selectedCategory: "",
      pincode: "",
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
        "Handyman Services"
      ],
      loading: false,
      error: ""
    };
  },

  methods: {
    async performSearch() {
      this.error = "";  // ✅ Clear any previous errors
      this.loading = true;

      const params = new URLSearchParams();
      if (this.selectedCategory) params.append("category", this.selectedCategory);
      if (this.pincode) params.append("pincode", this.pincode);

      try {
        // ✅ Fetch only non-flagged services from the backend
        const response = await fetch(`/search-services?${params.toString()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          if (response.status === 404) {
            this.$emit("updateServices", []);
          } else {
            throw new Error(`Error: ${response.status}`);
          }
        } else {
          const data = await response.json();
          this.$emit("updateServices", data);  // ✅ Emit filtered services
        }
      } catch (error) {
        console.error("Error:", error);
        this.error = "Failed to fetch services. Please try again.";
      } finally {
        this.loading = false;
      }
    }
  }
};
