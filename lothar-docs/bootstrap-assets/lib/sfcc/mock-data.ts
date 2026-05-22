import { storeCatalog } from "./constants";
import { Collection, Product } from "./types";

function picsumImage(seed: string): Product["featuredImage"] {
  return {
    url: `https://picsum.photos/seed/${seed}/800/800`,
    altText: seed,
    width: 800,
    height: 800,
  };
}

function buildProduct(
  id: string,
  title: string,
  categoryId: string,
  price: string,
  seed: string
): Product {
  const image = picsumImage(seed);
  const money = { amount: price, currencyCode: "USD" as const };

  return {
    id,
    handle: id,
    title,
    categoryId,
    description: `${title} — sample product for local mock mode.`,
    descriptionHtml: `<p>${title} — sample product for local mock mode.</p>`,
    featuredImage: image,
    images: [image],
    currencyCode: "USD",
    priceRange: { minVariantPrice: money, maxVariantPrice: money },
    seo: { title, description: `${title} in mock catalog` },
    options: [],
    tags: [],
    variants: [
      {
        id,
        title: "Default",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default" }],
        price: money,
      },
    ],
    availableForSale: true,
    updatedAt: new Date().toISOString(),
  };
}

export const mockProducts: Product[] = [
  buildProduct("mock-tee-black", "Mock Tee — Black", "mens", "29.99", "mock-tee-black"),
  buildProduct("mock-tee-white", "Mock Tee — White", "mens", "29.99", "mock-tee-white"),
  buildProduct(
    "mock-hoodie-navy",
    "Mock Hoodie — Navy",
    "mens",
    "59.99",
    "mock-hoodie-navy"
  ),
  buildProduct(
    "mock-dress-floral",
    "Mock Dress — Floral",
    "womens",
    "89.99",
    "mock-dress-floral"
  ),
  buildProduct(
    "mock-skirt-denim",
    "Mock Skirt — Denim",
    "womens",
    "49.99",
    "mock-skirt-denim"
  ),
  buildProduct(
    "mock-jacket-wind",
    "Mock Jacket — Windbreaker",
    "newarrivals",
    "129.99",
    "mock-jacket-wind"
  ),
];

const collectionMeta: Record<string, { title: string; description: string }> = {
  mens: { title: "Men's", description: "Men's apparel" },
  womens: { title: "Women's", description: "Women's apparel" },
  newarrivals: { title: "New Arrivals", description: "Latest styles" },
  "top-seller": { title: "Top Sellers", description: "Customer favorites" },
  "hidden-homepage-carousel": {
    title: "Homepage Carousel",
    description: "Hidden carousel collection",
  },
  "hidden-homepage-featured-items": {
    title: "Homepage Featured",
    description: "Hidden featured grid collection",
  },
};

export const mockCollectionProductIds: Record<string, string[]> = {
  mens: ["mock-tee-black", "mock-tee-white", "mock-hoodie-navy"],
  womens: ["mock-dress-floral", "mock-skirt-denim"],
  newarrivals: ["mock-jacket-wind", "mock-dress-floral"],
  "top-seller": [
    "mock-tee-black",
    "mock-hoodie-navy",
    "mock-dress-floral",
    "mock-jacket-wind",
  ],
  "hidden-homepage-carousel": [
    "mock-tee-black",
    "mock-hoodie-navy",
    "mock-dress-floral",
  ],
  "hidden-homepage-featured-items": [
    "mock-tee-black",
    "mock-hoodie-navy",
    "mock-dress-floral",
  ],
};

export function mockGetProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}

export function mockGetCollections(): Collection[] {
  return storeCatalog.ids.split(",").map((id) => {
    const meta = collectionMeta[id] || { title: id, description: "" };
    return {
      handle: id,
      title: meta.title,
      description: meta.description,
      seo: { title: meta.title, description: meta.description },
      updatedAt: new Date().toISOString(),
      path: `/search/${id}`,
    };
  });
}

export function mockGetProductsForCollection(collectionId: string): Product[] {
  const ids = mockCollectionProductIds[collectionId] || [];
  return ids
    .map((id) => mockGetProductById(id))
    .filter((p): p is Product => p !== undefined);
}

export function mockSearchAll(options: {
  query?: string;
  categoryId?: string;
  sortKey?: string;
  limit?: number;
}): Product[] {
  const { query, categoryId, sortKey, limit = 100 } = options;
  let results = categoryId
    ? mockGetProductsForCollection(categoryId)
    : [...mockProducts];

  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }

  results = sortMockProducts(results, sortKey);
  return results.slice(0, limit);
}

function sortMockProducts(products: Product[], sortKey?: string): Product[] {
  const sorted = [...products];
  switch (sortKey) {
    case "price-low-to-high":
      sorted.sort(
        (a, b) =>
          parseFloat(a.priceRange.minVariantPrice.amount) -
          parseFloat(b.priceRange.minVariantPrice.amount)
      );
      break;
    case "price-high-to-low":
      sorted.sort(
        (a, b) =>
          parseFloat(b.priceRange.minVariantPrice.amount) -
          parseFloat(a.priceRange.minVariantPrice.amount)
      );
      break;
    case "product-name-ascending":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "product-name-descending":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      break;
  }
  return sorted;
}
