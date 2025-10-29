import Image from 'next/image'
import React from 'react'

type Props = {}
const imgStar24 = "/b4a13f5311dc65797e13a46db579b15c16f53006.svg"
const Background = (props: Props) => {
  return (
    <div>
        <div className="absolute flex h-[0px] items-center justify-center translate-x-[-50%] translate-y-[-50%] w-[0px]"
              style={{ top: "40%", left: "50%" }}>
              <div className="flex-none rotate-[270deg]">
                <div className="relative size-[429.992px]">
                  <div className="absolute inset-[-8.68%_-7.43%]">
                    <img alt="" className="block max-w-none size-full" src={imgStar24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Central Token Visual - Positioned in the middle of the star */}
            <div className="absolute flex items-center justify-center"
              style={{ top: "35%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <Image src="/tokens_icon_labelled.svg" alt="Token Visual" width={188} height={188} />
            </div>
    </div>
  )
}

export default Background