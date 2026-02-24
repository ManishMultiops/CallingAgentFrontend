import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  DataUsage,
  // Home,
  AccountCircle,
  Logout,
  // Schedule,
  Settings,
  Event,
  // Analytics,
  Inventory as ProductIcon,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Products', icon: <ProductIcon />, path: '/products' },
  { text: 'Leads', icon: <DataUsage />, path: '/data' },
  // { text: 'Callbacks', icon: <Schedule />, path: '/callbacks' },
  { text: 'Demos', icon: <Event />, path: '/demos' },
  // { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 2 }}>
        <Typography
          component="div"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: 'primary.main',
            textAlign: 'center',
            lineHeight: 1.2
          }}
        >
          MultiOps CallGen AI
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  ...(isSelected && {
                    backgroundColor: mode === 'dark' ? 'rgba(74, 222, 128, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                    borderLeft: `4px solid ${mode === 'dark' ? '#4ade80' : '#2563eb'}`,
                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                      color: mode === 'dark' ? '#4ade80' : '#2563eb',
                      fontWeight: 'bold'
                    }
                  }),
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? (mode === 'dark' ? '#4ade80' : '#2563eb') : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: mode === 'dark' ? 'rgba(39, 39, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${mode === 'dark' ? '#3f3f46' : '#e2e8f0'}`,
          boxShadow: 'none',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>

            <MenuItem onClick={toggleTheme} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemIcon>
                  {mode === 'dark' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
                </ListItemIcon>
                Dark Mode
              </Box>
              <Box>
                <input
                  type="checkbox"
                  checked={mode === 'dark'}
                  readOnly
                  style={{
                    cursor: 'pointer',
                    accentColor: '#4ade80',
                    width: '16px',
                    height: '16px',
                    marginLeft: '12px'
                  }}
                />
              </Box>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: `1px solid ${mode === 'dark' ? '#3f3f46' : '#e2e8f0'}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: `1px solid ${mode === 'dark' ? '#3f3f46' : '#e2e8f0'}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
