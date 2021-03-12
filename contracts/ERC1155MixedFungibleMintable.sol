pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/AccessControlEnumerable.sol";
import "./ERC1155MixedFungible.sol";

/**
    @dev Mintable form of ERC1155
    Shows how easy it is to mint new items
*/
contract ERC1155MixedFungibleMintable is AccessControlEnumerable, ERC1155MixedFungible {

    uint256 nonce;
    mapping (uint256 => address) public creators;
    mapping (uint256 => uint256) public maxIndex;

    modifier creatorOnly(uint256 _id) {
        //require(creators[_id] == msg.sender);
        require(hasRole(bytes32(_id), msg.sender), "Not creator");
        _;
    }

    constructor (string memory uri_) ERC1155MixedFungible(uri_) {}

    // This function only creates the type.
    function create(
        string calldata _uri,
        bool   _isNF)
    external returns(uint256 _type) {

        // Store the type in the upper 128 bits
        _type = (++nonce << 128);

        // Set a flag if this is an NFI.
        if (_isNF)
          _type = _type | TYPE_NF_BIT;

        // This will allow restricted access to creators.
        creators[_type] = msg.sender;
        _setupRole(bytes32(_type), msg.sender);

        // emit a Transfer event with Create semantic to help with discovery.
        emit TransferSingle(msg.sender, address(0x0), address(0x0), _type, 0);

        if (bytes(_uri).length > 0)
            emit URI(_uri, _type);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable, ERC1155MixedFungible) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}
