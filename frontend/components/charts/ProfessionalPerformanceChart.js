export default {
    name: "ProfessionalPerformanceChart",
    mounted() {
      const ctx = this.$refs.professionalPerformanceChart;
      new Chart(ctx, {
        type: "horizontalBar",  // Horizontal Bar Chart
        data: {
          labels: ["John", "Alice", "Bob", "Sam"],
          datasets: [
            {
              label: "Services Completed",
              data: [40, 60, 30, 50],
              backgroundColor: [
                "#4CAF50", // Green
                "#FF9800", // Orange
                "#F44336", // Red
                "#2196F3", // Blue
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
            },
          },
        },
      });
    },
    template: `
      <div class="chart-container" style="position: relative; height: 300px; width: 100%;">
        <canvas ref="professionalPerformanceChart"></canvas>
      </div>
    `,
  };
  