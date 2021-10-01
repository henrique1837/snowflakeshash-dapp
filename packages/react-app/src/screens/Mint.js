import React,{useMemo,useState,useCallback} from "react";
import ReactDOMServer from 'react-dom/server';

import { Container,Row,Col,Image,Spinner } from 'react-bootstrap';
import { Button,TextInput,TransactionBadge,ProgressBar,IconLink } from '@aragon/ui';
import Avatar from 'avataaars';
import IPFS from 'ipfs-http-client-lite';

import { useAppContext } from '../hooks/useAppState'
import useWeb3Modal from "../hooks/useWeb3Modal";
import useContract from "../hooks/useContract";
import hydroIdenticon from '../assets/snowflakes.js';

const ipfs = IPFS({
  apiUrl: 'https://ipfs.infura.io:5001'
})
function Mint(){
  const {loadWeb3Modal,coinbase} = useWeb3Modal();
  const {getMetadata,getTotalSupply} = useContract();
  const { state } = useAppContext();

  const [name,setName] = useState();
  const [description,setDescription] = useState();
  const [randomized,setRandomized] = useState();
  const [minting,setMinting] = useState(false);
  const [canMint,setCanMint] = useState(true);
  const [focused,setFocused] = useState(false);

  const [mintingMsg,setMintingMsg] = useState(false);
  const [pendingTx,setPendingTx] = useState(false);

  const randomize = useCallback(() => {
    const icon = hydroIdenticon.create({ // All options are optional
        // seed used to generate icon data, default: random
         // width/height of the icon in pixels, default: 125
    });
    document.getElementById('icon').innerHTML = '';
    document.getElementById('icon').appendChild(icon)


  },[document.getElementById('icon')])

  const mint = useCallback(async () => {
    try{
      setMinting(true);
      if(name.replace(/ /g, '') === "" || !name){
        setMinting(false);
        return;
      }
      setMintingMsg(<p><small>Checking all tokens already minted ... </small></p>);

      const promises = [];
      const totalSupply = await getTotalSupply();
      for(let i = 1; i <= totalSupply; i++){
        promises.push(getMetadata(i,state.hashavatars))
      }

      const metadatas = await Promise.allSettled(promises);
      let cont = true;

      metadatas.map(obj => {
        //const obj = JSON.parse(string);
        if(obj.name === name) {
          cont = false
        }
      });
      if(!cont){
        alert("HashAvatar with that name already claimed");
        setMintingMsg(null);
        setMinting(false);
        return;
      }
      setMintingMsg(<p><small>Storing image and metadata at IPFS ... </small></p>);
      const imgres = await ipfs.add(document.getElementById('icon').innerHTML);
      const metadata = {
          name: name,
          image: `ipfs://${imgres[0].hash}`,
          external_url: `https://snowflakeshash.com/`,
          description: description
      }
      const res = await ipfs.add(JSON.stringify(metadata));
      const uri = res[0].hash;
      console.log(uri)
      setMintingMsg(<p><small>Approve transaction ... </small></p>);
      const id = Number(await state.hashavatars.methods.totalSupply().call()) + 1;
      console.log(id)
      const fees = [{
        recipient: state.coinbase,
        value: 500
      }];

      await state.hashavatars.methods.mint(id,fees,1,uri).send({
        from: state.coinbase,
        value: 10 ** 18,
        gasPrice: 1000000000
      }).once('transactionHash',(hash) => {
        setMintingMsg(
          <div>
           Tx sent <TransactionBadge transaction={hash} networkType={state.netId === 4 ? "rinkeby" : "xdai"} />
          </div>
        )
        /*
        this.setState({
          mintingMsg: <p><small>Transaction <Link href={`https://blockscout.com/xdai/mainnet/tx/${hash}`} isExternal >{hash}</Link> sent, wait confirmation ...</small></p>
        });
        */
      });
      setMintingMsg(<p><small>Transaction confirmed!</small></p>)
      setTimeout(() => {
        setMinting(false);
        setMintingMsg(null)
      },5000)

    } catch(err){
      setMintingMsg(<p><small>{err.message}</small></p>)
      setTimeout(() => {
        setMinting(false);
        setMintingMsg(null);
      },2000)
    }
  },[state,getMetadata,getTotalSupply,state.hashavatars,document.getElementById('icon')]);


  const handleOnChange = useCallback(async (e) => {
        e.preventDefault();
        if(e.target.name === "description"){
          setDescription(e.target.value)
          return;
        }
        try{
          const web3 = state.provider;
          const hashname = e.target.value.trim()

          const icon = hydroIdenticon.create({ // All options are optional
              seed: web3.utils.sha3(hashname), // seed used to generate icon data, default: random
              // width/height of the icon in pixels, default: 125
          });
          document.getElementById('icon').innerHTML = '';
          document.getElementById('icon').appendChild(icon)
          /*
          if(state.loadingNFTs && state.hashavatars){
            const promises =[];
            const totalSupply = await getTotalSupply();
            for(let i = 1; i <= totalSupply; i++){
              promises.push(getMetadata(i,state.hashavatars))
            }
            metadatas = await Promise.allSettled(promises);
            alert(metadatas.length)
            metadatas = metadatas.map(obj => {
              return(JSON.stringify(obj))
            })
          } else {

          }
          */
          const metadatas = state.nfts.map(str => {
            const obj = JSON.parse(str);
            return(obj.metadata);
          });
          let cont = true;

          metadatas.map(obj => {
            //const obj = JSON.parse(string);
            if(obj.name === hashname) {
              cont = false
              setName(null);
            }
            return(obj)
          });
          if(!cont){
            setCanMint(false);
            return;
          }
          setCanMint(true);
          setName(hashname);

      } catch(err){
        console.log(err)
      }

  },[document.getElementById('icon'),state.nfts]);



  useMemo(() => {
    if(document.getElementById('icon') && !randomized){
      randomize();
      setRandomized(true);
    }
    if(document.getElementById("input_name") && !focused){
      setFocused(true);
      document.getElementById("input_name").focus();
      document.getElementById("input_name").select();
    }
  },[randomize,focused,document.getElementById("input_name"),document.getElementById('icon'),randomized])

  return(
    <>
      <Container>
        <center>
          <p>The <b>Snowflakes</b> are Avatars waiting to be claimed by anyone on xDai Chain.</p>
          <p>Once you select the avatar's name a specific avatar figure will be generated and you can mint a single copy of it.</p>
          <p>Choose your preferred Snowflake and start your collection now!</p>
          <p>The maximum amount of Snowflakes that will exists is 200000</p>
        </center>
        <center>
          <div id="icon" style={{width: '150px'}}></div>
        </center>
        <center>
          <p>Select the name of your Snowflake and claim it!</p>
          <p>{state.totalSupply && <small>There are {200000 - state.totalSupply} snowflakes to be minted</small>}</p>
        </center>
        <center style={{marginBottom: '10px',marginTop: '10px'}}>
          <TextInput placeholder="Snowflake's Name"
                     onChange={handleOnChange}
                     id="input_name"
                     name="name"
          />
        </center>
        <center style={{marginBottom: '10px',marginTop: '10px'}}>
          <TextInput placeholder="Snowflake's Description"
                     onChange={handleOnChange}
                     id="input_description"
                     name="description"
          />
        </center>
        <center>
        {
          (
            state.coinbase ?
            (
                !minting && !pendingTx ?
                (
                  canMint ? (<Button onClick={mint}>Claim</Button>) : ("Snowflake with that name already claimed")
                ) :
                (
                  <div style={{wordBreak: 'break-word'}}>
                    <Spinner animation="border" size="2xl"/>
                    {mintingMsg}
                  </div>
                )

            ) :
            !coinbase && window.ethereum ?
            <Button onClick={loadWeb3Modal}>Connect Wallet</Button> :
            !window.ethereum && <Button onClick={() => {window.open("https://metamask.io/", '_blank')}}>Install Metamask <IconLink/></Button>


          )
        }
        </center>
        {
          state.coinbase &&
          state.loadingNFTs &&
          state.nfts &&
          state.totalSupply &&
          <center>
          <p>Loading all Snowflakes ...</p>
          <ProgressBar
            value={state.nfts?.length/state.totalSupply}
          />
          </center>
        }
        {
          state.myNfts.length > 0 &&
          <>
          <h4>Snowflakes created by you</h4>
          <Row style={{textAlign: 'center'}}>
          {
            state.myNfts?.map(str => {
              const obj = JSON.parse(str);
              return(
                <Col style={{paddingTop:'80px'}}>
                  <center>
                    <div>
                      <p>{obj.metadata.name}</p>
                    </div>
                    <div>
                      <Image src={obj.metadata?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="150px"/>
                    </div>
                  </center>
                </Col>
              )
            })
          }
          </Row>
          </>
        }
      </Container>
    </>
  )
}

export default Mint;