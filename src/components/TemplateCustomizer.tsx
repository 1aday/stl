import React, { useState, useEffect } from 'react';
import { STLTemplate, CustomizationValues } from '../types/template';
import { TemplateParser } from '../services/TemplateParser';
import { STLViewer } from './STLViewer';
import { CustomizationForm } from './CustomizationForm';
import { getDemoSTL } from '../services/DemoSTL';

export const TemplateCustomizer: React.FC = () => {
    const [template, setTemplate] = useState<STLTemplate | null>(null);
    const [customization, setCustomization] = useState<CustomizationValues>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load demo STL on component mount
    useEffect(() => {
        loadDemoSTL();
    }, []);

    const loadDemoSTL = async () => {
        try {
            setLoading(true);
            setError(null);
            const demoFile = getDemoSTL();
            const parsedTemplate = await TemplateParser.parseSTLFile(demoFile, true);
            console.log('Parsed template:', parsedTemplate);

            const initialValues: CustomizationValues = {};
            parsedTemplate.elements.forEach(element => {
                if (element.defaultValue) {
                    initialValues[element.id] = element.defaultValue;
                }
            });
            setCustomization(initialValues);
            setTemplate(parsedTemplate);
        } catch (err) {
            setError('Failed to load demo STL');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.stl')) {
            setError('Please upload a valid STL file');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const parsedTemplate = await TemplateParser.parseSTLFile(file);

            // Set initial customization values from template defaults
            const initialValues: CustomizationValues = {};
            parsedTemplate.elements.forEach(element => {
                if (element.defaultValue) {
                    initialValues[element.id] = element.defaultValue;
                }
            });
            setCustomization(initialValues);
            setTemplate(parsedTemplate);
        } catch (err) {
            setError('Failed to parse STL file');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!template) return;

        // Create a new STL string with updated values
        let updatedSTL = template.rawSTL;

        // Replace template values with customization values
        Object.entries(customization).forEach(([key, value]) => {
            const searchText = new RegExp(`# TEMPLATE_\\w+_${key}.*`, 'g');
            const replacement = `# TEMPLATE_${key.toUpperCase()}_${key} ${value}`;
            updatedSTL = updatedSTL.replace(searchText, replacement);
        });

        // Create and download the file
        const blob = new Blob([updatedSTL], { type: 'model/stl' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customized.stl';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="template-customizer">
            <div className="upload-section mb-8">
                <div className="flex gap-4 items-center">
                    <input
                        type="file"
                        accept=".stl"
                        onChange={handleFileUpload}
                        disabled={loading}
                        className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
                    />
                    <button
                        onClick={loadDemoSTL}
                        className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Load Demo STL
                    </button>
                </div>
                {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>

            {loading && (
                <div className="text-center py-8">Loading STL file...</div>
            )}

            {template && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="order-2 md:order-1">
                        <CustomizationForm
                            elements={template.elements}
                            values={customization}
                            onChange={setCustomization}
                        />
                        <button
                            onClick={handleExport}
                            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Export STL
                        </button>
                    </div>
                    <div className="order-1 md:order-2">
                        <STLViewer
                            stlData={template.rawSTL}
                            customization={customization}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}; 