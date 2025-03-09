import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Autocomplete,
  IconButton,
  Collapse,
  Chip,
  Alert,
  Divider,
  InputAdornment,
  Stack,
  Paper
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Cookies from "js-cookie";
import dayjs from "dayjs";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 5,
  // boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(3),
  transition: "box-shadow 0.3s ease-in-out",
  "&:hover": {
    // boxShadow: theme.shadows[6]
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 5,
  padding: theme.spacing(1, 3),
  textTransform: "none",
  fontWeight: 600,
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)"
  }
}));

const FormField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 5,
    transition: "background-color 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    }
  }
}));

const initialForm = {
  amount: "",
  description: "",
  date: dayjs(),
  category_id: "",
};

export default function TransactionForm({
  fetchTransactions,
  editTransaction,
  setEditTransaction,
}) {
  const user = useSelector((state) => state.auth.user);
  const categories = user?.categories || [];
  const token = Cookies.get("token");
  
  const [form, setForm] = useState(initialForm);
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editTransaction.amount !== undefined) {
      setForm({
        ...editTransaction,
        date: dayjs(editTransaction.date)
      });
      setEditMode(true);
      setOpen(true);
    } else {
      setForm(initialForm);
      setEditMode(false);
    }
  }, [editTransaction]);

  const validate = () => {
    const newErrors = {};
    
    if (!form.amount || form.amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    
    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!form.category_id) {
      newErrors.category_id = "Please select a category";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleDate = (newValue) => {
    setForm({ ...form, date: newValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    editMode ? update() : create();
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditMode(false);
    setEditTransaction({});
    setErrors({});
    setOpen(false);
  };

  const showAlert = (message, severity = "success") => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const reload = (res) => {
    if (res.ok) {
      setForm(initialForm);
      setEditMode(false);
      setEditTransaction({});
      fetchTransactions();
      showAlert(editMode ? "Transaction updated successfully!" : "Transaction added successfully!");
      setOpen(false);
      setErrors({});
    } else {
      showAlert("An error occurred. Please try again.", "error");
    }
  };

  const create = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transaction`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      reload(res);
    } catch (error) {
      console.error("Error creating transaction:", error);
      showAlert("Failed to create transaction. Please try again.", "error");
    }
  };

  const update = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/transaction/${editTransaction._id}`,
        {
          method: "PATCH",
          body: JSON.stringify(form),
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      reload(res);
    } catch (error) {
      console.error("Error updating transaction:", error);
      showAlert("Failed to update transaction. Please try again.", "error");
    }
  };

  const getCategoryById = () => {
    return categories.find((category) => category._id === form.category_id) || null;
  };

  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
            Transactions
          </Typography>
          
          {!open && (
            <AnimatedButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Add Transaction
            </AnimatedButton>
          )}
        </Box>
        
        <Collapse in={open}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              mb: 2,
              border: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" component="div">
                {editMode ? "Update Transaction" : "New Transaction"}
              </Typography>
              
              <IconButton onClick={handleCancel} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {alert.show && (
              <Alert 
                severity={alert.severity}
                sx={{ mb: 2 }}
                action={
                  <IconButton
                    size="small"
                    onClick={() => setAlert({ ...alert, show: false })}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                {alert.message}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <FormField
                  type="number"
                  label="Amount"
                  name="amount"
                  variant="outlined"
                  fullWidth
                  value={form.amount}
                  onChange={handleChange}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
                
                <FormField
                  type="text"
                  label="Description"
                  name="description"
                  variant="outlined"
                  fullWidth
                  value={form.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box sx={{ display: "flex", gap: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Transaction Date"
                      inputFormat="DD.MM.YYYY"
                      value={form.date}
                      onChange={handleDate}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          sx={{ marginRight: 0 }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  
                  <Autocomplete
                    value={getCategoryById()}
                    onChange={(event, newValue) => {
                      setForm({ 
                        ...form, 
                        category_id: newValue ? newValue._id : "" 
                      });
                      
                      if (errors.category_id) {
                        setErrors({ ...errors, category_id: null });
                      }
                    }}
                    id="category-select"
                    options={categories}
                    getOptionLabel={(option) => option.label || ""}
                    renderInput={(params) => (
                      <FormField
                        {...params}
                        label="Category"
                        error={!!errors.category_id}
                        helperText={errors.category_id}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <CategoryIcon color="action" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <span style={{ marginRight: 8, fontSize: 20 }}>{option.icon}</span>
                          {option.label}
                        </Box>
                      </li>
                    )}
                    fullWidth
                  />
                </Box>
                
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  <AnimatedButton
                    type="button"
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </AnimatedButton>
                  
                  <AnimatedButton
                    type="submit"
                    variant="contained"
                    color={editMode ? "info" : "primary"}
                    startIcon={<SaveIcon />}
                  >
                    {editMode ? "Update" : "Save"}
                  </AnimatedButton>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Collapse>
        
        {!open && (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Add new transactions to track your expenses
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
}