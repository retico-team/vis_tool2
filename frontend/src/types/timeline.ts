import { DefaultButton } from '@/types/general'

export interface RecordButtonProps extends Omit<DefaultButton, 'onClick'> {
    isRecording?: boolean;
    setRecording?: (value: boolean) => void;
    onClick?: (id: string, isRecording: boolean) => void;
}