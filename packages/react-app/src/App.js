import React,{useEffect,useState} from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import { Main,Box,Link,IconLink } from '@aragon/ui';

import useWeb3Modal from "./hooks/useWeb3Modal";
import useContract from "./hooks/useContract";
import { AppContext, useAppState } from './hooks/useAppState'

import Home from "./screens/Home";
import Mint from "./screens/Mint";
import Profile from "./screens/Profile";
//import GamesPage from "./screens/Games";

//import Feedbacks from "./screens/Feedbacks";

import AllAvatars from "./screens/AllAvatars";

import Menu from "./components/Menu";


//import GET_TRANSFERS from "./graphql/subgraph";


function App() {

  const {provider,coinbase,netId,profile} = useWeb3Modal();
  const {hashavatars,creators,nfts,loadingNFTs,myNfts,myOwnedNfts,totalSupply} = useContract();
  const { state, actions } = useAppState()
  const [nftsLength,setNftsLength] = useState();
  const [myNftsLength,setMyNftsLength] = useState();
  const [myOwnedNftsLength,setMyOwnedNftsLength] = useState();

  const [previousCoinbase,setPrevCoinbase] = useState();
  const [previousNetId,setPrevsNetId] = useState();
  const [previousHashAvatars,setPrevsHashAvatars] = useState();
  const [previousCreators,setPrevsCreators] = useState();
  const [previousTotalSupply,setPrevsTotalSupply] = useState();
  const [previousLoadingNFTs,setPrevsLoadingNFTs] = useState();

  useEffect(() => {
    if((coinbase !== previousCoinbase) || (netId !== previousNetId) ){
      setPrevCoinbase(coinbase);
      setPrevsNetId(netId);
      actions.setProvider(provider);
      actions.setNetId(netId);
      actions.setCoinbase(coinbase);
      actions.setProfile(profile);
    }


    if(hashavatars !== previousHashAvatars){
      actions.setHashAvatars(hashavatars);
      setPrevsHashAvatars(hashavatars)
    }
    if(nfts && nftsLength !== nfts.length){
      actions.setNfts(nfts)
      setNftsLength(nfts.length);
    }

    if(myNfts && myNftsLength !== myNfts.length){
      actions.setMyNfts(myNfts);
      setMyNftsLength(myNfts.length);
    }
    if(myOwnedNfts && myOwnedNftsLength !== myOwnedNfts.length){
      actions.setMyOwnedNfts(myOwnedNfts);
      setMyOwnedNftsLength(myOwnedNfts.length);
    }

    if(loadingNFTs !== previousLoadingNFTs){
      actions.setLoadingNFTs(loadingNFTs)
      setPrevsLoadingNFTs(loadingNFTs)

    }
    if(totalSupply !== previousTotalSupply){
      actions.setTotalSupply(totalSupply)
      setPrevsTotalSupply(totalSupply)

    }
    if(creators !== previousCreators){
      actions.setCreators(creators)
      setPrevsCreators(creators)

    }
  },[
    actions,
    provider,
    coinbase,
    netId,
    hashavatars,
    nfts,
    myNfts,
    loadingNFTs,
    creators,
    totalSupply,
    myNftsLength,
    nftsLength,
    previousCoinbase,
    myOwnedNfts,
    myOwnedNftsLength,
    profile
  ]);

  return (
    <Main>


      <AppContext.Provider value={{ state, actions }}>

        <Router>
        <Menu />

        <Box>
          {
            netId !== 4 && netId !== 0x64 && coinbase &&
            <center>
              <p><b>Wrong network</b></p>
              <p><Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" external>Please connect to xDai network <IconLink /></Link></p>
            </center>

          }
          <Switch>

            <Route path="/home" component={Home}/>
            <Route path="/all-avatars" component={AllAvatars}/>
            <Route path="/mint" component={Mint}/>
            <Route path="/profile" component={Profile}/>


            {/*
              <Route path="/games" component={GamesPage}/>
              <Route path="/feedbacks" component={Feedbacks}/>
            */}
            <Route render={() => {

              return(
                <Redirect to="/mint" />
              );

            }} />
          </Switch>

        </Box>
        </Router>
        <footer style={{textAlign: "center",marginTop: "50px"}}>
          <Link href="https://t.me/thehashavatars" external>Telegram <IconLink /></Link>
          <Link href="https://twitter.com/thehashavatars" external>Twitter <IconLink /></Link>
          <Link href="https://github.com/henrique1837/snowflakeshash-dapp" external>Github <IconLink /></Link>
          <Link href="https://dweb.link/ipfs/bafybeibxurg3o5vo7n7xnr374fvscb6amb4jmojnx4e6zqmlwgrcjscoo4" external>Previous Version  <IconLink /></Link>

        </footer>

      </AppContext.Provider>


    </Main>
  );
}

export default App;
