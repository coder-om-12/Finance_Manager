import React, { useState } from "react";
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Badge,
  Container,
  useTheme,
  alpha
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../store/auth.js";
import Cookies from "js-cookie";

// Icons
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
  transition: "all 0.3s ease-in-out",
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: 0.5,
  backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
  backgroundClip: "text",
  textFillColor: "transparent",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "white",
  display: "flex",
  alignItems: "center",
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  margin: theme.spacing(0, 0.5),
  borderRadius: "8px",
  padding: theme.spacing(0.8, 2),
  textTransform: "none",
  fontWeight: active ? 600 : 500,
  backgroundColor: active ? alpha(theme.palette.common.white, 0.15) : "transparent",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  transition: "all 0.2s",
}));

const NavIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  transition: "all 0.2s",
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  cursor: "pointer",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.05)",
  },
  width: 38,
  height: 38,
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: 240,
    boxSizing: "border-box",
    backgroundColor: theme.palette.background.default,
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function NavBar() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Check if current screen is mobile
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // State for menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Check which page is active
  const isActive = (path) => location.pathname === path;
  
  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle logout
  function handleLogout() {
    Cookies.remove("token");
    dispatch(logOut());
    navigate("/login");
    handleMenuClose();
    setMobileOpen(false);
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.firstName) return "U";
    return user.firstName.charAt(0) + (user.lastName ? user.lastName.charAt(0) : "");
  };

  // Navigation links for authenticated users
  const authenticatedLinks = [
    { name: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { name: "Categories", path: "/category", icon: <CategoryIcon /> },
    // Add more navigation links as needed
  ];

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ height: "100%" }}>
      <DrawerHeader>
        <Box display="flex" alignItems="center" px={2} width="100%">
          <AccountBalanceWalletIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}>
            Finance Manager
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      </DrawerHeader>
      <Divider />
      
      {isAuthenticated && (
        <>
          <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <UserAvatar>{getUserInitials()}</UserAvatar>
            <Box ml={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Divider />
        </>
      )}
      
      <List>
        {isAuthenticated ? (
          <>
            {authenticatedLinks.map((link) => (
              <ListItem 
                button 
                key={link.name}
                component={Link} 
                to={link.path}
                onClick={handleDrawerToggle}
                selected={isActive(link.path)}
                sx={{
                  backgroundColor: isActive(link.path) ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon sx={{ color: isActive(link.path) ? "primary.main" : "inherit" }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={link.name} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive(link.path) ? 600 : 400 
                  }}
                />
              </ListItem>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{ mx: 1, my: 0.5, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ color: "error.main" }}
              />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/login"
              onClick={handleDrawerToggle}
              sx={{ mx: 1, my: 0.5, borderRadius: 1 }}
            >
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            
            <ListItem 
              button 
              component={Link} 
              to="/register"
              onClick={handleDrawerToggle}
              sx={{ mx: 1, my: 0.5, borderRadius: 1 }}
            >
              <ListItemIcon>
                <AppRegistrationIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Logo */}
            <AccountBalanceWalletIcon sx={{ mr: 1, display: { xs: "none", sm: "flex" } }} />
            <LogoText
              variant="h6"
              component={Link}
              to="/"
              sx={{
                mr: 2,
                flexGrow: { xs: 1, md: 0 },
                textDecoration: "none",
                display: "flex",
              }}
            >
              Personal Finance Manager
            </LogoText>
            
            {/* Desktop Nav Links */}
            {!isMobile && isAuthenticated && (
              <Box sx={{ flexGrow: 1, display: "flex", ml: 2 }}>
                {authenticatedLinks.map((link) => (
                  <Tooltip title={link.name} key={link.name}>
                    <NavButton
                      component={Link}
                      to={link.path}
                      color="inherit"
                      startIcon={link.icon}
                      active={isActive(link.path) ? 1 : 0}
                    >
                      {link.name}
                    </NavButton>
                  </Tooltip>
                ))}
              </Box>
            )}
            
            <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />
            
            {/* User Section */}
            {isAuthenticated ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {!isMobile && (
                  <Typography variant="body2" sx={{ mr: 2, fontStyle: "italic" }}>
                    Welcome, {user?.firstName}
                  </Typography>
                )}
                
                {!isMobile && (
                  <Tooltip title="Notifications">
                    <NavIconButton color="inherit" sx={{ mr: 1 }}>
                      <Badge badgeContent={2} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </NavIconButton>
                  </Tooltip>
                )}
                
                <Tooltip title="Account settings">
                  <UserAvatar onClick={handleMenuOpen}>
                    {getUserInitials()}
                  </UserAvatar>
                </Tooltip>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      width: 200,
                      borderRadius: 2,
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.2))",
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  }}
                >
                  <MenuItem component={Link} to="/profile">
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/settings">
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: "flex" }}>
                {!isMobile ? (
                  <>
                    <NavButton
                      component={Link}
                      to="/login"
                      color="inherit"
                      startIcon={<LoginIcon />}
                      active={isActive("/login") ? 1 : 0}
                    >
                      Login
                    </NavButton>
                    <NavButton
                      component={Link}
                      to="/register"
                      color="inherit"
                      startIcon={<AppRegistrationIcon />}
                      active={isActive("/register") ? 1 : 0}
                    >
                      Register
                    </NavButton>
                  </>
                ) : (
                  <IconButton
                    color="inherit"
                    aria-label="Login"
                    component={Link}
                    to="/login"
                  >
                    <LoginIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </StyledAppBar>
      
      {/* Mobile Drawer */}
      <MobileDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawerContent}
      </MobileDrawer>
      
      {/* Toolbar placeholder to push content below AppBar */}
      <Toolbar />
    </Box>
  );
}