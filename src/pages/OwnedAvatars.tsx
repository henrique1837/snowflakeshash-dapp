import * as React from "react";
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
  Center,
  Alert,
  AlertIcon,
  Spinner,
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

import Avatar from 'avataaars';


class AllAvatars extends React.Component {

  state = {
    savedBlobs: [],
  }
  constructor(props){
    super(props)
    this.handleEvents = this.handleEvents.bind(this);
    this.checkTokens = this.props.checkTokens;
  }
  componentDidMount = async () => {
    //await this.props.initWeb3();
    const promises = [];
    const results = await this.props.checkTokens();
    for(let res of results){
      promises.push(this.handleEvents(null,res));
    }
    await Promise.all(promises)
    const itoken = this.props.itoken;
    itoken.events.TransferSingle({
      filter: {
        to: this.props.coinbase
      },
      fromBlock: 'latest'
    }, this.handleEvents);

    let hasNotConnected = true;
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
        let toClaim = await Promise.all(claimed);
        console.log(toClaim)
        toClaim = toClaim.filter(item => {
          if(item.hasClaimed === false && this.props.coinbase.toLowerCase() === item.creator.toLowerCase()){
            return(item);
          }
        });
        console.log(toClaim)
        const itoken = this.props.itoken;
        hasNotConnected = false;
        this.setState({
          toClaim: toClaim
        });
      }
    },500);
  }

  handleEvents = async (err, res) => {
    try {
      const web3 = this.props.web3;
      let uri = await this.props.itoken.methods.uri(res.returnValues._id).call();
      console.log(uri)
      if(uri.includes("ipfs://ipfs/")){
        uri = uri.replace("ipfs://ipfs/", "")
      } else {
        uri = uri.replace("ipfs://", "");
      }
      console.log(uri)
      console.log(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text())
      const metadata = JSON.parse(await (await fetch(`https://ipfs.io/ipfs/${uri}`)).text());


      console.log(metadata)
      const obj = {
        returnValues: res.returnValues,
        metadata: metadata
      }
      const balance = await this.props.itoken.methods.balanceOf(this.props.coinbase,res.returnValues._id).call();
      if(balance > 0 && !this.state.savedBlobs.includes(JSON.stringify(obj))){
        this.state.savedBlobs.push(JSON.stringify(obj));
        await this.forceUpdate();
      }

    } catch (err) {
      console.log(err);
    }
  }
  render(){
    return(
        <Box>
          <VStack spacing={12}>
            <Box>
            <Heading>Snowflakes you own</Heading>
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

export default AllAvatars
