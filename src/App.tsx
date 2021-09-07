import * as React from "react";
import ReactDOMServer from 'react-dom/server';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Stack,
  Grid,
  Button,
  theme,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Divider,
  Link,
  Image,
  Center,
  Spinner,
  Avatar,
  Tooltip
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'

import Web3 from 'web3';
import Web3Modal from "web3modal";
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx'

import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebRTCStar from 'libp2p-webrtc-star'
import { NOISE } from 'libp2p-noise'
import Mplex from 'libp2p-mplex'
import Bootstrap from 'libp2p-bootstrap'
import Room from 'ipfs-pubsub-room';
import Gossipsub from 'libp2p-gossipsub'

import ERC1155 from './contracts/ItemsERC1155.json'
import ERC20Rewards from './contracts/ERC20Rewards.json'
import ERC1155Likes from './contracts/ERC1155Likes.json'
import SnowflakesInvasion from './contracts/SnowflakesInvasion.json'

import Nav from './components/Nav';
import MintPage from './pages/Mint';
import OwnedAvatars from './pages/OwnedAvatars';
import AllAvatars from './pages/AllAvatars';
import Games from './pages/Games';



const providerOptions = {
  injected: {
    package: null
  }
};

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions // required
});

class App extends React.Component {

  state = {
    netId: 0x64,
    savedBlobs: [],
    creators: [],
    likes: [],
    loadingAvatars: true,
    peersOnline: 0
  }
  constructor(props){
    super(props)
    this.initWeb3 = this.initWeb3.bind(this);
    this.connectWeb3 = this.connectWeb3.bind(this);
    this.checkClaimed = this.checkClaimed.bind(this);
    this.getMetadata = this.getMetadata.bind(this);

    this.claim = this.claim.bind(this);
    this.checkTokens = this.checkTokens.bind(this);
    this.addNetwork = this.addNetwork.bind(this);
    this.initLibp2p = this.initLibp2p.bind(this);
  }
  componentDidMount = async () => {

    if (web3Modal.cachedProvider) {
      await this.connectWeb3();
    } else {
      await this.initWeb3();
    }
    this.setState({
      loading: false
    });
    if(this.state.itoken){
      await this.initiateContracts();
    }

    try{
      await this.initLibp2p();
    } catch(err){
      console.log(err)
    }

  }



  initWeb3 = async () => {
    try{
      let coinbase
      let web3;
      if(window.location.href.includes("?rinkeby")){
        web3 = new Web3("wss://rinkeby.infura.io/ws/v3/e105600f6f0a444e946443f00d02b8a9");
      } else {
        web3 = new Web3("https://rpc.xdaichain.com/")
      }
      const netId = await web3.eth.net.getId();

      let itoken;
      let tokenLikes;
      if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
        tokenLikes = new web3.eth.Contract(ERC1155Likes.abi, ERC1155Likes.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
        tokenLikes = new web3.eth.Contract(ERC1155Likes.abi, ERC1155Likes.xdai);
      }
      let address = window.location.search.split('?address=')[1];
      if(address?.includes('&rinkeby')){
        address = address.split("&rinkeby")[0];
      }
      if(!address && coinbase){
        address = coinbase;
      }

      this.setState({
        web3: web3,
        itoken: itoken,
        address:address,
        coinbase: coinbase,
        tokenLikes: tokenLikes,
        netId: netId
      });


    }catch(err){
      console.log(err)
    }
  }

  connectWeb3 = async () => {
    try{
      const provider =  await web3Modal.connect();;
      const web3 = new Web3(provider);
      const coinbase = await web3.eth.getCoinbase();
      const netId = await web3.eth.net.getId();
      let itoken;
      let rewards;
      let tokenLikes;
      let snowflakesInvasion;
      if(netId === 4){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.rinkeby);
        rewards = new web3.eth.Contract(ERC20Rewards.abi, ERC20Rewards.rinkeby);
        tokenLikes = new web3.eth.Contract(ERC1155Likes.abi, ERC1155Likes.rinkeby);
        snowflakesInvasion = new web3.eth.Contract(SnowflakesInvasion.abi, SnowflakesInvasion.rinkeby);
      } else if(netId === 0x64){
        itoken = new web3.eth.Contract(ERC1155.abi, ERC1155.xdai);
        tokenLikes = new web3.eth.Contract(ERC1155Likes.abi, ERC1155Likes.xdai);
      }
      const profile = await getLegacy3BoxProfileAsBasicProfile(coinbase);
      let initiateContracts = false;
      if(this.state.netId !== netId &&
        (netId === 0x64 || netId === 4)){
        initiateContracts = true;
      }
      this.setState({
        web3: web3,
        itoken: itoken,
        rewards: rewards,
        tokenLikes: tokenLikes,
        snowflakesInvasion: snowflakesInvasion,
        coinbase:coinbase,
        profile:profile,
        netId:netId,
        provider: provider
      });
      provider.on('accountsChanged', accounts => window.location.reload(true));
      provider.on('chainChanged', chainId => window.location.reload(true));
      // Subscribe to provider disconnection
      provider.on("disconnect", async (error: { code: number; message: string }) => {
        await web3Modal.clearCachedProvider();
        window.location.reload(true);
      });
      if(initiateContracts){
        this.setState({
          savedBlobs: [],
          creators: [],
          likes: []
        })
        await this.initiateContracts();
      }
    } catch(err){
      web3Modal.clearCachedProvider();
      this.initWeb3();
    }

  }

  initiateContracts = async () => {
    this.setState({
      likes: [],
      creators: [],
      savedBlobs: [],
      loadingAvatars: true
    })
    let promises = [];
    const results = await this.checkTokens();

    for(let res of results){
      promises.push(this.handleEvents(null,res));

      this.handleLikes(null,res);
    }
    Promise.all(promises).then(() => {
      this.setState({
        loadingAvatars: false,
        savedBlobs: this.state.savedBlobs.sort(function(xstr, ystr){
                        const x = JSON.parse(xstr)
                        const y = JSON.parse(ystr)
                        return y.returnValues._id - x.returnValues._id;
                    })
      });
    });
    this.state.itoken.events.TransferSingle({
      filter: {
        from: '0x0000000000000000000000000000000000000'
      },
      fromBlock: 'latest'
    }, this.handleEvents);
    this.state.tokenLikes.events.LikeOrUnlike({
      filter:{

      },
      fromBlock: 'latest'
    },this.handleLikes);
  }

  getMetadata = async(id) => {
    const uriToken = await this.state.itoken.methods.uri(id).call();
    let metadataToken = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uriToken.replace("ipfs://","")}`)).text());
    const svgImage = await (await fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"))).text();
    fetch(metadataToken.image.replace("ipfs://","https://ipfs.io/ipfs/"))
    return(metadataToken)
  }
  checkTokens = async () => {
    const itoken = this.state.itoken;

    const lastId = await itoken.methods.totalSupply().call();
    const results = [];
    for(let i = 1;i<=lastId;i++){
      const res = {
        returnValues: {
          _id: i,
        }
      }
      results.push(res)
    }
    return(results)
  }
  checkClaimed = async (id) => {
    if(id > 1500) {
      return
    }
    const creator = await this.state.itoken.methods.creators(id).call();
    const hasClaimed = await this.state.rewards.methods.claimed(creator,id).call();
    return({
      id: id,
      creator: creator,
      hasClaimed: hasClaimed
    });
  }
  claim = async (ids) => {
    try{
      const hash = await this.state.rewards.methods.claimMany(ids).send({
        from: this.state.coinbase,
        gasPrice: 1000000000
      });
      return(hash);
    } catch(err){
      console.log(err)
    }
  }
  addNetwork = async () => {
    try{
      const data = {
        chainId: "0x64", // A 0x-prefixed hexadecimal string
        chainName: "xDai",
        nativeCurrency: {
          name: "xDai",
          symbol: "xDai", // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: ["https://rpc.xdaichain.com/"],
        blockExplorerUrls: 'https://blockscout.com/xdai/mainnet'
      }
      await window.ethereum.request({
    "jsonrpc": "2.0",
    "method": "wallet_addEthereumChain",
    "params": [
        {
            "chainId": "0x64",
            "chainName": "xDAI Chain",
            "rpcUrls": [
                "https://dai.poa.network"
            ],
            "iconUrls": [
                "https://xdaichain.com/fake/example/url/xdai.svg",
                "https://xdaichain.com/fake/example/url/xdai.png"
            ],
            "nativeCurrency": {
                "name": "xDAI",
                "symbol": "xDAI",
                "decimals": 18
            },
            "blockExplorerUrls": [
                "https://blockscout.com/poa/xdai/"
            ]
        }
    ],
    "id": 0
})
    } catch(err){

    }
  }
  initLibp2p = async () => {

    const libp2p = await Libp2p.create({
      addresses: {
        // Add the signaling server address, along with our PeerId to our multiaddrs list
        // libp2p will automatically attempt to dial to the signaling server so that it can
        // receive inbound connections from other peers

        listen: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
        ]
      },
      modules: {
        transport: [Websockets, WebRTCStar],
        connEncryption: [NOISE],
        streamMuxer: [Mplex],
        peerDiscovery: [Bootstrap],
        pubsub: Gossipsub
      },
      config: {
        peerDiscovery: {
          // The `tag` property will be searched when creating the instance of your Peer Discovery service.
          // The associated object, will be passed to the service when it is instantiated.
          [Bootstrap.tag]: {
            enabled: true,
            list: [
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
            ]
          }
        },
        pubsub: {
          enabled: true,
          emitSelf: true,
          canRelayMessage: true
        }
      }
    });
    // Listen for new peers
    libp2p.on('peer:discovery', (peerId) => {
      //console.log(`Found peer ${peerId.toB58String()}`)
    })

    // Listen for new connections to peers
    libp2p.connectionManager.on('peer:connect', (connection) => {
      //console.log(`Connected to ${connection.remotePeer.toB58String()}`)
    })

    // Listen for peers disconnecting
    libp2p.connectionManager.on('peer:disconnect', (connection) => {
      //console.log(`Disconnected from ${connection.remotePeer.toB58String()}`)
    })

    await libp2p.start();
    const room = new Room(libp2p, 'snowflakes-dapp-peers-online')

    room.on('peer joined', (cid) => {
      console.log(`Joined ${cid}`)

      this.setState({
        peersOnline: this.state.peersOnline + 1
      })
    })

    room.on('peer left', (cid) => {
      console.log(`Left ${cid}`)
      this.setState({
        peersOnline: this.state.peersOnline -1
      })
    })

    room.once('subscribed',() => {
      console.log(`Subscribed`)
    })

    this.setState({
      libp2p: libp2p,
      room: room
    })
    return(libp2p);


  }

  handleEvents = async (err, res) => {
    try {
      const metadata = await this.getMetadata(res.returnValues._id);
      const creator = await this.state.itoken.methods.creators(res.returnValues._id).call();
      let profile;
      try{
        profile = await getLegacy3BoxProfileAsBasicProfile(creator);
      } catch(err){

      }
      const creatorProfile = {
        address: creator,
        profile: profile
      }
      if(!this.state.creators.includes(JSON.stringify(creatorProfile))){
        this.state.creators.unshift(JSON.stringify(creatorProfile));
        this.forceUpdate();
      }

      const obj = {
        returnValues: res.returnValues,
        metadata: metadata,
        creator: creator,
        profile: profile,
      }
      if(!this.state.savedBlobs.includes(JSON.stringify(obj))){
        this.state.savedBlobs.unshift(JSON.stringify(obj));
        this.forceUpdate();
      }
    } catch (err) {
      console.log(err);
    }
  }

  handleLikes = async (err,res) => {
    try{

        let likes = 0;
        let liked;
        likes = await this.state.tokenLikes.methods.likes(res.returnValues._id).call();
        if(this.state.coinbase){
          liked = await this.state.tokenLikes.methods.liked(this.state.coinbase,res.returnValues._id).call();
        }

        this.state.likes[res.returnValues._id] =  {
                                                    likes: likes,
                                                    liked: liked
                                                  };

        this.forceUpdate();

    } catch(err){

    }
  }

  render(){
    return(

      <Router>
      <ChakraProvider theme={theme}>
        <Box>
          <Nav
            connectWeb3={this.connectWeb3}
            {...this.state}
          />
        </Box>
        <Box textAlign="center" fontSize="xl">
          <Grid minH="100vh" p={3}>
            <Switch>
              <Route path={"/home"} render={() => {
                return(
                  <Box>
                    <VStack spacing={12}>
                      <Heading>Snowflakes</Heading>

                      <Stack>
                        <SimpleGrid
                          columns={{ sm: 1, md: 2 }}
                          spacing="40px"
                          mb="20"
                          justifyContent="left"
                        >
                          <Text style={{textAlign: 'left'}} fontSize="md">
                            <p>Each Snowflake can be minted for 1 xDai (1 USD), after that you can sell for any price you want. Your collectable can not be replicated or ever destroyed, it will be stored on Blockchain forever.</p>
                            <p>Choose your preferred Snowflake and start your collection now!</p>
                            <br/>
                            <p>1 xDai = 1 Snowflake</p>
                            <br/>
                            <p>The maximum amount of Snowflakes that will exists is 200000</p>
                            <br />
                            <p>The Snowflake Hash is built on xDai Chain, an Ethereum layer 2 sidechain that provides transactions cheaper and faster in a secure way, you must <Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" isExternal>set your wallet to xDai Chain network <ExternalLinkIcon mx="2px" /></Link> in order to join.</p>
                            <p>xDai ERC1155 at <Link href={`https://blockscout.com/xdai/mainnet/address/${ERC1155.xdai}`} isExternal>{ERC1155.xdai} <ExternalLinkIcon mx="2px" /></Link></p>
                            <br/>
                            <p>You can also use it in rinkeby testnetwork to test.</p>
                            <p>Rinkeby ERC1155 at <Link href={`https://rinkeby.etherscan.io/address/${ERC1155.rinkeby}`} isExternal>{ERC1155.rinkeby} <ExternalLinkIcon mx="2px" /></Link></p>
                            <br/>
                            <p>This project uses "Hydro-Snowflake-Identicon-Generator" package from <Link href="https://github.com/cyphercodes96/Hydro-Snowflake-Identicon-Generator" isExternal>https://github.com/cyphercodes96/Hydro-Snowflake-Identicon-Generator <ExternalLinkIcon mx="2px" /></Link> and can be copied / modified by anyone.</p>
                          </Text>
                          <Center>
                            <Image boxSize="200px" src="https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu" />
                          </Center>
                        </SimpleGrid>
                      </Stack>
                    </VStack>
                  </Box>
                  )
                }
              }/>


              <Route path={"/created-avatars"} render={() => {

                    return(
                      <>
                      {
                        (
                          this.state.itoken ?
                          (
                            <MintPage

                              checkClaimed={this.checkClaimed}
                              getMetadata={this.getMetadata}
                              claim={this.claim}
                              connectWeb3={this.connectWeb3}
                              checkTokens={this.checkTokens}
                              {...this.state}

                            />
                          ):
                          (
                            (this.state.netId === 4 || this.state.netId === 0x64) ?
                            (
                              <Center>
                               <VStack spacing={4}>
                                <Heading>Loading ...</Heading>
                                <Avatar
                                  size={'xl'}
                                  src={
                                    'https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu'
                                  }
                                />
                                <Spinner size="xl" />
                                </VStack>
                              </Center>
                            ) :
                            (
                              <Center>
                               <VStack spacing={4}>
                                <Heading>WRONG NETWORK</Heading>
                                <Avatar
                                  size={'xl'}
                                  src={
                                    'https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu'
                                  }
                                />
                                <p>Please connect to xDai network</p>
                                </VStack>
                              </Center>
                            )
                          )
                        )
                      }
                      </>
                    )
                  }

              }/>

              <Route path={"/game"} render={() => {
                  return(
                    <>
                    {
                      (
                        this.state.itoken &&
                        (
                          <Games
                            getMetadata={this.getMetadata}
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            initLibp2p={this.initLibp2p}
                            {...this.state}
                          />
                        )
                      )
                    }
                    </>
                  )
                }
              }/>

              <Route path={"/owned-avatars"} render={() => {
                  return(
                    <>
                    {
                      (
                        this.state.itoken ?
                        (
                          <OwnedAvatars
                            checkClaimed={this.checkClaimed}
                            claim={this.claim}
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            {...this.state}
                          />
                        ):
                        (
                          (this.state.netId === 4 || this.state.netId === 0x64) ?
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>Loading ...</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu'
                                }
                              />
                              <Spinner size="xl" />
                              </VStack>
                            </Center>
                          ) :
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>WRONG NETWORK</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu'
                                }
                              />
                              <p>Please connect to xDai network</p>
                              </VStack>
                            </Center>
                          )
                        )
                      )
                    }
                    </>
                  )
                }
              }/>

              <Route path={"/all-avatars"} render={() => {
                  return(
                    <>
                    {
                      (
                        this.state.itoken ?
                        (
                          <AllAvatars
                            initWeb3={this.initWeb3}
                            checkTokens={this.checkTokens}
                            {...this.state}

                          />
                        ):
                        (
                          (this.state.netId === 4 || this.state.netId === 0x64) ?
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>Loading ...</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu'
                                }
                              />
                              <Spinner size="xl" />
                              </VStack>
                            </Center>
                          ) :
                          (
                            <Center>
                             <VStack spacing={4}>
                              <Heading>WRONG NETWORK</Heading>
                              <Avatar
                                size={'xl'}
                                src={
                                  'https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu'
                                }
                              />
                              <p>Please connect to xDai network</p>
                              </VStack>
                            </Center>
                          )
                        )
                      )
                    }
                    </>
                  )
                }
              }/>

              <Route render={() => {

                return(
                  <Redirect to="/created-avatars" />
                );

              }} />
            </Switch>
          </Grid>
          <Center my="6">
            <HStack
              spacing="10px"
              fontSize="sm"
              flexDirection={{ base: 'column-reverse', lg: 'row' }}
            >
            <Link href="https://t.me/thehashavatars" isExternal>Telegram <ExternalLinkIcon mx="2px" /></Link>
            <Link href="https://twitter.com/thehashavatars" isExternal>Twitter <ExternalLinkIcon mx="2px" /></Link>
            <Link href="https://github.com/henrique1837/snowflakeshash-dapp" isExternal>Github <ExternalLinkIcon mx="2px" /></Link>
            {
              (
                this.state.netId === 4 &&
                (
                  <Link  href={`https://rinkeby.client.aragon.org/#/erc20testdaohash.aragonid.eth`} isExternal>GovBETA {' '}<ExternalLinkIcon mx="2px" /></Link>
                )
              )
            }
            {
              (
                this.state.room &&
                (
                  <>
                    <Tooltip label="Peers connected to you" aria-label="peers">
                      <Image boxSize="20px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABfElEQVRIie2VOU4DQRBFn0diSMFEOOMADlhugAVYJIhVgsiJgZD1GGa7BBbXMCDMAbDBiFWCCDKQjMQQzG8NjNrjGRCZK2n9X69cVnd1D3TiDzH8TywOsA98ArkYfE7sjmrbxgHgAR9AIQZfEOupSWTMCWwCY/JSEbzJTajGA6Zbwd3Ag6BNeRngGMha+KxyGekt1d4Brq3BkoCa/pkLnMs7tPBl5apiU0Bd3oKtwZGSa9Kr0ldA2sKngYaYFXkb0mVbgxslB6VPpWekJ4FH/G3My5sVcyI9JH1ta/CuZI/0a0ib8/GAe3m90i8h/WZ+NM7cRk1R2/je4FnrgNaa1lGtRYItKsozF/EiVPtka2YOeV3aHHID+yH34e+1ByzLM4dsmzoWlawTjGk1osCM6ZlYB7iUN29r4OIfnod/acC/RBVaX7QK0C+9rdpboMvWAIKxawLj8uI8FXmC92gqggdgj98/dqUYPA6wS/LnukTCkR5JwCb64HTiR3wBnYJtcaM+zzsAAAAASUVORK5CYII="/>
                    </Tooltip>
                    <small>{this.state.peersOnline} peers</small>

                  </>
                )
              )
            }
            </HStack>
          </Center>
        </Box>
      </ChakraProvider>

      </Router>
    )
  }
}

export default App
