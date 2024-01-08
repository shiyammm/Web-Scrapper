'use server';

import Product from '../models/product.model';
import { revalidatePath } from 'next/cache';
import { connectToDB } from '../mongoose';
import { scrapAmazonProduct } from '../scraper';
import { getAveragePrice, getHighestPrice, getLowestPrice } from '../utils';

export const scrapeAnsStoreProduct = async (productUrl: string) => {
  if (!productUrl) return;

  try {
    connectToDB();
    const scrapedProduct = await scrapAmazonProduct(productUrl);

    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      {
        url: scrapedProduct.url,
      },
      product,
      { upsert: true, new: true },
    );
    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message} `);
  }
};

export async function getProductById(productId: string) {
  try {
    connectToDB();

    const product = await Product.findOne({ _id: productId });

    if (!product) return null;
    return product;
  } catch (error) {}
}
