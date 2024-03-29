import React from "react";
import { Container,Row,Col } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Split,ProgressBar } from '@aragon/ui'

import { useAppContext } from '../hooks/useAppState'

function Profile(){
  const { state } = useAppContext();
  return(
    <>

      <Container>

        <Split
          primary={
            <>
            <h4>Profile</h4>
            {
              state.myOwnedNfts &&
              <p><small>Total of {state.myOwnedNfts.length} Snowflakes owned by you</small></p>

            }

            {
              state.loadingNFTs && state.nfts && state.totalSupply &&
              <center>
              <p>Loading all Snowflakes ...</p>
              <ProgressBar
                value={state.nfts.length/state.totalSupply}
              />
              </center>
            }
            {
              state.myOwnedNfts?.length > 0 &&
              <>
              <Row style={{textAlign: 'center'}}>
              {
                state.myOwnedNfts?.map(str => {
                  const obj = JSON.parse(str);

                  return(
                    <Col style={{paddingTop:'80px'}}>

                      <center>
                        <div>
                          <p><b>{obj.metadata.name}</b></p>
                        </div>
                        <div>
                          <img alt="" src={obj.metadata?.image.replace("ipfs://",state.gateways[Math.floor(Math.random()*state.gateways.length)])} width="150px"/>
                        </div>
                      </center>

                    </Col>
                  )
                })
              }
              </Row>

                </>
            }
            </>
          }
          secondary={

            <div>
              <div>
              <IdentityBadge
                label={state.profile?.username}
                entity={state.coinbase}
                connectedAccount
                networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                popoverTitle={state.profile?.username }
              />
              </div>
              {
                state.profile?.image &&
                <div>
                  <img
                    alt=""
                    src={state.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")}
                    style={{width: '250px',heigth: "250px"}}
                  />
                </div>
              }
              <p>{state.profile?.description}</p>
              {
                state.profile?.url &&
                <p><Link href={state.profile?.url} external={true}>{state.profile?.url} <IconLink  /></Link></p>
              }
            </div>

          }
        />


      </Container>
    </>
  )
}

export default Profile;
