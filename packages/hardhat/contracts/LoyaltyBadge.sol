//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LoyaltyBadge
 * @author Lazarus
 * @notice A simple ERC721 contract for minting loyalty badges.
 * @dev This contract is owned by the relayer, which is the only address
 * authorized to mint new badges via the `safeMint` function.
 * It inherits from ERC721 and ERC721Pausable, with minting controlled
 * by the owner for simplicity in our relayer-based architecture.
 */
contract LoyaltyBadge is ERC721, ERC721Pausable, Ownable {
    /**
     * @notice Initializes the contract, setting the name, symbol, and owner.
     * @param _owner The address of the relayer/deployer that will own this contract.
     */
    constructor(
        address _owner
    )
        ERC721("Automata Loyalty Badge", "ALB")
        Ownable(_owner)
    {}

    /**
     * @notice Safely mints a new loyalty badge to a recipient.
     * @dev This function is restricted to the contract owner (our relayer).
     * @param to The address to receive the new NFT.
     * @param tokenId The unique ID for the new NFT.
     */
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    /**
     * @notice Pauses all token transfers.
     * @dev Can only be called by the owner.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses all token transfers.
     * @dev Can only be called by the owner.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Override required by Solidity for ERC721Pausable.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}