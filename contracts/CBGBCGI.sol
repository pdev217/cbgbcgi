// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract CBGBCGI is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using SafeMath for uint256;
     uint public drop_unlock_time = 1667260800; //November 1st 2022
    string public unlock_preview = "https://cbgb.mypinata.cloud/ipfs/QmXVss1BheMNtWhvBQqV613uu9nh67fcFh9eMFF9avadfx";
    uint8[15] public walletPercents = [59,10,10,5,2,2,2,2,2,2,2,2,2,2,2];
    address[15] public wallets = [
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0x653229a1c558b87cba440bb82d296Bd1E572C23D,
        0xfe78bf9d611c6aAB734A69810E79e8220278c897,
        0xFFE7aFE2b1Fa96045e91e566a903a230CbB99f70,
        0x1B86c2909C765eC3Be7Ad953E3Bd6f3c748EE07B,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55,
        0xf74a589d778f6D1166DcA66d0B17263403227E55
    ];

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        // if(block.timestamp < 1667260800) {      //November 1st 2022
        //     return "https://cbgb.mypinata.cloud/ipfs/QmXVss1BheMNtWhvBQqV613uu9nh67fcFh9eMFF9avadfx";
        // }else {
        // }
         return super.tokenURI(tokenId);
    }
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    constructor() ERC721("CBGBCGI", "CBGB") {}
    
    function mint(string memory _uri) public payable {
        uint256 mintIndex = totalSupply();
        _safeMint(msg.sender, mintIndex);
        _setTokenURI(mintIndex, _uri);
        _sendEther();
    }

    function doubleMint(string[] memory metadataGroup) public payable {
        for (uint256 i = 0; i < metadataGroup.length; i++) {
            uint256 mintIndex = totalSupply();
            _safeMint(msg.sender, mintIndex);
            _setTokenURI(mintIndex, metadataGroup[i]);
        }
        _sendEther();
    }

    function _sendEther() public payable {
        for(uint i = 0; i < 15; i++) {
            (bool sent,) = wallets[i].call{value: msg.value * walletPercents[i]/100}("");
            console.log(sent);
        }
    }

    function setUnlockTime(uint256 newUnlockTime) external onlyOwner {
        drop_unlock_time = newUnlockTime;
    }

    function getTime() public view returns (uint256) {
        return block.timestamp;
    }
}