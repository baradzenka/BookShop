import "./slider.scss";

import {QuerySelector, QuerySelectors, AddAttributes, RemoveAttributes,
	AppendImageElement, AppendDivElement, assert, Clamp} from "../../global";
import {PreloadImages} from "../preload-images/preload-images";
import {MakeLoadingIndicatorBodyB} from "../loading_indicators/loading_indicators";



export type SlideInfo = {
	imgPath: string;
	desc: string;
};

export function InitSlider(data: SlideInfo[], startItem: number = 0,
	slideShowInterval: number/*ms*/): void
{
	assert(data.length > 0);
	assert(startItem >= 0 && startItem < data.length);
	assert(slideShowInterval > 0);

	g_slidesData = data;
	PrepareLayout(data, startItem);

	g_slideShow.interval = slideShowInterval;
	const imgUrls: string[] = data.map(i => i.imgPath);
	(new PreloadImages).Start(imgUrls, OnPreloadSlidesFinished);

	document.body.onresize = OnBodyResize;
	OnBodyResize();   // to determine visibility of the aside banners.
}



let g_slidesData: SlideInfo[];
const g_slideShow: {
		interval: number | undefined;
		intervalID: number | undefined;
	} = { interval: undefined, intervalID: undefined };
let g_bTransitionRunning: boolean = false;



function OnPreloadSlidesFinished(): void
{
	QuerySelector(".slider .slider__screen").removeAttribute("hidden");   // show slider.
	QuerySelector(".slider .slider__ctrl").removeAttribute("hidden");   // show dots under the slider.

	ResetSlideShow();   // start slide show.

	QuerySelector(".slider .slider__preload-slides").setAttribute("hidden","");   // hide loading indicator.
}

function OnBodyResize(): void
{
	// Hide slider's banners.
	const bannersParent: HTMLElement = QuerySelector(".slider .slider__banners") as HTMLElement;
	const maxPageWidth: number = parseInt( window.getComputedStyle(bannersParent).maxWidth );
	const opacity: number = Clamp(document.body.clientWidth - maxPageWidth-80, 0, 100) / 100;
	bannersParent.style.opacity = opacity.toString();
};


function ResetSlideShow(): void
{
	if(g_slideShow.intervalID)
		clearInterval(g_slideShow.intervalID);

	g_slideShow.intervalID = window.setInterval(() =>
		{
			let slide: number = GetCurrentSlide();
			slide = (++slide < g_slidesData.length ? slide : 0);
			SelectSlide(slide);

	 	}, g_slideShow.interval);
}


function PrepareLayout(data: SlideInfo[], startItem: number): void
{
	PrepareImgsLayout(data, startItem);
	PreparePreloadSlidesIndicatorLayout();
	PrepareDotsLayout(data, startItem);
}

function PrepareImgsLayout(data: SlideInfo[], startItem: number): void
{ 
	const divSlider: Element = QuerySelector(".slider .slider__screen");

	const leftImg: HTMLImageElement = AppendImageElement(divSlider, "slider__img", "slider__img-location_left");
	leftImg.setAttribute("hidden","");

	const centerImg: HTMLImageElement = AppendImageElement(divSlider, "slider__img");
	centerImg.src = data[startItem]!.imgPath;
	centerImg.alt = data[startItem]!.desc;

	const rightImg: HTMLImageElement = AppendImageElement(divSlider, "slider__img", "slider__img-location_right");
	rightImg.setAttribute("hidden","");
}

function PreparePreloadSlidesIndicatorLayout(): void
{
	const divIndicator: Element = QuerySelector(".slider .slider__preload-slides");
	divIndicator.innerHTML += MakeLoadingIndicatorBodyB("#4c3db2");
}

function PrepareDotsLayout(data: SlideInfo[], startItem: number): void
{
	const divCtrl: Element = QuerySelector(".slider .slider__ctrl");
	data.forEach((_, i: number) =>
		{
			const dot: HTMLDivElement = AppendDivElement(divCtrl, "slider__ctrl-item");
			if(i == startItem)
				dot.setAttribute("active","");
			dot.dataset["index"] = i.toString();
			dot.onclick = e => OnSelectSlide( parseInt((e.target! as HTMLElement).dataset["index"]!) );
		});
}

function OnSelectSlide(slide: number): void
{
	if(slide != GetCurrentSlide() && 
		!g_bTransitionRunning)
	{
		SelectSlide(slide);
		ResetSlideShow();
	}
}

function SelectSlide(slide: number): void
{
	if(!g_bTransitionRunning)
	{
		const curSlide: number = GetCurrentSlide();
		if(slide != curSlide)
		{
			// Select Image
			if(slide > curSlide)
				ShiftImageLeftTo(slide);
			if(slide < curSlide)
				ShiftImageRightTo(slide);

			// Select Dot
			const dots: NodeList = QuerySelectors(".slider .slider__ctrl-item");
			dots.forEach(e => (e as Element).removeAttribute("active"));
			(dots[slide] as Element).setAttribute("active","");
		}
	}
}

function GetCurrentSlide(): number
{
	const activeDot: HTMLElement = QuerySelector(".slider .slider__ctrl-item[active]") as HTMLElement;
	return parseInt(activeDot.dataset["index"]!);
}


function ShiftImageLeftTo(slide: number): void
{
	const leftImg: HTMLElement = QuerySelector(".slider .slider__img-location_left") as HTMLElement;
	const curImg: HTMLElement = QuerySelector(
		".slider .slider__img:not(.slider__img-location_left, .slider__img-location_right)") as HTMLElement;
	const rightImg: HTMLElement = QuerySelector(".slider .slider__img-location_right") as HTMLElement;

	leftImg.className = "slider__img  slider__img-location_right";
	leftImg.setAttribute("hidden","");
	leftImg.removeAttribute("src");

	curImg.className = "slider__img  slider__img-location_left";
	RemoveAttributes(curImg, "hidden","alt");
	curImg.ontransitionend = null;

	rightImg.className = "slider__img";
	rightImg.removeAttribute("hidden");
	AddAttributes(rightImg, {"src": g_slidesData[slide]!.imgPath, "alt": g_slidesData[slide]!.desc});
	rightImg.ontransitionend = () => g_bTransitionRunning = false;
	g_bTransitionRunning = true;
}

function ShiftImageRightTo(slide: number): void
{
	const leftImg: HTMLElement = QuerySelector(".slider .slider__img-location_left") as HTMLElement;
	const curImg: HTMLElement = QuerySelector(
		".slider .slider__img:not(.slider__img-location_left, .slider__img-location_right)") as HTMLElement;
	const rightImg: HTMLElement = QuerySelector(".slider .slider__img-location_right") as HTMLElement;

	leftImg.className = "slider__img";
	leftImg.removeAttribute("hidden");
	AddAttributes(leftImg, {"src": g_slidesData[slide]!.imgPath, "alt": g_slidesData[slide]!.desc});
	leftImg.ontransitionend = () => g_bTransitionRunning = false;
	g_bTransitionRunning = true;

	curImg.className = "slider__img  slider__img-location_right";
	RemoveAttributes(curImg, "hidden","alt");
	curImg.ontransitionend = null;

	rightImg.className = "slider__img  slider__img-location_left";
	rightImg.setAttribute("hidden","");
	rightImg.removeAttribute("src");
}

