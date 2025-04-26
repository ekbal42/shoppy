import Astra from "./defaults/Astra";

export type TemplateComponent = React.FC<{
  shop: any;
  colorScheme?: string;
}>;

export { Astra };

export const TEMPLATES = {
  astra: {
    name: "Astra",
    component: Astra,
    thumbnail: null,
  },
} as const;
export type TemplateId = keyof typeof TEMPLATES;
