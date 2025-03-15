// ====== CONFIG ======
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const usdtAddress = "YOUR_USDT_TOKEN_ADDRESS";
const contractABI = [ /* Paste your Contract ABI here */ ];

let web3;
let account;
let contract;

// ====== INIT WEB3 ======
async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        account = accounts[0];
        document.getElementById("walletAddress").innerText = `Connected: ${account}`;
        contract = new web3.eth.Contract(contractABI, contractAddress);
        loadDashboard();
    } else {
        alert("Please install Metamask!");
    }
}

// ====== LOAD DASHBOARD ======
async function loadDashboard() {
    const userDetails = await contract.methods.getUserDetails(account).call();
    document.getElementById("balance").innerText = web3.utils.fromWei(userDetails[0], "ether");
    document.getElementById("totalPairs").innerText = userDetails[1];
    document.getElementById("referrals").innerText = userDetails[4];
}

// ====== DEPOSIT ======
async function deposit() {
    const amount = document.getElementById("depositAmount").value;
    const referrer = document.getElementById("referrerAddress").value || "0x0000000000000000000000000000000000000000";

    if (amount < 10) {
        alert("Minimum deposit is 10 USDT");
        return;
    }

    const usdtContract = new web3.eth.Contract([
        { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }
    ], usdtAddress);

    const value = web3.utils.toWei(amount, "ether");

    // Approve USDT Spend
    await usdtContract.methods.approve(contractAddress, value).send({ from: account });

    // Deposit
    await contract.methods.deposit(value, referrer).send({ from: account });

    alert("Deposit Successful!");
    loadDashboard();
}

// ====== WITHDRAW ======
async function withdraw() {
    const amount = document.getElementById("withdrawAmount").value;

    if (amount < 5) {
        alert("Minimum withdrawal is 5 USDT");
        return;
    }

    const value = web3.utils.toWei(amount, "ether");

    // Withdraw
    await contract.methods.withdraw(value).send({ from: account });

    alert("Withdrawal Successful!");
    loadDashboard();
}

// ====== TRANSACTION HISTORY ======
async function loadTransactionHistory() {
    const history = await contract.methods.getUserTransactions(account).call();
    const historyList = document.getElementById("transactionHistory");
    historyList.innerHTML = "";

    history.forEach(tx => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `Tx: ${tx}`;
        historyList.appendChild(li);
    });
}

// ====== EVENT LISTENERS ======
document.getElementById("connectWallet").onclick = initWeb3;
document.getElementById("depositBtn").onclick = deposit;
document.getElementById("withdrawBtn").onclick = withdraw;
