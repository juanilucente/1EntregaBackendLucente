import express from 'express';
import { ProductManager } from '../productManager.js'; // Asumo que ya lo tenías
import { io } from '../app.js'; // Importamos el WebSocket

const router = express.Router();
const productManager = new ProductManager();

// Ruta para la vista de inicio (home.handlebars)
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', { products }); // Renderiza la vista home.handlebars con los productos
  } catch (error) {
    res.status(500).json({ error: 'Hubo un problema al cargar los productos' });
  }
});

// Ruta para la vista de productos en tiempo real (realtimeproducts.handlebars)
router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products }); // Renderiza realTimeProducts.handlebars con los productos
  } catch (error) {
    res.status(500).json({ error: 'Hubo un problema al cargar los productos en tiempo real' });
  }
});

// Aquí creamos una ruta para agregar un producto y que el frontend se actualice en tiempo real
router.post('/api/products', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  
  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const newProduct = await productManager.addProduct({ title, description, code, price, stock, category, thumbnails });
  
  // Enviamos el nuevo producto a través del WebSocket para que todos los clientes lo reciban
  io.emit('newProduct', newProduct);
  
  res.status(201).json(newProduct);
});

// Ruta para eliminar un producto
router.delete('/api/products/:pid', async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await productManager.deleteProduct(pid);
  
  if (deletedProduct) {
    // Emitimos el evento de eliminación para que los clientes se actualicen en tiempo real
    io.emit('deletedProduct', pid);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Emitir los productos a los nuevos clientes cuando se conectan
io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado');
  
  // Emitir los productos existentes a los nuevos clientes
  const products = await productManager.getProducts();
  socket.emit('initialProducts', products);

  // Escuchar eventos de productos nuevos o eliminados
  socket.on('newProduct', (product) => {
    io.emit('newProduct', product);
  });
  socket.on('deletedProduct', (pid) => {
    io.emit('deletedProduct', pid);
  });

  // Escuchar los mensajes del chat
  socket.on('newMessage', (message) => {
    io.emit('newMessage', message); // Enviar el mensaje a todos los clientes conectados
  });
});

export default router;
