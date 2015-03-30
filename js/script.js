(function(){
	$(document).ready(function(){

		var songsArray = [
			{
				name: "Please Dont Stop The Music",
				url: "http://a.tumblr.com/tumblr_lny5arjxY31qgzinjo1.mp3",
			},
			{
				name: "Hands up in the air",
				url: "http://tegos.ru/new/mp3_full/Timbaland_ft_Ne-Yo_-_Hands_In_The_Air.mp3"
			},
			{
				name: "Bonfire - Knife Party",
				url: "http://www.hulkshare.com/ap-n0eckf30xybk.mp3",
			},
		];

		var options = {
			random: false,
			loop: false,
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

		$("#loadBar").on({
			click: function(e){
				e.preventDefault();
				var seekToPosition = e.pageX - $(this).position().left;
				var seekWidth = $(this).width();
				myPeakPlayer.seekToPosition(seekToPosition, seekWidth);
			}
		});

		myPeakPlayer.onPlay = function(currentSong){
			$("#playSongButton i").addClass('glyphicon-pause');
			$(".songName").text(currentSong.name);
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
		
	});
})();