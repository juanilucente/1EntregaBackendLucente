import express from 'express';
import { engine } from 'express-handlebars';
import productRouter from './routes/products.router.js';
import cartRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { Server } from 'socket.io';
import path from 'path';
import { __dirname } from './utils.js';
import connectDB from './db.js';
import { Product } from './models/product.js';

const app = express();
const PORT = 8080;

let io;

connectDB()
  .then(() => {
    console.log('Conexión a MongoDB exitosa');

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.engine(
      'handlebars',
      engine({
        helpers: {
          ifEquals: function (arg1, arg2, options) {
            return arg1 == arg2 ? options.fn(this) : options.inverse(this);
          },
        },
      })
    );
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, '/views'));

    app.use(express.static(path.join(__dirname, '/public')));

    app.use('/api/products', productRouter);
    app.use('/api/carts', cartRouter);
    app.use('/', viewsRouter);

    const serverHttp = app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

    io = new Server(serverHttp);

    io.on('connection', async (socket) => {
      console.log('Nuevo cliente conectado');

      const products = await Product.find().lean();
      socket.emit('initialProducts', products);

      socket.on('newProduct', (product) => {
        io.emit('newProduct', product);
      });

      socket.on('deletedProduct', (pid) => {
        io.emit('deletedProduct', pid);
      });

      socket.on('newMessage', (message) => {
        io.emit('newMessage', message);
      });
    });
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
  });

export { io };
