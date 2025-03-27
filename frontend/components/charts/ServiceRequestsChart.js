export default {
    name: "ServiceRequestsChart",
    props: {
        data: {
            type: Object,
            default: null,
        },
    },
    mounted() {
        this.renderChart();
    },
    watch: {
        data(newData) {
            if (newData) this.renderChart();
        },
    },
    methods: {
        renderChart() {
            const ctx = this.$refs.serviceRequestsChart;
            const chartData = this.data || {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                pending: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                active: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                completed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                rejected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            };

            const datasets = [
                { label: "Requested", data: chartData.pending, backgroundColor: "#FF5733" },
                { label: "Accepted", data: chartData.active, backgroundColor: "#33FF57" },
                { label: "Completed", data: chartData.completed, backgroundColor: "#3357FF" },
                { label: "Cancelled", data: chartData.rejected, backgroundColor: "#FF33A1" },
            ];

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: chartData.labels,
                    datasets,
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { beginAtZero: true },
                        y: { beginAtZero: true },
                    },
                },
            });
        },
    },
    template: `
      <div class="chart-container" style="position: relative; height: 300px; width: 100%;">
        <canvas ref="serviceRequestsChart"></canvas>
      </div>
    `,
};