import Network from '@/components/Network';

function NetworkPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
        <div className="bg-white rounded-t-lg shadow px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-800">Network</h2>
        </div>
        <div className="flex-1 bg-white rounded-b-lg shadow overflow-hidden">
            <Network />
        </div>
    </div>
  )
}

export default NetworkPage