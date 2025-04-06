import fs from 'fs/promises';
import path from 'path';

const filePath = path.resolve('src/products.json');

export class ProductManager {
  constructor() {
    this.path = filePath;
  }

  async _loadProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async _saveProducts(products) {
    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
  }

  async getProducts() {
    return await this._loadProducts();
  }

  async getProductById(id) {
    const products = await this._loadProducts();
    return products.find((p) => p.id === id);
  }

  async addProduct(product) {
    const products = await this._loadProducts();

    const newId = products.length > 0 ? String(Number(products[products.length - 1].id) + 1) : '1';
    const newProduct = { id: newId, ...product };

    products.push(newProduct);
    await this._saveProducts(products);
    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this._loadProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updates, id }; // no se cambia el ID
    await this._saveProducts(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this._loadProducts();
    const filtered = products.filter((p) => p.id !== id);
    await this._saveProducts(filtered);
    return filtered.length < products.length;
  }
}
