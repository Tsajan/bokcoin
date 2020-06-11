App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	accountBalance: 0,
	totalSupply: 0,

	init: function() {
		console.log("App initialized...")
		return App.initWeb3();
	},

	initWeb3: function() {
		if (typeof web3 !== 'undefined') {
			//if a web3 instance is already provided by metamask
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			//specify default instance if no web3 instance provided
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}

		return App.initContracts();
	},

	initContracts: function() {
		$.getJSON("BOKCoin.json", function(bokcoin) {
			App.contracts.BOKCoin = TruffleContract(bokcoin);
			App.contracts.BOKCoin.setProvider(App.web3Provider);
			App.contracts.BOKCoin.deployed().then(function(bokcoin) {
				console.log("BOKCoin Address: ", bokcoin.address)
			});
			return App.render();
		})
		
	},

	render: function() {

		//command to enable metamask connection
		ethereum.enable();


		//access the connected account
		web3.eth.getCoinbase(function(err, account) {
			if(err === null) {
				console.log("account: ", account);
				App.account = account;
				$('#accountAddress').html("Your Account: " + account);
			}
		})

		App.contracts.BOKCoin.deployed().then(function(instance) {
			bokcoinInstance = instance;
			return bokcoinInstance.balanceOf(App.account);
		}).then(function(accountBal) {
			console.log("Corresponding Account has " , accountBal.toNumber());
			App.accountBalance = accountBal;
			$('#accountBalance').html(accountBal.toNumber());
			return bokcoinInstance.totalSupply();
		}).then(function(totalSupply) {
			App.totalSupply = totalSupply;
			$('#totalSupply').html(totalSupply.toNumber());
		});
	},

	addTokens: function() {
		var quantityToAdd = $('#quantityToAdd').val();
		App.contracts.BOKCoin.deployed().then(function(instance) {
			bokcoinInstance = instance;
			return bokcoinInstance.addTokens(quantityToAdd, {
				from: App.account,
				gas: 500000
			}).then(function(result) {
				console.log("New tokens added");
			});
		})
	},

	burnTokens: function() {
		var quantityToBurn = $('#quantityToBurn').val();
		App.contracts.BOKCoin.deployed().then(function(instance) {
			bokcoinInstance = instance;
			return bokcoinInstance.burnTokens(quantityToBurn, {
				from: App.account,
				gas: 500000
			}).then(function(result) {
				console.log("Tokens burned successfully");
			})
		})
	},

	transferTokens: function() {
		var recipient = $('#recipient').val();
		var transferamt = $('#transferamt').val();
		App.contracts.BOKCoin.deployed().then(function(instance) {
			bokcoinInstance = instance;
			return bokcoinInstance.transfer(recipient, transferamt, {
				from: App.account,
				gas: 500000
			}).then(function(result) {
				console.log("Transfer completed successfully");
			})
		})
	},

	offerDeposit: function() {
		var rateOffered = $('#rateOffered').val();
		var timeperiod = $('#timeperiod').val();
		var maxAcptDeposit = $('#maxAcptDeposit').val();
		App.contracts.BOKCoin.deployed().then(function(instance) {
			bokcoinInstance = instance;
			return bokcoinInstance.offerDeposit(rateOffered, timeperiod, maxAcptDeposit, {
				from: App.account,
				gas: 500000
			}).then(function(result) {
				console.log("An account has offered deposit");
			})
		})
	},

	makeDeposit: function() {
		var depositid = $('#depositid').val();
		var principal = $('#principal').val();
		App.contracts.BOKCoin.deployed().then(function(instance) {
			bokcoinInstance = instance;
			return bokcoinInstance.makeDeposit(depositid, principal, {
				from: App.account,
				gas: 500000
			}).then(function(result) {
				console.log("An account has made deposit");
			})
		})
	},

	redeemDeposit: function() {
		var depositid = $('#depositid').val();
		App.contracts.BOKCoin.deployed().then(function(instance) {
			bokcoinInstance = instance;
			return bokcoinInstance.receiveBack(depositid, {
				from: App.account,
				gas: 500000
			}).then(function(result) {
				console.log("Redemption of a deposit made is completed");
			})
		})
	}
}

$(function() {
	$(window).load(function() {
		App.init();
	})
});