'use client'
import { GameSession, GameSessionPlayer } from '@/payload-types'
import QRCode from 'react-qr-code'
import { FaCopy } from 'react-icons/fa'
import { createPlayerLink, getPlayerColorFromIndex } from '@/app/game-lib'
import { useContext, useState } from 'react'
import { type Player } from 'game-server/src/rooms/schema/GameRoomState'
import { GameStoreContext, GameState } from './game-state'

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

  const ctx = useContext(GameStoreContext)

  const { playersList } = ctx as GameState

  const player = playersList?.find((p) => p.sessionId == playerSession.id)

  return (
    <div className="card bg-neutral-800 w-80 shadow-sm my-4 max-w-70">
      <div className="card-body p-1">
        <div className="flex items-center gap-3">
          {player?.picture && player?.picture != 'unset' && (
            <div>
              <img
                className="rounded-full aspect-square block"
                width={50}
                height={50}
                src={player?.picture}
                alt={`Player ${playerSession.index}`}
              />
            </div>
          )}
          <div>
            <div className="card-title">
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
                <div className="text-sm">Player {player?.name ?? `${color.name}`}</div>
              </div>
              <div className="badge badge-secondary">{player?.ready ? 'Ready' : 'Joining...'}</div>
            </div>
            <p>Scan the QR Below to Join the game</p>
          </div>
        </div>
        {/* <div className="card-actions justify-end">
          <div className="badge badge-outline">Fashion</div>
          <div className="badge badge-outline">Products</div>
        </div> */}
      </div>
      <figure>
        <QRCode
          size={128}
          fgColor={color.hex}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          value={playerLink}
          viewBox={`0 0 256 256`}
        />
      </figure>
    </div>
  )
}
