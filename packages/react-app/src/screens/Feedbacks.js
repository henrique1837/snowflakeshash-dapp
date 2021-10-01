import React,{useCallBack,useState} from "react";
import { Container,Row,Col,Image } from 'react-bootstrap';
import { TextInput,Button } from '@aragon/ui'
import useWeb3Modal from "../hooks/useWeb3Modal";
import useWaku from "../hooks/useWaku";

function Feedbacks(){
  const [value,setValue] = useState();
  const {waku,msgs,sendMessage} = useWaku();

  const sendMsg = useCallBack(() => {
    if(value){
      sendMessage(value);
    }
  },[waku,value]);

  return(
    <>
      <h2>Feedbacks</h2>
      <small>Suggestions? Some idea? Partnership? Make a joke? Feel free to give your feedback!</small>
      <Container>
        <Row>
          <Col style={{wordBreak:'break-word'}} fontSize="md">
  
          </Col>
        </Row>
        <Row>
          <Col style={{wordBreak:'break-word'}} fontSize="md">
            {
              waku &&
              <>
              <TextInput
                value={value}
                onChange={event => {
                  setValue(event.target.value)
                }}
              />
              <Button onClick={sendMsg}>Post</Button>
              </>
            }
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Feedbacks;
