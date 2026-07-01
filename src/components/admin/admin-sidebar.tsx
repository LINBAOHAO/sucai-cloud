"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FileText, FolderTree, LayoutDashboard, MessageSquareQuote, Package, Settings, ShoppingCart, Tag, Truck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquareQuote },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/ai", label: "AI Agent", icon: Bot },
  { href: "/admin/ai/orders", label: "AI Orders", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          SC
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">速采云 Admin</p>
          <p className="text-xs text-slate-500">管理后台</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/"
          className="text-xs text-slate-500 transition-colors hover:text-blue-600"
        >
          ← 返回前台网站
        </Link>
      </div>
    </aside>
  );
}
