import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";

export function TopNav() {
  const count = useCart((s) => s.items.length);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-background/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-border">
      <Link to="/" className="font-display text-2xl tracking-tighter italic">
        LUCKYDROP
      </Link>
      <Link
        to="/cart"
        className="relative bg-foreground text-background size-10 rounded-full flex items-center justify-center font-bold text-sm"
      >
        {count}
        {count > 0 && (
          <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full border-2 border-background" />
        )}
      </Link>
    </nav>
  );
}
