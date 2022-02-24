import { gql } from 'apollo-boost'
import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useWallet } from '../../services/providers/MintbaseWalletContext';
// import { Player, BigPlayButton } from 'video-react';
import { Thing } from '../../interfaces/thing.interface';
import Player from '../../components/Player';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import Loader from '../../components/Loader';
import Gavel from '@material-ui/icons/Gavel';
import DescriptionIcon from '@material-ui/icons/Description';
var _nearApiJs = require("near-api-js");

const FETCH_TOKEN = gql`
query MyQuery ($thing_id: String!) {
    thing(where: {id: {_eq: $thing_id}}) {
      id
      tokens(distinct_on: id, where: {list: {removedAt: {_is_null: true}}}) {
        id
        list {
          price
          autotransfer
          offer {
            price
          }
        }
        txId
      }
      storeId
      metadata {
        animation_type
        animation_url
        media
        title
        description
        tags
        external_url
        category
      }
    }
  }`



const Product = ({ thing_id }: { thing_id: string }) => {
    const [things, setThing] = useState<Thing[]>([])
    const { wallet, isConnected } = useWallet();
    const [bid, setBid] = useState('0')

    const [getTokens, { loading: loadingTokensData, data: tokensData, fetchMore }] =
        useLazyQuery(FETCH_TOKEN, {
            variables: {
                thing_id: ''
            },
        })
    useEffect(() => {
        getTokens({
            variables: {
                thing_id
            },
        })
    }, [])

    useEffect(() => {
        if (!tokensData) return;
        setThing(tokensData.thing)
    }, [tokensData])

    var tokenPriceNumber
    var price, tokenPrice: string
    things.map((thing: Thing) => {
        tokenPriceNumber = Number(thing.tokens[0].list.price)
        //format keep on giving error without the map implementation, why?
        price = _nearApiJs.utils.format.formatNearAmount((tokenPriceNumber).toLocaleString('fullwide', { useGrouping: false }), 2)
        tokenPrice = (tokenPriceNumber).toLocaleString('fullwide', { useGrouping: false })

    })
    //var tokenPriceNumber = Number(things[0].tokens[0].list.price)
    // var price = _nearApiJs.utils.format.formatNearAmount((tokenPriceNumber).toLocaleString('fullwide', { useGrouping: false }), 2)
    // const tokenPrice = (tokenPriceNumber).toLocaleString('fullwide', { useGrouping: false })

    var buy = () => {
        if (things[0]?.tokens[0].list.autotransfer) {
            wallet?.makeOffer(things[0]?.tokens[0].id, tokenPrice, { marketAddress: process.env.marketAddress })
        }
        else {
            wallet?.makeOffer(things[0]?.tokens[0].id, _nearApiJs.utils.format.parseNearAmount(bid), { marketAddress: process.env.marketAddress })
        }
    }
    var currentBid;
    if (things[0]?.tokens[0].list.offer == null) {
        currentBid = '0'
    }
    else {
        currentBid = _nearApiJs.utils.format.formatNearAmount((Number(things[0]?.tokens[0].list.offer.price)).toLocaleString('fullwide', { useGrouping: false }), 5)
    }

    return (
        <>
        {loadingTokensData && <Loader />}

        {!loadingTokensData &&
            <main className=" py-32 bg-gray-100 ">
                <div className="container mx-auto px-6 md:">
                    <div className="bg:gray-100 lg:flex lg:justify-around lx:flex md:block sm:block md:justify-center">
                        <div className="   xl:max-w-prose lg:max-w-prose md:max-w-full sm:max-w-full ">
                            
                                <>
                                    {!things[0]?.metadata.animation_type &&
                                        <img width="500px" className=" object-contain mx-auto"
                                            src={things[0]?.metadata.media}
                                            alt={things[0]?.metadata.title} />
                                    }

                                    {things[0]?.metadata.animation_type &&
                                        <div id="responsiveVideoWrapper" className=" lg:-mt-52 xl:mt-8 ">
                                            <Player src={things[0]?.metadata.animation_url!} thumbnail={things[0]?.metadata.media} size={"big"}></Player>
                                        </div>
                                    }
                                    <div className="divider divider-vertical"></div>
                                </>
                                <div className='xl:invisible md:invisible sm:invisible lg:visible w-full p-5'>
                                    <p className='text-gray-400 py-2'>Owned by: <a className='text-blue-400' href={`http://arweave.net/${thing_id}`} target="_blank">Arweave Link</a></p>
                                    <DescriptionIcon />
                                    <span className='text-gray-700 text-[18px] pt-2 border-solid border-b-2 border-full border-gray-200'>Desciption</span>
                                    <p className='p-2'> <span className='storeID'>{things[0]?.metadata.description}</span> </p>
                                </div>
                            
                        </div>
                        <div className="priceTag">

                            <h3 className="text-gray-700 uppercase text-lg font-bold">{things[0]?.metadata.title}</h3>

                            <div className='text-gray-500 mt-12 text-sm mx-5'>
                               <p>Store ID: {things[0]?.storeId} </p>

                                <p ><a className='text-blue-400' target="_blank" rel="noreferrer" href={`https://explorer.${process.env.NETWORK === 'testnet' ? 'testnet' : ''}.near.org/transactions/${things[0]?.tokens[0].txId}`}>Near Link</a></p>

                                <p><a className='text-blue-400' href={`http://arweave.net/${thing_id}`} target="_blank" rel="noreferrer">Arweave Link</a></p>

                                <p>Tokens: {things[0]?.tokens.length} </p>

                                <p>description: {things[0]?.metadata.description} </p>

                                <p>externall URL :<a className='text-blue-400' href={things[0]?.metadata.external_url} target="_blank" rel="noreferrer"> {things[0]?.metadata.external_url}</a> </p>

                            <div className='text-gray-500 text-sm ml-14'>

                                <div className='text-gray-700 text-[18px] '>
                                    <p>Store ID: <span className='storeID'>{things[0]?.storeId}</span> </p>
                                    <p>category: <span className='storeID'>{things[0]?.metadata.category || 'Not Available'}</span></p>
                                    <p>Tokens: <span className='text-black'>{things[0]?.tokens.length}</span> </p>
                                </div>                                

                            </div>


                            {isConnected && things[0]?.tokens[0].list.autotransfer &&
                                <>
                                    <div className='xl:pt-10 xl:pb-5 lg:pt-8 lg:pb-5 md:py-5 sm:py-8 pl-10'>
                                        <span className='text-gray-500 mt-12 text-sm mx-5'>current price</span> <br />
                                        <span className=" text-xl object-contain flex flex-col sm:flex-row m-5 justify-start  items-center">
                                            <img src="../images/near.png" alt="here" className='w-4 h-4 '/>
                                            <span className='px-2'>{price} </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center pt-2 border-solid  border-t-2 border-full border-gray-200">
                                        <button className="fontFamily buyButton" onClick={buy}>
                                            <AccountBalanceWalletIcon className='mr-4' />
                                            Buy
                                        </button>
                                    </div>
                                </>
                            }

                            {
                                isConnected && !things[0]?.tokens[0].list.autotransfer &&
                                <>
                                    <div className='xl:pt-14 xl:pb-5 lg:pt-11 lg:pb-5 md:py-5 sm:py-8'>
                                        <span className='text-gray-500 mt-12 text-sm mx-5'>current Bid</span> <br />
                                        <span className=" text-xl flex m-5 justify-start">
                                            <img src="../images/near-protocol-near-logo.png" alt="here" className='w-4 h-4 my-auto' />
                                            <span className='px-2'>{currentBid} </span>
                                        </span>
                                    </div>
                                    <div>
                                        <input value={bid} type="number" onChange={e => setBid(e.target.value)} min="0" className="rounded-full focus:outline-none text-gray-700 py-2" />
                                    </div>
                                    <div className="flex items-center mt-3">
                                        <button className="buyButton" onClick={buy}>
                                        <Gavel className='mr-2' /> 
                                            Bid</button>
                                    </div>
                                </>
                            }
                                        
                        </div>
                        <div className='red-300'></div>
                    </div>
                </div>               
            </main>
    }
        </>
    )
}


export const getServerSideProps = (params: any) => {
    const thing_id = params.query.thing_id
    return {
        props: {
            thing_id
        }
    }
}

export default Product