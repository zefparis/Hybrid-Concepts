import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-ia-solution-blue text-white rounded-full shadow-lg hover:bg-blue-700 relative"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-ia-solution-red text-white text-xs rounded-full flex items-center justify-center">
          3
        </span>
      </Button>
    </div>
  );
}
