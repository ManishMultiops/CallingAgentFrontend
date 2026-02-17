import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Grid,
    InputAdornment
} from '@mui/material';
import {
    Add,
    Edit,
    Delete
} from '@mui/icons-material';
import apiClient from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
    const { user, loading: authLoading } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        min_price: '',
        max_price: ''
    });

    useEffect(() => {
        if (!authLoading && user) {
            fetchProducts();
        }
    }, [user, authLoading]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/data/products/');
            const data = response.data.results || response.data;
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            setError('Failed to fetch products');
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Format price range before sending
            const formattedData = {
                ...formData,
                price_range: formData.min_price && formData.max_price
                    ? `Rs. ${formData.min_price} - Rs. ${formData.max_price}`
                    : formData.min_price ? `Rs. ${formData.min_price}` : ''
            };

            // Remove helper fields before sending
            delete formattedData.min_price;
            delete formattedData.max_price;

            if (editingProduct) {
                await apiClient.put(`/data/products/${editingProduct.id}/`, formattedData);
                setSuccess('Product updated successfully');
            } else {
                await apiClient.post('/data/products/', formattedData);
                setSuccess('Product added successfully');
            }

            await fetchProducts();
            setOpenDialog(false);
            setEditingProduct(null);
            resetForm();
        } catch (error) {
            setError('Failed to save product');
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await apiClient.delete(`/data/products/${productId}//`);
            setSuccess('Product deleted successfully');
            await fetchProducts();
        } catch (error) {
            setError('Failed to delete product');
            console.error('Error deleting product:', error);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);

        // Parse min/max from price_range string (Rs. 100 - Rs. 500)
        let min = '';
        let max = '';
        if (product.price_range) {
            const parts = product.price_range.split('-').map(p => p.trim().replace(/[^0-9]/g, ''));
            if (parts.length >= 1) min = parts[0];
            if (parts.length >= 2) max = parts[1];
        }

        setFormData({
            title: product.title,
            description: product.description || '',
            min_price: min,
            max_price: max
        });
        setOpenDialog(true);
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        resetForm();
        setOpenDialog(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            min_price: '',
            max_price: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
    };

    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" color="error">
                    Please log in to access products management.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Products Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddProduct}
                >
                    Add Product
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Price Range</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(products) && products.length > 0 ? products.map((product) => (
                                <TableRow
                                    key={product.id}
                                    onClick={() => handleProductSelect(product)}
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor: selectedProduct?.id === product.id ? 'action.selected' : 'inherit',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{product.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{product.title}</TableCell>
                                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {product.description}
                                    </TableCell>
                                    <TableCell>{product.price_range || 'N/A'}</TableCell>
                                    <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body2" color="textSecondary">
                                            No products found. Add a product to get started.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Product Form Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Product Title"
                            value={formData.title}
                            onChange={handleInputChange}
                            name="title"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            name="description"
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Min Price"
                                    type="number"
                                    value={formData.min_price}
                                    onChange={handleInputChange}
                                    name="min_price"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Max Price"
                                    type="number"
                                    value={formData.max_price}
                                    onChange={handleInputChange}
                                    name="max_price"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.title}>
                        {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Products;
