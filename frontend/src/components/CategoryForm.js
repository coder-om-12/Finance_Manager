import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Paper,
  Divider,
  InputAdornment,
  Stack,
  Alert,
  Chip,
  Grid,
  Tooltip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LabelIcon from "@mui/icons-material/Label";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Cookies from "js-cookie";
import { setUser } from "../store/auth";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 5,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(3),
  transition: "box-shadow 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[6]
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

const EmojiContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2)
}));

const EmojiChip = styled(Chip)(({ theme, selected }) => ({
  fontSize: "1.2rem",
  cursor: "pointer",
  padding: theme.spacing(1),
  transition: "transform 0.2s, box-shadow 0.2s",
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: selected ? theme.palette.primary.light : "transparent",
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
  }
}));

// Extended emoji list for better categorization
const categoryIcons = [
  // Transportation
  "🚗", "🚕", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚜", "🛵", "🏍️", "🛺", "🚲", "✈️", "🚀", "🛸", "🚁", "⛵", "🚢", "🛩️", "🚆", "🚇", "🚊", "🚉", "🚝", "🚞", "🚋",
  // Food & Drinks
  "🍕", "🍔", "🌭", "🍿", "🧂", "🥓", "🍳", "🧇", "🥞", "🧈", "🍞", "🥐", "🥨", "🥯", "🥖", "🧀", "🥗", "🥙", "🥪", "🍖", "🍗", "🥩", "🥚", "🍲", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥛", "🫗",
  // Shopping
  "🛒", "👕", "👖", "🧥", "👗", "👚", "👔", "👙", "👘", "🥻", "🩱", "🩲", "🩳", "👛", "👜", "👝", "🧳", "🎒", "👞", "👟", "👠", "👡", "🥿", "👢",
  // Entertainment
  "🎬", "🎮", "🕹️", "🎭", "🎨", "🎪", "🎟️", "🎫", "🎺", "🎻", "🪕", "🥁", "🎹", "🪘", "🎸", "🪗", "🎯", "🎱", "🎾", "🏈", "⚽", "🏀", "⚾", "🏐", "🏉", "🎣", "🥏", "🎳", "⛳", "🏹", "🛝", "🧩", "🎰", "🎲", "♟️", "🎴", "🀄", "🎯",
  // Bills & Utilities
  "📱", "💻", "⌨️", "🖥️", "🖨️", "📺", "📟", "📠", "📞", "☎️", "📬", "📧", "📧", "📨", "📩", "📤", "📥", "📦", "📫", "📪", "📭", "📮", "🧾", "💸", "💵", "💴", "💶", "💷", "💰", "💳", "🧾", "💲", "✉️", "📃", "📄", "📑", "🧰", "🧲", "🔨", "⛏️", "⚒️", "🛠️", "🧪", "🧫", "🧬", "🔬", "🔭", "📡", "🎮",
  // Health
  "💊", "💉", "🩸", "🩹", "🩺", "🔬", "🧫", "🧪", "🦠", "🧬", "👓", "🕶️", "🥽", "🥼", "🧴", "🦺",
  // Education
  "📚", "📖", "🔖", "📕", "📗", "📘", "📙", "📒", "📔", "📓", "📰", "🗞️", "📝", "✏️", "🖊️", "🖋️", "✒️", "🖌️", "🖍️", "📋", "📌", "📍", "📎", "🖇️", "📏", "📐", "✂️", "🗃️", "🗄️", "🗑️", "🔎",
  // Home & Living
  "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "💒", "🏛️", "⛪", "🕌", "🕍", "🛕", "🏰", "🏯",
  // Miscellaneous
  "🧸", "🪑", "🛋️", "🪞", "🪟", "🛏️", "🛌", "🧸", "🪆", "🪅", "🪄", "🧿", "🧶", "🧵", "🪡", "🧷", "🪢", "🧹", "🧺", "🧻", "🪣", "🧼", "🫧", "🪥", "🧽", "🧯", "👁️", "🗣️", "👤", "👥", "👨‍👩‍👧‍👦", "👨‍👩‍👧", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧", "👩‍👩‍👦", "👨‍👨‍👦", "👪", "💌", "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️‍🔥", "❤️‍🩹", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤", "🌐", "♨️", "🌀", "🌈", "🌂", "☂️", "☔", "⚡", "❄️", "☃️", "⛄", "☄️", "🔥", "💧", "🌊", "🎀", "🎁", "🎗️", "🎖️", "🏆", "🏅", "🥇", "🥈", "🥉", "📢", "🔔"
];

const InitialForm = {
  label: "",
  icon: "",
};

export default function CategoryForm({ editCategory, setEditCategory }) {
  const user = useSelector((state) => state.auth.user);
  const token = Cookies.get("token");
  const dispatch = useDispatch();
  
  const [form, setForm] = useState(InitialForm);
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Filter emoji based on search query
  const filteredIcons = categoryIcons.filter(icon => 
    searchQuery === "" || icon.includes(searchQuery)
  );

  useEffect(() => {
    if (editCategory._id !== undefined) {
      setForm(editCategory);
      setEditMode(true);
      setOpen(true);
    } else {
      setForm(InitialForm);
      setEditMode(false);
    }
  }, [editCategory]);

  const validate = () => {
    const newErrors = {};
    
    if (!form.label.trim()) {
      newErrors.label = "Category name is required";
    }
    
    if (!form.icon) {
      newErrors.icon = "Please select an icon";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    editMode ? update() : create();
  };

  const handleCancel = () => {
    setForm(InitialForm);
    setEditMode(false);
    setEditCategory({});
    setErrors({});
    setOpen(false);
    setSearchQuery("");
  };

  const showAlert = (message, severity = "success") => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const reload = (res, _user) => {
    if (res.ok) {
      setForm(InitialForm);
      setEditMode(false);
      setEditCategory({});
      dispatch(setUser({ user: _user }));
      showAlert(editMode ? "Category updated successfully!" : "Category added successfully!");
      setOpen(false);
      setErrors({});
      setSearchQuery("");
    } else {
      showAlert("An error occurred. Please try again.", "error");
    }
  };

  const create = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/category`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const _user = {
        ...user,
        categories: [...user.categories, { ...form }],
      };
      
      reload(res, _user);
    } catch (error) {
      console.error("Error creating category:", error);
      showAlert("Failed to create category. Please try again.", "error");
    }
  };

  const update = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/category/${editCategory._id}`,
        {
          method: "PATCH",
          body: JSON.stringify(form),
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const _user = {
        ...user,
        categories: user.categories.map((cat) =>
          cat._id == editCategory._id ? form : cat
        ),
      };
      
      reload(res, _user);
    } catch (error) {
      console.error("Error updating category:", error);
      showAlert("Failed to update category. Please try again.", "error");
    }
  };

  const handleIconSelect = (icon) => {
    setForm({ ...form, icon });
    if (errors.icon) {
      setErrors({ ...errors, icon: null });
    }
  };

  const groupedIcons = [
    { title: "Transportation", icons: filteredIcons.slice(0, 27) },
    { title: "Food & Drinks", icons: filteredIcons.slice(27, 82) },
    { title: "Shopping", icons: filteredIcons.slice(82, 105) },
    { title: "Entertainment", icons: filteredIcons.slice(105, 142) },
    { title: "Bills & Utilities", icons: filteredIcons.slice(142, 179) },
    { title: "Health", icons: filteredIcons.slice(179, 195) },
    { title: "Education", icons: filteredIcons.slice(195, 225) },
    { title: "Home & Living", icons: filteredIcons.slice(225, 242) },
    { title: "Miscellaneous", icons: filteredIcons.slice(242) },
  ];

  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
            Categories
          </Typography>
          
          {!open && (
            <AnimatedButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Add Category
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
                {editMode ? "Update Category" : "New Category"}
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
                  type="text"
                  label="Category Name"
                  name="label"
                  variant="outlined"
                  fullWidth
                  value={form.label}
                  onChange={handleChange}
                  error={!!errors.label}
                  helperText={errors.label}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LabelIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center' }}>
                    <EmojiEmotionsIcon color="action" sx={{ mr: 1 }} />
                    Select Icon
                  </Typography>
                  
                  {errors.icon && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1 }}>
                      {errors.icon}
                    </Typography>
                  )}
                  
                  <TextField
                    variant="outlined"
                    placeholder="Search icons..."
                    size="small"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          🔍
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      maxHeight: 250, 
                      overflowY: 'auto',
                      borderRadius: 2,
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'rgba(0,0,0,0.05)',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                      },
                    }}
                  >
                    {searchQuery ? (
                      <EmojiContainer>
                        {filteredIcons.map((icon, index) => (
                          <Tooltip title={`Select ${icon}`} key={index}>
                            <EmojiChip
                              label={icon}
                              onClick={() => handleIconSelect(icon)}
                              selected={form.icon === icon}
                              variant={form.icon === icon ? "filled" : "outlined"}
                            />
                          </Tooltip>
                        ))}
                      </EmojiContainer>
                    ) : (
                      <Box>
                        {groupedIcons.map((group, groupIndex) => 
                          group.icons.length > 0 && (
                            <Box key={groupIndex} sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                {group.title}
                              </Typography>
                              <EmojiContainer>
                                {group.icons.map((icon, index) => (
                                  <Tooltip title={`Select ${icon}`} key={index}>
                                    <EmojiChip
                                      label={icon}
                                      onClick={() => handleIconSelect(icon)}
                                      selected={form.icon === icon}
                                      variant={form.icon === icon ? "filled" : "outlined"}
                                    />
                                  </Tooltip>
                                ))}
                              </EmojiContainer>
                            </Box>
                          )
                        )}
                      </Box>
                    )}
                  </Paper>
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
        
        {!open && user.categories.length === 0 && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No categories yet. Add your first category to organize your expenses.
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
}