import { cookies } from "next/headers";
import {
  mockGetCollections as getMockCollections,
  mockGetProductById,
  mockSearchAll,
} from "./mock-data";
import { Cart, CartItem, Collection, Product } from "./types";

export const MOCK_CART_LINES_COOKIE = "mock_cart_lines";

type MockCartLine = {
  itemId: string;
  productId: string;
  quantity: number;
};

function parseCartLines(raw: string | undefined): MockCartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MockCartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readCartLines(): Promise<MockCartLine[]> {
  return parseCartLines((await cookies()).get(MOCK_CART_LINES_COOKIE)?.value);
}

async function writeCartLines(lines: MockCartLine[]): Promise<void> {
  (await cookies()).set(MOCK_CART_LINES_COOKIE, JSON.stringify(lines), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

function buildCartItem(line: MockCartLine, product: Product): CartItem {
  const unitPrice = parseFloat(product.priceRange.minVariantPrice.amount);
  const total = (unitPrice * line.quantity).toFixed(2);

  return {
    id: line.itemId,
    quantity: line.quantity,
    cost: {
      totalAmount: {
        amount: total,
        currencyCode: product.currencyCode,
      },
    },
    merchandise: {
      id: line.productId,
      title: product.title,
      selectedOptions: product.variants[0]?.selectedOptions || [],
      product,
    },
  };
}

function buildCart(cartId: string, lines: MockCartLine[]): Cart {
  const cartItems: CartItem[] = [];
  let subtotal = 0;

  for (const line of lines) {
    const product = mockGetProductById(line.productId);
    if (!product) continue;
    cartItems.push(buildCartItem(line, product));
    subtotal += parseFloat(product.priceRange.minVariantPrice.amount) * line.quantity;
  }

  const subtotalStr = subtotal.toFixed(2);
  const tax = (subtotal * 0.08).toFixed(2);
  const total = (subtotal + parseFloat(tax)).toFixed(2);

  return {
    id: cartId,
    checkoutUrl: "/checkout/information",
    cost: {
      subtotalAmount: { amount: subtotalStr, currencyCode: "USD" },
      totalAmount: { amount: total, currencyCode: "USD" },
      totalTaxAmount: { amount: tax, currencyCode: "USD" },
    },
    totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    lines: cartItems,
  };
}

function nextItemId(lines: MockCartLine[]): string {
  return `mock-line-${lines.length + 1}`;
}

export async function mockGetCollections(): Promise<Collection[]> {
  return getMockCollections();
}

export async function mockGetProduct(id: string): Promise<Product> {
  const product = mockGetProductById(id);
  if (!product) {
    throw new Error(`Mock product not found: ${id}`);
  }
  return product;
}

export async function mockSearchProducts(options: {
  query?: string;
  categoryId?: string;
  sortKey?: string;
  limit?: number;
}): Promise<Product[]> {
  return mockSearchAll(options);
}

export async function mockCreateCart(): Promise<Cart> {
  const cartId = `mock-cart-${Date.now()}`;
  await writeCartLines([]);
  return buildCart(cartId, []);
}

export async function mockGetCart(): Promise<Cart | undefined> {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) return undefined;
  const lines = await readCartLines();
  if (lines.length === 0) {
    return buildCart(cartId, []);
  }
  return buildCart(cartId, lines);
}

export async function mockAddToCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart | undefined> {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) return undefined;

  const existing = await readCartLines();

  for (const incoming of lines) {
    const found = existing.find((l) => l.productId === incoming.merchandiseId);
    if (found) {
      found.quantity += incoming.quantity;
    } else {
      existing.push({
        itemId: nextItemId(existing),
        productId: incoming.merchandiseId,
        quantity: incoming.quantity,
      });
    }
  }

  await writeCartLines(existing);
  return buildCart(cartId, existing);
}

export async function mockRemoveFromCart(lineIds: string[]): Promise<Cart | undefined> {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) return undefined;

  const existing = (await readCartLines()).filter((l) => !lineIds.includes(l.itemId));
  await writeCartLines(existing);
  return buildCart(cartId, existing);
}

export async function mockUpdateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart | undefined> {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) return undefined;

  let existing = await readCartLines();

  for (const update of lines) {
    existing = existing.filter((l) => l.itemId !== update.id);
    if (update.quantity > 0) {
      existing.push({
        itemId: update.id,
        productId: update.merchandiseId,
        quantity: update.quantity,
      });
    }
  }

  await writeCartLines(existing);
  return buildCart(cartId, existing);
}

export async function mockGetProductRecommendations(
  productId: string
): Promise<Product[]> {
  const product = await mockGetProduct(productId);
  if (!product.categoryId) return [];

  const products = await mockSearchProducts({
    categoryId: product.categoryId,
    limit: 11,
  });

  return products.filter((p) => p.id !== productId);
}
