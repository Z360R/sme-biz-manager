'use client'

import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  IconButton, Tooltip, Paper, Typography, CircularProgress,
  Chip, MenuItem,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useState } from 'react'
import type { Product } from '@sme/shared'
import { useProducts, useDeleteProduct, useProductCategories } from '@/hooks/useProducts'
import { ProductForm } from './ProductForm'
import { StockMovementForm } from './StockMovementForm'

export function ProductsTable() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [movementProduct, setMovementProduct] = useState<Product | null>(null)

  const { data, isLoading } = useProducts({ page: page + 1, pageSize, search, category })
  const { data: categories = [] } = useProductCategories()
  const deleteProduct = useDeleteProduct()

  function handleEdit(product: Product) {
    setEditProduct(product)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditProduct(null)
    setFormOpen(true)
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this product?')) {
      deleteProduct.mutate(id)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search name or SKU…"
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          sx={{ width: 240 }}
        />
        <TextField
          select
          label="Category"
          size="small"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0) }}
          sx={{ width: 180 }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={handleCreate}>+ New Product</Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No products found</Typography>
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((product) => {
                const isLow = product.stockQty < product.lowStockThreshold
                return (
                  <TableRow key={product.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">${product.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        {product.stockQty}
                        {isLow && (
                          <Chip
                            icon={<WarningAmberIcon />}
                            label="Low"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Adjust stock">
                        <IconButton size="small" color="primary" onClick={() => setMovementProduct(product)}>
                          <SwapVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(product)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
        />
      </Paper>

      <ProductForm open={formOpen} product={editProduct} onClose={() => setFormOpen(false)} />

      {movementProduct && (
        <StockMovementForm
          open={!!movementProduct}
          productId={movementProduct.id}
          productName={movementProduct.name}
          onClose={() => setMovementProduct(null)}
        />
      )}
    </Box>
  )
}
