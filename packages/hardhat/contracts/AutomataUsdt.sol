//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title AutomataUsdt
 * @author Lazarus (Refactored for EIP-712)
 * @notice A secure, generic, gasless USDT payment contract for the Automata platform.
 * @dev Inherits from EIP712 and Nonces to support signature-based authorization.
 * The relayer (msg.sender) submits a user's signature to authorize the transfer.
 */
contract AutomataUsdt is Ownable, EIP712, Nonces {
    // --- State Variables ---

    IERC20 public immutable usdtToken;

    // --- EIP-712 ---

    // Struct for the meta-transaction permit
    struct Permit {
        address from;
        address to;
        uint256 amount;
        uint256 deadline;
        uint256 nonce;
    }

    // Typehash for the Permit struct
    // solhint-disable-next-line var-name-mixedcase
    bytes32 public constant PERMIT_TYPEHASH =
        keccak256(
            "Permit(address from,address to,uint256 amount,uint256 deadline,uint256 nonce)"
        );

    // --- Events ---

    event PaymentSent(
        address indexed from,
        address indexed to,
        uint256 amountSent
    );

    // --- Constructor ---

    constructor(
        address _usdtTokenAddress
    ) Ownable(msg.sender) EIP712("AutomataUsdt", "1") {
        require(
            _usdtTokenAddress != address(0),
            "AutomataUsdt: USDT address cannot be zero"
        );
        usdtToken = IERC20(_usdtTokenAddress);
    }

    // --- Core Logic (Meta-Transaction) ---

    /**
     * @notice Returns the current nonce for an address.
     * @dev Allows off-chain services to query the nonce for signature generation.
     * @param owner The address to query the nonce for.
     * @return The current nonce.
     */
    function nonces(address owner) public view override returns (uint256) {
        return super.nonces(owner);
    }

    /**
     * @notice Processes a USDT payment via a meta-transaction.
     * @dev The relayer (msg.sender) submits the user's signature (v, r, s)
     * to authorize a transfer *from* the user's wallet.
     * The user ('from') MUST have approved this contract to spend their USDT.
     * @param from The user's address authorizing the transfer.
     * @param to The final recipient's address.
     * @param amount The net amount of USDT the recipient should receive.
     * @param deadline The timestamp after which the signature is invalid.
     * @param v The recovery id of the signature.
     * @param r The r value of the signature.
     * @param s The s value of the signature.
     */
    function sendPaymentMeta(
        address from,
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        // 1. Verify deadline
        require(block.timestamp <= deadline, "AutomataUsdt: Signature expired");

        // 2. Get the current nonce for the user
        uint256 currentNonce = nonces(from);

        // 3. Construct the permit and compute its EIP-712 digest
        Permit memory permit = Permit({
            from: from,
            to: to,
            amount: amount,
            deadline: deadline,
            nonce: currentNonce
        });
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(PERMIT_TYPEHASH, permit.from, permit.to, permit.amount, permit.deadline, permit.nonce)
            )
        );

        // 4. Recover the signer from the signature
        address signer = ECDSA.recover(digest, v, r, s);

        // 5. Verify signer == from
        require(signer != address(0), "AutomataUsdt: Invalid signature");
        require(signer == from, "AutomataUsdt: Signer does not match 'from' address");

        // 6. Use the nonce to prevent replay attacks
        _useNonce(signer);

        // 7. Execute the core logic: transfer 'amount' from 'from' to 'to'
        // The user ('from') must have approved this contract to spend 'amount' USDT
        bool recipientSuccess = usdtToken.transferFrom(from, to, amount);
        require(recipientSuccess, "AutomataUsdt: Transfer to recipient failed");

        // 8. Emit the event
        emit PaymentSent(
            from, // The user, not the relayer (msg.sender)
            to,
            amount
        );
    }

    // --- Admin Functions (Good Hygiene) ---

    /**
     * @notice Allows the owner to withdraw any native AVAX
     * accidentally sent to this contract.
     */
    function withdrawAVAX() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "AutomataUsdt: Failed to withdraw native currency");
    }

    /**
     * @notice Allows the owner to rescue any ERC20 tokens
     * accidentally sent to this contract's address (e.g., if a user
     * sends tokens *to* the contract instead of approving it).
     */
    function withdrawTokens(IERC20 _tokenAddress) public onlyOwner {
        uint256 balance = _tokenAddress.balanceOf(address(this));
        require(balance > 0, "AutomataUsdt: No tokens to withdraw");
        bool success = _tokenAddress.transfer(owner(), balance);
        require(success, "AutomataUsdt: Failed to withdraw tokens");
    }
}