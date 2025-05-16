import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  status: { type: Boolean, default: true },
  thumbnail: [String],
  stock: Number,
  code: String,
});

productSchema.plugin(mongoosePaginate);

export const Product = mongoose.model('Product', productSchema);
