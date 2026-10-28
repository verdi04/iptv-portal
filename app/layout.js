export const metadata = {
  title: 'IPTV Portal',
  description: 'IPTV Management Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
