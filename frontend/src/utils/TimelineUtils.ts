import type { TimelineEdge, EdgeType } from "@/types/allTypes";

const getModuleColor = (module: string, type: EdgeType): string => {
    const hashString = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    };

    let hash = hashString(module);

    // Additional mixing step for better distribution
    hash = hash ^ (hash >>> 16);
    hash = Math.imul(hash, 2654435761); // Knuth's multiplicative hash
    hash = hash ^ (hash >>> 16);

    // Golden ratio conjugate for better color distribution
    const goldenRatio = 1.61803398875;
    const hue = ((Math.abs(hash) * goldenRatio) % 1) * 360;

    const typeMap: Record<string, { s: number; l: number }> = {
        previous: { s: 72, l: 50 },
        grounded: { s: 62, l: 46 },
    };

    const { s: saturation, l: lightness } = typeMap[type] ?? typeMap.previous;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const scaleIU = (isPrevious: boolean, edge: TimelineEdge): number => {
    if (isPrevious && edge.age < 0.001) {
        return edge.age * 10000;
    }
    else if (isPrevious && edge.age < 0.1) {
        return edge.age * 1000;
    }
    return edge.age;
};

export { getModuleColor, scaleIU };