import STTApi from "./index";
import CONFIG from "./CONFIG";
import { ImageProvider, IFoundResult } from './ImageProvider';

function getWikiImageUrl(fileName: string, id: any): Promise<IFoundResult> {
	return STTApi.wikiImages.where('fileName').equals(fileName).first((entry: any) => {
		if (entry) {
			if (entry.url) {
				//console.info('Found ' + fileName + ' in the cache with url ' + entry.url);
				let result: IFoundResult = {
					id: id,
					url: entry.url
				};
				return Promise.resolve(result);
			} else {
				if ((Date.now() - entry.lastQueried) / 3600000 < CONFIG.HOURS_TO_RECOVERY) {
					return Promise.reject('The Wiki didn\'t have an image for ' + fileName);
				}
			}
		}

		return STTApi.networkHelper.get('https://stt.wiki/w/api.php', {
			action: 'query',
			titles: 'File:' + fileName + "|File:" + fileName.replace('png', 'PNG') + "|File:" + fileName.replace('.png', '_Full.png') + "|File:" + fileName.replace('_', '-'),
			prop: 'imageinfo',
			iiprop: 'url|metadata',
			format: 'json'
		}).then((data: any) => {
			let foundUrl = undefined;
			Object.keys(data.query.pages).forEach((pageKey: any) => {
				let page = data.query.pages[pageKey];
				if (page.imageinfo) {
					page.imageinfo.forEach((imgInfo: any) => {
						foundUrl = imgInfo.url;
					});
				}
			});

			let result: IFoundResult = {
				id: id,
				url: foundUrl
			};
			return Promise.resolve(result);
		}).then((found: IFoundResult) => {
			return STTApi.wikiImages.put({
				fileName: fileName,
				url: found.url,
				lastQueried: Date.now()
			}).then(() => {
				if (found.url) {
					//console.info('Caching ' + fileName + ' with url ' + found.url);
					return Promise.resolve(found);
				}
				else {
					// the Wiki doesn't have this image yet, or it was named in a non-standard way
					//console.info('Caching the fact that ' + fileName + ' is not available in the wiki yet');
					return Promise.reject('The Wiki doesn\'t have an image yet for ' + fileName);
				}
			});
		});
	});
}

export class WikiImageProvider implements ImageProvider {
	getCrewImageUrl(crew: any, fullBody: boolean, id: any): Promise<IFoundResult> {
		let fileName = crew.name.split(' ').join('_') + (fullBody ? '' : '_Head') + '.png';
		return getWikiImageUrl(fileName, id);
	}

	getShipImageUrl(ship: any, id: any): Promise<IFoundResult> {
		let fileName = ship.name.split(' ').join('_').split('.').join('').split('\'').join('') + '.png';
		return getWikiImageUrl(fileName, id);
	}

	getItemImageUrl(item: any, id: any): Promise<IFoundResult> {
		var fileName = item.name + CONFIG.RARITIES[item.rarity].name + '.png';
		fileName = fileName.split(' ').join('').split('\'').join('');
		return getWikiImageUrl(fileName, id);
	}

	getFactionImageUrl(faction: any, id: any): Promise<IFoundResult> {
		let fileName = 'Icon' + faction.name.split(' ').join('') + '.png';
		return getWikiImageUrl(fileName, id);
	}

	getSprite(assetName: string, spriteName: string, id: any): Promise<IFoundResult> {
		return Promise.reject('Not implemented');
	}

	getImageUrl(iconFile: string, id: any): Promise<IFoundResult> {
		let fileName = iconFile + '.png';
		return getWikiImageUrl(fileName, id);
	}
}