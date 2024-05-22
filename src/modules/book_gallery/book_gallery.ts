import "./book_gallery.scss";

import getSymbolFromCurrency from 'currency-symbol-map';

import {QuerySelector, QuerySubSelector, QuerySelectors, QuerySelectorUnsafe,
	ManageAttribute, QuerySelectorsUnsafe, AppendAnchorElement, assert} from "../../global";
import {IsBookInCart, AddBookToCart, DeleteBookFromCart} from "../local_storage/local_storage";
import {PreloadImages} from "../preload-images/preload-images";
import {MakeLoadingIndicatorBodyA, MakeLoadingIndicatorBodyB} from "../loading_indicators/loading_indicators";
import {MakeRatingCtrl} from "../rating_ctrl/rating_ctrl";

//import {TEST_DATA} from "./test_data";



let g_apiKey: string;
let g_numberBooksAtOnce: number;
let g_onClickButtonBuy: ()=>void;

const g_preloadImages: PreloadImages = new PreloadImages;



export function InitBookGallery(bookCategories: string[], apiKey: string,
	startItem: number, numberBooksAtOnce: number,
	onClickButtonBuy: () => void/*callback*/): void
{
	assert(startItem >= 0 && startItem < bookCategories.length);

	g_apiKey = apiKey;
	g_numberBooksAtOnce = numberBooksAtOnce;
	g_onClickButtonBuy = onClickButtonBuy;

	PrepareCategoriesLayout(bookCategories, startItem);
	PrepareLoadMoreButtonLayout();

	QuerySelector(".book-gallery .book-list").addEventListener("click", OnBookListAreaClick);
	QuerySelector(".book-gallery .book-ctrl__load-more-btn").addEventListener("click", OnBtnLoadMoreClick);
}

function PrepareCategoriesLayout(bookCategories: string[], startItem: number): void
{
	const divCategories: Element = QuerySelector(".book-gallery .book-categories");
	bookCategories.forEach((c: string, i: number) =>
		{
			const active: boolean = (i == startItem);
			const categoryItem: HTMLAnchorElement = AppendAnchorElement(divCategories, "book-categories__item");
			if(active)
				categoryItem.setAttribute("active","");
			const content: string = MakeLoadingIndicatorBodyB("#756ad3");
			categoryItem.innerHTML = c + `<span class="book-categories__loading loading-indicator-b" ${!active ? "hidden" : ""}>` +
				`${content}</span>`;
			categoryItem.onclick = e => OnSelectCategory((e.target as Element).textContent!);
		}
	);
}

function PrepareLoadMoreButtonLayout(): void
{
	const divIndicator: Element = QuerySelector(".book-gallery .load-more-indicator");
	divIndicator.innerHTML += MakeLoadingIndicatorBodyA("#4c3db2");
}




function OnSelectCategory(categoryName: string): void
{
	HighlightCategory(categoryName);
	g_preloadImages.Abort();
	LoadBookGalleryChunk(true);   // with clear the book list.
}

function HighlightCategory(categoryName: string): void
{
	const divCategories: Element = QuerySelector(".book-gallery .book-categories");
	Array.from(divCategories.children).forEach((e: Element) =>
		{
			ManageAttribute(e, e.textContent==categoryName, "active");

			const loadingElem: Element = QuerySubSelector(e,".book-categories__loading");
			ManageAttribute(loadingElem, e.textContent!=categoryName, "hidden");
		});
}

function ClearBookList(): void
{
	QuerySelector(".book-gallery .book-list").innerHTML = "";
}


function OnBookListAreaClick(e: Event): void
{
	const elem: HTMLElement | null = ((e.target instanceof HTMLButtonElement) ? (e.target as HTMLElement) : null);
	if(elem &&
		elem.classList.contains("book-desc__btn"))
	{	// A "BUY NOW" button was clicked.

		if(elem.dataset["bookId"])
		{
			// Looking for all buttons with the same book id.
			const btns: NodeList = QuerySelectorsUnsafe(`.book-desc__btn[data-book-id="${elem.dataset["bookId"]}"]`);

			if(IsBookInCart(elem.dataset["bookId"]))
			{
				btns.forEach(e => (e as Element).removeAttribute("chosen"));
				DeleteBookFromCart(elem.dataset["bookId"]);
			}
			else
			{
				btns.forEach(e => (e as Element).setAttribute("chosen",""));
				AddBookToCart(elem.dataset["bookId"]);
			}
			btns.forEach(e => (e as Element).textContent = GetButtonBuyText(elem.dataset["bookId"]!));   // update text on the button.
			g_onClickButtonBuy();   // update books' counter on the header.
		}
	}
}


function OnBtnLoadMoreClick(): void
{
	if(!IsLoadingBooks())
		LoadBookGalleryChunk();
}



function ShowLoadingIndicator(show: boolean) : void
{
	const loadingIndicator : Element = QuerySelector(".book-gallery .load-more-indicator");
	ManageAttribute(loadingIndicator, !show, "hidden");
}

function IsLoadingBooks(): boolean
{
	return !!QuerySelectorUnsafe(".book-gallery .load-more-indicator:not([hidden])");
}


function ShowErrorBanner(show: boolean, text?: string) : void
{
	const loadingIndicator : Element = QuerySelector(".book-gallery .banner-error");
	ManageAttribute(loadingIndicator, !show, "hidden");

	if(show)
	{
		assert(text);
		loadingIndicator.textContent = text!;
	}
}

function HideCategoryLoadingMarker(): void
{
	const loadingElements: NodeList = QuerySelectors(".book-categories__loading");
	loadingElements.forEach(e => (e as Element).setAttribute("hidden",""));
}



export function LoadBookGalleryChunk(clearBookList: boolean = false): void
{
	ShowErrorBanner(false);
	ShowLoadingIndicator(true);

	const activeCategory : Element = QuerySelector(".book-gallery .book-categories__item[active]");
	const categoryName: string = activeCategory.textContent!;

	const bookList : Element = QuerySelector(".book-gallery .book-list");
	const startIndex: number = bookList.children.length;

	const request: string = `https://www.googleapis.com/books/v1/volumes?q="subject:${categoryName}"` + 
		`&key=${g_apiKey}&printType=books&startIndex=${startIndex}&maxResults=${g_numberBooksAtOnce}` +
		`&langRestrict=en`;


	// *** Working with TEST_DATA from the 'test_data.ts' ***.

//	const imgUrls: string[] = [];   // urls of all images that need to be loaded
//	const booksLayout: string = GetBooksLayout(TEST_DATA, imgUrls/*out*/);
//
//	g_preloadImages.Start(imgUrls, () =>   // preloading of images finished.
//		{
//			HideCategoryLoadingMarker();
//			ShowLoadingIndicator(false);
//			bookList.innerHTML = (clearBookList ? booksLayout : bookList.innerHTML + booksLayout);
//		});
//	return;


	fetch(request)
		.then((response: Response) =>
		{
			if(!response.ok)
			{
				if(response.status == 423)
					throw Error("Data loading error. The destination resource is locked.");
				if(response.status == 429)
					throw Error("Data loading error. Too many requests.");
				throw Error(`Data loading error. The response status is ${response.status}.`);
			}
			return response.json();
		})
		.then(data =>
		{
			if(typeof(data) !== "object" ||
				!data.items || !Array.isArray(data.items) || (data.items as []).length == 0)
			{
				throw Error("Data loading error");
			}

			const imgUrls: string[] = [];   // urls of all images that need to be loaded
			const booksLayout: string = GetBooksLayout(data.items, imgUrls/*out*/);

			g_preloadImages.Start(imgUrls, () =>   // preloading of images finished.
				{
					HideCategoryLoadingMarker();
					ShowLoadingIndicator(false);
					bookList.innerHTML = (clearBookList ? booksLayout : bookList.innerHTML + booksLayout);
				});
		})
		.catch((error: Error) =>
		{
			if(clearBookList)
				ClearBookList();

			HideCategoryLoadingMarker();
			ShowLoadingIndicator(false);
			ShowErrorBanner(true, error.message);
		});
}

function GetBooksLayout(data: object[], imgUrls: string[]/*out*/): string
{
	let layout: string = "";
	data.forEach((obj: object) =>
		{
			if(Object.prototype.hasOwnProperty.call(obj,"id") &&
				Object.prototype.hasOwnProperty.call(obj,"volumeInfo") &&
				Object.prototype.hasOwnProperty.call(obj,"saleInfo"))
			{
				layout += GetBookLayout(obj, imgUrls);
			}
		}
	);
	return layout;
}

function GetBookLayout(obj: any, imgUrls: string[]/*out*/): string
{
	const thumbnailExist: boolean = !!obj.volumeInfo.imageLinks && !!obj.volumeInfo.imageLinks.thumbnail;
	const imgStyle: string = (thumbnailExist ? "book-img" : "book-img book-img_no-thumbnail");
	const imgUrl: string = (thumbnailExist ? obj.volumeInfo.imageLinks.thumbnail : 
		"./images/book_gallery/no_thumbnail.svg");

	if(thumbnailExist)
		imgUrls.push(obj.volumeInfo.imageLinks.thumbnail);

	return `<div class="book">` +
				`<img class="${imgStyle}" src="${imgUrl}" alt="The description of the book">` +
				`<div class="book-desc">` +
					GetBookAuthorsLayout(obj) +
					GetBookTitleLayout(obj) +
					GetRatingLayout(obj) +
					GetBookDescriptionLayout(obj) +
					GetBookRetailPriceLayout(obj) +
					GetBookButtonBuyLayout(obj) +
				`</div>` +
			`</div>`;
}

function GetBookAuthorsLayout(obj: any): string
{
	if(!obj.volumeInfo.authors ||
		!Array.isArray(obj.volumeInfo.authors) ||
		obj.volumeInfo.authors.length == 0)
	{
		return "";
	}

	const authors: string = obj.volumeInfo.authors.join(", ");
	return `<div class="book-desc__authors">${authors}</div>`;
}

function GetBookTitleLayout(obj: any): string
{
	if(!obj.volumeInfo.title || 
		typeof(obj.volumeInfo.title) !== "string")
	{
		return "";
	}

	return `<div class="book-desc__title">${obj.volumeInfo.title}</div>`;
}

function GetRatingLayout(obj: any): string
{
	if(!obj.volumeInfo.averageRating ||
		!obj.volumeInfo.ratingsCount)
	{
		return "";
	}

	const rating: number = parseFloat(obj.volumeInfo.averageRating);
	const ratingCtrl: string = MakeRatingCtrl(rating, 12,11, 1, "#eeedf5", "#f2c94c");

	const ratingsCount = RatingsCountToString(obj.volumeInfo.ratingsCount);
	const reviewNumber: string = `<span>${ratingsCount} review</span>`;
	
	return `<div class="book-desc__rating">${ratingCtrl}${reviewNumber}</div>`;
}

function RatingsCountToString(ratingsCount: number): string
{
	if(ratingsCount >= 1000000)
		return (ratingsCount / 1000000).toFixed(1) + "M";
	if(ratingsCount >= 1000)
		return (ratingsCount / 1000).toFixed(1) + "K";
	return ratingsCount.toString();
}

function GetBookDescriptionLayout(obj: any): string
{
	if(!obj.volumeInfo.description || 
		typeof(obj.volumeInfo.description) !== "string")
	{
		return "";
	}

	const description: string = obj.volumeInfo.description.substr(0,150);
	return `<div class="book-desc__description">${description}</div>`;
}

function IsRetailPriceExist(obj: any): boolean
{
	return obj.saleInfo.retailPrice && typeof(obj.saleInfo.retailPrice) === "object" &&
		obj.saleInfo.retailPrice.amount && typeof(obj.saleInfo.retailPrice.amount) === "number" &&
		obj.saleInfo.retailPrice.currencyCode && typeof(obj.saleInfo.retailPrice.currencyCode) === "string";
}

function GetBookRetailPriceLayout(obj: any): string
{
	if(!IsRetailPriceExist(obj))
		return "";

	const currencySymbol: string = getSymbolFromCurrency(obj.saleInfo.retailPrice.currencyCode) ||
		obj.saleInfo.retailPrice.currencyCode;
	const retailPrice: string = currencySymbol + obj.saleInfo.retailPrice.amount;
	return `<div class="book-desc__price">${retailPrice}</div>`;
}

function GetBookButtonBuyLayout(obj: any): string
{
	const disable: string = (IsRetailPriceExist(obj) ? "" : "disabled");
	const chosen: string = (IsRetailPriceExist(obj) && IsBookInCart(obj.id) ? "chosen" : "");
	const text: string = GetButtonBuyText(obj.id);
	return `<button type="button" class="button book-desc__btn" data-book-id="${obj.id}" ${disable}${chosen}>${text}</button>`;
}

function GetButtonBuyText(bookID: string): string
{
	return (!IsBookInCart(bookID) ? "buy now" : "in the cart");
}

