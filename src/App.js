import React, { Component } from 'react';
import 'reset-css/reset.css';
import './App.css';
import queryString from 'query-string';

let defaultStyle = {
  color: '#fff',
  'fontFamily': 'Verdana'
};

class PlaylistCounter extends Component {
  render() {
    let playlistCounterStyle = {
      ...defaultStyle,
      width: '40%',
      display: 'inline-block',
      marginBottom: '10px',
      fontSize: '14px',
      lineHeight: '30px'
    };
    return (
      <div style={playlistCounterStyle}>
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
    let totalDurationHours = Math.round(totalDuration/60)
    let isTooLow = totalDurationHours < 20;
    let hoursCounterStyle = {
      ...defaultStyle,
      width: '40%',
      display: 'inline-block',
      marginBottom: '10px',
      fontSize: '14px',
      lineHeight: '30px',
      color: isTooLow ? 'red' : 'white'
    };

    return (
      <div style={hoursCounterStyle}>
        <h2>{ totalDurationHours  } hours </h2>
      </div>
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div style={defaultStyle}>
        <img />
        <input
          type="text"
          onChange={event => this.props.onTextChange(event.target.value)}
          style={{
            ...defaultStyle,
            color: 'black',
            fontSize : '20px',
            padding: '10px',
            marginBottom: '30px'
          }}/>
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let {playlist, index} = this.props
    return (
      <div style={{
        ...defaultStyle,
        display: 'inline-block',
        width: '25%',
        height: '180px',
        padding: '10px',
        background: index % 2 ? '#C0C0C0' : 'black'
      }}>
        <img src={playlist.imageUrl} style={{width: '60px'}}/>
        <h3>{playlist.name}</h3>
        <ul style={{
          marginTop: '10px'
        }}>
          { playlist.songs.map(song =>
            <li style={{
              padddingTop: '2px'
            }}>{song.name}</li>
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
    .then(playlistData => {

      let playlists = playlistData.items;
      // console.warn(playlists);
      // Array of promises of tracks
      let trackDataPromises = playlistData.items.map(playlist =>
        fetch(playlist.tracks.href, {
          headers: { 'Authorization': 'Bearer ' + accessToken }
        }).then(response => response.json() ))

      // console.warn(trackDataPromises);

      // When all the promises have been resolved
      return Promise.all(trackDataPromises).then(trackDatas => {
          // console.log(trackDatas);

          trackDatas.forEach((trackData, index) => {
            playlists[index].trackDatas = trackData.items
              .map(item => item.track)
              .map(trackData => ({
                name: trackData.name,
                duration: trackData.duration_ms / 1000
              }))
          })
          return playlists;
        })
    })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        // console.log(item.trackDatas);
        return {
          name: item.name,
          imageUrl: item.images[0].url,
          songs: item.trackDatas.slice(0,3)
          }
        })
    }))
  }

  render() {
    // console.warn(this.state);

    let playlistsToRender =
      this.state.user &&
      this.state.playlists
        ? this.state.playlists.filter(playlist => {
          let matchesPlaylist = playlist.name.toLowerCase().includes(
            this.state.filterString.toLowerCase());

          let matchesSong = playlist.songs.find(song => song.name.toLowerCase().includes(
            this.state.filterString.toLowerCase()));

          return matchesPlaylist || matchesSong;
        })
        : [];

    return (
      <div className="App">
        { this.state.user ?
          <div>
            <h1 style={{...defaultStyle,
              fontSize: '54px',
              marginTop: '5px',
              marginBottom: '5px'
            }}>
            { this.state.user.name}'s Playlist
            </h1>
              <PlaylistCounter playlists={ playlistsToRender } />
              <HoursCounter playlists={ playlistsToRender } />
              <Filter onTextChange={text => this.setState({filterString: text})} />

              { playlistsToRender.map((playlist, i) =>
                <Playlist playlist={playlist} index={i} />
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
