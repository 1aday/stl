import React from 'react';
import { TemplateElement, CustomizationValues } from '../types/template';

interface CustomizationFormProps {
    elements: TemplateElement[];
    values: CustomizationValues;
    onChange: (values: CustomizationValues) => void;
}

export const CustomizationForm: React.FC<CustomizationFormProps> = ({
    elements,
    values,
    onChange,
}) => {
    console.log('CustomizationForm render:', { elements, values });

    const handleInputChange = (id: string, value: string) => {
        const newValues = {
            ...values,
            [id]: value,
        };
        console.log('Input change:', { id, value, newValues });
        onChange(newValues);
    };

    const renderInput = (element: TemplateElement) => {
        console.log('Rendering element:', {
            type: element.type,
            isColor: element.type.toLowerCase() === 'color',
            element
        });

        if (element.type.toLowerCase() === 'color') {
            return (
                <input
                    type="color"
                    value={values[element.id] || element.defaultValue}
                    onChange={(e) => handleInputChange(element.id, e.target.value)}
                    className="w-full h-10"
                />
            );
        }

        return (
            <input
                type="text"
                value={values[element.id] || element.defaultValue}
                onChange={(e) => handleInputChange(element.id, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder={element.defaultValue}
            />
        );
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-4">Customize Template</h2>
            {elements.map((element) => (
                <div key={element.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {element.label}
                    </label>
                    {renderInput(element)}
                </div>
            ))}
        </div>
    );
}; 