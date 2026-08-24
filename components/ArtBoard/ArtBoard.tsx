'use client';

import { useEffect, useState } from 'react';
import {
  Text,
  Radio,
  RadioGroup,
  SimpleGrid,
  Tabs,
  rem,
  Grid,
  Button,
  ColorPicker,
} from '@mantine/core';

import { toast } from 'react-toastify';
import { IconSparkles, IconTools } from '@tabler/icons-react';
import {
  useAccount,
  useBalance,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { Address } from 'viem';
import { parseEther } from 'ethers';
import { useSearchParams, useRouter } from 'next/navigation';
import contract from '@/contract/Anglez.json';
import {
  AnglezContractAddress,
  AnglezCurrentNetworkCurrencySymbol,
  AnglezCurrentNetworkID,
  AnglezCurrentNetworkName,
} from '@/src/Constants';
import Loading from '../Loading/Loading';
import { TokenParams, RGBAColor, buildArtwork, generateRandomTokenParams } from '../../src/anglez';
import { fetchCustomMintPrice, fetchRandomMintPrice } from '../../src/BlockchainServerAPI';
import { handleError } from '@/src/ErrorHandler';
import styles from './ArtBoard.module.css';

export function ArtBoard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('random');
  const [randomMintPrice, setRandomMintPrice] = useState<string | null>(null);
  const [customMintPrice, setCustomMintPrice] = useState<string | null>(null);
  const [randomSeed, setRandomSeed] = useState<number | null>(null);
  const [style, setStyle] = useState('cyclic');
  const [structure, setStructure] = useState('folded');
  const [shapeCount, setShapeCount] = useState(5);
  // stored as rgb()
  const [tintColour, setTintColour] = useState('');
  const [svg, setSvg] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const { switchChain } = useSwitchChain();
  const { data: hash, error: mintError, isPending, writeContract } = useWriteContract();
  const account = useAccount();
  const accountBalance = useBalance({ address: account.address as Address });
  const {
    isLoading: isConfirming,
    error: confirmedError,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 0,
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const { abi } = contract;

  const generateNewSeed = () => Math.trunc(Math.random() * 5_000_000);

  const rgbToObj = (rgbString: string) => {
    // console.log('RGB: ' + rgbString);
    const colorArray = rgbString
      .slice(rgbString.indexOf('(') + 1, rgbString.indexOf(')'))
      .split(', ');

    const color: RGBAColor = {
      r: Number(colorArray[0]),
      g: Number(colorArray[1]),
      b: Number(colorArray[2]),
      a: Number(colorArray[3]),
    };

    // console.log('RGB obj: ' + JSON.stringify(color));
    return color;
  };

  const generateSvgDataUri = () => {
    console.log(`Generating svg data URI with random seed: ${randomSeed}`);

    if (randomSeed == null) {
      console.log('Random seed is null!');
      return null;
    }

    let tokenParams: TokenParams;
    if (activeTab === 'random') {
      tokenParams = generateRandomTokenParams(randomSeed);
    } else {
      tokenParams = {
        seed: randomSeed,
        shapeCount,
        tintColour: rgbToObj(tintColour),
        isCyclic: style === 'cyclic',
        isChaotic: structure === 'chaotic',
      };
    }

    const svgString = buildArtwork(tokenParams);
    // console.log('SVG STRING: ' + svgString);
    const encodedSvgString = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encodedSvgString}`;
  };

  const randomize = (requestedSeed?: number) => {
    console.log(`newSeed in randomize: ${JSON.stringify(requestedSeed)}`);
    const newSeed = requestedSeed ?? generateNewSeed();
    console.log(`Generating random anglez with seed: ${newSeed}`);

    const tokenParams = generateRandomTokenParams(newSeed);

    console.log(`Randomized params: ${JSON.stringify(tokenParams)}`);
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
    // console.log('RANDOM MINT PRICE: ', price.toString());
    setRandomMintPrice(price);
  };
  const getCustomMintPrice = async () => {
    const price = await fetchCustomMintPrice();
    // console.log('CUSTOM MINT PRICE: ', price.toString());
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
    console.log(`Is pending: ${isPending}`);
    console.log(`Is confirming: ${isConfirming}`);

    if (isPending || isConfirming) {
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
  }, [isPending, isConfirming]);

  // useEffect(() => {
  //   showInfoMessage('Transaction confirmed: ' + isConfirmed);
  // }, [isConfirmed]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const seed = searchParams.get('seed');
    if (tab != null && tab === 'custom') {
      setActiveTab('custom');
    }
    if (seed != null) {
      console.log(`Got seed from query string: ${seed}`);
      randomize(parseInt(seed, 10));
    } else {
      randomize();
    }

    getRandomMintPrice();
    getCustomMintPrice();
  }, []);

  useEffect(() => {
    if (randomSeed == null) {
      return;
    }

    const svgDataUri = generateSvgDataUri();
    if (svgDataUri != null) {
      setSvg(svgDataUri);
    }
  }, [activeTab, randomSeed, style, structure, shapeCount, tintColour]);

  // Update URL query string when seed changes
  useEffect(() => {
    if (randomSeed != null) {
      const existing = new URLSearchParams(searchParams.toString());
      // Remove to control order explicitly
      existing.delete('tab');
      existing.delete('seed');

      const ordered = new URLSearchParams();
      if (activeTab) {
        ordered.append('tab', activeTab);
      }
      ordered.append('seed', randomSeed.toString());

      // Append remaining params preserving their current order
      existing.forEach((value, key) => {
        ordered.append(key, value);
      });

      router.replace(`/create?${ordered.toString()}`, { scroll: false });
    }
  }, [randomSeed, activeTab]);

  const newSeedPressed = () => {
    const newSeed = generateNewSeed();
    setRandomSeed(newSeed);
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

  const mintRandom = async () => {
    console.log('Minting random...');

    try {
      // 'connecting'/'reconnecting' are not the same as "no wallet" - wagmi reports
      // isConnected as false/indeterminate while it is still restoring a session, so
      // checking it alone warns the user they're disconnected when they aren't yet.
      if (account.isConnecting || account.isReconnecting) {
        toast.info('Still connecting to your crypto wallet. Please try again in a moment.');
        return;
      }

      if (!account.isConnected) {
        toast.warn(
          'anglez is not connected to a crypto wallet. Tap the Connect Wallet button at top right.'
        );
        return;
      }

      console.log(`Minting random for address: ${account.address}`);

      const currentChainId = account?.chainId;
      console.log(`Account Chain ID: ${currentChainId}`);
      console.log(`Desired Chain ID: ${AnglezCurrentNetworkID}`);
      if (currentChainId !== AnglezCurrentNetworkID) {
        console.log('On wrong network.  Switching chain..');
        toast.warn(
          `You're on the wrong chain. Switching to ${AnglezCurrentNetworkName}... Try again!`
        );
        switchChain({ chainId: AnglezCurrentNetworkID });
        return;
      }

      // setIsMinting(true);
      // const mintReceipt = await mintRandomAnglez(randomSeed);

      if (accountBalance.data && accountBalance.data.value < parseEther(randomMintPrice!)) {
        toast.warn(
          `You don't have enough ${AnglezCurrentNetworkCurrencySymbol} to mint on ${AnglezCurrentNetworkName}. Please top up your balance.`
        );
        return;
      }

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
    // See mintRandom: a pending reconnect is not a disconnected wallet.
    if (account.isConnecting || account.isReconnecting) {
      toast.info('Still connecting to your crypto wallet. Please try again in a moment.');
      return;
    }

    if (!account.isConnected) {
      toast.warn(
        'anglez is not connected to a crypto wallet. Tap the Connect Wallet button at top right.'
      );
      return;
    }

    console.log(`Minting custom for address: ${account.address}`);

    const currentChainId = account?.chainId;
    console.log(`Account Chain ID: ${currentChainId}`);
    console.log(`Desired Chain ID: ${AnglezCurrentNetworkID}`);
    if (currentChainId !== AnglezCurrentNetworkID) {
      console.log('On wrong network.  Switching chain..');
      toast.warn(
        `You're on the wrong chain. Switching to ${AnglezCurrentNetworkName}... Try again!`
      );
      switchChain({ chainId: AnglezCurrentNetworkID });
      return;
    }

    if (accountBalance.data && accountBalance.data.value < parseEther(customMintPrice!)) {
      toast.warn(
        `You don't have enough ${AnglezCurrentNetworkCurrencySymbol} to mint on ${AnglezCurrentNetworkName}. Please top up your balance.`
      );
      return;
    }

    // const tokenParams: TokenParams = {
    //   seed: randomSeed,
    //   shapeCount: shapeCount,
    //   tintColour: rgbToObj(tintColour),
    //   isCyclic: style === 'cyclic',
    //   isChaotic: structure === 'chaotic',
    // };

    // console.log('Minting with params: ' + JSON.stringify(tokenParams));
    // setIsMinting(true);

    try {
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
          style === 'cyclic',
          style === 'chaotic',
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

  return (
    <div>
      <div className="artboard">
        {loading ? <> </> : <img className="artboardImage" alt="anglez preview" src={svg} />}
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
                  {`rgb(${rgbToObj(tintColour).r}, ${rgbToObj(tintColour).g}, ${
                    rgbToObj(tintColour).b
                  })`}
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
                    {isPending && <div>Transaction pending...</div>}
                    {isConfirming && <div>Waiting for confirmation...</div>}
                  </>
                ) : (
                  <>
                    <Button onClick={randomizeTapped}>Randomize</Button>
                    <Button onClick={newSeedPressed}>New Seed</Button>
                    <Button className={styles.mintButton} onClick={mintCustom}>
                      Mint! ({`${customMintPrice} ETH`})
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
          <Text mb="lg" c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="lg">
            Only 512 anglez can ever be minted.
          </Text>
        </div>
      )}
    </div>
  );
}
