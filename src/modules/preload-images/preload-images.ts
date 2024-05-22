
import {AppendDivElement, AppendImageElement} from "../../global";



export class PreloadImages
{
	constructor()
	{
		this.parentElement = (AppendDivElement(document.body) as HTMLElement);
		this.parentElement.style.position = "fixed";
		this.parentElement.style.left = "9999px";
		this.parentElement.style.opacity = "0";
	}

	Start(imgUrls: string[], onLoadingFinish: ()=>void/*callback*/): void
	{
		this.parentElement.innerHTML = "";   // clear all old preloaded images.

		imgUrls.forEach(url =>
			{
				const imgElement: HTMLImageElement = AppendImageElement(this.parentElement);
				imgElement.src = url;
				imgElement.onload = imgElement.onerror = () =>   // for success and failure
					{
						if(--this.numLoadingImgs == 0)
							onLoadingFinish();
					};
					++ this.numLoadingImgs;
			});
	}

	Abort(): void
	{
		if(this.numLoadingImgs != 0)
		{
			this.parentElement!.innerHTML = "";   // clear all old images.
			this.numLoadingImgs = 0;
		}
	}

	parentElement: HTMLElement;
	numLoadingImgs: number = 0;   // number of images currently loading.
};

