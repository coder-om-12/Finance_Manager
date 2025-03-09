import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline
} from "@mui/material";
import { useSelector } from "react-redux";
import CategoryIcon from "@mui/icons-material/Category";
import RefreshIcon from "@mui/icons-material/Refresh";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";

// Define a main theme matching the Home page theme
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

export default function Category() {
  const user = useSelector((state) => state.auth.user);
  const [editCategory, setEditCategory] = useState({});
  const theme = useTheme();

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary" elevation={0} sx={{ mb: 3 }}>
          <Toolbar>
            <CategoryIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Categories Manager
            </Typography>
            <IconButton color="inherit">
              <RefreshIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Expense Categories
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your expense categories to better organize and track your spending.
            </Typography>
          </Box>

          <CategoryForm
            editCategory={editCategory}
            setEditCategory={setEditCategory}
          />
          
          <CategoryList
            editCategory={editCategory}
            setEditCategory={setEditCategory}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}