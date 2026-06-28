import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("nav");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-gradient mb-4 text-6xl font-bold">404</h1>
      <p className="mb-8 text-lg text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link href="/">{t("home")}</Link>
      </Button>
    </div>
  );
}
