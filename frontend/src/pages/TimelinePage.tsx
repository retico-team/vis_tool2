import Timeline from '@/components/Timeline';
import RecordButton from '@/components/RecordButton';

function TimelinePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
        <div className="bg-white rounded-t-lg shadow px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Timeline</h2>
            <RecordButton 
            id="main-recorder"
            onToggle={(id: string, isRecording: boolean) => {
                console.log(`Recorder ${id} is now ${isRecording ? 'recording' : 'stopped'}`);
            }}
            />
        </div>
        <div className="flex-1 bg-white rounded-b-lg shadow overflow-hidden">
            <Timeline />
        </div>
    </div>
  )};

export default TimelinePage