import * as React from "react";
import ReactDOMServer from 'react-dom/server';
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
  Alert,
  AlertIcon,
  Select,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Avatar as Av
} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'


import IPFS from 'ipfs-http-client-lite';
import hydroIdenticon from '../assets/snowflakes.js';


const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})


class MintPage extends React.Component {

  state = {
    savedBlobs: [],
    allSnowflakes: [],
    supply: 1,
    royalites: 500,
    minting: false,
    mintingMsg: '',
    toClaim: [],
    type: "snowflakes",
    canMint: true
  }
  constructor(props){
    super(props)
    this.randomize = this.randomize.bind(this);
    this.mint = this.mint.bind(this);
  }
  componentDidMount = async () => {
    try{
      //await this.props.initWeb3();
      document.getElementById("input_name").focus();
      document.getElementById("input_name").select();
      this.randomize();
      setInterval(async () => {
        if(this.props.savedBlobs.length !== this.state.allSnowflakes){
          this.checkEvents();
        }
      },1000);



    } catch(err){

    }
  }

  randomize = async () => {

    const icon = hydroIdenticon.create({ // All options are optional
        // seed used to generate icon data, default: random
         // width/height of the icon in pixels, default: 125
    });
    document.getElementById('icon').innerHTML = '';
    document.getElementById('icon').appendChild(icon)



  }


  mint = async () => {
    try{
      this.setState({
        minting: true
      });
      if(this.state.name.replace(/ /g, '') === "" || !this.state.name){
        this.setState({
          minting: false
        });
        return;
      }
      this.setState({
        mintingMsg: <p><small>Checking all tokens already minted ... </small></p>
      });
      const results = await this.props.checkTokens();
      let metadatas = this.props.savedBlobs.map(string => {
        const obj = JSON.parse(string)
        return(obj.metadata)
      })

      if(this.props.loadingAvatars){
        const metaPromises = []
        for(let res of results){
          if(this.props.netId === 4 && res.returnValues._id === 32){
            continue
          }
          const metadataToken = this.props.getMetadata(res.returnValues._id);
          metaPromises.push(metadataToken)
        }
        metadatas = await Promise.all(metaPromises);
      }
      let cont = true;
      let dnaNotUsed = true;
      metadatas.map(obj => {
        //const obj = JSON.parse(string);
        if(obj.name === this.state.name ){ //&& obj.attributes[0].value === this.state.type) {
          cont = false
        }
      });
      if(!cont){
        alert("Snowflake with that name and type already claimed");
        this.setState({
          minting: false
        });
        return;
      }
      if(isNaN(this.state.royalites) || this.state.royalites < 0 || this.state.royalites > 2000) {
        alert("Royalites must be a number, miminum value allowed is 0 and maximum is 20");
        this.setState({
          minting: false
        });
        return;
      }
      this.setState({
        mintingMsg: <p><small>Storing image and metadata at IPFS ... </small></p>
      });
      const imgres = await ipfs.add(document.getElementById('icon').innerHTML);
      metadatas.map(obj => {
        //const obj = JSON.parse(string);
        if(obj.image === imgres[0].hash) {
          dnaNotUsed = false
        }
      });
      if(!dnaNotUsed){
        alert("Snowflake already claimed!");
        this.setState({
          minting: false
        });
        return;
      }
      let description = "Generate and mint snowflakes as ERC1155 NFT"
      if(this.state.description){
        description = this.state.description
      }
      let metadata = {
          name: this.state.name,
          image: `ipfs://${imgres[0].hash}`,
          external_url: `https://thesnowflakes.com`,
          description: description
      }
      const res = await ipfs.add(JSON.stringify(metadata));
      //const uri = res[0].hash;
      const uri = res[0].hash;
      this.setState({
        mintingMsg: <p><small>Approve transaction ... </small></p>
      });
      const id = Number(await this.props.itoken.methods.totalSupply().call()) + 1;
      console.log(id)

      let fees = [{
        recipient: this.props.coinbase,
        value: this.state.royalites
      }];
      if(this.state.royalites <= 0){
        fees = [];
      }
      await this.props.itoken.methods.mint(id,fees,1,uri).send({
        from: this.props.coinbase,
        value: 10 ** 18,
        gasPrice: 1000000000
      }).once('transactionHash',(hash) => {
        this.setState({
          mintingMsg: <p><small>Transaction <a href={`https://blockscout.com/xdai/mainnet/tx/${hash}`} target="_blank" >{hash}</a> sent, wait confirmation ...</small></p>
        });
      }).once('transactionHash',(hash) => {
        this.setState({
          mintingMsg: <p><small>Transaction <Link href={`https://blockscout.com/xdai/mainnet/tx/${hash}`} isExternal >{hash}</Link> sent, wait confirmation ...</small></p>
        });
      });
      this.setState({
        mintingMsg: <p><small>Transaction confirmed!</small></p>
      });
      setTimeout(() => {
        this.setState({
          minting: false
        });
      },2000);
    } catch(err){
      this.setState({
        mintingMsg: <p><small>{err.message}</small></p>
      });
      setTimeout(() => {
        this.setState({
          minting: false
        });
      },2000)
    }
  }



  handleOnChange = (e) => {
    e.preventDefault();
    if(e.target.name === "description"){
      this.setState({
        description: e.target.value
      });
      return;
    }
    if(e.target.name === "royalites"){
      this.setState({
        royalites: e.target.value*100
      });
      return;
    }
    try{
      const web3 = this.props.web3;
      const icon = hydroIdenticon.create({ // All options are optional
          seed: web3.utils.sha3(e.target.value.trim()), // seed used to generate icon data, default: random
          // width/height of the icon in pixels, default: 125
      });
      document.getElementById('icon').innerHTML = '';
      document.getElementById('icon').appendChild(icon)
      const metadatas = this.props.savedBlobs.map(str => {
        const obj = JSON.parse(str);
        return(obj.metadata);
      });
      let cont = true;
      metadatas.map(obj => {
        if(obj.name === e.target.value.trim()) {
          cont = false
        }
      });
      if(!cont){
        this.setState({
          canMint: false
        });
        return;
      }
      this.setState({
        name: e.target.value.trim()
      });
    } catch(err){
      console.log(err)
    }
  }
  checkEvents = async () => {

    this.state.allSnowflakes = this.props.savedBlobs;
    this.state.allSnowflakes.map(async str => {
      const obj = JSON.parse(str);

      if(this.props.coinbase){
        if(obj.creator.toLowerCase() === this.props.coinbase.toLowerCase() && !this.state.savedBlobs.includes(JSON.stringify(obj))){
          this.state.savedBlobs.push(JSON.stringify(obj));
        }

      }
      if(this.props.rewards !== undefined && this.props.coinbase){
        const claim = await this.props.checkClaimed(obj.returnValues._id);
        if(claim.hasClaimed === false && this.props.coinbase.toLowerCase() === claim.creator?.toLowerCase()){
          this.state.toClaim.push(claim);
        }
      }
    })
    this.forceUpdate()
  }
  render(){
    return(
        <Box>
          <VStack spacing={4}>
            <Box>
              <Heading>Snowflakes</Heading>
            </Box>

            <Box align="center">
              <Text fontSize="sm">
                <p>The <b>Snowflakes</b> are Avatars waiting to be claimed by anyone on xDai Chain.</p>
                <p>Once you select the avatar's name a specific avatar figure will be generated and you can mint a single copy of it.</p>
                <p>Choose your preferred Snowflake and start your collection now!</p>
                <p>The maximum amount of Snowflakes that will exists is 200000</p>
              </Text>
            </Box>
            <Box align="center">
              <div id="icon" style={{width: '150px'}}></div>
              <Text>
                <p>Select the name of your Snowflake and claim it!</p>
                <p><small>There are {200000 - this.state.allSnowflakes.length} snowflakes to be minted</small></p>
                <Input placeholder="Snowflake's Name" size="md" id="input_name" onChange={this.handleOnChange} onKeyUp={this.handleOnChange} style={{marginBottom: '10px'}}/>
                <Input placeholder="Welcome message (optional)" size="md" onChange={this.handleOnChange} onKeyUp={this.handleOnChange} name="description" style={{marginBottom: '10px'}}/>
                {/*<Input placeholder="Creator's royalites (default 5%)" size="md" onChange={this.handleOnChange} onKeyUp={this.handleOnChange} name="royalites" style={{marginBottom: '10px'}}/>*/}

                {
                  (
                    this.props.coinbase ?
                    (
                      !this.state.minting ?
                      (
                        this.state.canMint ? (<Button onClick={this.mint}>Claim</Button>) : ("Snowflake with that name already claimed")
                      ) :
                      (
                        <>
                        <Spinner size="xl" />
                        {this.state.mintingMsg}
                        </>
                      )
                    ) :
                    (
                      !this.props.loading ?
                      (
                        <Button onClick={this.props.connectWeb3}>Connect Wallet</Button>
                      ) :
                      (
                        <>
                        <Spinner size="xl" />
                        </>
                      )
                    )
                  )
                }

              </Text>
            </Box>
            <Box>
            {
              this.props.loadingAvatars &&
              (
                <Center>
                 <VStack spacing={4}>
                  <p>Loading all Snowflakes</p>
                  <Spinner size="md" />
                  </VStack>
                </Center>
              )
            }
            </Box>
            {
              this.state.savedBlobs.length > 0 &&
              (
                <Box>
                  <Heading>Snowflakes Created by you</Heading>
                </Box>
              )
            }
            <Box>
            <SimpleGrid
              columns={{ sm: 1, md: 6 }}
              spacing="40px"
              mb="20"
              justifyContent="center"
            >
            {
              this.state.savedBlobs?.map((string) => {
                const blob = JSON.parse(string);
                return(
                  <Box
                    rounded="2xl"
                    p="5"
                    borderWidth="1px"
                    _hover={{ boxShadow: '2xl', background: this.state.cardHoverBg }}
                  >
                    <Popover>
                      <PopoverTrigger>
                      <LinkBox
                        // h="200"
                        role="group"
                        as={Link}
                      >
                        <Text
                          fontSize="sm"
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <LinkOverlay
                            style={{fontWeight: 600 }}
                            href={blob.url}
                          >
                            {blob.metadata.name}
                          </LinkOverlay>
                        </Text>
                        <Divider mt="4" />
                        <Center>
                          <Av src={blob.metadata.image.replace("ipfs://","https://ipfs.io/ipfs/")} size="2xl"/>
                        </Center>

                      </LinkBox>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>{blob.metadata.name}</PopoverHeader>
                        <PopoverBody>
                          {blob.metadata.description}
                        </PopoverBody>
                        <PopoverFooter>
                          <p><small>Token ID: {blob.returnValues._id}</small></p>
                          <p><small><Link href={`https://epor.io/tokens/${this.props.itoken.options.address}/${blob.returnValues._id}`} target="_blank">View on Epor.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                          <p><small><Link href={`https://unifty.io/xdai/collectible.html?collection=${this.props.itoken.options.address}&id=${blob.returnValues._id}`} target="_blank">View on Unifty.io{' '}<ExternalLinkIcon fontSize="18px" /></Link></small></p>
                        </PopoverFooter>

                      </PopoverContent>
                    </Popover>
                  </Box>
                )
              })
            }
            </SimpleGrid>
            </Box>
          </VStack>
        </Box>


    )
  }
}

export default MintPage
