export interface TemplateElement {
    type: 'text' | 'color';
    id: string;
    label: string;
    defaultValue: string;
}

export interface STLTemplate {
    elements: TemplateElement[];
    rawSTL: string;
}

export interface CustomizationValues {
    [key: string]: string;
} 