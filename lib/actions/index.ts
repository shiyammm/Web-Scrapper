'use server';

import { scrapAmazonProduct } from '../scraper';

export const scrapeAnsStoreProduct = async (productUrl: string) => {
  if (!productUrl) return;

  try {
    const scrapedProduct = await scrapAmazonProduct(productUrl);

    if (!scrapedProduct) return;

    

  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message} `);
  }
};
