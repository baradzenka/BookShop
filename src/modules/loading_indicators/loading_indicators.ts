import "./loading_indicators.scss";



export function MakeLoadingIndicatorA(color: string, extraStyle: string = ""): string
{
	const body: string = MakeLoadingIndicatorBodyA(color);
	return `<div class="loading-indicator-a ${extraStyle}">${body}</div>`;
}

export function MakeLoadingIndicatorBodyA(color: string): string
{
	return `<div class="b1" style="background: ${color};"></div>` +
			`<div class="b2" style="background: ${color};"></div>` +
			`<div class="b3" style="background: ${color};"></div>` +
			`<div class="b4" style="background: ${color};"></div>` +
			`<div class="b5" style="background: ${color};"></div>` +
			`<div class="b6" style="background: ${color};"></div>` +
			`<div class="b7" style="background: ${color};"></div>` +
			`<div class="b8" style="background: ${color};"></div>`;
}


export function MakeLoadingIndicatorB(color: string, extraStyle: string = ""): string
{
	const body: string = MakeLoadingIndicatorBodyB(color);
	return `<div class="loading-indicator-b ${extraStyle}">${body}</div>`;
}

export function MakeLoadingIndicatorBodyB(color: string): string
{
	return `<div class="b1" style="background: ${color};"></div>` +
			`<div class="b2" style="background: ${color};"></div>` +
			`<div class="b3" style="background: ${color};"></div>` +
			`<div class="b4" style="background: ${color};"></div>` +
			`<div class="b5" style="background: ${color};"></div>`;
}

