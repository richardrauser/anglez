'use client';
import { useEffect, useState } from 'react';
import styles from './ArtBoard.module.css';
import { Text, Radio, RadioGroup, Stack, Slider, SimpleGrid } from '@mantine/core';
import { build, randomIntFromInterval } from '../../src/planes';
import { Button, NumberInput, ColorPicker } from '@mantine/core';
import { getReadWriteContract } from '../../src/BlockchainAPI';
import { showErrorMessage } from '@/src/UIUtils';
import { handleError } from '@/src/ErrorHandler';
import { Type } from 'react-toastify/dist/utils';
import { toast } from 'react-toastify';

export function ArtBoard() {
  const [svg, setSvg] = useState('');
  const [randomSeed, setRandomSeed] = useState(100);
  const [custom, setCustom] = useState(false);
  const [zoom, setZoom] = useState(75);
  const [style, setStyle] = useState('linear');
  const [shapeCount, setShapeCount] = useState(5);
  // stored as rgb()
  const [tintColour, setTintColour] = useState('');

  const generatePlanesDataUri = () => {
    console.log('Generating planes...');
    const svgString = build(randomSeed, zoom, rgbToObj(tintColour), style, shapeCount);
    // console.log('SVG STRING: ' + svgString);
    const encodedSvgString = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encodedSvgString}`;
  };

  const randomize = () => {
    console.log('Generating random...');

    setRandomSeed(Math.trunc(Math.random() * 5_000_000));

    const randomZoom = randomIntFromInterval(randomSeed + 1, 90, 100);

    // const polyRepeatChance = randomIntFromInterval(randomSeed + 400, 0, 100);
    // const randomStyle = polyRepeatChance > 80 ? 'cycle' : 'linear';
    const randomShapeCount = randomIntFromInterval(randomSeed + 2, 5, 8);

    setZoom(randomIntFromInterval(randomSeed + 3, 50, 100));
    setStyle(randomIntFromInterval(randomSeed + 4, 0, 1) === 0 ? 'linear' : 'cycle');
    setShapeCount(randomIntFromInterval(randomSeed + 5, 5, 8));

    const red = randomIntFromInterval(randomSeed + 6, 0, 255);
    const green = randomIntFromInterval(randomSeed + 7, 0, 255);
    const blue = randomIntFromInterval(randomSeed + 8, 0, 255);
    const alpha = '0.' + randomIntFromInterval(randomSeed + 9, 10, 90);
    setTintColour(`rgba(${red}, ${green}, ${blue}, ${alpha})`);
  };

  useEffect(() => {
    randomize();
  }, []);

  useEffect(() => {
    const svg = generatePlanesDataUri();
    setSvg(svg);
  }, [randomSeed, zoom, style, custom, shapeCount, tintColour]);

  const generateNewSeed = () => {
    setRandomSeed(Math.trunc(Math.random() * 5_000_000));
  };

  const mintRandom = async () => {
    console.log('Minting random...');

    try {
      const contract = await getReadWriteContract();

      const mintTx = await contract.mintRandom(randomSeed);
      console.log('Mint tx: ' + mintTx.hash);
    } catch (error: any) {
      console.error('Minting error! ', error);
      handleError(error);
    }
  };

  const mintCustom = async () => {
    console.log('Minting custom...');

    try {
      const contract = await getReadWriteContract();
      //     function mintCustom(uint24 seed, uint8 shapeCount, uint8 zoom, uint8 tintRed, uint8 tintGreen, uint8 tintBlue, uint8 tintAlpha, bool isCyclic) public payable {

      const mintPrice = await contract.getCustomMintPrice();
      console.log('Mint price: ' + mintPrice.toString());

      const rgbObj = rgbToObj(tintColour);
      const alpha = Math.round(rgbObj.a * 255);
      console.log('Alpha: ' + alpha);

      const overrides = {
        // gasLimit: 140000,
        value: mintPrice,
      };

      //     function mintCustom(uint24 seed, uint8 shapeCount, uint8 zoom, uint8 tintRed, uint8 tintGreen, uint8 tintBlue, uint8 tintAlpha, bool isCyclic) public payable {
      const mintTx = await contract.mintCustom(
        randomSeed,
        shapeCount,
        zoom,
        rgbObj.r,
        rgbObj.g,
        rgbObj.b,
        alpha,
        style === 'cycle',
        overrides
      );
      console.log('Mint tx: ' + mintTx.hash);
      toast.success('Your NFT has been minted!');
    } catch (error: any) {
      console.error('Minting error! ', error);
      handleError(error);
    }
  };

  type RGBAColor = {
    r: number;
    g: number;
    b: number;
    a: number;
  };

  const rgbToObj = (rgbString: string) => {
    console.log('RGB: ' + rgbString);
    let colors = ['r', 'g', 'b', 'a'];

    let colorArray = rgbString
      .slice(rgbString.indexOf('(') + 1, rgbString.indexOf(')'))
      .split(', ');

    let color: RGBAColor = {
      r: Number(colorArray[0]),
      g: Number(colorArray[1]),
      b: Number(colorArray[2]),
      a: Number(colorArray[3]),
    };

    console.log('RGB obj: ' + JSON.stringify(color));
    return color;
  };

  return (
    <div>
      <div className="artboard">
        <img className="artboardImage" src={svg}></img>
      </div>

      <div className={styles.artboardControls}>
        <div className="panel">
          <div>Random seed: {randomSeed}</div>
          <Button onClick={generateNewSeed}>New Seed</Button>
          <Button onClick={randomize}>Randomize All</Button>
        </div>
        <div className="panel">
          <div>Mint!</div>
          <Button onClick={mintRandom}>Mint random</Button>
          <Button onClick={mintCustom}>Mint cutom</Button>
        </div>
        <SimpleGrid cols={{ base: 1, xs: 2 }}>
          <Stack>
            <div className="panel">
              <Text ta="left" size="m">
                Style
              </Text>
              <RadioGroup value={style} onChange={setStyle} name="style">
                {' '}
                <Radio value="linear" label="linear" />
                <Radio value="cycle" label="cyclic" />
              </RadioGroup>
            </div>
            <div className="panel">
              <Text ta="left" size="m">
                Shapes
              </Text>
              <NumberInput value={shapeCount} onChange={(value) => setShapeCount(Number(value))} />
            </div>
          </Stack>

          <Stack>
            <div className="panel">
              <Text ta="left" size="m">
                Color
              </Text>
              <ColorPicker format="rgba" value={tintColour} onChange={setTintColour} />
            </div>
          </Stack>
        </SimpleGrid>
        <Stack>
          <div className="panel">
            <Text ta="left" size="m">
              Zoom
            </Text>
            <Slider
              name="Zoom"
              value={zoom}
              onChange={(value) => setZoom(value)}
              color="blue"
              min={50}
              max={100}
              marks={[
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
              ]}
            />
            zoom: {zoom}%
          </div>
        </Stack>
      </div>
    </div>
  );
}
