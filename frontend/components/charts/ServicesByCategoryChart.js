export default {
    name: "ServicesByCategoryChart",
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
            const ctx = this.$refs.servicesByCategoryChart;
            const chartData = this.data || { labels: [], data: [] };

            // Ensure we have enough colors for all categories
            const colors = [
                "#FF5733", "#33FF57", "#3357FF", "#FF33A1",
                "#FFC107", "#28A745", "#DC3545", "#6F42C1",
            ];
            const backgroundColors = chartData.labels.map((_, idx) => colors[idx % colors.length]);

            new Chart(ctx, {
                type: "pie",
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.data,
                        backgroundColor: backgroundColors,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },
    },
    template: `
      <div class="chart-container" style="position: relative; height: 300px; width: 100%;">
        <canvas ref="servicesByCategoryChart"></canvas>
      </div>
    `,
};