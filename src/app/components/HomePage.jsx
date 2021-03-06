import React from 'react';
import Streams from './Streams';
import Messages from './Messages';
import Users from './Users';
import Header from './Header';
import wrapper from '../styles/homePage';
import body from '../styles/body';

class HomePage extends React.Component {
  render() {
    return (
      <div style={wrapper}>
        <Header />
        <div style={body}>
          <Streams />
          <Messages />
          <Users />
        </div>
      </div>
    );
  }
}

export default HomePage;
