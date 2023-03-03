// SPDX-License-Identifier: MIT

// Pragma
pragma solidity ^0.8.8;
// Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";
import "./PriceConverter.sol";
// Error Codes
error FundMe__NotOwner();
error FundMe__AmountTooLess();
error FundMe__CallFailed();

// gas optimisation
// deploy: 856181
// after adding constant and immutable: 811668
// after adding constant, immutable and custom error

// Interfaces, Librarires, Contracts

/** @title A contract for crowd funding
 *  @author Shikhin Arora
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConcerter for uint;

    // State Variables
    address[] private s_funders;
    mapping(address => uint) private s_addressToAmountFunded;
    address private immutable i_owner;
    uint256 public constant MIN_AMOUNT = 50 * 1e18;
    AggregatorV3Interface private s_priceFeed;

    // Modifiers
    modifier onlyOwner(){
        // require(msg.sender == i_owner, "Only owner has the privilidge to do this");
        if (msg.sender != i_owner) { revert FundMe__NotOwner(); }
        _;
    }

    // Functions
    // Functions Order:
    // constructor
    // receive
    // fallback
    // external
    // public
    // internal
    // private
    // view / pure


    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        // console.log("constructor %s", i_owner);
    }

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    /**
     *  @notice This function funds this contract
     *  @dev This implements price feeds as our library
     */
    function fund() payable public {
        uint256 amountInUsd = msg.value.getExchangeRate(s_priceFeed);
        // require(amountInUsd >= MIN_AMOUNT, "Don't be a cheap ass!!");
        if (amountInUsd < MIN_AMOUNT) { revert FundMe__AmountTooLess(); }
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        for(uint funderIndex = 0; funderIndex < s_funders.length; funderIndex++) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        // require(callSuccess, "Call failed!");
        if (!callSuccess) { revert FundMe__CallFailed(); }
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for(uint funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        // require(callSuccess, "Call failed!");
        if (!callSuccess) { revert FundMe__CallFailed(); }
    }

    function getFunder(uint256 index) public view returns(address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return s_priceFeed;
    }
}