import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export const alt = 'A Pretty Girl Matter';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c17c82',
          fontFamily: 'serif',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>A Pretty Girl Matter</div>
        <div style={{ fontSize: '32px', color: '#666' }}>Professional Permanent Makeup</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
