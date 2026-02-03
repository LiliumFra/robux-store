import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'RobuxStore'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#09090b',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 20 }}>Refills safe & fast</div>
        <div style={{ fontWeight: 'bold' }}>RobuxStore</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
