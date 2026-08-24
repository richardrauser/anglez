import { Suspense } from 'react';
import { ArtBoard } from '@/components/ArtBoard/ArtBoard';

export default function CreatePage() {
  return (
    <Suspense>
      <ArtBoard />
    </Suspense>
  );
}
