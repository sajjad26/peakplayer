(function(){
	$(document).ready(function(){
		console.log(window.songsArray);
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