import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';

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
        <img src={playlist.imageUrl} style={{width: '60px'}}/>
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
    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

    // setTimeout(() => {
    //   this.setState({ serverData: fakeServerData });
    // },1000);

    if (!accessToken) {
      return;
    }

    fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({
        user: {
          name: data.id
        }
      });
    })

    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
    .then(res => res.json())
    .then(data => {
      console.warn(data);
      this.setState({
        playlists: data.items.map(item => ({
          name: item.name,
          songs: [],
          imageUrl: item.images[0].url
        }))
      })
    })
  }

  render() {
    console.warn(this.state);
    let playlistsToRender =
      this.state.user &&
      this.state.playlists
        ? this.state.playlists.filter(playlist =>
          playlist.name.toLowerCase().includes(
            this.state.filterString.toLowerCase()))
        : [];

    return (
      <div className="App">
        { this.state.user ?
          <div>
            <h1 style={{...defaultStyle, 'fontSize': '54px'}}>
            { this.state.user.name}'s Playlist
            </h1>
              <PlaylistCounter playlists={ playlistsToRender } />
              <HoursCounter playlists={ playlistsToRender } />
              <Filter onTextChange={text => this.setState({filterString: text})} />

              { playlistsToRender.map(playlist =>
                <Playlist playlist={playlist} />
              )}
          </div> :
          <button
            onClick={() => {
              window.location = window.location.href.includes('localhost')
                ? 'http://localhost:8888/login'
                : 'https://spot-playlists-backend.herokuapp.com/login';
            }}
            style={{
            padding: '10px',
            'fontSize': '18px',
            'marginTop': '50px'
          }}>Sign in with Spotify </button>
        }
      </div>
    );
  }
}

export default App;
