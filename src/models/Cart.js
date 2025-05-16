import mongoose from 'mongoose';

const productInCartSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const cartSchema = new mongoose.Schema({
  products: [productInCartSchema],
});

const CartModel = mongoose.model('Cart', cartSchema);
export default CartModel;



