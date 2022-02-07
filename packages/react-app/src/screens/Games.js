import React,{useState} from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Button } from '@aragon/ui';

import FirstContact from './games/FirstContact'

function GamesPage() {

  const [play,setPlay] = useState();

  const games = [
    {
      component: <FirstContact />,
      name: "FirstContact",
      description: "We finally can see lands! Lets kill every resident if there are some!",
      image: "https://ipfs.io/ipfs/bafkreielvi4lb634g3zm5n3md2gwkemdupzthlvsarutxvikrndjup5iza"
    }
  ]

  return(

      <>
      {
        (
          play ?
          (
            <>
            {play}
            </>
          ) :
          (
            <div>
              <div>
                <h4>HashAvatars Games</h4>
              </div>
              <Container>

              {
                (
                  !play &&
                  (
                    <Row
                      columns={{ sm: 1, md: 5 }}
                      spacing="40px"
                      mb="20"
                      justifyContent="center"
                    >
                    {
                      games.map((game) => {

                        return(
                          <Col>
                            <center>
                            <div><b>{game.name}</b></div>
                            <hr />
                            <div><Image src={game.image} style={{width: '150px',height: '150px'}} roundedCircle/></div>
                            <hr />
                            <Button onClick={() => {setPlay(game.component)}} size="small" mode="strong">Play</Button>
                            <div>{game.description}</div>
                            </center>
                          </Col>
                        )
                      })
                    }
                    </Row>
                  )
                )
              }

              </Container>
            </div>
          )
        )
      }

      </>


  )

}

export default GamesPage;
