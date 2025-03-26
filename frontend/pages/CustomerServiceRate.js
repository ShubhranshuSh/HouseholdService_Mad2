import store from "../utils/store.js";
import CustomerNavbar from "../components/CustomerNavbar.js";

export default {
    components: { CustomerNavbar },
    data() {
        return {
            requestId: null,
            rating: null,
            feedback: '',
            error: null,
            ratingDescriptions: {
                1: "Very Unsatisfied - Poor service, did not meet expectations",
                2: "Unsatisfied - Service had significant room for improvement",
                3: "Neutral - Service was okay, but could be better",
                4: "Satisfied - Good service with minor areas to improve",
                5: "Completely Satisfied - Excellent service, exceeded expectations"
            }
        };
    },
    created() {
        this.requestId = this.$route.params.id;
        
        if (!store.state.loggedIn || store.state.role !== "customer") {
            alert("🚨 Unauthorized access");
            this.$router.push("/login");
        }
    },
    methods: {
        async submitRating() {
            if (!this.rating) {
                this.error = "Please select a rating.";
                return;
            }
            
            try {
                const response = await fetch(`/customer/requests/${this.requestId}/rate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': store.state.auth_token
                    },
                    body: JSON.stringify({
                        rating: Number(this.rating),  // Explicitly convert to number
                        feedback: this.feedback || ''
                    })
                });

                // Enhanced error handling
                if (!response.ok) {
                    const contentType = response.headers.get("Content-Type");
                    
                    // Try to parse JSON error
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Failed to submit rating");
                    }
                    
                    // Fallback to text response
                    const errorText = await response.text();
                    console.error("Full error response:", errorText);
                    throw new Error(errorText || `HTTP error! status: ${response.status}`);
                }

                // Parse successful response
                const result = await response.json();
                
                // Success alert and navigation
                alert("Thank you for your feedback!");
                this.$router.push("/customer/requests");
            } catch (error) {
                console.error("Detailed error submitting rating:", error);
                this.error = error.message || "Failed to submit rating. Please try again.";
            }
        }
    },
    template: `
    <div>
        <CustomerNavbar />
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card shadow-sm">
                        <div class="card-header bg-success text-white text-center">
                            <h3>Rate Our Service</h3>
                        </div>
                        <div class="card-body">
                            <div v-if="error" class="alert alert-danger mb-3">
                                {{ error }}
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Service Rating</label>
                                <select 
                                    v-model="rating" 
                                    class="form-select" 
                                    required
                                >
                                    <option :value="null" disabled>Select Rating</option>
                                    <option v-for="(description, score) in ratingDescriptions" 
                                            :key="score" 
                                            :value="score"
                                    >
                                        {{ score }} Star - {{ description }}
                                    </option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Additional Feedback (Optional)</label>
                                <textarea 
                                    v-model="feedback" 
                                    class="form-control" 
                                    rows="4" 
                                    placeholder="Share your experience and help us improve..."
                                ></textarea>
                            </div>
                            <div class="text-center">
                                <button 
                                    @click="submitRating" 
                                    class="btn btn-success btn-lg"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};