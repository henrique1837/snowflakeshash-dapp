import React from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { Link,IconLink } from '@aragon/ui'
import { addresses } from "@project/contracts";

function Home(props){
  return(
    <Container>
      <h2>HashAvatars</h2>
      <Container>
        <Row>
          <Col style={{textAlign: 'left', wordBreak:'break-word'}} fontSize="md">
            <p>Each Snowflake can be minted for 1 xDai (1 USD), after that you can sell for any price you want. Your collectable can not be replicated or ever destroyed, it will be stored on Blockchain forever.</p>
            <p>Choose your preferred Snowflake and start your collection now!</p>
            <br/>
            <p>1 xDai = 1 Snowflake</p>
            <br/>
            <p>The maximum amount of Snowflakes that will exists is 200000</p>
            <br />
            <p>The Snowflake Hash is built on xDai Chain, an Ethereum layer 2 sidechain that provides transactions cheaper and faster in a secure way, you must <Link href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup" external>set your wallet to xDai Chain network <IconLink mx="2px" /></Link> in order to join.</p>
            <p>xDai ERC1155 at <Link href={`https://blockscout.com/xdai/mainnet/address/${addresses.erc1155.xdai}`} external>{addresses.erc1155.xdai} <IconLink /></Link></p>
            <br/>
            <p>You can also use it in rinkeby testnetwork to test.</p>
            <p>Rinkeby ERC1155 at <Link href={`https://rinkeby.etherscan.io/address/${addresses.erc1155.rinkeby}`} external>{addresses.erc1155.rinkeby} <IconLink mx="2px" /></Link></p>
            <br/>
            <p>This project uses "Hydro-Snowflake-Identicon-Generator" package from <Link href="https://github.com/cyphercodes96/Hydro-Snowflake-Identicon-Generator" external>https://github.com/cyphercodes96/Hydro-Snowflake-Identicon-Generator <IconLink mx="2px" /></Link> and can be copied / modified by anyone.</p>
          </Col>
          <Col style={{textAlign: 'center'}}>
            <Image boxSize="200px" src="https://ipfs.io/ipfs/QmZossnC5rci4YzVe3n2Z9bEJEXZrzTKNg2jXKXM1kehiu" />
          </Col>
        </Row>
      </Container>
    </Container>
  )
}

export default Home;
