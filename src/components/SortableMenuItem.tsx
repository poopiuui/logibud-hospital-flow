import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface SortableMenuItemProps {
  id: string;
  title: string;
  visible: boolean;
  onVisibilityToggle: () => void;
}

export function SortableMenuItem({ id, title, visible, onVisibilityToggle }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border rounded-lg bg-card"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <Checkbox 
        checked={visible}
        onCheckedChange={onVisibilityToggle}
      />
      <span className={`flex-1 ${!visible ? 'text-muted-foreground line-through' : ''}`}>
        {title}
      </span>
    </div>
  );
}
