export const metadata = {
  title: 'A Pretty Girl Matter - Permanent Makeup',
  description: 'Professional permanent makeup services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
