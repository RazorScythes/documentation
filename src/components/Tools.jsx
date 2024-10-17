const getLinkId = (url) => {
    let id;
    const youtubeMatch = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})(?:\S+)?$/;
    const dropboxMatch = /^(?:https?:\/\/)?(?:www\.)?dropbox\.com\/(?:s|sh)\/([\w\d]+)(?:\/.*)?$/;
    const megaMatch = /^(?:https?:\/\/)?mega\.(?:co\.nz|nz|io)\/(?:#!\/)?(?:file|enc|f)!([a-zA-Z0-9!_-]{8,})(?:\S+)?$/;
    const googleDriveMatch = /^(?:https?:\/\/)?drive\.google\.com\/(?:uc\?export=view&id=|file\/d\/|open\?id=)([^/&?#]+)/;
  
    if (youtubeMatch.test(url)) {
        id = url.match(youtubeMatch)[1];
    } else if (dropboxMatch.test(url)) {
        id = url.match(dropboxMatch)[1];
    } else if (megaMatch.test(url)) {
        id = url.match(megaMatch)[1];
    } else if (googleDriveMatch.test(url)) {
        id = url.match(googleDriveMatch)[1];
    } else {
        id = null;
    }
    return id;
}

export const convertDriveImageLink = (url) => {
    if(url.includes('drive.google.com'))
        return `https://drive.google.com/thumbnail?id=${getLinkId(url)}&sz=w1000`
    else
        return url
}

export const millisToTimeString = (millis) => {
    // Convert milliseconds to seconds
    var seconds = Math.floor(millis / 1000);
    // Calculate hours, minutes, and seconds
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    seconds %= 60;

    // Format the time string
    var timeString = "";
    if (hours > 0) {
        timeString += hours.toString().padStart(2, '0') + ":";
    }
    timeString += minutes.toString().padStart(2, '0') + ":" +
                  seconds.toString().padStart(2, '0');
    
    return timeString;
  }