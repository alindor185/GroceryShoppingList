import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { LinearProgress, Typography, Box, Paper, Grid, Button } from '@mui/material';

// Register the required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const WeeklyListDesign = ({ items }) => {
  const categories = [
    "Dairy",
    "Fruits & Vegetables",
    "Meat & Fish",
    "Bakery",
    "Beverages",
    "Snacks",
    "Frozen",
    "Household Items",
    "Personal Care",
    "Other",
  ];

  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = items.filter((item) => item.category === category).length;
    return acc;
  }, {});

  const purchasedCount = items.filter((item) => item.purchased).length;
  const totalCount = items.length;
  const purchasedPercentage = totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0;

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#E7E9ED",
          "#71B37C",
          "#FF5A5E",
          "#C9CBD3",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#E7E9ED",
          "#71B37C",
          "#FF5A5E",
          "#C9CBD3",
        ],
      },
    ],
  };

  return (
    <Box sx={{ padding: 3, maxWidth: '900px', margin: '0 auto' }}>
      <Paper elevation={3} sx={{ padding: 3, borderRadius: 4, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Weekly List Overview
        </Typography>

        <Grid container spacing={4}>
          {/* Doughnut Chart Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                padding: 3,
                borderRadius: 4,
                background: 'linear-gradient(to bottom right, #E3F2FD, #FFFFFF)',
              }}
            >
              <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#555' }}>
                Items Distribution by Category
              </Typography>
              <Doughnut data={chartData} />
            </Paper>
          </Grid>

          {/* Linear Progress Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                padding: 3,
                borderRadius: 4,
                background: 'linear-gradient(to bottom right, #FFF3E0, #FFFFFF)',
              }}
            >
              <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#555' }}>
                Progress of Purchased Items
              </Typography>
              <Box sx={{ textAlign: 'center', padding: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={purchasedPercentage}
                  sx={{ height: 20, borderRadius: 5, backgroundColor: '#E0E0E0', marginY: 2 }}
                />
                <Typography variant="h6" align="center" sx={{ color: '#333' }}>
                  {purchasedCount}/{totalCount} items purchased ({purchasedPercentage.toFixed(1)}%)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ marginTop: 4, display: 'flex', justifyContent: 'space-around' }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#007bff',
              color: '#fff',
              fontSize: '16px',
              padding: '10px 20px',
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#0056b3' },
            }}
          >
            Add New Item
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#007bff',
              color: '#007bff',
              fontSize: '16px',
              padding: '10px 20px',
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#e7f3ff', borderColor: '#0056b3' },
            }}
          >
            View History
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default WeeklyListDesign;
