// vanta.d.ts
declare module "vanta/dist/vanta.net.min.js" {
  const VantaNet: any;
  export default VantaNet;
}
declare module "vanta/dist/vanta.topology.min.js";
declare module "vanta/dist/vanta.globe.min.js";

interface Window {
  VANTA: any;
}
