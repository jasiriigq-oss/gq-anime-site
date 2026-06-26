'use client'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

export interface DefaultHeroProps extends React.PropsWithChildren {}
export const DefaultHero: React.FC<DefaultHeroProps> = ({}: DefaultHeroProps) => {
  const selfRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: selfRef,
    /*
    When the top of the target meets the bottom of the container
    to when the bottom of the target meets the top of the container
  */
    offset: ['start center', 'end end'],
  })
  const { opacity } = useTransform(
    scrollYProgress,
    [0, 1],
    {
      opacity: [0.0, 1],
    },
    { clamp: false },
  )

  return (
    <motion.div
      ref={selfRef}
      id="scroll-indicator"
      initial={{ opacity: 0 }}
      className="hero min-h-screen "
      style={{
        opacity,
        backgroundImage:
          'url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)',
      }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
          <p className="mb-5">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi
            exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.
          </p>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </div>
    </motion.div>
  )
}
