import { GameSession, GameSessionPlayer } from '@/payload-types'
import QRCode from 'react-qr-code'
import { FaCopy } from 'react-icons/fa'
import { createPlayerLink, getPlayerColorFromIndex } from '@/app/game-lib'
import { useState } from 'react'

export interface JoinCardProps extends React.PropsWithChildren {
  playerSession: GameSessionPlayer
}
export const JoinCard: React.FC<JoinCardProps> = ({ playerSession }: JoinCardProps) => {
  const [contentCopied, setContentCopied] = useState(false)

  const color = getPlayerColorFromIndex(playerSession.index)
  const playerLink = createPlayerLink((playerSession.session as GameSession)?.id, playerSession.id)

  async function setClipboard(text: string) {
    const type = 'text/plain'
    const clipboardItemData = {
      [type]: text,
    }
    const clipboardItem = new ClipboardItem(clipboardItemData)
    await navigator.clipboard.write([clipboardItem])
  }

  return (
    <div className="card bg-base-100 w-80 shadow-sm my-4">
      <figure>
        <QRCode
          size={256}
          fgColor={color.hex}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          value={playerLink}
          viewBox={`0 0 256 256`}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          <div className="flex gap-2 items-center">
            <div className="tooltip">
              <div className="tooltip-content">
                {contentCopied && <div>Copied!</div>}
                {!contentCopied && <div>Copy Link</div>}
              </div>
              <button
                className="cursor-pointer"
                onClick={() => {
                  setClipboard(playerLink)
                  setContentCopied(true)
                  setTimeout(() => {
                    setContentCopied(false)
                  }, 5000)
                }}
              >
                {!contentCopied && <span className="sr-only">Copy Link</span>}

                <FaCopy />
              </button>
            </div>
            <div>Player {color.name}</div>
          </div>
          <div className="badge badge-secondary">
            {playerSession.ready ? 'Ready' : 'Joining...'}
          </div>
        </h2>
        <p>Scan the QR Above to Join the game</p>
        {/* <div className="card-actions justify-end">
          <div className="badge badge-outline">Fashion</div>
          <div className="badge badge-outline">Products</div>
        </div> */}
      </div>
    </div>
  )
}
