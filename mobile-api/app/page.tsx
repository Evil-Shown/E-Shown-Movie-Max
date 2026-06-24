export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: 40 }}>
      <h1>Chithra Cinema — mobile-api</h1>
      <p>This is an API-only backend for the Chithra Cinema mobile app.</p>
      <p>Available routes:</p>
      <ul>
        <li>GET /api/home</li>
        <li>GET /api/browse</li>
        <li>GET /api/search</li>
        <li>GET /api/movie/[id]</li>
        <li>GET /api/movie/[id]/similar</li>
        <li>GET /api/tv/[id]/seasons</li>
      </ul>
    </main>
  );
}
