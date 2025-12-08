type EdgeType = 'previous' | 'grounded';

interface DefaultCardProps {
    onToggle?: (id: string) => void;
}

interface DefaultButtonProps {
    title: string;
    isLoading: boolean;
    setLoading: (value: boolean) => void;
    onClick?: (id: string) => void;
}