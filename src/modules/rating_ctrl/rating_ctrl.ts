import "./rating_ctrl.scss";


export function MakeRatingCtrl(rating/*[0,5]*/: number,
	width/*px*/: number, height/*px*/: number, gap/*px*/: number, 
	colorBack: string, colorFront: string, 
	extraClass: string = ""): string
{
	const widthCtrl: number = 5 * width + 4 * gap;
	const widthImg: number = width + gap;
	const level: number = Math.round(rating * width + Math.floor(rating) * gap);

	return `<div class="rating-ctrl-9d2fb4 ${extraClass}" ` +
		`style="width: ${widthCtrl}px; height: ${height}px; ` +
		`-webkit-mask-size: ${widthImg}px 100%; mask-size: ${widthImg}px 100%; ` +
		`background-color: ${colorBack};">` +
			`<p style="width: ${level}px; background-color: ${colorFront};"></p>` +
		`</div>`;
}

