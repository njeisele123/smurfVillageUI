export async function getIP() {
    const ipResponse = await fetch("//api.ipify.org?format=json");
    const { ip } = await ipResponse.json();
    return ip;
}