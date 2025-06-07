import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, FileSpreadsheet, File } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { Document } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export function DocumentsWidget() {
  const { t, i18n } = useTranslation();
  
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
    return File;
  };

  const getFileIconColor = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'text-red-600 bg-red-100';
    if (mimeType.includes('word')) return 'text-blue-600 bg-blue-100';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-green-600 bg-green-100';
    return 'text-purple-600 bg-purple-100';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentDocuments")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const locale = i18n.language === 'fr' ? fr : enUS;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-ia-solution-dark">
            {t("recentDocuments")}
          </CardTitle>
          <Button className="bg-ia-solution-blue hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t("addDocument")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {documents?.slice(0, 4).map((document) => {
            const Icon = getFileIcon(document.mimeType);
            const iconColor = getFileIconColor(document.mimeType);
            
            return (
              <div
                key={document.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ia-solution-dark truncate">
                      {document.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(document.fileSize)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {t("addedAgo")} {formatDistanceToNow(new Date(document.createdAt), { 
                    addSuffix: true, 
                    locale 
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {t("by")} {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
