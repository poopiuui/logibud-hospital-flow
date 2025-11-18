import { ReactNode, useRef, useState, TouchEvent } from "react";
import { TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableTableRowProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const SwipeableTableRow = ({ children, onEdit, onDelete, className }: SwipeableTableRowProps) => {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = swipeX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const newSwipeX = Math.max(-160, Math.min(0, currentXRef.current + deltaX));
    setSwipeX(newSwipeX);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (swipeX < -80) {
      setSwipeX(-160);
    } else {
      setSwipeX(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 px-4 bg-destructive/10"
        style={{ width: "160px" }}
      >
        {onEdit && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => {
              setSwipeX(0);
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => {
              setSwipeX(0);
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <TableRow
        className={cn("transition-transform touch-pan-y", className)}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </TableRow>
    </div>
  );
};
