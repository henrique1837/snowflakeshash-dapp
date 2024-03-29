import { useCallback,useMemo, useState,useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import getProfile from './useProfile';

//import WalletConnectProvider from "@walletconnect/web3-provider";

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register


function useWeb3Modal(config = {}) {
  const [provider, setProvider] = useState();
  const [coinbase, setCoinbase] = useState();
  const [profile,setProfile] = useState();
  const [netId , setNetId] = useState();
  const [connecting , setConnecting] = useState();

  const [noProvider , setNoProvider] = useState();
  const [autoLoaded, setAutoLoaded] = useState(false);
  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const providerOptions = {
    injected: {
      package: null
    },
    /*
    frame: {
      package: ethProvider // required
    }
    /*
    torus: {
      package: Torus, // required
      options: {
        networkParams: {
          chainId: 0x64, // optional
          networkId: 0x64 // optional
        }
      }
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId,
      },
    }
    */
  };
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      setCoinbase();
      setProfile()
      setNetId(0x64);
      setProvider(new ethers.providers.JsonRpcProvider("https://rpc.gnosischain.com/"));
    },
    [web3Modal],
  );
  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {

    try{
      setConnecting(true)
      setAutoLoaded(true);
      const conn = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(conn,"any");
      const signer = newProvider.getSigner()
      const newCoinbase = await signer.getAddress();

      const {chainId} = await newProvider.getNetwork();
      setProvider(newProvider);
      setCoinbase(newCoinbase);
      setNetId(chainId);
      setNoProvider(true);
      conn.on('accountsChanged', accounts => {
        setCoinbase(accounts[0]);
      });
      conn.on('chainChanged', async chainId => {
        setNetId(Number(chainId))
      });
      // Subscribe to provider disconnection
      conn.on("disconnect", async (error: { code: number; message: string }) => {
        logoutOfWeb3Modal();
      });
      setConnecting(false);
      return;
    } catch(err){
      console.log(err);
      setConnecting(false)
      logoutOfWeb3Modal();
    }

  }, [web3Modal,logoutOfWeb3Modal]);




  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useMemo(() => {
    if (!autoLoaded && web3Modal.cachedProvider) {
      setAutoLoaded(true);
      loadWeb3Modal();
      setNoProvider(true);
    }
  },[autoLoaded,loadWeb3Modal]);
  useMemo(() => {

    if(!noProvider && !autoLoaded && !web3Modal.cachedProvider && !connecting){
      setProvider(new ethers.providers.JsonRpcProvider("https://rpc.gnosischain.com/"));
      setNetId(0x64);
      setNoProvider(true);
      setAutoLoaded(true);
    }



  },[
    noProvider,
    autoLoaded,
    connecting
   ]);

   useEffect(() => {
     async function getNewProfile(){
       const newProfile = await getProfile(coinbase);
       setProfile(newProfile);
     }
     if(coinbase){
       try{
         getNewProfile()
       } catch(err){

       }
     }
   },[coinbase])

  return({provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId,profile,connecting});
}

export default useWeb3Modal;
