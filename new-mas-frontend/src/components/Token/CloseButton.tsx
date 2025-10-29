import React from 'react'

type Props = {
    setSelectedToken: (token: null) => void;
}

const CloseButton = (props: Props) => {
    const { setSelectedToken } = props;
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => setSelectedToken(null)}
                className="bg-[#1a97a4] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#158a96] transition-colors"
              >
                Close
              </button>
            </div>
  )
}

export default CloseButton