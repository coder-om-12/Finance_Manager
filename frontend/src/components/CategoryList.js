import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  useTheme,
  alpha
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import NoResultsIcon from "@mui/icons-material/FilterAltOff";
import Cookies from "js-cookie";
import { setUser } from "../store/auth";

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 5,
//   boxShadow: theme.shadows[3],
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

const IconChip = styled(Chip)(({ theme }) => ({
  fontSize: '1.5rem',
  padding: theme.spacing(1),
  borderRadius: 5,
  fontWeight: 500,
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
  }
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

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 5,
//   boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(3),
  overflow: 'hidden'
}));

// Static category colors for visualization
const getCategoryColor = (label) => {
  const colors = {
    food: "#FF5252",
    grocery: "#4CAF50",
    transport: "#2196F3",
    entertainment: "#9C27B0",
    bills: "#FF9800",
    shopping: "#3F51B5",
    travel: "#009688",
    health: "#E91E63",
    education: "#795548",
    investment: "#607D8B",
    gift: "#FFEB3B",
    others: "#9E9E9E"
  };
  
  const key = Object.keys(colors).find(key => 
    label.toLowerCase().includes(key)
  );
  
  return key ? colors[key] : colors.others;
};

export default function CategoryList({ editCategory, setEditCategory }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const token = Cookies.get("token");
  const theme = useTheme();
  
  // States for filtering and UI
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle delete dialog
  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  // Delete category function
  const confirmDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/category/${selectedCategory._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.ok) {
        const _user = {
          ...user,
          categories: user.categories.filter((cat) => cat._id != selectedCategory._id),
        };
        dispatch(setUser({ user: _user }));
        
        setSnackbar({
          open: true,
          message: "Category deleted successfully!",
          severity: "success"
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete category",
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setSnackbar({
        open: true,
        message: "Error deleting category",
        severity: "error"
      });
    }
    
    closeDeleteDialog();
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter categories based on search
  const filteredCategories = user?.categories?.filter(category =>
    searchQuery === "" || 
    category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.icon.includes(searchQuery)
  ) || [];

  return (
    <>
      <StyledCard>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
              <CategoryIcon sx={{ mr: 1 }} />
              Category List
            </Typography>
            
            <SearchField
              variant="outlined"
              placeholder="Search categories..."
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
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {filteredCategories.length > 0 ? (
            <StyledTableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="categories table">
                <TableHead>
                  <TableRow>
                    <HeaderCell align="left">Icon</HeaderCell>
                    <HeaderCell align="left">Category Name</HeaderCell>
                    <HeaderCell align="center">Category Example</HeaderCell>
                    <HeaderCell align="right">Actions</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.map((category) => {
                    const categoryColor = getCategoryColor(category.label);
                    
                    return (
                      <StyledTableRow key={category._id}>
                        <TableCell align="left">
                          <Typography variant="h4" component="div" sx={{ fontSize: '2rem' }}>
                            {category.icon}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {category.label}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconChip
                            label={category.icon}
                            style={{
                              backgroundColor: alpha(categoryColor, 0.1),
                              color: categoryColor,
                              borderColor: alpha(categoryColor, 0.3),
                            }}
                            icon={<LabelIcon />}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Edit Category">
                              <IconButton
                                color="primary"
                                onClick={() => setEditCategory(category)}
                                disabled={editCategory._id !== undefined}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Category">
                              <IconButton
                                color="error"
                                onClick={() => openDeleteDialog(category)}
                                disabled={editCategory._id !== undefined}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </StyledTableContainer>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <NoResultsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                {searchQuery ? "No categories matching your search" : "No categories found"}
              </Typography>
              {searchQuery && (
                <Button 
                  variant="text" 
                  color="primary" 
                  onClick={() => setSearchQuery("")} 
                  sx={{ mt: 1 }}
                >
                  Clear Search
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </StyledCard>

      {/* Category Statistics Card */}
      <StyledCard>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 600 }}>
            Category Statistics
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {user?.categories?.map((category) => {
              const categoryColor = getCategoryColor(category.label);
              
              return (
                <Chip
                  key={category._id}
                  icon={<span style={{ fontSize: '1.2rem', marginRight: '4px' }}>{category.icon}</span>}
                  label={category.label}
                  sx={{
                    bgcolor: alpha(categoryColor, 0.1),
                    color: categoryColor,
                    border: `1px solid ${alpha(categoryColor, 0.3)}`,
                    padding: '16px 8px',
                    fontWeight: 500,
                    '& .MuiChip-icon': {
                      color: 'inherit',
                    }
                  }}
                />
              );
            })}
            
            {user?.categories?.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No categories available. Add some categories to organize your expenses.
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, flexWrap: 'wrap', gap: 2 }}>
            <Paper sx={{ p: 2, borderRadius: 2, flex: '1 1 45%', minWidth: 200 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Categories
              </Typography>
              <Typography variant="h4" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                {user?.categories?.length || 0}
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, borderRadius: 2, flex: '1 1 45%', minWidth: 200 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Most Used Icons
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {/* Display 5 most common icons, this is for UI demonstration */}
                {user?.categories?.slice(0, 5).map((category, idx) => (
                  <Tooltip title={category.label} key={idx}>
                    <Chip
                      label={category.icon}
                      size="small"
                      sx={{ fontSize: '1.2rem' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Paper>
          </Box>
        </CardContent>
      </StyledCard>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category?
            {selectedCategory && (
              <Box component="span" sx={{ display: "block", mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>{selectedCategory.icon}</span>
                  <Typography component="span" fontWeight="bold">{selectedCategory.label}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Deleting this category may affect transactions associated with it.
                </Typography>
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
      
      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
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
    </>
  );
}