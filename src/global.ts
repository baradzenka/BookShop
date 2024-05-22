

export function QuerySelectorUnsafe(selector: string): Element | null
{
	return document.querySelector(selector);
}

export function QuerySubSelector(parentElement: Element | Document,
	selector: string): Element
{
	const elem: Element | null = parentElement.querySelector(selector);
	assert(elem);
	return <Element>elem;
}
export function QuerySelector(selector: string): Element
{
	return QuerySubSelector(document,selector);
}


export function QuerySelectorsUnsafe(selector: string): NodeList
{
	return document.querySelectorAll(selector);
}

export function QuerySubSelectors(parentElement: Element | Document,
	selector: string): NodeList
{
	const elems: NodeList = parentElement.querySelectorAll(selector);
	assert(elems.length);
	return elems;
}
export function QuerySelectors(selector: string): NodeList
{
	return QuerySubSelectors(document,selector);
}


export function AddAttributes(elem: Element, attrs: object): void
{
	Object.entries(attrs).forEach(v => elem.setAttribute(v[0], v[1] as string));
}
export function RemoveAttributes(elem: Element, ... atts: string[]): void
{
	atts.forEach(a => elem.removeAttribute(a));
}

export function ManageAttribute(elem: Element, set: boolean, 
	attribName: string, attribValue: string = ""): void
{
	(set ?
		elem.setAttribute(attribName,attribValue) :
		elem.removeAttribute(attribName));
}


export function CreateElement(tagName: string): HTMLElement
{
	return document.createElement(tagName);
}

export function AppendElement(parent: Element, tagName: string,
	... classList: string[]): HTMLElement
{
	const child: HTMLElement = parent.appendChild( CreateElement(tagName) );
	assert(child);

	if(classList)
		child.classList.add(...classList);
	return child;
}

export function AppendDivElement(parent: Element, ... classList: string[]): HTMLDivElement
{
	return AppendElement(parent, "div", ... classList) as HTMLDivElement;
}
export function AppendAnchorElement(parent: Element, ... classList: string[]): HTMLAnchorElement
{
	return AppendElement(parent, "a", ... classList) as HTMLAnchorElement;
}
export function AppendImageElement(parent: Element, ... classList: string[]): HTMLImageElement
{
	return AppendElement(parent, "img", ... classList) as HTMLImageElement;
}

export function AppendButtonElement(parent: Element, ... classList: string[]): HTMLButtonElement
{
	return AppendElement(parent, "button", ... classList) as HTMLButtonElement;
}



export function assert(condition: null | undefined | boolean | number | string | Node,
	message?: string): void | never
{
	if(!condition)
		throw new Error(message || "Assertion failed");
}


export function Clamp(val: number, min: number, max: number): number
{
	return Math.min( Math.max(val,min), max);
}

