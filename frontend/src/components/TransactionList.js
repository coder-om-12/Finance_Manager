import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Box,
  Chip,
  TextField,
  InputAdornment,
  TablePagination,
  Menu,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Badge
} from "@mui/material";
import { useSelector } from "react-redux";
import { styled, alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import Cookies from "js-cookie";

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 5,
  // boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(3),
  "&::-webkit-scrollbar": {
    width: 10,
    height: 10
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.background.paper
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: 5,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.5)
    }
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.2s",
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.07),
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const HeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  fontWeight: 600,
  position: "sticky",
  top: 0,
  zIndex: 10,
}));

const CategoryChip = styled(Chip)(({ theme, categorycolor }) => ({
  borderRadius: 5,
  fontWeight: 500,
  backgroundColor: categorycolor ? alpha(categorycolor, 0.1) : alpha(theme.palette.primary.main, 0.1),
  color: categorycolor || theme.palette.primary.main,
  border: `1px solid ${categorycolor ? alpha(categorycolor, 0.3) : alpha(theme.palette.primary.main, 0.3)}`,
}));

const MonthHeader = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderRadius: 5,
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 5,
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    transition: "all 0.3s",
    "&:hover": {
      backgroundColor: theme.palette.common.white,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.common.white,
    }
  }
}));

const FilterButton = styled(Button)(({ theme }) => ({
  borderRadius: 5,
  textTransform: "none",
  padding: theme.spacing(0.5, 2),
}));

export default function TransactionList({
  data,
  fetchTransactions,
  setEditTransaction,
  editTransaction,
}) {
  const token = Cookies.get("token");
  const user = useSelector((state) => state.auth.user);
  
  // States for filtering and pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedMonths, setExpandedMonths] = useState({});
  
  // State for confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // State for filter menu
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  
  // Static category colors for demo
  const categoryColors = {
    food: "#FF5252",
    shopping: "#4CAF50",
    transport: "#2196F3",
    entertainment: "#9C27B0",
    bills: "#FF9800",
    others: "#607D8B"
  };

  // Prepare categories for filtering
  const categoryOptions = user?.categories || [];

  // Toggle month expansion
  const toggleMonthExpansion = (monthId) => {
    setExpandedMonths({
      ...expandedMonths,
      [monthId]: !expandedMonths[monthId]
    });
  };

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search and filtering
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    setPage(0);
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setSortMenuAnchor(null);
  };

  // Handle filter menu
  const openFilterMenu = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const closeFilterMenu = () => {
    setFilterMenuAnchor(null);
  };

  // Handle sort menu
  const openSortMenu = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const closeSortMenu = () => {
    setSortMenuAnchor(null);
  };

  // Handle delete transaction
  const openDeleteDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  const confirmDelete = async () => {
    if (!selectedTransaction) return;
    
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/transaction/${selectedTransaction._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
    
    closeDeleteDialog();
  };

  // Helper function to get category name and icon
  const getCategoryInfo = (id) => {
    if (!user) {
      return { name: "Loading...", icon: "❓" };
    }
    
    const category = user.categories.find((category) => category._id === id);
    return category ? { name: category.label, icon: category.icon } : { name: "N/A", icon: "❓" };
  };

  // Helper function to format date
  const formatDate = (date) => {
    return dayjs(date).format("DD MMM YYYY");
  };

  // Helper function to format month header
  const formatMonthHeader = (monthId) => {
    return dayjs().month(monthId - 1).format("MMMM YYYY");
  };

  // Filter and sort the transactions
  const filteredData = React.useMemo(() => {
    // Start with all months
    let filteredMonths = [...data];
    
    // Sort months based on ID (chronological)
    if (sortOrder === "oldest") {
      filteredMonths.sort((a, b) => a._id - b._id);
    } else {
      filteredMonths.sort((a, b) => b._id - a._id);
    }
    
    // Process each month's transactions
    filteredMonths = filteredMonths.map(month => {
      // Filter transactions by search query
      let filteredTransactions = month.transactions.filter(transaction => {
        const matchesSearch = searchQuery === "" || 
          transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by category if selected
        const matchesCategory = categoryFilter === "" || transaction.category_id === categoryFilter;
        
        // Filter by date
        const transactionDate = dayjs(transaction.date);
        const today = dayjs();
        let matchesDate = true;
        
        if (dateFilter === "today") {
          matchesDate = transactionDate.isSame(today, "day");
        } else if (dateFilter === "thisWeek") {
          matchesDate = transactionDate.isAfter(today.subtract(7, "day"));
        } else if (dateFilter === "thisMonth") {
          matchesDate = transactionDate.isSame(today, "month");
        }
        
        return matchesSearch && matchesCategory && matchesDate;
      });
      
      // Sort transactions within month
      if (sortOrder === "highest") {
        filteredTransactions.sort((a, b) => b.amount - a.amount);
      } else if (sortOrder === "lowest") {
        filteredTransactions.sort((a, b) => a.amount - b.amount);
      } else if (sortOrder === "newest") {
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortOrder === "oldest") {
        filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      return {
        ...month,
        transactions: filteredTransactions
      };
    });
    
    // Filter out months with no matching transactions
    return filteredMonths.filter(month => month.transactions.length > 0);
  }, [data, searchQuery, categoryFilter, dateFilter, sortOrder]);

  // Calculate total number of transactions across all filtered months
  const totalTransactionCount = filteredData.reduce(
    (count, month) => count + month.transactions.length, 
    0
  );

  // Initialize expandedMonths if it's the first render
  useEffect(() => {
    if (data.length > 0 && Object.keys(expandedMonths).length === 0) {
      const initialExpandedState = {};
      data.forEach((month, index) => {
        initialExpandedState[month._id] = index === 0; // Expand only the first month
      });
      setExpandedMonths(initialExpandedState);
    }
  }, [data, expandedMonths]);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: "bold", mb: 2 }}>
            Transaction History
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <SearchField
              variant="outlined"
              placeholder="Search transactions..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 250 } }}
            />
            
            <Box sx={{ display: "flex", gap: 1 }}>
              <FilterButton
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={openFilterMenu}
                size="small"
              >
                Filter
              </FilterButton>
              
              <FilterButton
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={openSortMenu}
                size="small"
              >
                Sort
              </FilterButton>
            </Box>
          </Box>
          
          {(searchQuery || categoryFilter || dateFilter !== "all") && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {searchQuery && (
                <Chip 
                  label={`Search: "${searchQuery}"`} 
                  onDelete={() => setSearchQuery("")}
                  size="small"
                />
              )}
              
              {categoryFilter && (
                <Chip 
                  label={`Category: ${getCategoryInfo(categoryFilter).name}`}
                  icon={<span>{getCategoryInfo(categoryFilter).icon}</span>}
                  onDelete={() => setCategoryFilter("")}
                  size="small"
                />
              )}
              
              {dateFilter !== "all" && (
                <Chip 
                  label={`Date: ${dateFilter === "today" ? "Today" : 
                    dateFilter === "thisWeek" ? "This Week" : 
                    "This Month"}`}
                  onDelete={() => setDateFilter("all")}
                  size="small"
                />
              )}
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {totalTransactionCount > 0 ? (
          <>
            {filteredData.map(month => (
              <Box key={month._id} sx={{ mb: 3 }}>
                <MonthHeader>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CalendarMonthIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatMonthHeader(month._id)}
                    </Typography>
                    <Chip 
                      label={`${month.transactions.length} transactions`}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                    <Chip 
                      label={`₹${month.totalExpenses.toLocaleString()}`}
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <IconButton 
                    size="small" 
                    onClick={() => toggleMonthExpansion(month._id)}
                  >
                    {expandedMonths[month._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </MonthHeader>
                
                {expandedMonths[month._id] && (
                  <StyledTableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="transaction table">
                      <TableHead>
                        <TableRow>
                          <HeaderCell align="center">Amount</HeaderCell>
                          <HeaderCell align="left">Description</HeaderCell>
                          <HeaderCell align="center">Category</HeaderCell>
                          <HeaderCell align="center">Date</HeaderCell>
                          <HeaderCell align="center">Actions</HeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {month.transactions.map((transaction) => {
                          const categoryInfo = getCategoryInfo(transaction.category_id);
                          // Determine category color - for demo, using static colors
                          const categoryColorKey = categoryInfo.name.toLowerCase().includes("food") ? "food" :
                            categoryInfo.name.toLowerCase().includes("shopping") ? "shopping" :
                            categoryInfo.name.toLowerCase().includes("transport") ? "transport" :
                            categoryInfo.name.toLowerCase().includes("entertainment") ? "entertainment" :
                            categoryInfo.name.toLowerCase().includes("bill") ? "bills" : "others";
                          
                          const categoryColor = categoryColors[categoryColorKey];
                          
                          return (
                            <StyledTableRow key={transaction._id}>
                              <TableCell align="center" component="th" scope="row" sx={{ fontWeight: 500 }}>
                                ₹{transaction.amount.toLocaleString()}
                              </TableCell>
                              <TableCell align="left">
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {transaction.description}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <CategoryChip 
                                  label={categoryInfo.name}
                                  categorycolor={categoryColor}
                                  avatar={<span>{categoryInfo.icon}</span>}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                {formatDate(transaction.date)}
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Edit">
                                  <IconButton
                                    color="primary"
                                    onClick={() => setEditTransaction(transaction)}
                                    disabled={editTransaction.amount !== undefined}
                                    size="small"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    color="error"
                                    onClick={() => openDeleteDialog(transaction)}
                                    disabled={editTransaction.amount !== undefined}
                                    size="small"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </StyledTableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                )}
              </Box>
            ))}
            
            {totalTransactionCount > 10 && (
              <TablePagination
                component="div"
                count={totalTransactionCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No transactions found matching your criteria.
            </Typography>
            {(searchQuery || categoryFilter || dateFilter !== "all") && (
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                  setDateFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        )}
      </CardContent>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={closeFilterMenu}
        PaperProps={{
          sx: { width: 250, maxHeight: 400, p: 1 }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Filter Transactions
        </Typography>
        <Divider sx={{ mb: 1 }} />
        
        <Box sx={{ px: 2, py: 1 }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={categoryFilter}
              label="Category"
              onChange={handleCategoryFilterChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categoryOptions.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: 8 }}>{category.icon}</span>
                    {category.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel id="date-filter-label">Date Range</InputLabel>
            <Select
              labelId="date-filter-label"
              id="date-filter"
              value={dateFilter}
              label="Date Range"
              onChange={handleDateFilterChange}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="thisWeek">This Week</MenuItem>
              <MenuItem value="thisMonth">This Month</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={closeSortMenu}
        PaperProps={{
          sx: { width: 180, p: 1 }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Sort By
        </Typography>
        <Divider sx={{ mb: 1 }} />
        
        <MenuItem 
          onClick={() => handleSortOrderChange("newest")}
          selected={sortOrder === "newest"}
        >
          Date (Newest First)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortOrderChange("oldest")}
          selected={sortOrder === "oldest"}
        >
          Date (Oldest First)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortOrderChange("highest")}
          selected={sortOrder === "highest"}
        >
          Amount (Highest First)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortOrderChange("lowest")}
          selected={sortOrder === "lowest"}
        >
          Amount (Lowest First)
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction?
            {selectedTransaction && (
              <Box component="span" sx={{ display: "block", mt: 2 }}>
                <Typography component="span" fontWeight="bold">Description:</Typography> {selectedTransaction.description}<br />
                <Typography component="span" fontWeight="bold">Amount:</Typography> ₹{selectedTransaction.amount.toLocaleString()}<br />
                <Typography component="span" fontWeight="bold">Date:</Typography> {selectedTransaction.date && formatDate(selectedTransaction.date)}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}