'use client';
import { useEffect, useState } from 'react';
import styles from './ArtBoard.module.css';
import { Text, Radio, RadioGroup, Stack, Slider, SimpleGrid, Tabs, rem } from '@mantine/core';
import {
  RGBAColor,
  buildArtwork,
  generateRandomTokenParams,
  randomIntFromInterval,
} from '../../src/anglez';
import { Button, NumberInput, ColorPicker } from '@mantine/core';
import { getReadWriteContract, mintCustomAnglez } from '../../src/BlockchainAPI';
import { showErrorMessage } from '@/src/UIUtils';
import { handleError } from '@/src/ErrorHandler';
import { toast } from 'react-toastify';
import { TokenParams } from '../../src/anglez';
import { IconSparkles, IconTools } from '@tabler/icons-react';

export function ArtBoard() {
  const [activeTab, setActiveTab] = useState<string | null>('random');
  const [randomSeed, setRandomSeed] = useState(100);
  const [custom, setCustom] = useState(false);
  const [zoom, setZoom] = useState(75);
  const [style, setStyle] = useState('linear');
  const [shapeCount, setShapeCount] = useState(5);
  // stored as rgb()
  const [tintColour, setTintColour] = useState('');
  const [svg, setSvg] = useState('');

  const generateSvgDataUri = () => {
    console.log('Generating svg data URI...');

    const tokenParams: TokenParams = {
      seed: randomSeed,
      shapeCount: shapeCount,
      zoom: zoom,
      tintColour: rgbToObj(tintColour),
      isCyclic: style === 'cycle',
    };

    const svgString = buildArtwork(tokenParams);
    // console.log('SVG STRING: ' + svgString);
    const encodedSvgString = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encodedSvgString}`;
  };

  const randomize = () => {
    console.log('Generating random...');

    setRandomSeed(Math.trunc(Math.random() * 5_000_000));

    const tokenParams = generateRandomTokenParams(randomSeed);

    const zoom = randomIntFromInterval(randomSeed + 3, 50, 100);

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
    const svg = generateSvgDataUri();
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

    const tokenParams: TokenParams = {
      seed: randomSeed,
      shapeCount: shapeCount,
      zoom: zoom,
      tintColour: rgbToObj(tintColour),
      isCyclic: style === 'cycle',
    };

    console.log('Minting with params: ' + JSON.stringify(tokenParams));

    try {
      //     function mintCustom(uint24 seed, uint8 shapeCount, uint8 zoom, uint8 tintRed, uint8 tintGreen, uint8 tintBlue, uint8 tintAlpha, bool isCyclic) public payable {
      await mintCustomAnglez(tokenParams);
      toast.success('Your NFT has been minted!');
    } catch (error: any) {
      console.error('Minting error: ', error);
      handleError(error);
    }
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
        <Tabs
          variant="unstyled"
          defaultValue="settings"
          classNames={styles}
          value={activeTab}
          onChange={setActiveTab}
        >
          <Tabs.List grow>
            <Tabs.Tab
              value="random"
              leftSection={<IconSparkles style={{ width: rem(16), height: rem(16) }} />}
            >
              Random
            </Tabs.Tab>
            <Tabs.Tab
              value="custom"
              leftSection={<IconTools style={{ width: rem(16), height: rem(16) }} />}
            >
              Custom
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="random" pt="xs">
            <div className="panel">
              <div>Random seed: {randomSeed}</div>
              <Button onClick={randomize}>Randomize</Button>
              <Button
                onClick={() => {
                  setActiveTab('custom');
                }}
              >
                Customize
              </Button>
              <Button className={styles.mintButton} onClick={mintRandom}>
                Mint!
              </Button>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="custom" pt="xs">
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
                  <NumberInput
                    value={shapeCount}
                    onChange={(value) => setShapeCount(Number(value))}
                  />
                </div>
              </Stack>

              <Stack>
                <div className="panel">
                  <Text ta="left" size="m">
                    Tint
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
                {zoom}%
              </div>
            </Stack>
            <div className="panel">
              <div>Random seed: {randomSeed}</div>
              <Button onClick={generateNewSeed}>New Seed</Button>
              <Button className={styles.mintButton} onClick={mintCustom}>
                Mint!
              </Button>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
