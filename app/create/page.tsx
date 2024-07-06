import { ArtBoard } from '@/components/ArtBoard/ArtBoard';
import { Suspense } from 'react';

export default function CreatePage() {
  return (
    <Suspense>
      <ArtBoard />
    </Suspense>
  );
}
