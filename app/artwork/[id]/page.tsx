import ArtworkView from './ArtworkView';

// Server component: `params` is a promise from Next 15 onwards, so resolve it here and
// hand the plain id to the client component that renders the artwork.
export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ArtworkView id={id} />;
}
