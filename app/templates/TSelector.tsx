import { TEMPLATES } from "./index";

export default function TSelector({
  currentTemplate,
  onSelect,
}: {
  currentTemplate: string;
  onSelect: (templateId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(TEMPLATES).map(([id, template]) => (
        <button
          key={id}
          className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
            currentTemplate === id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onSelect(id)}
        >
          <img
            src={template.thumbnail || "https://placehold.co/600x400"}
            alt={template.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-medium">{template.name}</h3>
            <button
              className="mt-2 text-sm text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(id);
              }}
            >
              {currentTemplate === id ? "Selected" : "Select Template"}
            </button>
          </div>
        </button>
      ))}
    </div>
  );
}
