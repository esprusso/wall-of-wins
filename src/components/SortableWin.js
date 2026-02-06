
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StickyNote from './StickyNote';

export default function SortableWin({ win, onToggleStar, onDelete, onUpdate }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: win.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        touchAction: 'none' // Crucial for touch dragging
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <StickyNote
                win={win}
                onToggleStar={onToggleStar}
                onDelete={onDelete}
                onUpdate={onUpdate}
            // Pass a prop to StickyNote to maybe show a drag handle icon if needed, 
            // OR just make the whole note draggable (as we did with attributes/listeners on the wrapper)
            />
        </div>
    );
}
