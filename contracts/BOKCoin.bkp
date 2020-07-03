pragma solidity >=0.4.21 <0.6.0;
import "./SafeMath.sol";

contract BOKCoin {
	//use SafeMath library
	using SafeMath for uint256;

	//Name of token
	string public name = "BOKCoin";
	//Symbol of token
	string public symbol = "BOK";
	//Standard of token
	string public standard = "ERC20";
	address public burner;
	address public creator;
	uint256 public totalSupply = 0; //maybe initialize it in constructor

	//create a state variable to record totalDeposits so far
	uint256 public depositCount = 0; //maybe use it in constructor

	//create struct for interest deposit
	struct Deposit {
		uint256 id;
		address payable depositor;
		address payable provider;
		uint256 rate;
		uint256 timeperiod;
		uint256 principal;
		uint256 maxDepositAmt;
		uint256 endtime;
		uint256 starttime;
		uint256 interest;
		uint256 amt;
		bool isAvailable;
		bool notRedeemed;
	}

	//create a dynamic array of deposits
	mapping(uint256=>Deposit) public deposits;


	mapping(address=>uint256) public balanceOf;
	mapping(address=> mapping(address=>uint256)) public allowance;

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value

	);

	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);

	constructor(uint256 _initialSupply) public {
		totalSupply += _initialSupply; //we want to be able to issue tokens later
		creator = msg.sender; //the one who deploys the contract will be the owner/creator
		burner = 0x0000000000000000000000000000000000000000;
		balanceOf[msg.sender] = totalSupply; //initialize totalSupply to the address creator

	}

	modifier onlyCreator() {
		require(msg.sender == creator, "Only creator is allowed of this action");
		_;
	}

	// transfer
	function transfer(address _to, uint256 _value) public returns (bool success) {
		// exception if account doesn't have enough
		require(balanceOf[msg.sender] >= _value);
		//transfer the balance
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;
		// transfer event
		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	//msg.sender is allowing _spender to spend _value tokens from msg.sender accounts
	function approve(address _spender, uint256 _value) public returns (bool success) {
		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function addTokens(uint256 _quantity) public onlyCreator returns (bool success) {
		totalSupply += _quantity;
		balanceOf[creator] += _quantity;
		return true;
	}

	function burnTokens(uint256 _quantity) public returns (bool success) {
		transfer(burner, _quantity);
		totalSupply -= _quantity;
		return true;
	}

	//the caller is an authorized address by _from address
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
		require(balanceOf[_from] >= _value);
		require(_value <= allowance[_from][msg.sender]);
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;
		allowance[_from][msg.sender] -= _value;
		emit Transfer(_from, _to, _value);
		return true;
	}

	//provider offers deposits
	function offerDeposit(uint256 _rate, uint256 _timeperiod, uint256 _maxDepositAmt) public returns (bool success) {
		//perform basic requirement check 
		require(balanceOf[msg.sender] >= _maxDepositAmt, "Provider doesn't have minimum balance");
		depositCount++;

		//initialize the Deposit struct for the corresponding id
		deposits[depositCount] = Deposit(depositCount, 0x0000000000000000000000000000000000000000, 0x0000000000000000000000000000000000000000, 0, 0, 0, 0, 0, 0, 0, 0, false, false);

		//update the fields of the created Deposit struct
		deposits[depositCount].id = depositCount;
		deposits[depositCount].provider = msg.sender;
		deposits[depositCount].rate = _rate;
		deposits[depositCount].timeperiod = _timeperiod;
		deposits[depositCount].maxDepositAmt = _maxDepositAmt;
		deposits[depositCount].isAvailable = true;
		return true;
	}

	//depositor makes deposit
	function makeDeposit(uint256 _id, uint256 _principal) public payable returns (bool success) {
		// basic requirements checks
		require(balanceOf[msg.sender] >= _principal, "Depositor must have sufficient tokens to make deposits");
		require(_principal <= deposits[_id].maxDepositAmt, "Cannot make deposit for value greater than offered");
		require(deposits[_id].isAvailable == true, "Cannot make deposit to an unavailable state");
		
		//setup values for the deposits mapping
		deposits[_id].depositor = msg.sender;
		deposits[_id].principal = _principal;
		deposits[_id].starttime = now;
		deposits[_id].endtime = deposits[_id].starttime + deposits[_id].timeperiod * 1 minutes;
		deposits[_id].notRedeemed = true;
		deposits[_id].isAvailable = false;

		//transfer the amounts from depositor to provider
		address payable _provider = deposits[_id].provider;
		balanceOf[msg.sender] -= _principal;
		balanceOf[_provider] += _principal;

		//calculate interest and amount that will be later redeemed
		uint256 _ptr;
		uint256 _rate = deposits[_id].rate;
		uint256 _timeperiod = deposits[_id].timeperiod;
		_ptr = (_principal.mul(_rate)).mul(_timeperiod);
		deposits[_id].interest = _ptr.div(100);
		deposits[_id].amt = _principal.add(deposits[_id].interest);

		return true;

	}

	function receiveBack(uint256 _id) public payable returns (bool success) {
		// basic requirements checks
		require(now >= deposits[_id].endtime, "Redemption time has not reached.");
		require(msg.sender == deposits[_id].depositor, "Call back is only allowed from depositor.");
		require(deposits[_id].notRedeemed == true, "Redemption should not have been made yet.");

		//retrive amount and provider from deposits
		uint256 _amount = deposits[_id].amt;
		address payable _provider = deposits[_id].provider;
		balanceOf[msg.sender] += _amount;
		balanceOf[_provider] -= _amount;

		//update notRedeemed flag
		deposits[_id].notRedeemed = false;

		return true;
	}
}