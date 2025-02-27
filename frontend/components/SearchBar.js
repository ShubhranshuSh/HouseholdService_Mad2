export default {
    template: `
      <div class="search-bar container mt-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <input 
              type="text" 
              class="form-control" 
              v-model="searchQuery" 
              placeholder="Search for services or professionals..."
            />
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="selectedService">
              <option value="">All Services</option>
              <option v-for="service in services" :key="service" :value="service">
                {{ service }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="sortBy">
              <option value="">Sort By</option>
              <option value="rating_desc">Rating: High to Low</option>
              <option value="rating_asc">Rating: Low to High</option>
              <option value="location_asc">Location: A-Z</option>
              <option value="location_desc">Location: Z-A</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" @click="performSearch">Search</button>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        searchQuery: "",
        selectedService: "",
        sortBy: "",
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
        ]
      };
    },
    methods: {
      performSearch() {
        this.$emit("search", {
          query: this.searchQuery,
          service: this.selectedService,
          sortBy: this.sortBy
        });
      }
    }
  };
  