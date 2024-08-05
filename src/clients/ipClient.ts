import axios from "axios";


export async function getIP() {
    const ipResponse = await axios.get("http://ipinfo.io/?format=jsonp&callback=getIP");
    
    return ipResponse?.data?.ip;
}