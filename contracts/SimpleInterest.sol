pragma solidity >=0.4.21 <0.6.0;
import "./SafeMath.sol";

contract SimpleInterest {
	using SafeMath for uint256;
	address payable public depositor;
	address payable public bank;
	uint256 public rate;
	uint256 public timeperiod;
	uint256 public principal;
	uint256 public endtime;
	uint256 public starttime;
	uint256 public interest;
	uint256 public amt;
	bool public isPaidBack;

	constructor() public {
		bank = address(uint160(address(this)));
	}

	modifier endTimeElapsed() {
		require(now >= endtime, "Redemption time has not reached.");
		_;
	}

	modifier callFromDepositor() {
		require(msg.sender == depositor, "Call back is only allowed from depositor");
		_;
	}

	modifier isActive() {
		require(isPaidBack == false, "Amount must not be paid");
		_;
	}

	function makeDeposit(uint256 _rate, uint256 _timeperiod) public payable returns (bool success) {
		principal = msg.value;
		rate = _rate;
		timeperiod = _timeperiod;
		starttime = now;
		endtime = now + timeperiod * 1 minutes;
		depositor = msg.sender;
		isPaidBack = false;
		return true;
	}

	function receiveBack() public payable endTimeElapsed callFromDepositor isActive returns (bool success) {
		uint256 _ptr;
		_ptr = (principal.mul(rate)).mul(timeperiod);
		interest = _ptr.div(100);
		amt = principal.add(interest);
		depositor.transfer(amt);
		isPaidBack = true;
		return true;
	}
}