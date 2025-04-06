import fs from 'fs/promises';
import path from 'path';

const filePath = path.resolve('src/carts.json');

export class CartManager {
  constructor() {
    this.path = filePath;
  }

  async _loadCarts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async _saveCarts(carts) {
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
  }

  async createCart() {
    const carts = await this._loadCarts();
    const newId = carts.length > 0 ? String(Number(carts[carts.length - 1].id) + 1) : '1';
    const newCart = { id: newId, products: [] };

    carts.push(newCart);
    await this._saveCarts(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this._loadCarts();
    return carts.find((c) => c.id === id);
  }

  async addProductToCart(cartId, productId) {
    const carts = await this._loadCarts();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;

    const existingProduct = cart.products.find((p) => p.product === productId);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this._saveCarts(carts);
    return cart;
  }
}
