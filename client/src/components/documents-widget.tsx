import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { FileText, File, FileSpreadsheet, Plus } from "lucide-react";

export default function DocumentsWidget() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return FileSpreadsheet;
    return File;
  };

  const getFileIconColor = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'text-red-600 bg-red-100';
    if (mimeType.includes('word')) return 'text-blue-600 bg-blue-100';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-green-600 bg-green-100';
    return 'text-purple-600 bg-purple-100';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const recentDocuments = documents?.slice(0, 4) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-emulog-dark">
            Documents Récents
          </CardTitle>
          <Button size="sm" className="bg-emulog-blue hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDocuments.map((document: any) => {
              const FileIcon = getFileIcon(document.mimeType);
              const iconColors = getFileIconColor(document.mimeType);
              
              return (
                <div
                  key={document.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColors}`}>
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emulog-dark truncate">
                        {document.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(document.fileSize)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Ajouté {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Par {document.uploadedBy?.firstName} {document.uploadedBy?.lastName}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <File className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Aucun document trouvé</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter le premier document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
