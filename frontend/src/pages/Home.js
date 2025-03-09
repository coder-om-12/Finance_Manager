import React, { useEffect, useState } from "react";
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  Button, 
  Paper, 
  Tabs, 
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  Fade,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Cookies from "js-cookie";
import DownloadIcon from "@mui/icons-material/Download";
import SyncIcon from "@mui/icons-material/Sync";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PieChartIcon from "@mui/icons-material/PieChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RefreshIcon from "@mui/icons-material/Refresh";

// Import our enhanced components
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import TransactionChart from "../components/TransactionChart";

// Define a main theme with better colors
const appTheme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
      light: "#7986cb",
      dark: "#303f9f",
      contrastText: "#fff"
    },
    secondary: {
      main: "#f50057",
      light: "#ff4081",
      dark: "#c51162",
      contrastText: "#fff"
    },
    background: {
      default: "#f5f7fa"
    }
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 5
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 5
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)"
        }
      }
    }
  }
});

const StyledTabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: "100%"
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 700,
  fontSize: "1.75rem",
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.5rem"
  }
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: 5,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
  }
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <StyledTabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`expense-tabpanel-${index}`}
      aria-labelledby={`expense-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </StyledTabPanel>
  );
};

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setRefreshing(true);
    try {
      const token = Cookies.get("token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transaction`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const { data } = await res.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const exportTransactions = () => {
    try {
      // Flatten the transactions for export
      const flattenedData = transactions.flatMap(month => 
        month.transactions.map(transaction => ({
          amount: transaction.amount,
          description: transaction.description,
          date: new Date(transaction.date).toLocaleDateString(),
          category: transaction.category_id
        }))
      );
      
      // Convert to CSV
      const headers = ['Amount', 'Description', 'Date', 'Category'];
      const csvContent = [
        headers.join(','),
        ...flattenedData.map(row => 
          [row.amount, `"${row.description}"`, row.date, row.category].join(',')
        )
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({
        open: true,
        message: "Transactions exported successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error exporting transactions:", error);
      setSnackbar({
        open: true,
        message: "Failed to export transactions",
        severity: "error"
      });
    }
  };

  // Calculate total stats
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return { total: 0, count: 0, average: 0 };
    }
    
    const total = transactions.reduce((sum, month) => sum + month.totalExpenses, 0);
    const count = transactions.reduce((sum, month) => 
      sum + month.transactions.length, 0
    );
    
    return {
      total,
      count,
      average: count > 0 ? (total / count).toFixed(2) : 0
    };
  };
  
  const stats = calculateStats();

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary" elevation={0} sx={{ mb: 3 }}>
          <Toolbar>
            <AccountBalanceWalletIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Expense Tracker Pro
            </Typography>
            <IconButton color="inherit" onClick={fetchTransactions} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Dashboard Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <DashboardCard>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Expenses
                      </Typography>
                      <Typography variant="h4" component="div" color="primary" fontWeight="bold">
                        ₹{stats.total.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Across all transactions
                      </Typography>
                    </CardContent>
                  </DashboardCard>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DashboardCard>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Transactions
                      </Typography>
                      <Typography variant="h4" component="div" color="secondary" fontWeight="bold">
                        {stats.count}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total transaction count
                      </Typography>
                    </CardContent>
                  </DashboardCard>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DashboardCard>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Average Transaction
                      </Typography>
                      <Typography variant="h4" component="div" color="primary" fontWeight="bold">
                        ₹{Number(stats.average).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Per transaction average
                      </Typography>
                    </CardContent>
                  </DashboardCard>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DashboardCard>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Months Tracked
                      </Typography>
                      <Typography variant="h4" component="div" color="secondary" fontWeight="bold">
                        {transactions.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Months with transactions
                      </Typography>
                    </CardContent>
                  </DashboardCard>
                </Grid>
              </Grid>
              
              {/* Transaction Form Card */}
              <TransactionForm
                fetchTransactions={fetchTransactions}
                editTransaction={editTransaction}
                setEditTransaction={setEditTransaction}
              />
              
              {/* Main Content Tabs */}
              <Paper sx={{ borderRadius: 2, mt: 3, boxShadow: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    scrollButtons={isMobile ? "auto" : false}
                    aria-label="transaction views"
                  >
                    <Tab icon={<DashboardIcon />} label="Dashboard" id="expense-tab-0" />
                    <Tab icon={<ListAltIcon />} label="Transactions" id="expense-tab-1" />
                    <Tab icon={<PieChartIcon />} label="Analytics" id="expense-tab-2" />
                  </Tabs>
                </Box>
                
                {/* Dashboard View */}
                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                      <TransactionList
                        data={transactions}
                        fetchTransactions={fetchTransactions}
                        setEditTransaction={setEditTransaction}
                        editTransaction={editTransaction}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TransactionChart data={transactions} />
                    </Grid>
                  </Grid>
                </TabPanel>
                
                {/* Transactions List View */}
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={exportTransactions}
                      disabled={transactions.length === 0}
                    >
                      Export to CSV
                    </Button>
                  </Box>
                  <TransactionList
                    data={transactions}
                    fetchTransactions={fetchTransactions}
                    setEditTransaction={setEditTransaction}
                    editTransaction={editTransaction}
                  />
                </TabPanel>
                
                {/* Analytics View */}
                <TabPanel value={tabValue} index={2}>
                  <TransactionChart data={transactions} />
                </TabPanel>
              </Paper>
            </>
          )}
        </Container>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}