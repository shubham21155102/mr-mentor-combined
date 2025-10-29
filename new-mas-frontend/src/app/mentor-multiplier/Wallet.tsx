import React from 'react'

interface WalletProps {
  multiplier: number;
}

const Wallet = (props: WalletProps) => {
    const { multiplier } = props;
  return (
    <div className="relative">
                <svg
                  width="240"
                  height="240"
                  viewBox="0 0 240 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Wallet base */}
                  <rect
                    x="60"
                    y="100"
                    width="120"
                    height="100"
                    rx="8"
                    fill="#C4956F"
                  />
                  <rect
                    x="60"
                    y="100"
                    width="120"
                    height="20"
                    rx="8"
                    fill="#8B6F47"
                  />

                  {/* Wallet details */}
                  <circle cx="150" cy="150" r="8" fill="#8B6F47" />
                  <path
                    d="M90 140 L110 160 L90 180"
                    stroke="#8B6F47"
                    strokeWidth="3"
                    fill="none"
                  />

                  {/* Multiplier circle */}
                  <circle cx="120" cy="70" r="50" fill="url(#gradient)" />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>

                  {/* Multiplier text */}
                  <text
                    x="120"
                    y="78"
                    textAnchor="middle"
                    fill="white"
                    fontSize="24"
                    fontWeight="bold"
                  >
                    {multiplier}x
                  </text>
                </svg>
              </div>
  )
}

export default Wallet