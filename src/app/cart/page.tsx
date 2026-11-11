import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CartView } from "@/components/CartView";
import { isDemoMode } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your cart" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const {
    data: { user },
  } = isDemoMode ? { data: { user: null } } : await (await createSessionClient()).auth.getUser();
  if (!isDemoMode && !user) redirect("/account/login?next=/cart");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-4xl font-bold">Your cart</h1>
      <CartView
        accountEmail={user?.email ?? ""}
        accountName={typeof user?.user_metadata.full_name === "string" ? user.user_metadata.full_name : ""}
      />
    </div>
  );
}
