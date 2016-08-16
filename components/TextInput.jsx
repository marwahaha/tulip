import React from 'react';

class TextInput extends React.Component {
  render() {
    const style = {
      WebkitAppearance: 'none',
      fontFamily: 'inherit',
      background: 'white',
      color: '#4A525A',
      borderColor: '#D1D0CE',
      fontWeight: '300',
      border: 'thin solid',
      fontSize: '0.8em',
      padding: '0.2em',
      paddingLeft: '0.4em',
      paddingRight: '0.4em',
      marginRight: '0.1em',
      borderRadius: '0.2em'
    };
    return <input id={this.props.id}
      name={this.props.name}
      placeholder={this.props.placeholder}
      onChange={this.props.onChange}
      style={style}
      type="text"
    />;
  }
}

export default TextInput;