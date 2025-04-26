import { TEMPLATES, TemplateId } from "./index";

interface Props {
  templateId: TemplateId;
  shop: any;
  colorScheme?: string;
}

export default function Renderer({ templateId, shop, colorScheme }: Props) {
  const template = TEMPLATES[templateId];

  if (!template) {
    return <div>Template not found!</div>;
  }

  const Template = template.component;
  return <Template shop={shop} colorScheme={colorScheme} />;
}
