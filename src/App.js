import React, { Component } from 'react';
import './App.css';

let defaultStyle = {
  color: '#fff'
};

let fakeServerData = {
  user: {
    name: 'David',
    playlists: [{
      name: 'My favorites',
      songs: [
        {name: 'song 1', duration: 1234},
        {name: 'song 2', duration: 1334},
        {name: 'song 3', duration: 1251}
      ]
    },{
      name: 'Discovery Weekly',
      songs: [
        {name: 'song 1', duration: 2222},
        {name: 'song 2', duration: 1399},
        {name: 'song 3', duration: 10976}
      ]
    },{
      name: 'Drake Specials',
      songs: [
        {name: 'song 1', duration: 1234},
        {name: 'song 2', duration: 8777},
        {name: 'song 3', duration: 987}
      ]
    },{
      name: '90s hits',
      songs: [
        {name: 'song 11', duration: 1087},
        {name: 'song 22', duration: 10009},
        {name: 'song 33 ', duration: 7648}
      ]
    }]
  }
};

class PlaylistCounter extends Component {
  render() {
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{ this.props.playlists.length } playlists </h2>
      </div>
    );
  }
}

class HoursCounter extends Component {
  render() {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist)=> {
      return songs.concat(eachPlaylist.songs);
    }, []);
    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration;
    }, 0)

    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{ Math.round(totalDuration/60) } hours </h2>
      </div>
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div style={defaultStyle}>
        <img />
        <input type="text" onChange={event =>
          this.props.onTextChange(event.target.value)} />
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let {playlist} = this.props
    return (
      <div style={{...defaultStyle, display: 'inline-block', width: '25%'}}>
        <img />
        <h3>{playlist.name}</h3>
        <ul>
          { playlist.songs.map(song =>
            <li>{song.name}</li>
          )}
        </ul>
      </div>
    );
  }
}


class App extends Component {
  constructor() {
    super();
    this.state = {
      serverData: {},
      filterString: '',
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ serverData: fakeServerData });
    },1000);
  }

  render() {
    console.warn(this.state);
    let playlistsToRender = this.state.serverData.user? this.state.serverData.user.playlists
      .filter(playlist =>
        playlist.name.toLowerCase().includes(
          this.state.filterString.toLowerCase())
    ) : [];

    return (
      <div className="App">
        { this.state.serverData.user ?
          <div>
            <h1 style={{...defaultStyle, 'fontSize': '54px'}}>
            { this.state.serverData.user.name}'s Playlist
          </h1>
            <PlaylistCounter playlists={ playlistsToRender } />
            <HoursCounter playlists={ playlistsToRender } />
            <Filter onTextChange={text => this.setState({filterString: text})} />

            { playlistsToRender.map(playlist =>
              <Playlist playlist={playlist} />
            )}
          </div> : <h1>loading...</h1>
        }
      </div>
    );
  }
}

export default App;
