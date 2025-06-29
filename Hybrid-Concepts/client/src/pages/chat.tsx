import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Chat() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={t("chat")} />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("chat")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">{t("chatPageInDevelopment", "Chat page under development...")}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
