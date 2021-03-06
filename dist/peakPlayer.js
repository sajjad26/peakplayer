/*
	Website	: 	http://www.peakplayer.com
	Author	: 	Sajjad Ashraf
	twitter  : 	https://twitter.com/sajjad26
*/
(function(){
	window.peakPlayer = function(options, songsArray){
		// the constructor function of peakPlayer
		this.defaults = {
			autoPlay: false,
			loop: false,
			volume: 100,
			songClass: "oneSound",
			random: false,
		}
		this.idPrefix = "song-";
		this.songs = [];
		this.song = false;
		this.lastSong = false;
		this.songIndex = 0;
		this.mute = false;
		this.loop = true;
		this.random = false;
		this.options = options || this.defaults;
		this.flashUrl = options.flashUrl || "";
		this.debug = options.debug || false;
		// now setting soundManager options
		this.sm = this.getSoundManager();
		this.setSoundManager(this.sm);
		if(typeof songsArray !== 'undefined'){
			this.addArraySongs(songsArray);
		}else{
			if(typeof this.parsePageSongs === 'function') this.parsePageSongs("oneSong");
		}
	};

	/* These are core methods which absolutely required for peakPlayer to function properly */

	peakPlayer.prototype = {
		getSoundManager : function(){
			if(window.soundManager){
				return window.soundManager;
			}
			return false;
		},
		setSoundManager : function(sm){
			if(sm){
				sm.url = this.options.flashUrl;
				sm.preferFlash = false;
				sm.flashVersion = 9;
				sm.debugMode = false;
				sm.flashPollingInterval = 1000;
				sm.waitForWindowLoad = true;
				sm.flash9Options.useEQData = true;
				sm.flash9Options.usePeakData = true;
			}
		},
		addSongs : function(songsArray){
			var song = {};
			var self = this;
			var index = this.songs.length;
			var loop = songsArray.length;
			for(var i = 0; i < loop; i++){
				if(!this.searchSong(songsArray[i].url)){
					song.name = songsArray[i].name;
					song.url = songsArray[i].url;
					song.index = index;
					song.id = this.idPrefix + index;
					song.smObject = false;
					this.songs.push(song);
					song = {};
					index++;
				}
			}
		},
		addSong : function(songName, songUrl){
			if(typeof songName !== 'undefined' && typeof songUrl !== 'undefined'){
				this.addSongs([{
					name : songName,
					url : songUrl,
				}]);
				return true;
			}
			return false;
		},
		searchSong : function(url, giveIndex){
			for (var i = this.songs.length - 1; i >= 0; i--) {

				if(this.songs[i].url === url){
					if(typeof giveIndex !== 'undefined' && giveIndex === true) return i;
					return true;
				}
			};
			return false;
		},
		setSong : function(songIndex){
				if(songIndex !== this.song.index){
					this.lastSong = this.song;
					this.song = this.songs[songIndex];
				}
		},
		getSoundIndex : function(songUrl, songsArray){
			var arrayLength = songsArray.length;
			for(var i = 0; i < arrayLength; i++){
				if(songsArray[i].url.toString() === songUrl.toString()){
					return songsArray[i].index;
				}
			}
			return false;
		},
		playSong : function(oneSongIndex){
			var self = this;
			if(typeof oneSongIndex === 'undefined'){
				if(this.song && this.song.smObject){
					oneSongIndex = this.song.index;
				}else{
					oneSongIndex = 0;
				}
			}
			/*
			if no song is played yet
			or
			the index passed is the index of a different song than the playing song
			*/
			this.setSong(oneSongIndex);
			if((false === this.song) || (false !== this.song && false === this.song.smObject)){
				// if this song is not played yet
				if(false !== this.lastSong && false !== this.lastSong.smObject){
					this.stopSong(this.lastSong);
				}
				this.song.smObject = this.sm.createSound({
					id: self.song.id,
					url: self.song.url,
					valume: self.options.volume,
					whileplaying: function(){
						if(typeof self.whilePlaying === 'function'){
							var elapsedTime = self.secondsToTime(this.position/1000);
							var totalTime = self.secondsToTime(this.durationEstimate/1000);
							var progress = (this.position / this.durationEstimate) * 100;
							self.whilePlaying(this, {"elapsedTime": elapsedTime,  "totalTime": totalTime}, progress);
						}
					},
					whileloading: function(){
						if(typeof self.whilePlaying === 'function'){
							var percentageLoaded = (this.bytesLoaded / this.bytesTotal) * 100;
							self.whileLoading(this, percentageLoaded);
						}
						if(this.readyState === 2){
							// loading has failed
							// removing this song from playlist
							self.songs.splice(self.song.index, 1);
							self.onPlayOrPause();
							self.loadingFailed(this);
						}
					},
					onfinish: function(){
						self.onPlayOrPause();
						if(typeof self.onFinish === 'function') self.onFinish(this);
					},
					onid3: function(){
						self.onid3(this);
					},
					onbufferchange: function(){
						if(this.readyState === 2){
							// loading has failed
							alert("loading failed");
							// removing this song from playlist
							self.songs.splice(self.song.index, 1);
							self.onPlayOrPause();
							self.loadingFailed(this);
						}
					}
				});
				this.song.smObject.play();
			}else if(false !== this.song && false !== this.song.smObject){
				// if this song is already played atleast once
				if(false !== this.lastSong && false !== this.lastSong.smObject){
					this.stopSong(this.lastSong);
				}
				this.song.smObject.togglePause();
			}else{
				/* THIS PLACE IS HAUNTED */
				/* NO TRESPASSING */
				/* WHAT HAVE YOU DONE, YOU WERE NEVER SUPPOSED TO COME HERE */
				/* ^_^ */
				/* console.log("i don't know whay to do"); */
			}
			this.onPlayOrPause();
			if(typeof this.performThemeRelatedTasks === 'function') this.performThemeRelatedTasks(oneSongIndex);
		},
		stopSong: function(songObject){
			songObject.smObject.stop();
			songObject.smObject.setPosition(0);
		},
		loadingFailed: function(songObject){
			//console.log(songObject);
			this.nextTrack();
		},
		onPlayOrPause : function(){
			if(this.mute){
				this.song.smObject.setVolume(0);
			}else{
				this.song.smObject.setVolume(100);
			}
			if(this.song.smObject.paused){
				if(typeof this.onPause === 'function') this.onPause(this.song);
			}else{
				if(typeof this.onPlay === 'function') this.onPlay(this.song);
			}
		},
		playTrack : function(name, url){
			if(typeof name !== 'undefined' && typeof url !== 'undefined'){
				var song = {
					name : name,
					url: url
				};
				this.addArraySongs([song]);
				this.playSong(this.searchSong(url, true));
			}else if(typeof name !== 'undefined' && typeof url === 'undefined'){
				this.playSong(name);
			} else{
				this.playSong();
			}
		},
		nextTrack : function(){
			this.playSong(this.getNextSongIndex());
		},
		previousTrack : function(){
			this.playSong(this.getPreviousSongIndex());
		},
		onid3 : function(songObject){},

		getPlaylist: function(){
			return this.songs;
		},
		getHTMLPlaylist: function(){
			var playlist = document.createElement("ul");
			var loop = this.songs.length;
			for(var i = 0; i < loop; i++){				
				var song = document.createElement("li");
				song.innerHTML = this.songs[i].name;
				song.id = this.songs[i].id;
				playlist.appendChild(song);
			}
			return playlist;
		},
		getCurrentSong: function(){
			return this.song;
		},

		seekToPosition : function(seekToPosition, seekWidth){
			seekToPosition = (seekToPosition/seekWidth) * 100;
			var newPosition = (this.song.smObject.durationEstimate/100)*seekToPosition;
			this.song.smObject.setPosition(newPosition);
		},
		toggleMute: function(){
			if(this.song.smObject.volume < 100){
				this.song.smObject.setVolume(100);
				this.mute = false;
			}else{
				this.song.smObject.setVolume(0);
				this.mute = true;
			}
		},		
		toggleLoop: function(){
			if(this.options.loop){
				this.options.loop = false;
			}else{
				this.options.loop = true;
			}
		},
		toggleRandom: function(){
			if(this.options.random){
				this.options.random = false;
			}else{
				this.options.random = true;
			}
		},				
		getNextSongIndex : function(){
			if(this.song.smObject){
				if(true === this.options.random && true !== this.options.loop){
					return this.getRandomSongIndex();
				}
				else if(true === this.options.loop){
					return this.song.index;
				}
				if((this.songs.length-1) > this.song.index){
					return this.song.index + 1;
				}else{
					return 0;
				}
			}else{
				return 0;
			}
		},
		getRandomSongIndex : function(){
			var randomIndex = Math.floor(Math.random()*this.songs.length);
			while(this.song.index === randomIndex){
				randomIndex = Math.floor(Math.random()*this.songs.length);
			}
			return randomIndex;
		},
		getPreviousSongIndex : function(){
			if(this.song.smObject){
				if(this.song.index === 0){
					return this.songs.length - 1;
				}else{
					return this.song.index - 1;
				}
			}
		},
		secondsToTime : function (secs){
		    // var hours = Math.floor(secs / (60 * 60));
		    var divisor_for_minutes = secs % (60 * 60);
		    var minutes = Math.floor(divisor_for_minutes / 60);
		    var divisor_for_seconds = divisor_for_minutes % 60;
		    var seconds = Math.ceil(divisor_for_seconds);
		    if(seconds > 59){
		    	minutes++;
		    	seconds = 0;
		    }
		    if(seconds < 10){
		    	seconds = "0" + seconds;
		    }
		    if(minutes < 10){
		    	minutes = "0" + minutes;
		    }

		    var obj = {
		        //"h": hours,
		        "m": minutes,
		        "s": seconds
		    };
		    return obj;
		},
	};

})();;(function(){
	$(document).ready(function(){
		var songsArray = window.songsArray || [
			{
				name: "Young Ac All I Be Doing",
				url: "http://xsongs.pk/downloads/young-ac-all-i-be-doing/v073887023_2119410002.mp3",
			},
			{
				name: "Please Dont Stop The Music",
				url: "http://a.tumblr.com/tumblr_lny5arjxY31qgzinjo1.mp3",
			},
			{
				name: "Hands up in the air",
				url: "http://tegos.ru/new/mp3_full/Timbaland_ft_Ne-Yo_-_Hands_In_The_Air.mp3"
			},
		];

		var options = {
			random: false,
			loop: false,
			flashUrl: "/node_modules/soundmanager2/swf/"
		};
		//console.log(peakPlayer);
		var myPeakPlayer = new peakPlayer(options);
		window.myPeakPlayer = myPeakPlayer;
		myPeakPlayer.addSongs(songsArray);

		$("#playSongButton").on({
			click : function(e){
				e.preventDefault();
				myPeakPlayer.playTrack();
			}
		});

		$("#nextSongButton").on({
			click : function(e){
				e.preventDefault();
				myPeakPlayer.nextTrack();
			}
		});

		$("#previousSongButton").on({
			click : function(e){
				e.preventDefault();
				myPeakPlayer.previousTrack();
			}
		});

		$("#loop").on({
			click : function(e){
				e.preventDefault();
				myPeakPlayer.toggleLoop();
				$(this).toggleClass("active");
			}
		});

		$("#random").on({
			click : function(e){
				e.preventDefault();
				myPeakPlayer.toggleRandom();
				$(this).toggleClass("active");
			}
		});

		$("#volume").on({
			click : function(e){
				e.preventDefault();
				myPeakPlayer.toggleMute();
				if($(this).find("i").hasClass("glyphicon-volume-off")){
					$(this).find("i").addClass("glyphicon-volume-up").removeClass("glyphicon-volume-off");
				}else{
					$(this).find("i").addClass("glyphicon-volume-off").removeClass("glyphicon-volume-up");
				}
			}
		});

		var volumeDown = false;
		var volumeWidth = $("#volumeBar").width();
		var knobWidth = $("#volumeBar").find("#volumeKnob").width();
		$("#volumeBar").on({
			click: function(e){
				var width = e.pageX - $(this).offset().left;
				$(this).find("#volumeSelected").css({
					width: width + "px"
				});
			},
			mousedown: function(e){
				volumeDown = true;
				console.log("down");
			},
			mouseup: function(e){
				volumeDown = false;
				console.log("up");
			},
			mousemove: function(e){
				if(volumeDown){
					var width = e.pageX - $(this).offset().left;
					if(width > ( volumeWidth - (knobWidth / 2)) || width < (knobWidth / 2)) return false;
					$(this).find("#volumeSelected").css({
						width: width + "px"
					});
					if(myPeakPlayer.song.smObject){
						myPeakPlayer.song.smObject.setVolume(width/2);
					}
				}
			},
			mouseleave: function(e){
				// volumeDown = false;
			}
		});

		$("#loadBar").on({
			click: function(e){
				e.preventDefault();
				var seekToPosition = e.pageX - $(this).parents(".main-player-container").position().left;
				var seekWidth = $(this).width();
				myPeakPlayer.seekToPosition(seekToPosition, seekWidth);
			}
		});

		myPeakPlayer.onPlay = function(currentSong){
			$("#playSongButton i").addClass('glyphicon-pause');
			$("#peakPlayer .song-name").text(currentSong.name);
			$("#playlist").find("ul").find("li.active").removeClass('active');
			$("#"+currentSong.id).addClass('active');
		};

		myPeakPlayer.onPause = function(currentSong){
			$("#playSongButton i").removeClass('glyphicon-pause');
		};

		myPeakPlayer.onFinish = function(currentSong){
			this.nextTrack();
		};

		myPeakPlayer.whilePlaying = function(songObject, timeObject, songProgress){
			$("#timeElapsed").text(timeObject.elapsedTime.m + ":" + timeObject.elapsedTime.s);
			$("#totalTime").text(timeObject.totalTime.m + ":" + timeObject.totalTime.s);
			$("#progressBar").css("width", songProgress + "%");
		};

		myPeakPlayer.whileLoading = function(songObject, percentageLoaded){
			$("#loadBar").css("width", percentageLoaded + "%");
		};

		// create playlist
		var playlist = myPeakPlayer.getHTMLPlaylist();
		$(playlist).find("li").click(function(event) {
			$(this).parents("ul").find("li.active").removeClass('active');
			$(this).addClass('active');
			var id = $(this).attr("id");
			myPeakPlayer.playTrack(id.match(/\d+$/)[0]);
		});
		$("#peakPlayer #playlist").html(playlist);


		
	});
})();