'use client';
import { useEffect, useState } from 'react';
import styles from './ArtBoard.module.css';
import { Text, Radio, RadioGroup, Stack, Slider } from '@mantine/core';

import { generatePlanes, randomIntFromInterval } from '../../src/planes';
import { Button } from '@mantine/core';

export function ArtBoard() {
  const [svg, setSvg] = useState(null);
  const [randomSeed, setRandomSeed] = useState(100);
  const [custom, setCustom] = useState(true);
  const [style, setStyle] = useState('linear');
  const [zoom, setZoom] = useState(75);

  const generatePlanesDataUri = () => {
    if (!custom) {
      // const randomSeed = Math.trunc(Math.random() * 5_000_000);
      console.log('Generating random...');
      const randomZoom = randomIntFromInterval(randomSeed, 90, 100);

      const red = randomIntFromInterval(randomSeed, 0, 255);
      const green = randomIntFromInterval(randomSeed, 0, 255);
      const blue = randomIntFromInterval(randomSeed, 0, 255);
      const alpha = '0.' + randomIntFromInterval(randomSeed, 10, 90);
      const randomTintColour = { r: red, g: green, b: blue, a: alpha };

      const polyRepeatChance = randomIntFromInterval(randomSeed + 400, 0, 100);
      const randomStyle = polyRepeatChance > 80 ? 'cycle' : 'linear';

      const svgString = encodeURIComponent(
        generatePlanes(randomSeed, randomZoom, randomTintColour, randomStyle)
      );
      return `data:image/svg+xml,${svgString}`;
    } else {
      console.log('Generating custom...');
      const red = randomIntFromInterval(randomSeed, 0, 255);
      const green = randomIntFromInterval(randomSeed, 0, 255);
      const blue = randomIntFromInterval(randomSeed, 0, 255);
      const alpha = '0.' + randomIntFromInterval(randomSeed, 10, 90);
      const randomTintColour = { r: red, g: green, b: blue, a: alpha };

      const svgString = generatePlanes(randomSeed, 150 - zoom, randomTintColour, style);
      console.log('SVG STRING: ' + svgString);
      const encodedSvgString = encodeURIComponent(svgString);
      return `data:image/svg+xml,${encodedSvgString}`;
    }
  };

  const updateZoom = (newZoom) => {
    console.log('New zoom: ' + newZoom);
    setZoom(newZoom);
    //   const newPlanes = generatePlanesDataUri();
    //   setSvg(newPlanes);
  };

  useEffect(() => {
    const svg = generatePlanesDataUri();
    setSvg(svg);
  }, [randomSeed, zoom, style, custom]);

  const generateNewSeed = () => {
    setRandomSeed(Math.trunc(Math.random() * 5_000_000));
  };

  return (
    <div>
      <div className={styles.artboard}>
        <img className={styles.artboardImage} src={svg}></img>
        <div>Random seed: {randomSeed}</div>
        <Button onClick={generateNewSeed}>Regenerate</Button>
        <Stack>
          <Text ta="left" size="m">
            Style
          </Text>
          <RadioGroup value={style} onChange={setStyle} name="style">
            {' '}
            <Radio value="linear" label="linear" />
            <Radio value="cycle" label="cyclic" />
            {/* <Radio checked variant="outline" onChange={() => {}} label="Outline checked radio" />
          <Radio disabled label="Disabled radio" />
          <Radio disabled checked onChange={() => {}} label="Disabled checked radio" /> */}
          </RadioGroup>
          <Text ta="left" size="m">
            Zoom
          </Text>
          <Slider
            name="Zoom"
            value={zoom}
            onChange={updateZoom}
            color="blue"
            min={50}
            max={100}
            marks={[
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '100%' },
            ]}
          />
        </Stack>
      </div>
    </div>
  );
}
