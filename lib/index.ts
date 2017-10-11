export { STTApiClass } from "./STTApi";
export { mergeDeep } from './ObjectMerge';
export { getWikiImageUrl } from './WikiImageTools';
export { loginSequence } from './LoginSequence';
export { loadFullTree } from './EquipmentTools';
export { loadGauntlet, gauntletCrewSelection, gauntletRoundOdds, payToGetNewOpponents, playContest } from './GauntletTools';

import { STTApiClass } from "./STTApi";
let STTApi = new STTApiClass();
export default STTApi;