import { STLTemplate, TemplateElement } from '../types/template';

export class TemplateParser {
    static async parseSTLFile(file: File, isDemo: boolean = false): Promise<STLTemplate> {
        const content = await this.readFileContent(file);
        let elements = this.identifyTemplateElements(content);

        // Only use default elements for demo or if no elements found
        if (isDemo || elements.length === 0) {
            elements = this.getDefaultElements();
        }

        console.log('Parsed elements:', elements); // Debug log
        console.log('Element types:', elements.map(e => e.type)); // Debug log

        return {
            elements,
            rawSTL: content
        };
    }

    private static identifyTemplateElements(content: string): TemplateElement[] {
        const elements: TemplateElement[] = [];
        const lines = content.split('\n');

        // Find potential customizable elements
        for (const line of lines) {
            const trimmedLine = line.trim();

            // Only parse lines that start with # TEMPLATE_ exactly
            if (trimmedLine.startsWith('# TEMPLATE_')) {
                // Use a more strict regex that only matches our template format
                const match = trimmedLine.match(/^# TEMPLATE_(COLOR|TEXT)_([a-zA-Z_]+)\s+(.+)$/);
                if (match) {
                    const [, type, id, value] = match;
                    if (!id.includes('walls')) { // Extra safety check
                        elements.push(this.createTemplateElement(type, id, value));
                    }
                }
            }
        }

        return elements;
    }

    private static isValidColor(color: string): boolean {
        return color.match(/^#[0-9A-F]{6}$/i) !== null ||
            color.match(/^#[0-9A-F]{3}$/i) !== null ||
            CSS.supports('color', color);
    }

    private static createTemplateElement(type: string, id: string, value: string): TemplateElement {
        const element = {
            type: type.toLowerCase() as 'text' | 'color',
            id: id.toLowerCase(),
            label: id.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
            defaultValue: type.toUpperCase() === 'COLOR' && !value.startsWith('#') ?
                '#' + value : value.trim()
        };
        console.log('Created element:', element); // Debug log
        return element;
    }

    private static getDefaultElements(): TemplateElement[] {
        return [
            {
                type: 'color' as const,
                id: 'nameplate_background',
                label: 'Background Color',
                defaultValue: '#FFA500'
            },
            {
                type: 'color' as const,
                id: 'nameplate_frame',
                label: 'Frame Color',
                defaultValue: '#333333'
            },
            {
                type: 'text' as const,
                id: 'nameplate_label',
                label: 'Text',
                defaultValue: 'BADGER'
            }
        ];
    }

    private static async readFileContent(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            if (file.name.toLowerCase().endsWith('.stl')) {
                reader.onload = (e) => {
                    try {
                        // Check if it's binary (solid not at start)
                        const content = e.target?.result;
                        if (content instanceof ArrayBuffer) {
                            // It's binary
                            const view = new Uint8Array(content);
                            let str = '';
                            for (let i = 0; i < view.length; i++) {
                                str += String.fromCharCode(view[i]);
                            }
                            resolve(str);
                        } else {
                            // It's ASCII
                            resolve(content as string);
                        }
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                reject(new Error('Not an STL file'));
            }
        });
    }
} 