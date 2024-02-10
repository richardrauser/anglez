'use client';
import { useEffect, useState } from 'react';
import styles from './ArtBoard.module.css';

import { buildRandomPlanes, buildPlanes, generateRandomArtDataUri } from '../../src/planes';
import { Button } from '@mantine/core';

export function ArtBoard() {
  const [svg, setSvg] = useState(null);

  useEffect(() => {
    const initialArt = generateRandomArtDataUri();
    console.log('Initial art: ' + initialArt);
    setSvg(initialArt);
  }, []);

  const updateArtBoard = () => {
    const randomCeiling = 5_000_000;
    const seed = Math.trunc(Math.random() * randomCeiling);
    console.log('Regerating with seed: ' + seed);
    const initialArt = generateRandomArtDataUri();
    console.log('Initial art: ' + initialArt);
    setSvg(initialArt);
  };

  return (
    <div>
      <div className={styles.artboard}>
        <img className={styles.artboardImage} src={svg}></img>
        <Button onClick={updateArtBoard}>Regenerate</Button>
      </div>
    </div>
  );
}
