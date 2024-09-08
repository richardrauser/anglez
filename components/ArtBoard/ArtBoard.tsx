'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import styles from './ArtBoard.module.css';
import {
  Text,
  Radio,
  RadioGroup,
  Stack,
  SimpleGrid,
  Tabs,
  rem,
  Grid,
  GridCol,
  NumberInputHandlers,
} from '@mantine/core';
import { RGBAColor, buildArtwork, generateRandomTokenParams } from '../../src/anglez';
import { Button, ColorPicker } from '@mantine/core';
import { fetchCustomMintPrice, fetchRandomMintPrice } from '../../src/BlockchainServerAPI';

import { handleError } from '@/src/ErrorHandler';
import { toast } from 'react-toastify';
import { TokenParams } from '../../src/anglez';
import { IconSparkles, IconTools } from '@tabler/icons-react';
import Loading from '../Loading/Loading';
import { useAccount } from 'wagmi';
import { useSwitchChain } from 'wagmi';
import {
  AnglezContractAddress,
  AnglezCurrentNetworkID,
  AnglezCurrentNetworkName,
} from '@/src/Constants';
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { abi } from '@/contract/Anglez.json';
import { showErrorMessage, showInfoMessage } from '@/src/UIUtils';
import { baseSepolia } from 'viem/chains';
import { Address } from 'viem';
import { parseEther } from 'ethers';
import { useShield3Context } from '@shield3/react-sdk';
import { useSearchParams } from 'next/navigation';

export function ArtBoard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('random');
  const [randomMintPrice, setRandomMintPrice] = useState<string | null>(null);
  const [customMintPrice, setCustomMintPrice] = useState<string | null>(null);
  const [randomSeed, setRandomSeed] = useState(0);
  const [style, setStyle] = useState('cyclic');
  const [structure, setStructure] = useState('folded');
  const [shapeCount, setShapeCount] = useState(5);
  // stored as rgb()
  const [tintColour, setTintColour] = useState('');
  const [svg, setSvg] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { chains, switchChain } = useSwitchChain();
  const { data: hash, error: mintError, isPending, writeContract } = useWriteContract();
  const account = useAccount();
  const { shield3Client } = useShield3Context();
  const {
    isLoading: isConfirming,
    error: confirmedError,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 0,
  });
  const searchParams = useSearchParams();

  const generateSvgDataUri = () => {
    console.log('Generating svg data URI...');

    var tokenParams: TokenParams;
    if (activeTab == 'random') {
      tokenParams = generateRandomTokenParams(randomSeed);
    } else {
      tokenParams = {
        seed: randomSeed,
        shapeCount: shapeCount,
        tintColour: rgbToObj(tintColour),
        isCyclic: style == 'cyclic',
        isChaotic: structure == 'chaotic',
      };
    }

    const svgString = buildArtwork(tokenParams);
    // console.log('SVG STRING: ' + svgString);
    const encodedSvgString = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encodedSvgString}`;
    setLoading(false);
  };

  const randomize = (newSeed?: number) => {
    console.log('newSeed in randomize: ' + JSON.stringify(newSeed));
    if (newSeed === undefined || newSeed == null) {
      newSeed = generateNewSeed();
    }
    console.log('Generating random anglez with seed: ' + newSeed);

    const tokenParams = generateRandomTokenParams(newSeed);

    console.log('Randomized params: ' + JSON.stringify(tokenParams));
    setRandomSeed(newSeed);
    setShapeCount(tokenParams.shapeCount);

    setTintColour(
      `rgba(${tokenParams.tintColour.r}, ${tokenParams.tintColour.g}, ${tokenParams.tintColour.b}, ${tokenParams.tintColour.a})`
    );
    setStyle(tokenParams.isCyclic ? 'cyclic' : 'linear');
    setStructure(tokenParams.isChaotic ? 'chaotic' : 'folded');
    setLoading(false);
  };

  const randomizeTapped = () => {
    randomize();
  };

  const getRandomMintPrice = async () => {
    const price = await fetchRandomMintPrice();
    console.log('RANDOM MINT PRICE: ', price.toString());
    setRandomMintPrice(price);
  };
  const getCustomMintPrice = async () => {
    const price = await fetchCustomMintPrice();
    console.log('CUSTOM MINT PRICE: ', price.toString());
    setCustomMintPrice(price);
  };

  // useEffect(() => {
  //   console.error('Minting error: ', mintError?.message);

  //   if (mintError != undefined && mintError != null) {
  //     showErrorMessage(mintError?.message);
  //   }
  // }, [mintError]);

  // useEffect(() => {
  //   console.log('Is confirmed: ' + isConfirmed);
  //   if (confirmedError == undefined) {
  //     return;
  //   }

  //   if (!confirmedError) {
  //     toast.success('Your Anglez NFT has successfully minted! Try another?');
  //   } else {
  //     toast.error('There was an error minting your Anglez NFT. Please try again.');
  //   }
  // }, [confirmedError]);

  useEffect(() => {
    console.log('Is pending: ' + isPending);
    console.log('Is confirming: ' + isConfirming);

    if (isValidating || isPending || isConfirming) {
      setIsMinting(true);
    } else if (isMinting) {
      if (!isPending && !isConfirming) {
        // transaction done
        if (isConfirmed) {
          toast.success('Your Anglez NFT has successfully minted! Try another?');
        } else if (mintError) {
          console.log('Minting error: ', mintError);
          handleError(mintError);
          // toast.error('There was an error minting your Anglez NFT. Please try again.');
        } else if (confirmedError) {
          console.log('Confirmation error: ', confirmedError);
          handleError(confirmedError);
        }
      }
      setIsMinting(false);
    }
  }, [isValidating, isPending, isConfirming]);

  // useEffect(() => {
  //   showInfoMessage('Transaction confirmed: ' + isConfirmed);
  // }, [isConfirmed]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const seed = searchParams.get('seed');
    if (tab != null && tab == 'custom') {
      setActiveTab('custom');
    }
    if (seed != undefined && seed != null) {
      console.log('Got seed from query string: ' + seed);
      randomize(parseInt(seed));
    } else {
      randomize();
    }
  }, []);

  useEffect(() => {
    getRandomMintPrice();
    getCustomMintPrice();

    const svg = generateSvgDataUri();
    setSvg(svg);
  }, [activeTab, randomSeed, style, structure, shapeCount, tintColour]);

  const newSeedPressed = () => {
    const newSeed = generateNewSeed();
    setRandomSeed(newSeed);
  };

  const generateNewSeed = () => {
    return Math.trunc(Math.random() * 5_000_000);
  };

  const decrementShapeCount = () => {
    const maxShapeCount = 2;
    const newShapeCount = Math.max(shapeCount - 1, maxShapeCount);

    setShapeCount(newShapeCount);
  };

  const incrementShapeCount = () => {
    const maxShapeCount = 20;
    const newShapeCount = Math.min(shapeCount + 1, maxShapeCount);

    setShapeCount(newShapeCount);
  };

  const validateTransaction = async () => {
    setIsValidating(true);
    const transaction = {
      // from: account.address,
      to: AnglezContractAddress,
      chainId: baseSepolia.id,
      // value: '0.0',
      // data: '0x...',
      // Other transaction fields
    };

    var policyResults = await shield3Client.getPolicyResults(
      transaction,
      account.address as Address
    );

    console.log('Policy results: ', policyResults);

    if (!policyResults) {
      console.log('No policy results found.');
      setIsValidating(false);
      var err = Error('No policy results found.');
      err.cause = { code: 'NO_POLICY_RESULTS' };
      throw err;
    } else if (policyResults.decision != 'Allow') {
      console.log('Policy results found. Transaction blocked.');
      setIsValidating(false);
      var err = Error('Transaction blocked by policy.');
      err.cause = { code: 'POLICY_BLOCKED' };
      throw err;
    }
    setIsValidating(false);
  };

  const mintRandom = async () => {
    console.log('Minting random...');

    try {
      if (!account.isConnected) {
        toast.warn(
          `anglez is not connected to a crypto wallet. Tap the Connect Wallet button at top right.`
        );
        return;
      }

      console.log('Minting random for address: ' + account.address);

      const currentChainId = account?.chainId;
      console.log('Account Chain ID: ' + currentChainId);
      console.log('Desired Chain ID: ' + AnglezCurrentNetworkID);
      if (currentChainId != AnglezCurrentNetworkID) {
        console.log('On wrong network.  Switching chain..');
        toast.warn(
          `You're on the wrong chain. Please switch to ${AnglezCurrentNetworkName} before minting.`
        );
        switchChain({ chainId: AnglezCurrentNetworkID });
        return;
      }

      // setIsMinting(true);
      // const mintReceipt = await mintRandomAnglez(randomSeed);

      // check if the transaction violates policy
      // await validateTransaction();

      writeContract({
        address: AnglezContractAddress as Address,
        abi,
        chain: baseSepolia,
        functionName: 'mintRandom',
        args: [randomSeed],
        value: parseEther(randomMintPrice!),
      });

      // console.log('Mint tx: ' + mintReceipt.hash);

      // if (mintReceipt.status == 1) {
      //   toast.success('Your Anglez NFT has successfully minted! Try another?');
      // } else {
      //   toast.error('There was an error minting your Anglez NFT. Please try again.');
      // }

      // setIsMinting(false);
      // randomize();
    } catch (error: any) {
      console.error('Minting error! ', error);
      setIsMinting(false);
      handleError(error);
    }
  };

  const mintCustom = async () => {
    if (!account.isConnected) {
      toast.warn(
        `anglez is not connected to a crypto wallet. Tap the Connect Wallet button at top right.`
      );
      return;
    }

    console.log('Minting custom for address: ' + account.address);

    const currentChainId = account?.chainId;
    console.log('Account Chain ID: ' + currentChainId);
    console.log('Desired Chain ID: ' + AnglezCurrentNetworkID);
    if (currentChainId != AnglezCurrentNetworkID) {
      console.log('On wrong network.  Switching chain..');
      toast.warn(
        `You're on the wrong chain. Please switch to ${AnglezCurrentNetworkName} before minting.`
      );
      switchChain({ chainId: AnglezCurrentNetworkID });
      return;
    }

    // const tokenParams: TokenParams = {
    //   seed: randomSeed,
    //   shapeCount: shapeCount,
    //   tintColour: rgbToObj(tintColour),
    //   isCyclic: style == 'cyclic',
    //   isChaotic: structure == 'chaotic',
    // };

    // console.log('Minting with params: ' + JSON.stringify(tokenParams));
    // setIsMinting(true);

    try {
      // await validateTransaction();

      const colour = rgbToObj(tintColour);
      const alpha = Math.round(colour.a * 255);

      writeContract({
        address: AnglezContractAddress as Address,
        abi,
        chain: baseSepolia,
        functionName: 'mintCustom',
        args: [
          randomSeed,
          shapeCount,
          colour.r,
          colour.g,
          colour.b,
          alpha,
          style == 'cyclic',
          style == 'chaotic',
        ],
        value: parseEther(customMintPrice!),
      });
      //     function mintCustom(uint24 seed, uint8 shapeCount, uint8 zoom, uint8 tintRed, uint8 tintGreen, uint8 tintBlue, uint8 tintAlpha, bool isCyclic) public payable {
      // const mintReceipt = await mintCustomAnglez(tokenParams);
      // console.log('Mint tx: ' + mintReceipt.hash);
      // setIsMinting(false);

      // if (mintReceipt.status == 1) {
      //   toast.success('Your Anglez NFT has successfully minted! Try another?');
      // } else {
      //   toast.error('There was an error minting your Anglez NFT. Please try again.');
      // }
      // randomize();
    } catch (error: any) {
      console.error('Minting error: ', error);
      setIsMinting(false);
      handleError(error);
    }
  };

  const rgbToObj = (rgbString: string) => {
    // console.log('RGB: ' + rgbString);
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

    // console.log('RGB obj: ' + JSON.stringify(color));
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
                <Text ta="left" size="sm">
                  <b>Shapes:</b> {shapeCount} <br />
                  <b>Style:</b> {style} <br />
                  <b>Structure:</b> {structure} <br />
                  <b>Tint color:</b>
                  {'rgb(' +
                    rgbToObj(tintColour).r +
                    ', ' +
                    rgbToObj(tintColour).g +
                    ', ' +
                    rgbToObj(tintColour).b +
                    ')'}
                  <br />
                  <b>Tint opacity:</b> {Math.round(rgbToObj(tintColour).a * 100)}%
                </Text>
              </div>
              <div className="panel">
                <div>Random seed: {randomSeed}</div>

                {/* {isPending || isConfirming ? ( */}
                {/* <Loading loadingText="Minting! Waiting for transaction receipt..." /> */}
                {isMinting ? (
                  <>
                    <Loading loadingText="Minting in progress!" />
                    {isValidating && <div>Validating transaction...</div>}
                    {isPending && <div>Transaction pending...</div>}
                    {isConfirming && <div>Waiting for confirmation...</div>}
                  </>
                ) : (
                  <>
                    {/* {hash && <div>Transaction Hash: {hash}</div>}
                    {isConfirming && <div>Waiting for confirmation...</div>}
                    {isConfirmed && <div>Transaction confirmed.</div>} */}
                    {/* {error && (
                      <div>Error: {(error as BaseError).shortMessage || error.message}</div>
                    )} */}
                    <Button onClick={randomizeTapped}>Randomize</Button>
                    <Button
                      onClick={() => {
                        setActiveTab('custom');
                      }}
                    >
                      Customize
                    </Button>
                    {/* {randomMintCost != null && ( */}
                    <Button className={styles.mintButton} onClick={mintRandom}>
                      Mint! ({randomMintPrice} ETH)
                    </Button>
                    {/* )} */}
                  </>
                )}
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="custom" pt="xs">
              <div className="panel">
                <Grid>
                  <Grid.Col span="auto">
                    <Text ta="left" size="m">
                      Style
                    </Text>
                    <RadioGroup value={style} onChange={setStyle} name="style">
                      <Radio value="linear" label="linear" />
                      <Radio value="cyclic" label="cyclic" />
                    </RadioGroup>
                    <Text ta="left" size="m">
                      Structure
                    </Text>
                    <RadioGroup value={structure} onChange={setStructure} name="structure">
                      <Radio value="folded" label="folded" />
                      <Radio value="chaotic" label="chaotic" />
                    </RadioGroup>
                    <Text ta="left" size="m">
                      Shapes
                    </Text>

                    <SimpleGrid className={styles.numberPicker} cols={3} spacing="0">
                      <Button className={styles.numberPickerButton} onClick={decrementShapeCount}>
                        -
                      </Button>
                      <Text className={styles.numberPickerText}>{shapeCount}</Text>
                      <Button className={styles.numberPickerButton} onClick={incrementShapeCount}>
                        +
                      </Button>
                    </SimpleGrid>
                  </Grid.Col>

                  <Grid.Col span="auto">
                    <Text ta="left" size="m">
                      Tint
                    </Text>
                    <ColorPicker
                      size="md"
                      format="rgba"
                      value={tintColour}
                      onChange={setTintColour}
                    />
                  </Grid.Col>
                </Grid>
              </div>
              <div className="panel">
                <div>Random seed: {randomSeed}</div>
                {isMinting ? (
                  <>
                    <Loading loadingText="Minting in progress!" />
                    {isValidating && <div>Validating transaction...</div>}
                    {isPending && <div>Transaction pending...</div>}
                    {isConfirming && <div>Waiting for confirmation...</div>}
                  </>
                ) : (
                  <>
                    <Button onClick={randomizeTapped}>Randomize</Button>
                    <Button onClick={newSeedPressed}>New Seed</Button>
                    <Button className={styles.mintButton} onClick={mintCustom}>
                      Mint! ({customMintPrice + ' ETH'})
                    </Button>
                    <Text size="sm">
                      <b>Randomize</b> randomizes everything, while <b>New Seed</b> randomizes the
                      seed value, but preserves your custom values.
                    </Text>
                  </>
                )}
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>
      )}
    </div>
  );
}
