import logo from '../logo.svg';
import Header from '../components/Header'
import React, { useState, useEffect } from 'react';

import '../static/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from "react-router-dom";
import { useMoralis, useChain } from "react-moralis";
import { SMARTCONTRACT_ABI, SMART_CONTRACT } from "../constants/contracts";
import { Alert } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { BigNumber } from "@ethersproject/bignumber";
import { useNavigate } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const STATUS_MINTED = "minted";
const STATUS_UNDEFINED = "";
const LVL_SUPER = "SUPER";
const LVL_SUPER_DUPER = "SUPER DUPER";

const category_names = {
  "HILLY": {
    static: true,
    name: "Hilly Kristal",
    description: "Alan Rickman plays Hilly Kristal, the owner of CBGB, widely considered The Godfather of Punk."
  },
  "BLONDIE": {
    static: true,
    name: "BLONDIE",
    description: "Mailin Akerman plays Debbie Harry of Blondie, The First Lady of Punk."
  },
  "THE RAMONES": {
    static: true,
    name: "THE RAMONES",
    description: "Joel David Moore plays Joey Ramone, lead singer of The Ramones, the First Punk Rock Supergroup."
  },
  "LISA KRISTAL": {
    static: true,
    name: "LISA KRISTAL",
    description: "Ashley Greene plays Lisa Kristal, daughter of CBGB founder Hilly Kristal."
  },
  "CHEETAH CHROME": {
    static: true,
    name: "CHEETAH CHROME",
    description: "Rupert Grint plays Cheetah Chrome, lead guitarist of The Dead Boys."
  },
  "STIV BATORS": {
    static: true,
    name: "STIV BATORS",
    description: "Justin Bartha plays Stiv Bators, lead singer of The Dead Boys."
  },
  "TERRY ORK": {
    static: true,
    name: "TERRY ORK",
    description: "Johnny Galecki plays Terry Ork, legendary band manager at CBGB."
  },
  "MERV": {
    static: true,
    name: "MERV",
    description: "Donal Logue plays Merv Fergusen, the First Bartender at CBGB."
  },
  "PATTI SMITH": {
    static: true,
    name: "PATTI SMITH",
    description: "Mickey Sumner plays Patti Smith, The Poet Laureate of CBGB."
  },
  "MAD MOUNTAIN": {
    static: true,
    name: "MAD MOUNTAIN",
    description: "Ryan Hurst plays Mad Mountain, head of the local chapter of The Hell's Angels and CBGB protector."
  },
  "GENYA RAVAN": {
    static: true,
    name: "GENYA RAVAN",
    description: "Stana Katic plays Genya Ravan, record producer at CBGB."
  },
  "NICKY GANT": {
    static: true,
    name: "Sleazy Agent",
    description: "Bradley Whitford plays a sleazy music agent. One of many that found their way to CBGB."
  },
  "TAXI": {
    static: true,
    name: "TAXI",
    description: "Richard DeKlerk plays Taxi, the First Sound Engineer of CBGB."
  },
  "IGGY POP": {
    static: true,
    name: "IGGY POP",
    description: "Taylor Hawkins plays Iggy Pop, consummate punk rocker, he is credited with the first stage dive."
  },
  "DAVID BYRNE":  {
    static: true,
    name: "DAVID BYRNE",
    description: "Jared Carter plays legendary David Byrne of The Talking Head."
  },
  "LOU REED": {
    static: true,
    name: "LOU REED",
    description: "Kyle Gallner plays Lou Reed, venerable lead singer of The Velvet Underground."
  },
  "JONATHAN": {
    static: true,
    name: "JONATHAN",
    description: "Hilly's dog, the First Dog of CBGB."
  },
  "STING": {
    static: true,
    name: "STING",
    description: "Keene McRae plays Sting, the lead singer of The Police."
  },
  "HILLY's MOM": {
    static: true,
    name: "HILLY'S MOM",
    description: "Estelle Harris plays Bertha Kristal, Hilly's mom."
  },
  "IDAHO": {
    static: true,
    name: "IDAHO",
    description: "Freddy Rodriguez plays Idaho, Hilly's favorite homeless junkie."
  },
  "WAYNE COUNTY": {
    static: true,
    name: "WAYNE COUNTY",
    description: "Caleb McCotter plays Wayne County, the First Drag Queen Rocker of CBGB."
  },
}

function Mint() {
  let RouteQuery = useQuery();
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const { isAuthenticated, Moralis, isInitialized } = useMoralis();
  const { chainId, chain, account } = useChain();
  const [mintPrice, setMintPrice] = useState(null);
  const [isProcessing, setProcessing] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [nftloadings, setNftLoadings] = useState({});
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [initSortField, setInitSortField] = useState(null);
  const [initSortDirection, setInitSortDirection] = useState(0);

  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(RouteQuery.get('category'));
  const [level, setLevel] = useState(RouteQuery.get('level'));
  const navigate = useNavigate();
  const connectorId = window.localStorage.getItem("connectorId");


  useEffect(() => {
    initialize();
    if (isInitialized){
      LoadNFTS(true);
    }
  }, [isAuthenticated, account, chainId, isInitialized])

  useEffect(() => {
    // Fetch items from another resources.
    if (isInitialized){
      LoadNFTS(false);
    }
  }, [itemOffset, itemsPerPage]);

  const initialize = async () => {
    getMintPrice();
  }

  const LoadNFTS = async (initiated = false) => {
    setLoading(true)
    const fields = [
      "objectId",
      "createdAt",
      "updatedAt",
      "name",
      "tokenId",
      "category",
      "level"
    ]
    const nftloadings = {};
    const query = new Moralis.Query("nfts");
    query.notEqualTo("status", STATUS_MINTED);
    console.log('initiated', initiated, initSortField, initSortDirection );
    //query.ascending("sort"); Not needed
    if (category) {
      query.equalTo("category", category);
    }
    if (level) {
      query.equalTo("level", level);
    }
    setTotal(await query.count());
    //TODO: move to a display function since it won't be used by end-users.
    setPageCount(Math.ceil(total / itemsPerPage));
    console.log('itemsPerPage', itemsPerPage);
    query.limit(itemsPerPage);
    query.skip(itemOffset);
    //query.withCount();
    const _nfts = await query.find();

    let nfts = _nfts.map((item, index) => {
      const nft = {};
      nft.tokenId = item.get('tokenId');
      nft.metadata = item.get('metadata');
      nft.txHash = item.get('txHash');
      nft.status = item.get('status');
      nft.confirmed = item.get('confirmed');
      nft.name = item.get('name');
      nft.image = nft.metadata.image
      //nft.sort = parseInt(Math.random() * itemsPerPage);
      nftloadings[nft.tokenId] = false;
      return nft;
    })
    console.log('nfts', nfts);
    setNfts(nfts);
    setLoading(false)
  }

  const superDuperMint = async () => {
    setLevel(LVL_SUPER_DUPER);
    await mint();
  }

  const mint = async () => {
    if (loading) return;
    let tokenId = "";
    const mintOption = {
      contractAddress: SMART_CONTRACT,
      functionName: "mint",
      abi: SMARTCONTRACT_ABI,
      params: {
        amount: 1,
        tokenIds: [tokenId]
      },
      msgValue: BigNumber.from(mintPrice)
    };
    setLoading(true)
    console.log('mint', mintOption);
    try {
      const tx = await Moralis.executeFunction(mintOption);
      console.log('tx', tx);
      if (!tx) {
        setLoading(false)
        alert("Buying Failed tx: ");
      }
      const NFT = Moralis.Object.extend("nfts");
      const query = new Moralis.Query(NFT);
      query.equalTo("tokenId", tokenId);
      const result = await query.first();
      if (result) {
        result.set("status", "minted");
        result.set("txHash", tx.hash);
        await result.save();
      }
      LoadNFTS()
    } catch (err) {
      console.log('mint err', err);
      setLoading(false)
      alert("Buying Failed: " + err.error.message);
    }
  }

  const getMintPrice = async () => {
    if (isAuthenticated && account) {
      const readOwner = {
        contractAddress: SMART_CONTRACT,
        functionName: "getSalePrice",
        abi: [{
          inputs: [],
          name: "getSalePrice",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        }]
      };
      try {
        const response = await Moralis.executeFunction(readOwner);
        if (response) {
          console.log('getMintPrice', response.toString())
          setMintPrice(response.toString());
        }
      } catch (err) {
        console.log('err', err)
        setMintPrice(null);
      }
    }
  }

  const handlePageClick = (event) => {
    let _nfts = nfts.map((item, index) => {
      item.image = "./loader.gif"
      return item;
    })
    setNfts(_nfts);

    const newOffset = (event.selected * itemsPerPage) % total;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  const goToEtherscan = (item) => {
    window.open(`https://rinkeby.etherscan.io/tx/${item.txHash}`, '_blank');
  }

  const goToOpenSea = (item) => {
    window.open(`https://testnets.opensea.io/assets/${SMART_CONTRACT}/${item.tokenId}`, '_blank');
  }

  return (
    <div className="App">
      <div className='mint-intro'>
        <div className='intro-innter'>
          <Header /><br /><br />
          {category && <div className='category-title'>
            {category == "HILLY'S MOM" && <img src="HILLY'S MOM.png" />}
            {category == "LISA KRISTAL" && <img src='/LISA KRISTAL.png' />}
            {category == "THE RAMONES" && <img src='THE RAMONES.png' />}
            {category == "STING" && <img src='STING.png' />}
            {category == "STIV BATORS" && <img src='STIV BATORS.png' />}
            {category == "PATTI SMITH" && <img src='PATTI SMITH.png' />}

            {category != "HILLY'S MOM" &&
              category != "LISA KRISTAL" &&
              category != "THE RAMONES" &&
              category != "STING" &&
              category != "STIV BATORS" &&
              category != "PATTI SMITH" &&
              category_names[category] && category_names[category].static == true && category_names[category].name}

            {category != "HILLY'S MOM" &&
              category != "LISA KRISTAL" &&
              category != "THE RAMONES" &&
              category != "STING" &&
              category != "STIV BATORS" &&
              category != "PATTI SMITH" &&
              (!category_names[category] ||
              category_names[category].static != true) && category}
          </div>}
          {level && <div className='category-title'>
            {level}
          </div>}
          {!category && !level && <div className='category-title'>
            {"ALL CBGB"}
          </div>}
          <br /><br />
          {category && nfts.length > 0 && <p className='first-lady'>{category_names[category] && category_names[category].static == true? category_names[category].description : nfts[0].metadata.description}</p>}<br />
          <p className='handcraft'><span>{level=="SUPER"? "11,999" : total}</span> hand-crafted unique tokens</p><br /><br /><br />
        </div>
        <div className='container'>
          {loading && <div class="overlay"><div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>}
          <div className='row'>
            {nfts.length > 0 && nfts.map(function (item, i) {
              //TODO: Here are the mint buttons
              return <div className='col-md-4 pb-5'>
                <img src={item.image} style={{ width: "100%" }} className="mint-img" />
                {item.image != "./loader.gif" && !loading && item.status != "minted" && level == "SUPER" && <button className='mint' onClick={() => mint()}>Super Mint</button>}
                {item.image != "./loader.gif" && !loading && item.status != "minted" && <button className='mint' onClick={() => mint()}>Super Duper Mint</button>}
                {item.image != "./loader.gif" && !loading && item.status == "minted" && item.confirmed != true && <button className='mint' onClick={() => goToEtherscan(item)}>View</button>}
                {item.image != "./loader.gif" && !loading && item.status == "minted" && item.confirmed == true && <button className='mint' onClick={() => goToOpenSea(item)}>View</button>}
              </div>
            })}
          </div>
          <div className='row'>
            <ReactPaginate
              breakLabel="..."
              nextLabel=">>>"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={pageCount}
              previousLabel="<<<"
              renderOnZeroPageCount={null}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default Mint;
