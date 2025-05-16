import { Router } from 'express';
import CartModel from '../models/cart.js';
import ProductModel from '../models/product.js';

const router = Router();

// Obtener carrito con productos "populados"
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Error obteniendo carrito' });
  }
});

// Agregar producto al carrito (nuevo o +1 si ya existe)
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const existingProduct = cart.products.find(p => p.product.toString() === pid);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.status(200).json({ status: 'success', message: 'Producto agregado al carrito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.json({ status: 'success', message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando producto' });
  }
});

// Actualizar todos los productos del carrito
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    cart.products = products;
    await cart.save();

    res.json({ status: 'success', message: 'Carrito actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando carrito' });
  }
});

// Actualizar cantidad de un producto específico en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const productInCart = cart.products.find(p => p.product.toString() === pid);
    if (!productInCart) return res.status(404).json({ error: 'Producto no encontrado en el carrito' });

    productInCart.quantity = quantity;
    await cart.save();

    res.json({ status: 'success', message: 'Cantidad actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando cantidad' });
  }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    cart.products = [];
    await cart.save();

    res.json({ status: 'success', message: 'Carrito vacío' });
  } catch (error) {
    res.status(500).json({ error: 'Error vaciando carrito' });
  }
});

export default router;

