import React, { Component } from "react";
import KycBlockChain from "./contracts/KycBlockChain.json";
import getWeb3 from "./getWeb3";
import "./App.css";
const crypto = require("crypto");

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
      this.setState({ web3, account: accounts[0], contract: instance });
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

  createmycustomer = async (e) => {
    e.preventDefault();
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

  createmybank = async (e) => {
    e.preventDefault();
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

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>Current Account</h2>
        <p>{this.state.account}</p>
        <form
          action="."
          method=""
          class="form"
          onSubmit={this.createmycustomer}
        >
          <fieldset>
            <legend>I am a Customer</legend>
            <p>
              <label>Customer Name</label>
              <input type="text" onChange={this.myNameChangeHandler} />
            </p>

            <p>
              <label>Customer Aadhar</label>
              <input type="text" onChange={this.myAadharChangeHandler} />
            </p>

            <p>
              <label>Customer Pan</label>
              <input type="text" onChange={this.myPanChangeHandler} />
            </p>

            <p>
              <label>Bank Verify</label>
              <input type="text" onChange={this.myVBankChangeHandler} />
            </p>
          </fieldset>

          <p>
            <input type="submit" name="submit" value="Save" class="button" />
          </p>
        </form>

        <form action="." method="" class="form" onSubmit={this.createmybank}>
          <fieldset>
            <legend>I am a Bank</legend>
            <p>
              <label>Bank Name</label>
              <input type="text" onChange={this.myBankNameChangeHandler} />
            </p>
          </fieldset>

          <p>
            <input type="submit" name="submit" value="Save" class="button" />
          </p>
        </form>

        <div>
          <p>
            <label>View KYC data</label>
            <p>
              <input type="text" onChange={this.myDataChangeHandler} />
            </p>
          </p>
          <button onClick={this.getkycfromcustomer}>Get my Data</button>
          <p>The stored value is: {this.state.data_hash}</p>
        </div>
      </div>
    );
  }
}

export default App;
