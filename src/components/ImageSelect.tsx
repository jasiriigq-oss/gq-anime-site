import { playerIconOptions } from '@/app/game-lib'
import { useRef, useState } from 'react'
import { FaCheck } from 'react-icons/fa'

export interface ImageSelectProps extends React.PropsWithChildren {
  itemName: string
  onIndexSet?: (index: number) => void
}
export const ImageSelect: React.FC<ImageSelectProps> = ({
  itemName,
  onIndexSet,
}: ImageSelectProps) => {
  const [selectIndex, setSelectIndex] = useState(0)

  function updateSelection(index: number) {
    onIndexSet?.call(null, index)
    setSelectIndex(index)
  }

  return (
    <>
      <div className="w-full flex gap-3 justify-center flex-wrap">
        {playerIconOptions.map((o, i) => {
          return (
            <div className="relative" key={i}>
              <button
                onClick={() => updateSelection(i)}
                type="button"
                key={i}
                className="cursor-pointer"
                title={`Select Icon ${i} `}
              >
                <img width={50} src={o.image} alt={`Icon ${i}`} />
              </button>
              {selectIndex == i && (
                <div>
                  <div className="flex justify-center items-center w-full h-full absolute top-0 left-0 bg-[rgba(0,0,0,0.5)]">
                    <FaCheck fill="white" size={30} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
