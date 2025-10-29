"use client"

import { useState } from 'react'

interface WebRTCDebuggerProps {
  webRTCStatus: string
  socketConnected: boolean
  participants: any[]
  testConnectivity: () => Promise<void>
  getConnectionStats: () => Promise<any>
}

export const WebRTCDebugger = ({ 
  webRTCStatus, 
  socketConnected, 
  participants, 
  testConnectivity, 
  getConnectionStats 
}: WebRTCDebuggerProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [connectionStats, setConnectionStats] = useState<any>(null)

  const handleGetStats = async () => {
    const stats = await getConnectionStats()
    setConnectionStats(stats)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">WebRTC Debug</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs bg-blue-600 px-2 py-1 rounded"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>
      
      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Socket: {socketConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${participants.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span>Participants: {participants.length}</span>
        </div>
        <div className="text-xs text-gray-300">
          Status: {webRTCStatus}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={testConnectivity}
              className="text-xs bg-green-600 px-2 py-1 rounded hover:bg-green-700"
            >
              Test Connectivity
            </button>
            <button
              onClick={handleGetStats}
              className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
            >
              Get Stats
            </button>
          </div>
          
          {connectionStats && (
            <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
              <h4 className="font-bold mb-1">Connection Stats:</h4>
              <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                {JSON.stringify(connectionStats, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-xs text-gray-400">
            <p><strong>Tips for cross-network issues:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Check if both users can see each other's video</li>
              <li>Try refreshing the page if connection fails</li>
              <li>Check browser console for detailed logs</li>
              <li>Ensure both users have stable internet</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
