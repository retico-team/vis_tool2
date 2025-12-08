import type { HTMLAttributes } from "react";

type EdgeType = 'previous' | 'processed' | 'grounded';

interface DefaultCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> {
    onToggle?: (id: string) => void;
}

interface DefaultButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
    title: string;
    isLoading: boolean;
    setLoading: (value: boolean) => void;
    onClick?: (id: string) => void;
}