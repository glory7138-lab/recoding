import './globals.css';

export const metadata = {
  title: 'NativeBOX AI - 동영상 AI 문장 자동 분할 & 어학 플레이어',
  description: 'AI 기반 동영상/음성 자동 문장 끊기 및 NativeBOX 자막 동기화 어학 학습 웹 프로그램',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
