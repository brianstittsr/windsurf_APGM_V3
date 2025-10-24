export default function Home() {
  return (
    <div>
      <h1>Redirecting to Permanent Makeup Website...</h1>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/permanent-makeup-website';`,
        }}
      />
    </div>
  );
}
