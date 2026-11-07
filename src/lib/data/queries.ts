import "server-only";
import { addDays } from "@/lib/domain/dates";
import { USE_SOON_DAYS, type Category, type Storage } from "@/lib/domain/constants";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import type { Viewer } from "./session";

const PRODUCT_COLUMNS =
  "id, name, quantity, unit, category, storage, purchased_on, expires_on, price_cents, notes, is_demo" as const;
export type Product = Pick<Tables<"products">, "id" | "name" | "quantity" | "unit" | "category" | "storage" | "purchased_on" | "expires_on" | "price_cents" | "notes" | "is_demo">;

const SHOPPING_COLUMNS =
  "id, name, quantity, unit, category, note, source, source_recipe, purchased_at, is_demo, created_at" as const;
export type ShoppingItem = Pick<Tables<"shopping_items">, "id" | "name" | "quantity" | "unit" | "category" | "note" | "source" | "source_recipe" | "purchased_at" | "is_demo" | "created_at">;

const WASTE_COLUMNS =
  "id, product_name, category, quantity, unit, reason, discarded_on, cost_cents, is_demo" as const;
export type WasteRecord = Pick<Tables<"waste_records">, "id" | "product_name" | "category" | "quantity" | "unit" | "reason" | "discarded_on" | "cost_cents" | "is_demo">;

export type StatusFilter = "all" | "fresh" | "soon" | "expired";
export type SortKey = "expiry" | "name" | "category" | "recent";

export type InventoryQuery = {
  q?: string;
  category?: Category;
  storage?: Storage;
  status?: StatusFilter;
  sort?: SortKey;
};

function fail(what: string, error: { message: string } | null): never {
  throw new Error(`Could not load ${what}.`, { cause: error });
}

/** Escape LIKE wildcards so user input is matched literally. */
function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function listProducts(viewer: Viewer, query: InventoryQuery = {}): Promise<Product[]> {
  const supabase = await createClient();
  let request = supabase.from("products").select(PRODUCT_COLUMNS).eq("household_id", viewer.householdId);

  if (query.q) request = request.ilike("name", likePattern(query.q));
  if (query.category) request = request.eq("category", query.category);
  if (query.storage) request = request.eq("storage", query.storage);

  const soonLimit = addDays(viewer.today, USE_SOON_DAYS);
  if (query.status === "expired") request = request.lt("expires_on", viewer.today);
  if (query.status === "soon") request = request.gte("expires_on", viewer.today).lte("expires_on", soonLimit);
  if (query.status === "fresh") request = request.gt("expires_on", soonLimit);

  switch (query.sort ?? "expiry") {
    case "name":
      request = request.order("name", { ascending: true });
      break;
    case "category":
      request = request.order("category", { ascending: true }).order("expires_on", { ascending: true });
      break;
    case "recent":
      request = request.order("created_at", { ascending: false });
      break;
    default:
      request = request.order("expires_on", { ascending: true }).order("name", { ascending: true });
  }

  const { data, error } = await request.limit(500);
  if (error) fail("your inventory", error);
  return data;
}

/** Items at or past their date within the use-soon window, most urgent first. */
export async function listAttentionProducts(viewer: Viewer): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("household_id", viewer.householdId)
    .lte("expires_on", addDays(viewer.today, USE_SOON_DAYS))
    .order("expires_on", { ascending: true })
    .order("name", { ascending: true });
  if (error) fail("expiring products", error);
  return data;
}

export async function getProduct(viewer: Viewer, id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("household_id", viewer.householdId)
    .eq("id", id)
    .maybeSingle();
  if (error) fail("this product", error);
  return data;
}

export async function listShoppingItems(viewer: Viewer): Promise<ShoppingItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shopping_items")
    .select(SHOPPING_COLUMNS)
    .eq("household_id", viewer.householdId)
    .order("purchased_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false });
  if (error) fail("your shopping list", error);
  return data;
}

export async function listWasteRecords(viewer: Viewer, sinceDays = 180): Promise<WasteRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("waste_records")
    .select(WASTE_COLUMNS)
    .eq("household_id", viewer.householdId)
    .gte("discarded_on", addDays(viewer.today, -sinceDays))
    .order("discarded_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) fail("your waste log", error);
  return data;
}

export async function hasDemoData(viewer: Viewer): Promise<boolean> {
  const supabase = await createClient();
  const checks = await Promise.all(
    (["products", "shopping_items", "waste_records"] as const).map((table) =>
      supabase.from(table).select("id", { count: "exact", head: true }).eq("household_id", viewer.householdId).eq("is_demo", true),
    ),
  );
  return checks.some((c) => (c.count ?? 0) > 0);
}

/** Badge counts for navigation: items needing attention and open shopping entries. */
export async function getNavCounts(viewer: Viewer): Promise<{ attention: number; shopping: number }> {
  const supabase = await createClient();
  const [attention, shopping] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("household_id", viewer.householdId)
      .lte("expires_on", addDays(viewer.today, USE_SOON_DAYS)),
    supabase
      .from("shopping_items")
      .select("id", { count: "exact", head: true })
      .eq("household_id", viewer.householdId)
      .is("purchased_at", null),
  ]);
  return { attention: attention.count ?? 0, shopping: shopping.count ?? 0 };
}
