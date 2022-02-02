import { BigInt } from "@graphprotocol/graph-ts"
import {
  HashAvatars as TokenContract,
  ApprovalForAll,
  SecondarySaleFees,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/HashAvatars/HashAvatars"

import {
  Token, User
} from '../generated/schema'

import { ipfs, json, JSONValue,Bytes } from '@graphprotocol/graph-ts'



export function handleApprovalForAll(event: ApprovalForAll): void {

}

export function handleSecondarySaleFees(event: SecondarySaleFees): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {
  let token = Token.load(event.params._id.toString());
  if (!token) {
    token = new Token(event.params._id.toString());
    token.creator = event.params._to.toHexString();
    token.tokenID = event.params._id;

    let tokenContract = TokenContract.bind(event.address);
    token.metadataURI = tokenContract.uri(event.params._id);
    //token.metadata = event.params._id.toString();
    token.createdAtTimestamp = event.block.timestamp;
    token.owner = event.params._to.toHexString();

    if(token.metadataURI != ''){
      let hash = token.metadataURI.split('ipfs://').join('')
      let data = ipfs.cat(hash) as Bytes;
      if (!data) return

      if (data != null){
        let value = json.fromBytes(data).toObject()

        let name = value.get('name');

        let imageUri = value.get('imageUri');
        token.name = name.toString();
        token.imageURI = imageUri.toString();
      }
    }

  }


  token.save();
  let user = User.load(event.params._to.toHexString());
  if (!user) {
    user = new User(event.params._to.toHexString());
    user.save();
  }

}

export function handleURI(event: URI): void {}
