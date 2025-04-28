import express from 'express';
import { engine } from 'express-handlebars';
import productRouter from './routes/products.router.js';
import cartRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js'; // Nuevo router para las vistas
import { Server } from 'socket.io';
import path from 'path';
import { __dirname } from './utils.js'; // Vamos a crear esto también

const app = express();
const PORT = 8080;

// Middleware para leer JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

// Recursos estáticos (public)
app.use(express.static(path.join(__dirname, '/public')));

// Rutas API
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Rutas de vistas
app.use('/', viewsRouter);

// Levantar servidor
const serverHttp = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// WebSocket server
export const io = new Server(serverHttp);

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  
  // Aquí se conectan los eventos para productos y chat, los mensajes del chat serán enviados a todos los clientes
  socket.on('newMessage', (message) => {
    io.emit('newMessage', message);
  });
});
