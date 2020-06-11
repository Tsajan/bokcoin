const BOKCoin = artifacts.require("BOKCoin");

contract('BOKCoin', function(accounts) {
	var tokenInstance; 

	it('initializes the contract with the corret values', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'BOKCoin', 'has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'BOK', 'has the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard) {
			assert.equal(standard, 'ERC20', 'has the correct standard');
		});
	})

	it('sets the total supply upon deployment', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 21000000, 'sets the total supply to 21 million');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 21000000, 'it allocates the total supply to the admin account');
			return tokenInstance.creator();
		}).then(function(creator) {
			assert.equal(creator, accounts[0], 'only creator account can deploy the contract');
		});
	});

	it('transfers token ownership', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			//test 'require' statement first by transferring something larger than the sender's balance
			return tokenInstance.transfer.call(accounts[1],99999999999999999);
		}).then(assert.fail).catch(function(error) {
			//assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 20750000, 'deducts balance from the sending accounts');
		})
	});

	it('approves tokens for delegated transfer', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'approve should be allowed');
			return tokenInstance.approve(accounts[1], 100);
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'should be the "transfer" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
			assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfers');
		});
	});

	it('handles delegated transfer', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			//transfers some tokens to fromAccount
			return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});

		}).then(function(receipt) {
			return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
		}).then(function(receipt) {
			//try transferring something larger than the sender's balance
			return tokenInstance.transferFrom(fromAccount, toAccount, 10000, {from: spendingAccount})
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
			//try tansferring something larger than approved amount
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(success) {
			assert.equal(success, true);
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "transfer" event');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 90, 'deducts the amount from sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 10, 'adds the amount to receiving account');
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 0, 'deducts the amount from allowance');
		});
	});

	it('handles addition of new tokens', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.addTokens.call(1000, {from: accounts[0]});
		}).then(function(success) {
			assert.equal(success, true, 'success must return true');
			return tokenInstance.addTokens(1000, {from: accounts[0]});
		}).then(function(dummy) {
			return tokenInstance.totalSupply();	
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 21001000, 'new added balance must be equal to 21001000');
		});
	});

	it('handles token burn', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.burnTokens.call(1, {from: accounts[0]});
		}).then(function(success) {
			assert.equal(success, true, 'burn success returns true');
			return tokenInstance.burnTokens(1, {from: accounts[0]});
		}).then(function(dummy) {
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 20750899, 'balance is reduced by 1 token correctly, new balance is 21000999');
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 21000999, 'totalSupply is reduced by 1 correctly. totalSupply is 21000999');
		});
	});

	it('handles offering of deposit', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.offerDeposit.call(5, 1, 100, {from: accounts[1]});
		}).then(function(success) {
			assert.equal(success, true, 'offer deposit returns true');
			return tokenInstance.offerDeposit(5, 1, 100, {from: accounts[1]});
		}).then(function() {
			return tokenInstance.depositCount();
		}).then(function(depositCount) {
			assert.equal(depositCount.toNumber(), 1, 'deposit count must be increased by 1');
			return tokenInstance.deposits(1);
		}).then(function(depositObj) {
			assert.equal(depositObj.id.toNumber(), 1, 'id is not equal to 1');
			assert.equal(depositObj.provider, accounts[1], 'provider is not set correctly');
			assert.equal(depositObj.rate, 5, 'rate is not set correctly');
			assert.equal(depositObj.timeperiod, 1, 'timeperiod is not set correctly');
			assert.equal(depositObj.maxDepositAmt, 100, 'maxDepositAmt is not set correctly');
			assert.equal(depositObj.isAvailable, true, 'isAvailable flag is still set to false');
		})
	});

	it('handles the deposits made', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.makeDeposit.call(1, 100, {from: accounts[0]});
		}).then(function(success) {
			assert.equal(success, true, 'make deposit returns true');
			return tokenInstance.makeDeposit(1, 100, {from: accounts[0]});
		}).then(function() {
			return tokenInstance.depositCount();
		}).then(function(depositCount) {
			assert.equal(depositCount.toNumber(), 1, 'deposit count must still be equal to 1');
			return tokenInstance.deposits(1);
		}).then(function(depositObj) {
			assert.equal(depositObj.principal, 100, 'principal value must be equal to 100');
			assert.equal(depositObj.depositor, accounts[0], 'depositor must be msg.sender i.e. accounts[2]');
			assert.equal(depositObj.starttime >= 0, true, 'starttime has initialized');
			assert.equal(depositObj.endtime >= 0, true, 'endtime has initialized');
			assert.equal(depositObj.interest, 5, 'interest value must equal 5');
			assert.equal(depositObj.amt, 105, 'amount must equal to 105');
			assert.equal(depositObj.isAvailable, false, 'isAvailable flag must update to false');
			assert.equal(depositObj.notRedeemed, true, 'notRedeemed flag must be set to true');
		});
	});


	it('confirming amount receipt', function() {
		return BOKCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.receiveBack.call(1, {from: accounts[0]});
		}).then(function(success) {
			assert.equal(success, true, 'receive back returns true');
			return tokenInstance.receiveBack(1, {from: accounts[0]});
		}).then(function() {
			return tokenInstance.depositCount();
		}).then(function(depositCount) {
			assert.equal(depositCount.toNumber(), 1, 'deposit count must still be equal to 1');
			return tokenInstance.deposits(1);
		}).then(function(depositObj) {
			assert.equal(depositObj.notRedeemed, false, 'notRedeemed flag must be set to false');
		});
	})

});