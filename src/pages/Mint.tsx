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
    toClaim: [],
    type: "snowflakes"
  }
  constructor(props){
    super(props)
    this.randomize = this.randomize.bind(this);
    this.handleEvents = this.handleEvents.bind(this);
    this.mint = this.mint.bind(this);
  }
  componentDidMount = async () => {
    try{
      //await this.props.initWeb3();
      document.getElementById("input_name").focus();
      document.getElementById("input_name").select();
      this.randomize();
      const promises = [];
      const results = await this.props.checkTokens();
      for(let res of results){
        promises.push(this.handleEvents(null,res));
      }
      await Promise.all(promises)
      const itoken = this.props.itoken;

      itoken.events.TransferSingle({
        filter: {
          from: '0x0000000000000000000000000000000000000'
        },
        fromBlock: 'latest'
      }, this.handleEvents);
      let hasNotConnected = !this.props.coinbase;
      setInterval(async () => {
        if(this.props.provider && hasNotConnected){
          const promises = [];
          const claimed = [];
          const results = await this.props.checkTokens();
          for(let res of results){
            promises.push(this.handleEvents(null,res));
            claimed.push(this.props.checkClaimed(res.returnValues._id));
          }
          await Promise.all(promises)
          if(this.props.rewards){
            let toClaim = await Promise.all(claimed);

            console.log(toClaim)
            toClaim = toClaim.filter(item => {
              if(item.hasClaimed === false && this.props.coinbase.toLowerCase() === item.creator?.toLowerCase()){
                return(item);
              }
            });
            console.log(toClaim);
            this.setState({
              toClaim: toClaim
            });
          }

          hasNotConnected = false;
        }
      },500);

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
      const metadatas = []
      for(let res of results){
        const uriToken = await this.props.itoken.methods.uri(res.returnValues._id).call();
        const metadataToken = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uriToken.replace("ipfs://","")}`)).text());
        metadatas.push(metadataToken)
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
      const ipfs = this.props.ipfs;
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
      });
      this.setState({
        minting: false
      });
    } catch(err){
      console.log(err);
      this.setState({
        minting: false
      });
    }
  }


  handleEvents = async (err, res) => {
    try {
      const web3 = this.props.web3;
      let uri = await this.props.itoken.methods.uri(res.returnValues._id).call();
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }

      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());

      const obj = {
        returnValues: res.returnValues,
        metadata: metadata
      }
      if (!this.state.allSnowflakes.includes(JSON.stringify(obj))) {
        this.state.allSnowflakes.push(JSON.stringify(obj));
        await this.forceUpdate();
      }
      if(!this.props.coinbase){
        return
      }
      const balance = await this.props.itoken.methods.balanceOf(this.props.coinbase,res.returnValues._id).call();
      const creator = await this.props.itoken.methods.creators(res.returnValues._id).call();

      if(creator.toLowerCase() === this.props.coinbase.toLowerCase() && !this.state.savedBlobs.includes(JSON.stringify(obj))){
        this.state.savedBlobs.push(JSON.stringify(obj));
        await this.forceUpdate();
      }
      if(this.props.rewards){
        const claim = await this.props.checkClaimed(res.returnValues._id);
        if(claim.hasClaimed === false && this.props.coinbase.toLowerCase() === claim.creator?.toLowerCase()){
          this.state.toClaim.push(claim);
          await this.forceUpdate();
        }
      }

    } catch (err) {
      console.log(err);
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

      this.setState({
        name: e.target.value.trim()
      })
    } catch(err){
      console.log(err)
    }
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
                        <Button onClick={this.mint}>Claim</Button>
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
            <Heading>Snowflakes Created by you</Heading>
            </Box>
            <Box>
            <SimpleGrid
              columns={{ sm: 1, md: 5 }}
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
                          <object type="text/html"
                          data={`https://ipfs.io/ipfs/${blob.metadata.image.replace("ipfs://","")}`}
                          width="196px"
                          style={{borderRadius: "100px"}}>
                          </object>
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
