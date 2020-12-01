import React, { Component } from "react";
import KycBlockChain from "./contracts/KycBlockChain.json";
import getWeb3 from "./getWeb3";
import "./App.css";
const crypto = require("crypto");

const GetAllBankAccounts = (props) => {
  if (parseInt(props.bankcount) > 0) {
    return (
      <div>
        {props.banks.map((bank) => (
          <p key={bank.key}>{bank.address}</p>
        ))}
      </div>
    );
  } else {
    return (
      <div>
        <p>There are no verified Bank Accounts in this network!</p>
      </div>
    );
  }
};

class App extends Component {
  state = {
    web3: null,
    account: null,
    contract: null,
    name: null,
    aadhar: null,
    pan: null,
    getdata: null,
    data_hash: null,
    b_name: null,
    bank_verify: null,
    entity: null,
    allaccounts: null,
    allbanks: [],
    bank_count: 0,
    status: null,
    requestAddress: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = KycBlockChain.networks[networkId];
      const instance = new web3.eth.Contract(
        KycBlockChain.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        account: accounts[0],
        contract: instance,
        allaccounts: accounts,
      });
      this.whoami();
      this.numbanks();
      // this.GetAllBankAccounts();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  myNameChangeHandler = (event) => {
    this.setState({ name: event.target.value });
  };
  myAadharChangeHandler = (event) => {
    this.setState({ aadhar: event.target.value });
  };
  myPanChangeHandler = (event) => {
    this.setState({ pan: event.target.value });
  };

  myBankNameChangeHandler = (event) => {
    this.setState({ bname: event.target.value });
  };

  myDataChangeHandler = (event) => {
    this.setState({ getdata: event.target.value });
  };

  myVBankChangeHandler = (event) => {
    this.setState({ bank_verify: event.target.value });
  };

  requestAddressChange = (event) => {
    this.setState({ requestAddress: event.target.value });
  };

  whoami = async () => {
    var { contract } = this.state;
    const cus = await contract.methods
      .isCus()
      .call({ from: this.state.account });
    const org = await contract.methods
      .isOrg()
      .call({ from: this.state.account });

    var who = cus ? "Customer" : org ? "Bank" : "None";
    this.setState({ entity: who });
  };

  createmycustomer = async () => {
    var { contract } = this.state;
    await contract.methods
      .newCustomer(
        this.state.name,
        crypto
          .createHash("sha1")
          .update(this.state.name + this.state.aadhar + this.state.pan)
          .digest("hex"),
        this.state.bank_verify
      )
      .send({ from: this.state.account });
  };

  createmybank = async () => {
    var { contract } = this.state;

    await contract.methods
      .newOrganisation(this.state.bname)
      .send({ from: this.state.account });
  };

  getkycfromcustomer = async () => {
    var { contract } = this.state;
    const response = await contract.methods
      .viewCustomerData(this.state.getdata)
      .call({ from: this.state.account });

    this.setState({ data_hash: response });
  };

  get = async () => {
    var { contract } = this.state;
    var access = await contract.methods
      .isOrg()
      .call({ from: this.state.account });
    if (access) {
      this.getkycfromcustomer();
    } else {
      window.alert("You are not a verified Bank!");
    }
  };

  create_customer = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var access = await contract.methods
      .isCus()
      .call({ from: this.state.account })
      .then(
        () => {
          window.alert("You successfully made an account!");
        },
        () => {
          window.alert("You already have an account!");
        }
      );
    if (!access) {
      this.createmycustomer();
      this.whoami();
    }
  };

  create_bank = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var access = await contract.methods
      .isOrg()
      .call({ from: this.state.account })
      .then(
        () => {
          window.alert("You are now a verified Bank Entity!");
        },
        () => {
          window.alert("You already are a bank!");
        }
      );
    if (!access) {
      this.createmybank();
      this.whoami();
    }
  };

  modify_data = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var confirm = await contract.methods
      .isCus()
      .call({ from: this.state.account });
    if (confirm) {
      await contract.methods
        .modifyCustomerData(
          this.state.name,
          crypto
            .createHash("sha1")
            .update(this.state.name + this.state.aadhar + this.state.pan)
            .digest("hex"),
          this.state.bank_verify
        )
        .send({ from: this.state.account })
        .then(() => {
          window.alert("Data Changed!");
        });
    }
  };

  numbanks = async () => {
    var { contract } = this.state;
    var len = await contract.methods.bankslength().call();
    this.setState({ bank_count: len });
    var banks = [];
    if (parseInt(this.state.bank_count) > 0) {
      for (var i = 0; i < len; i++) {
        banks.push({
          key: i,
          address: await contract.methods.Banks(i).call(),
        });
      }
    }

    this.setState({ allbanks: banks });
  };

  getmystatus = async () => {
    var { contract } = this.state;
    var status = await contract.methods
      .checkStatus()
      .call({ from: this.state.account });

    if (status === "0") {
      this.setState({ status: "Accepted" });
    } else if (status === "1") {
      this.setState({ status: "Rejected" });
    } else if (status === "2") {
      this.setState({ status: "Pending" });
    } else {
      this.setState({ status: "Undefined" });
    }
  };

  viewRequests = async () => {
    var { contract } = this.state;
    var reqs = await contract.methods.viewRequests().call({
      from: this.state.account,
    });
    console.log(reqs);
  };

  accept = async () => {
    var { contract } = this.state;
    await contract.methods
      .changeStatusToAccepted(this.state.requestAddress)
      .send({ from: this.state.account })
      .then(
        () => {
          window.alert("Status Changed!");
        },
        () => {
          window.alert("You are not authorized!");
        }
      );
  };

  reject = async () => {
    var { contract } = this.state;
    await contract.methods
      .changeStatusToRejected(this.state.requestAddress)
      .send({ from: this.state.account })
      .then(
        () => {
          window.alert("Status Changed!");
        },
        () => {
          window.alert("You are not authorized!");
        }
      );
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>Current Account is a {this.state.entity} entity</h2>
        <h3>{this.state.account}</h3>
        <fieldset>
          <legend>
            <strong>Verified Bank Addresses</strong>
          </legend>
          <GetAllBankAccounts
            bankcount={this.state.bank_count}
            banks={this.state.allbanks}
          />
        </fieldset>

        <br />
        <br />

        <form action="." method="" onSubmit={this.create_customer}>
          <fieldset>
            <legend>
              <strong>Customer Registration Form</strong>
            </legend>
            <p>
              <label>Your Name </label>
              <input type="text" onChange={this.myNameChangeHandler} />
            </p>

            <p>
              <label>Your Aadhar </label>
              <input type="text" onChange={this.myAadharChangeHandler} />
            </p>

            <p>
              <label>Your Pan </label>
              <input type="text" onChange={this.myPanChangeHandler} />
            </p>

            <p>
              <label>Bank Address you want to verify your data with </label>
              <input type="text" onChange={this.myVBankChangeHandler} />
            </p>
            <p>
              <input type="submit" name="submit" value="Create Customer" />
            </p>
          </fieldset>
        </form>

        <br />
        <br />

        <form action="." method="" onSubmit={this.create_bank}>
          <fieldset>
            <legend>
              <strong>Bank Registration Form</strong>
            </legend>
            <p>
              <label>Bank Name </label>
              <input type="text" onChange={this.myBankNameChangeHandler} />
            </p>
            <p>
              <input type="submit" name="submit" value="Create bank" />
            </p>
          </fieldset>
        </form>

        <br />
        <br />

        <form action="." method="" onSubmit={this.modify_data}>
          <fieldset>
            <legend>
              <strong>Change Customer Data</strong>
            </legend>
            <p>
              <label>New Name </label>
              <input type="text" onChange={this.myNameChangeHandler} />
            </p>
            <p>
              <label>New Aadhar </label>
              <input type="text" onChange={this.myAadharChangeHandler} />
            </p>
            <p>
              <label>New Pan </label>
              <input type="text" onChange={this.myPanChangeHandler} />
            </p>
            <p>
              <label>New Bank Verify </label>
              <input type="text" onChange={this.myVBankChangeHandler} />
            </p>
            <p>
              <input type="submit" name="submit" value="Change Data" />
            </p>
          </fieldset>
        </form>

        <br />
        <br />

        <fieldset>
          <legend>
            <strong>Bank Requests</strong>
          </legend>
          <p>
            <button onClick={this.viewRequests}>View Requests</button>
          </p>
          <p>
            <label>Request Address </label>
            <input type="text" onChange={this.requestAddressChange} />
          </p>

          <p>
            <button onClick={this.accept}>Accept Request</button>

            <button onClick={this.reject}>Reject Request</button>
          </p>
        </fieldset>

        <br />
        <br />

        <div>
          <label>
            <strong>View Customer data hash</strong>
          </label>
          <p>
            <input type="text" onChange={this.myDataChangeHandler} />
          </p>
          <button onClick={this.get}>Get my Data</button>
          <p>The stored hash value is: {this.state.data_hash}</p>
        </div>

        <br />
        <br />

        <div>
          <label>
            <strong>View Customer Status</strong>
          </label>
          <p>
            <button onClick={this.getmystatus}>Get Customer Status</button>
          </p>
          <p>Customer Status is: {this.state.status}</p>
        </div>
      </div>
    );
  }
}

export default App;
