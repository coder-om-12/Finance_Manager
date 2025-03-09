import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme
} from "@mui/material";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  BarSeries,
  LineSeries,
  PieSeries,
  Legend,
  Tooltip,
  Title,
  ZoomAndPan
} from "@devexpress/dx-react-chart-material-ui";
import {
  Animation,
  ArgumentScale,
  EventTracker,
  ValueScale,
  Stack,
  Palette
} from "@devexpress/dx-react-chart";
import { scaleBand } from "@devexpress/dx-chart-core";
import dayjs from "dayjs";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { styled } from "@mui/material/styles";

// Custom styled components
const StatsCard = styled(Card)(({ theme, color }) => ({
  background: color || theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: 5,
  // boxShadow: theme.shadows[3],
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    // boxShadow: theme.shadows[8]
  }
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export default function TransactionChart({ data }) {
  const [tabValue, setTabValue] = useState(0);
  const [timeFrame, setTimeFrame] = useState("month");
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format data for different chart types
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group transactions by month, category, or day based on timeFrame
    let formattedData = [];
    
    // For monthly view
    if (timeFrame === "month") {
      formattedData = data.map((item) => ({
        period: dayjs().month(item._id - 1).format("MMM"),
        totalExpenses: item.totalExpenses,
        count: item.transactions.length
      }));
    } 
    // For yearly view, group by quarters
    else if (timeFrame === "year") {
      const quarterData = {};
      data.forEach(item => {
        const month = parseInt(item._id);
        const quarter = Math.ceil(month / 3);
        const quarterKey = `Q${quarter}`;
        
        if (!quarterData[quarterKey]) {
          quarterData[quarterKey] = {
            period: quarterKey,
            totalExpenses: 0,
            count: 0
          };
        }
        quarterData[quarterKey].totalExpenses += item.totalExpenses;
        quarterData[quarterKey].count += item.transactions.length;
      });
      formattedData = Object.values(quarterData);
    }
    // For weekly view, use the last 4 weeks of data
    else if (timeFrame === "week") {
      const lastFourWeeks = [];
      // We'll simulate weekly data from monthly data
      const today = dayjs();
      for (let i = 0; i < 4; i++) {
        const weekStart = today.subtract(i, 'week').startOf('week');
        const weekLabel = `Week ${i+1}`;
        
        // Find transactions in this week
        const weekTotal = data.reduce((sum, month) => {
          const monthDate = dayjs().month(month._id - 1);
          if (Math.abs(monthDate.diff(weekStart, 'month')) <= 1) {
            return sum + month.totalExpenses / 4; // Roughly divide monthly expenses by 4
          }
          return sum;
        }, 0);
        
        lastFourWeeks.unshift({
          period: weekLabel,
          totalExpenses: parseFloat(weekTotal.toFixed(2)),
          count: Math.round(weekTotal / 100) // Estimate transaction count
        });
      }
      formattedData = lastFourWeeks;
    }
    
    return formattedData;
  }, [data, timeFrame]);

  // Calculate category breakdown
  const categoryData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const categoryTotals = {};
    
    data.forEach(month => {
      month.transactions.forEach(transaction => {
        const catId = transaction.category_id;
        if (!categoryTotals[catId]) {
          categoryTotals[catId] = {
            categoryId: catId,
            total: 0,
            count: 0
          };
        }
        categoryTotals[catId].total += transaction.amount;
        categoryTotals[catId].count += 1;
      });
    });
    
    return Object.values(categoryTotals).map(cat => ({
      category: cat.categoryId,
      amount: parseFloat(cat.total.toFixed(2)),
      count: cat.count
    }));
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { 
      total: 0, 
      average: 0, 
      highest: 0,
      highestMonth: "",
      trend: 0
    };
    
    const total = data.reduce((sum, month) => sum + month.totalExpenses, 0);
    const average = total / data.length;
    
    // Find highest spending month
    const highestMonth = data.reduce((highest, month) => 
      month.totalExpenses > highest.total 
        ? { total: month.totalExpenses, month: month._id }
        : highest
    , { total: 0, month: "" });
    
    // Calculate trend (comparing most recent vs previous)
    const sortedMonths = [...data].sort((a, b) => b._id - a._id);
    const trend = sortedMonths.length > 1 
      ? ((sortedMonths[0].totalExpenses - sortedMonths[1].totalExpenses) / sortedMonths[1].totalExpenses) * 100
      : 0;
    
    return {
      total: parseFloat(total.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      highest: parseFloat(highestMonth.total.toFixed(2)),
      highestMonth: dayjs().month(highestMonth.month - 1).format("MMMM"),
      trend: parseFloat(trend.toFixed(1))
    };
  }, [data]);

  // Custom palette based on the current theme
  const chartPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" sx={{ mb: 2, fontWeight: "bold" }}>
          Expense Analytics
        </Typography>
        
        {/* Stats Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <StatsCard color={theme.palette.primary.main} sx={{ flex: 1, minWidth: 150 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                Total Expenses
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <AttachMoneyIcon />
                <Typography variant="h5" component="div" sx={{ ml: 1, fontWeight: "bold" }}>
                  {stats.total.toLocaleString()} ₹
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
          
          <StatsCard color={theme.palette.info.main} sx={{ flex: 1, minWidth: 150 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                Monthly Average
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <AttachMoneyIcon />
                <Typography variant="h5" component="div" sx={{ ml: 1, fontWeight: "bold" }}>
                  {stats.average.toLocaleString()} ₹
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
          
          <StatsCard color={theme.palette.error.main} sx={{ flex: 1, minWidth: 150 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                Highest Month
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {stats.highestMonth}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <AttachMoneyIcon />
                <Typography variant="h5" component="div" sx={{ ml: 1, fontWeight: "bold" }}>
                  {stats.highest.toLocaleString()} ₹
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
          
          <StatsCard 
            color={stats.trend > 0 ? theme.palette.error.main : theme.palette.success.main} 
            sx={{ flex: 1, minWidth: 150 }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                Monthly Trend
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {stats.trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                <Typography variant="h5" component="div" sx={{ ml: 1, fontWeight: "bold" }}>
                  {Math.abs(stats.trend)}%
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
        </Box>

        {/* Chart Controls */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="chart tabs"
          >
            <Tab label="Expenses Over Time" />
            <Tab label="Category Breakdown" />
            <Tab label="Trend Analysis" />
          </Tabs>
          
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="time-frame-select-label">Time Frame</InputLabel>
            <Select
              labelId="time-frame-select-label"
              id="time-frame-select"
              value={timeFrame}
              label="Time Frame"
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="month">Monthly</MenuItem>
              <MenuItem value="year">Quarterly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Chart data={chartData} height={340}>
            <Palette scheme={chartPalette} />
            <ArgumentScale factory={scaleBand} />
            <ArgumentAxis />
            <ValueAxis />
            
            <BarSeries
              valueField="totalExpenses"
              argumentField="period"
              name="Expenses"
            />
            
            <Animation />
            <EventTracker />
            <Tooltip />
            <Legend position="bottom" />
            <ZoomAndPan />
          </Chart>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Chart data={categoryData} height={340}>
            <Palette scheme={chartPalette} />
            <PieSeries
              valueField="amount"
              argumentField="category"
              innerRadius={0.6}
            />
            <Animation />
            <EventTracker />
            <Tooltip />
            <Legend position="right" />
            <Title 
              text="Expenses by Category"
              textComponent={props => (
                <Typography variant="h6" {...props} />
              )}
            />
          </Chart>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Chart data={chartData} height={340}>
            <Palette scheme={chartPalette} />
            <ArgumentAxis />
            <ValueAxis />
            
            <LineSeries
              valueField="totalExpenses"
              argumentField="period"
              name="Expense Trend"
            />
            
            <BarSeries
              valueField="count"
              argumentField="period"
              name="Transaction Count"
            />
            
            <Animation />
            <EventTracker />
            <Tooltip />
            <Legend position="bottom" />
            <ValueScale name="count" />
          </Chart>
        </TabPanel>
      </CardContent>
    </Paper>
  );
}