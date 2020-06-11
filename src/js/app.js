App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	accountBalance: 0,

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

		});
	}
}

$(function() {
	$(window).load(function() {
		App.init();
	})
});