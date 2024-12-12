'use client';

import React from 'react';
import { TemplateCustomizer } from '../components/TemplateCustomizer';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">STL Template Customizer</h1>
        <TemplateCustomizer />
      </div>
    </main>
  );
}
