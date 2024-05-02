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
import Loading from '../Loading/Loading';

export function ArtBoard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('random');
  const [randomSeed, setRandomSeed] = useState(0);
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
    setLoading(false);
  };

  const randomize = () => {
    const newSeed = generateNewSeed();
    console.log('Generating random anglez with seed: ' + newSeed);

    const tokenParams = generateRandomTokenParams(newSeed);

    console.log('Randomized params: ' + JSON.stringify(tokenParams));
    setRandomSeed(newSeed);
    setZoom(tokenParams.zoom);
    setShapeCount(tokenParams.shapeCount);

    setTintColour(
      `rgba(${tokenParams.tintColour.r}, ${tokenParams.tintColour.g}, ${tokenParams.tintColour.b}, ${tokenParams.tintColour.a})`
    );
    setStyle(tokenParams.isCyclic ? 'cycle' : 'linear');
    setLoading(false);
  };

  useEffect(() => {
    randomize();
  }, []);

  useEffect(() => {
    const svg = generateSvgDataUri();
    setSvg(svg);
  }, [randomSeed, zoom, style, custom, shapeCount, tintColour]);

  const newSeedPressed = () => {
    const newSeed = generateNewSeed();
    setRandomSeed(newSeed);
  };

  const generateNewSeed = () => {
    return Math.trunc(Math.random() * 5_000_000);
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
        {loading ? <> </> : <img className="artboardImage" src={svg}></img>}
      </div>

      {loading ? (
        <Loading />
      ) : (
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
                      min={2}
                      max={20}
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
                <Button onClick={newSeedPressed}>New Seed</Button>
                <Button className={styles.mintButton} onClick={mintCustom}>
                  Mint!
                </Button>
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>
      )}
    </div>
  );
}
