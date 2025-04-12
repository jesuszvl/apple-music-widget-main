set artworkPath to "/Users/jesuszavala/Documents/streams/apple-music-widget-main/public/artwork.jpg"

if application "Music" is running then
	tell application "Music"
		if player state is playing then
			set trackName to name of current track
			set artistName to artist of current track
			set albumName to album of current track

			try
				set artworkData to data of artwork 1 of current track
				set outFile to open for access POSIX file artworkPath with write permission
				set eof of outFile to 0
				write artworkData to outFile
				close access outFile
			on error errMsg
				return "ERROR: " & errMsg
			end try

			set currentTime to player position
			set totalTime to duration of current track

			return trackName & "||" & artistName & "||" & albumName & "||" & currentTime & "||" & totalTime
		else
			return "Paused"
		end if
	end tell
else
	return "Closed"
end if
