import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Vista de inicio (redirige a /products)
router.get('/', (req, res) => {
  res.redirect('/products');
});

// Vista productos paginados con filtro y orden
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, query } = req.query;

    const url = new URL('http://localhost:8080/api/products');
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (sort) url.searchParams.append('sort', sort);
    if (query) url.searchParams.append('query', query);

    const response = await fetch(url.toString());
    const data = await response.json();

    res.render('products', {
      products: data.payload,
      pagination: {
        totalPages: data.totalPages,
        page: data.page,
        hasPrevPage: data.hasPrevPage,
        hasNextPage: data.hasNextPage,
        prevPage: data.prevPage,
        nextPage: data.nextPage,
        prevLink: data.hasPrevPage ? `/products?page=${data.prevPage}&sort=${sort || ''}&query=${query || ''}` : null,
        nextLink: data.hasNextPage ? `/products?page=${data.nextPage}&sort=${sort || ''}&query=${query || ''}` : null,
      },
      sort,
      query,
    });
  } catch (error) {
    res.status(500).send('Error al cargar productos paginados');
  }
});

// Vista detalle de producto por id
router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const response = await fetch(`http://localhost:8080/api/products/${pid}`);
    const product = await response.json();

    if (!product || product.error) {
      return res.status(404).render('error', { message: 'Producto no encontrado' });
    }

    res.render('productDetail', { product });
  } catch (error) {
    res.status(500).send('Error al cargar el detalle del producto');
  }
});

// Vista carrito por id con productos poblados
router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const response = await fetch(`http://localhost:8080/api/carts/${cid}`);
    const data = await response.json();

    if (!data || data.status === 'error') {
      return res.status(404).render('error', { message: 'Carrito no encontrado' });
    }

    res.render('cartDetail', { cart: data.payload });
  } catch (error) {
    res.status(500).send('Error al cargar el carrito');
  }
});

// Vista productos en tiempo real (opcional)
router.get('/realtimeproducts', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8080/api/products');
    const data = await response.json();
    res.render('realTimeProducts', { products: data.payload });
  } catch (error) {
    res.status(500).json({ error: 'Hubo un problema al cargar los productos en tiempo real' });
  }
});

export default router;

