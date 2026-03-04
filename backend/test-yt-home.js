import YTMusic from 'ytmusic-api';
const ytmusic = new YTMusic();
ytmusic.initialize().then(() => {
    return ytmusic.getHomeSections();
}).then(res => {
    console.log("HOME SECTIONS:", JSON.stringify(res.slice(0, 2), null, 2));
}).catch(console.error);
