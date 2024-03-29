import React,{useEffect,useMemo,useState} from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import { Main,Box,Link,IconLink } from '@aragon/ui';

import { ChatBox } from '@orbisclub/modules'
import "@orbisclub/modules/dist/index.modern.css";

import useWeb3Modal from "./hooks/useWeb3Modal";
import useContract from "./hooks/useContract";
import useClient from "./hooks/useGraphClient";

import { AppContext, useAppState } from './hooks/useAppState'

import Home from "./screens/Home";
import Mint from "./screens/Mint";
import Profile from "./screens/Profile";


import AllAvatars from "./screens/AllAvatars";

import Menu from "./components/Menu";


//import GET_TRANSFERS from "./graphql/subgraph";


function App() {
  const { state, actions } = useAppState();

  const { client,initiateClient } = useClient();
  const {
    provider,
    coinbase,
    netId,
    profile,
    connecting,
    loadWeb3Modal
  } = useWeb3Modal();
  const {
    hashavatars,
    creators,
    nfts,
    loadingNFTs,
    loadingMyNFTs,
    myNfts,
    myOwnedNfts,
    totalSupply,
    getTotalSupply,
    getMetadata,
    initiateContracts,
    getAllNFTs,
    getMyNFTs,
    checkEvents
  } = useContract();
  const [getData,setGetData] = useState();
  const [checkingEvents,setCheckingEvents] = useState();

  useEffect(() => {
    actions.setConnecting(connecting);
  },[connecting])
  useEffect(() => {
    actions.setProvider(provider);
    actions.setLoadWeb3Modal(loadWeb3Modal);
  },[provider])

  useEffect(() => {
    actions.setCoinbase(coinbase);
    if(!coinbase){
      actions.setMyOwnedNfts([]);
      actions.setMyNfts([])
    }
    if(coinbase && client){
      getMyNFTs(client,coinbase,netId)
    }
    setCheckingEvents(false);
  },[coinbase,client])
  useEffect(() => {
    actions.setNetId(netId);
    initiateClient(netId);
    setGetData(false);
    setCheckingEvents(false);
    initiateContracts(netId,provider);
  },[netId])
  useEffect(() => {
    actions.setProfile(profile);
  },[profile])

  useEffect(() => {
    actions.setHashAvatars(hashavatars);
    actions.setGetTotalSupply(getTotalSupply);
    actions.setGetMetadata(getMetadata);
  },[hashavatars])

  useEffect(() => {
    if(!checkingEvents && hashavatars && !loadingNFTs){
      checkEvents(coinbase);
      setCheckingEvents(true);
    }
  },[coinbase,hashavatars,checkingEvents,loadingNFTs]);

  useEffect(() => {
    actions.setNfts(nfts)
  },[nfts])

  useEffect(() => {
    actions.setMyOwnedNfts(myOwnedNfts)
  },[myOwnedNfts])
  useEffect(() => {
    actions.setMyNfts(myNfts)
  },[myNfts])

  useEffect(() => {
    actions.setLoadingNFTs(loadingNFTs)
  },[loadingNFTs])
  useEffect(() => {
    actions.setLoadingMyNFTs(loadingMyNFTs)
  },[loadingMyNFTs])
  useEffect(() => {
    actions.setTotalSupply(totalSupply);
    if(!getData && client && totalSupply){
      setGetData(true);
      getAllNFTs(client,totalSupply,netId)
    }
  },[totalSupply,client,getData])

  useEffect(() => {
    actions.setCreators(creators)
  },[creators])


  useEffect(() => {
    actions.setClient(client);
  },[client]);


  return (
    <Main>

      <ChatBox context="kjzl6cwe1jw1475lav0kq3j39dbx99mywfzas1jpc957uxel6dro9nlos1zkbd6" poweredByOrbis="black" />
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

            <Route render={() => {

              return(
                <Redirect to="/mint" />
              );

            }} />
          </Switch>

        </Box>
        </Router>
        <footer style={{textAlign: "center",marginTop: "50px"}}>
          <Link href="https://twitter.com/thehashavatars" external>Twitter<IconLink /></Link>
          <Link href="https://github.com/henrique1837/snowflakeshash-dapp" external>Github<IconLink /></Link>
          <Link href="https://bridge.connext.network/" external>Bridge<IconLink /></Link>
          <Link href="https://app.orbis.club/" external>OrbisClub<IconLink /></Link>

        </footer>


      </AppContext.Provider>


    </Main>
  );
}

export default App;
