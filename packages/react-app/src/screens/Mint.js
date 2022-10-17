import React,{useMemo,useState,useCallback} from "react";

import { Container,Row,Col,Spinner } from 'react-bootstrap';
import { Button,TextInput,TransactionBadge,ProgressBar,IconLink,LoadingRing,Link } from '@aragon/ui';

import { NFTStorage, Blob } from 'nft.storage'
import { ethers } from "ethers";

import { useAppContext } from '../hooks/useAppState'
import hydroIdenticon from '../assets/snowflakes.js';

const NFT_STORAGE_TOKEN = process.env.REACT_APP_NFT_STORAGE_API
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

function Mint(){
  const { state } = useAppContext();

  const [name,setName] = useState();
  const [description,setDescription] = useState();
  const [randomized,setRandomized] = useState();
  const [minting,setMinting] = useState(false);
  const [canMint,setCanMint] = useState(true);
  const [focused,setFocused] = useState(false);

  const [mintingMsg,setMintingMsg] = useState(false);
  const [loadingHydro,setLoadingHydro] = useState(true);

  const iconDom = document.getElementById('icon')
  const nameDom = document.getElementById('input_name')

  const randomize = useCallback(() => {
    const icon = hydroIdenticon.create({ // All options are optional
        // seed used to generate icon data, default: random
         // width/height of the icon in pixels, default: 125
    });
    iconDom.innerHTML = '';
    iconDom.appendChild(icon)
    setLoadingHydro(false);

  },[iconDom])

  const mint = useCallback(async () => {
    try{
      setMinting(true);
      if(name.replace(/ /g, '') === "" || !name){
        setMinting(false);
        return;
      }
      setMintingMsg(<p><small>Checking all tokens already minted ... </small></p>);

      const promises = [];
      const totalSupply = await state.getTotalSupply();
      for(let i = 1; i <= totalSupply; i++){
        promises.push(state.getMetadata(i,state.hashavatars))
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
        alert("Snowflake with that name already claimed");
        setMintingMsg(null);
        setMinting(false);
        return;
      }
      setMintingMsg(<p><small>Storing image and metadata at IPFS ... </small></p>);
      //const imgres = await ipfs.add(iconDom.innerHTML);
      const storageResImg = await NFTStorage.encodeBlob(new Blob([iconDom.innerHTML]));
      const imgUri = await client.storeCar(storageResImg.car);

      const metadata = {
          name: name,
          description: description,
          image: `ipfs://${imgUri}`,
          external_url: `https://dweb.link/ipns/snowflakeshash.crypto`
      }
      //const res = await ipfs.add(JSON.stringify(metadata));
      //const uri = res[0].hash;
      const storageRes = await NFTStorage.encodeBlob(new Blob([JSON.stringify(metadata)]));
      const uri = await client.storeCar(storageRes.car);
      console.log(uri)
      setMintingMsg(
        <>
        <p><small>Metadata stored at <Link href={`${state.gateways[Math.floor(Math.random()*state.gateways.length)]}${uri}`} external><IconLink/>{uri}</Link>.</small></p>
        <p><small>Approve transaction ... </small></p>
        </>
      );
      const id = Number(await state.hashavatars.totalSupply()) + 1;
      console.log(id)
      const fees = [{
        recipient: state.coinbase,
        value: 500
      }];
      const signer = state.provider.getSigner()

      const tokenWithSigner = state.hashavatars.connect(signer);

      const tx = await tokenWithSigner.mint(id,fees,1,uri,{
        value: ethers.utils.parseEther('1')
      });
      setMintingMsg(
        <div>
         Tx sent <TransactionBadge transaction={tx.hash} networkType={state.netId === 4 ? "rinkeby" : "xdai"} />
        </div>
      )

      await tx.wait();

      setMintingMsg(<p><small>Transaction confirmed!</small></p>)
      setTimeout(() => {
        setMinting(false);
        setMintingMsg(null)
      },10000)

    } catch(err){
      setMintingMsg(<p style={{overflowX: "auto"}}><small>{err.message.split("reverted: ")[1]?.split('",')[0] ? err.message.split("reverted: ")[1].split('",')[0] : err.message }</small></p>)
      setTimeout(() => {
        setMinting(false);
        setMintingMsg(null);
      },4000)
    }
  },[
    state,
    state.getMetadata,
    state.getTotalSupply,
    state.hashavatars,
    iconDom,
    name,
    description
  ]);


  const handleOnChange = useCallback(async (e) => {
        e.preventDefault();
        if(e.target.name === "description"){
          setDescription(e.target.value)
          return;
        }
        try{
          const hashname = e.target.value.trim()

          const icon = hydroIdenticon.create({ // All options are optional
              seed: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(hashname)), // seed used to generate icon data, default: random
              // width/height of the icon in pixels, default: 125
          });
          iconDom.innerHTML = '';
          iconDom.appendChild(icon)

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
        alert(err)
        console.log(err)
      }

  },[iconDom,state.nfts]);



  useMemo(() => {
    if(iconDom && !randomized){
      randomize();
      setRandomized(true);
    }
    if(nameDom && !focused){
      setFocused(true);
      nameDom.focus();
      nameDom.select();
    }
  },[randomize,focused,nameDom,iconDom,randomized])

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
          {
            loadingHydro &&
            <LoadingRing />
          }
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
        <center>
        {
          (
            state.coinbase ?
            (
                !minting ?
                (
                  state.hashavatars && !state.connecting ?
                  (
                    canMint ?
                    name &&
                    <Button onClick={mint}>Claim</Button> :
                    <p>HashAvatar with that name already claimed</p>
                  ) :
                  <p><LoadingRing/><small>Loading smart contract</small></p>
                ) :
                (
                  <div style={{wordBreak: 'break-word'}}>
                    <Spinner animation="border" size="2xl"/>
                    {mintingMsg}
                  </div>
                )

            ) :
            !state.coinbase && window.ethereum ?
            state.hashavatars && <Button onClick={state.loadWeb3Modal}>Connect Wallet</Button> :
            !window.ethereum && <Button onClick={() => {window.open("https://metamask.io/", '_blank')}}>Install Metamask <IconLink/></Button>


          )
        }
        </center>
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
          state.myNfts?.length > 0 &&
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
                      <img src={obj.metadata?.image.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])} width="150px"/>
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
