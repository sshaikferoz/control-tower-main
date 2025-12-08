'use client';

export default function FontStyle() {
    return (
        <style jsx global>{`
      /* Custom Manifa2 Font */
      @font-face {
        font-family: 'Manifa2';
        src: url(${process.env.NEXT_PUBLIC_BSP_NAME}/fonts/ManifaV2-SemiBold.ttf)
          format('truetype');
        font-weight: 600;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Manifa2';
        src: url(${process.env.NEXT_PUBLIC_BSP_NAME}/fonts/ManifaV2-Bold.ttf)
          format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
    `}</style>
    );
}
