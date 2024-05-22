import "./header.scss";

import {QuerySelector} from "../../global";
import {GetBookNumberInCart} from "../local_storage/local_storage";



export function InitHeader(): void
{
	UpdateBookCounter();
}

export function UpdateBookCounter(): void
{
	const booksInCart: number = GetBookNumberInCart();

	const counter: Element = QuerySelector(".menu-action-item__counter");
	if(booksInCart == 0)
		counter.setAttribute("hidden","");
	else
	{
		counter.textContent = booksInCart.toString();
		counter.removeAttribute("hidden");
	}
}

