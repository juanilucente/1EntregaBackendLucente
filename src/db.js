import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://juanilucente:5zy2GydhxeuJ9tPe@cluster0.i9ybotz.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1); // si falla, termina el proceso
  }
};

export default connectDB;

