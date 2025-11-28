// TODO add enum for different types

export const getModuleColor = (module: string, type: 'previous' | 'grounded' | 'processed' = 'previous'): string => {
    // Hash function to generate a consistent number from a string
    const hashString = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    };

    // Generate HSL color from hash
    const hash = hashString(module);
    const hue = hash % 360;
    
    // Adjust saturation and lightness based on edge type
    const saturation = type === 'previous' ? 70 : 60;
    const lightness = type === 'previous' ? 50 : 45;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const scaleIU = (isPrevious: boolean, edge) => {
    if (isPrevious && edge.age < 0.001) {
        return edge.age * 10000;
    }
    else if (isPrevious && edge.age < 0.1) {
        return edge.age * 1000;
    }
    return edge.age;
};