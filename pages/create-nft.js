/* pages/create-nft.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import { create } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
const projectIdAndSecret = `${projectId}:${projectSecret}`

console.log("start working")

const client = create({
  host: 'ipfs.infura.io',
  port: 9000,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(projectIdAndSecret).toString(
      'base64'
    )}`,
  },
})


import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()


  async function onChange(e) {
    /* upload image to IPFS */
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      // const url = `https://acccccccc.infura.io/ipfs/${added.path}`
      // const url ="https:acccccccc.infura-ipfs.io"
      const url = "https:acccccccc/ipfs/${added.path}"
      // const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
      console.log(url);
    } catch (error) {
      console.log('Error uploading file: ', error)
      console.log("so sad uoload missed");
    }  
  }

async function createItem() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
        name,
        description,
        image: fileUrl,
    }
    ,console.log("set properties"))

    try {
        const added = await client.add(data)

        const url = `https://acccccccc.infura.io/ipfs/${added.path}`
        // after file is uploaded to IPFS, pass the URL to save it on Polygon
        createSale(url)
    } catch (error) {
        console.log('Error uploading file: ', error)
    }
}

  async function uploadToIPFS() {
    const { name, description, price } = formInput
    console.log("upload start");
    if (!name || !description || !price || !fileUrl) return
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    console.log(name);
    console.log(description);
    console.log("image");
    console.log("confirm property");
    try {
      const added = await client.add(data)
      console.log("client connecting");
      // const url = `https://acccccccc.infura.io/ipfs/${added.path}`
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
      console.log("kkk")
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    console.log("ada");
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* create the NFT */
    console.log("create the NFT");
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    console.log("now create the NFT");
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    // console.log("url");
    console.log(price);
    console.log(listingPrice);
    // console.log("now create the NFT2"); here didn't work
    await transaction.wait()
    console.log("created the NFT");
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>
    </div>
  )
}