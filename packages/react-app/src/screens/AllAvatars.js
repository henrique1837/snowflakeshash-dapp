import React,{useState} from "react";
import { Container,Row,Col,Image,Popover,OverlayTrigger,Spinner } from 'react-bootstrap';
import { Link,IconLink,IdentityBadge,Pagination,Split,Button,EthIdenticon,ProgressBar } from '@aragon/ui'

import { useAppContext } from '../hooks/useAppState'

function AllAvatars(){
  const { state } = useAppContext();
  const [selected, setSelected] = useState(0)
  const [filtered,setFiltered] = useState();

  return(
    <>

      <Container>

        <Split
          primary={
            <>
            <h4>All Snowflakes</h4>
            {
              state.totalSupply &&
              <p><small>Total of {state.totalSupply} Snowflakes</small></p>

            }

            {
              filtered &&
              <center>
                {
                  state.creators.map(str => {
                    const obj = JSON.parse(str);
                    if(obj.address === filtered){
                      return(
                        <div>
                          <div>
                          <IdentityBadge
                            label={obj.profile?.name}
                            entity={obj.address}
                            networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                            popoverTitle={obj.profile?.name }
                          />
                          </div>
                          {
                            obj.profile?.image &&
                            <div>
                              <img
                                rounded
                                src={obj.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")}
                                style={{width: '250px',heigth: "250px"}}
                              />
                            </div>
                          }
                          <p>{obj.profile?.description}</p>
                          {
                            obj.profile?.url &&
                            <p><Link href={obj.profile?.url} external={true}>{obj.profile?.url} <IconLink  /></Link></p>
                          }
                        </div>
                      )
                    }
                    return;
                  })
                }
              </center>
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
              !filtered && state.totalSupply &&
              <Pagination pages={
                (Number((state.totalSupply/12).toFixed(0)) < Number((state.totalSupply/12))) ?
                  Number((state.totalSupply/12).toFixed(0)) + 1 :
                  Number((state.totalSupply/12).toFixed(0))
              } selected={selected} onChange={setSelected} />
            }
            {
              state.nfts?.length > 0 &&
              <>
              <Row style={{textAlign: 'center'}}>
              {
                state.nfts?.map(str => {
                  const obj = JSON.parse(str);

                  if(filtered){
                    if(filtered !== obj.creator){
                      return
                    }
                  }

                  if(!filtered &&
                      ((obj.returnValues._id <= state.totalSupply - (selected+1)*12) ||
                       (obj.returnValues._id > state.totalSupply - ((selected+1)*12) + 12))){
                    return
                  }

                  const popover =
                    <Popover id={`popover-${obj.returnValues._id}`} class=".hashover">
                      <Popover.Header as="h3">{obj.metadata.name}</Popover.Header>
                      <Popover.Body>
                        <p>ID: {obj.returnValues._id}</p>
                        {
                          obj.metadata.description && <p>{obj.metadata.description}</p>
                        }
                        <p>Creator: {
                          <Link href="" onClick={() => setFiltered(obj.creator)}>
                            <IdentityBadge
                              label={obj.profile?.name}
                              badgeOnly
                              entity={obj.creator}
                              networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                              icon={obj.profile?.image ?
                                    <img src={obj.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")} style={{width: '25px'}} /> :
                                    <EthIdenticon address={obj.creator}/>
                              }
                            />
                          </Link>
                        }
                        </p>
                      {
                        obj.profile?.url &&
                        <p><small><Link href={obj.profile?.url} external={true}>{obj.profile?.url} <IconLink  /></Link></small></p>

                      }
                      <p><small><Link href={`https://epor.io/tokens/${state.hashavatars.address}/${obj.returnValues._id}`} external={true}>View on Epor.io{' '}<IconLink  /></Link></small></p>
                      <p><small><Link href={`https://unifty.io/xdai/collectible.html?collection=${state.hashavatars.address}&id=${obj.returnValues._id}`} external={true}>View on Unifty.io{' '}<IconLink /></Link></small></p>
                      </Popover.Body>
                    </Popover>
                  return(
                    <Col style={{paddingTop:'80px'}}>


                    <Link href="">
                    <OverlayTrigger trigger="click" placement="top" overlay={popover}>
                      <center>
                        <div>
                          <p><b>{obj.metadata.name}</b></p>
                        </div>
                        <div>
                          <img src={obj.metadata?.image.replace("ipfs://","https://ipfs.io/ipfs/")} width="150px"/>
                        </div>
                      </center>
                    </OverlayTrigger>
                    </Link>

                    </Col>
                  )
                })
              }
              </Row>
                {
                  filtered &&
                  <center>
                    <Button onClick={() => {setFiltered(null);setSelected(0)}}>All Avatars</Button>
                  </center>
                }
                </>
            }
            </>
          }
          secondary={
              <div style={{maxHeight: "1000px",overflowY: "scroll"}}>
              <h4>Creators</h4>
              <p><small>Total of {!state.loadingNFTs ? state.creators.length : <Spinner animation="border" size="sm"/>} Snowflakes creators</small></p>
              <div>
              {
                state.creators?.map((string) => {
                  const obj = JSON.parse(string);

                  return(
                    <div>
                    <Link href="" onClick={() => setFiltered(obj.address)}>

                      <IdentityBadge
                        label={obj.profile?.name && obj.profile.name}
                        entity={obj.address}
                        badgeOnly
                        networkType={state.netId === 4 ? "rinkeby" : "xdai"}
                        icon={obj.profile?.image ?
                              <img src={obj.profile.image.original.src.replace("ipfs://","https://ipfs.io/ipfs/")} style={{width: '25px'}} /> :
                              <EthIdenticon address={obj.address}/>
                        }
                      />
                    </Link>

                    </div>
                  )
                })
              }
              </div>
              </div>


          }
        />


      </Container>
    </>
  )
}

export default AllAvatars;
