import React from 'react';
import TextInput from './TextInput.jsx';
import Button from './Button.jsx';

class SignInForm extends React.Component {
  constructor() {
    super();
    this.state = {apiKey: '', email: ''};
  }

  login(e) {
    e.preventDefault();
    localStorage.email = this.state.email;
    localStorage.apiKey = this.state.apiKey;
    console.log(localStorage.email);
    console.log(localStorage.apiKey);
  }

  onEmailChange(e) {
    this.setState({email: e.target.value});
  }

  onAPIKeyChange(e) {
    this.setState({apiKey: e.target.value});
  }

  render() {
    return <form onSubmit={this.login}>
      <label htmlFor="email">Email address</label>
      <TextInput id="email"
        name="email"
        placeholder="Your zulip account's email address"
        onChange={this.onEmailChange}
      />
      <label htmlFor="API-key">API Key</label>
      <TextInput id="API-key" 
        name="API-key" 
        placeholder="Paste your API key here!" 
        onChange={this.onAPIKeyChange} 
      />
      <Button value="Sign In!" />
    </form>;
  }
}

export default SignInForm;