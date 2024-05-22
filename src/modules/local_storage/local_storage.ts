

const g_localStorageKey: string = "BookShop.a5e3b9.BooksInCart";


export function IsBookInCart(bookID: string): boolean
{
	const bookIDArr: string[] | null = ReadBookIDArray();
	return bookIDArr!=null && bookIDArr.includes(bookID);
}

export function GetBookNumberInCart(): number
{
	const bookIDArr: string[] | null = ReadBookIDArray();
	return (bookIDArr!=null ? bookIDArr.length : 0);
}

export function AddBookToCart(bookID: string): void
{
	const bookIDArr: string[] | null = ReadBookIDArray();
	if(!bookIDArr)
		WriteBookIDArray([bookID]);
	else
		if(!bookIDArr.includes(bookID))
		{
			bookIDArr.push(bookID);
			WriteBookIDArray(bookIDArr);
		}
}

export function DeleteBookFromCart(bookID: string): void
{
	let bookIDArr: string[] | null = ReadBookIDArray();
	if(bookIDArr)
		if(bookIDArr.includes(bookID))
		{
			bookIDArr = bookIDArr.filter(i => i !== bookID);
			WriteBookIDArray(bookIDArr);
		}
}


function ReadBookIDArray(): string[] | null
{
	const jsonObj: string | null = localStorage.getItem(g_localStorageKey);
	return (jsonObj ? JSON.parse(jsonObj).books ?? null : null);
}
function WriteBookIDArray(bookIDArr: string[]): void
{
	const jsonObj: string = JSON.stringify({"books" : bookIDArr});
	localStorage.setItem(g_localStorageKey,jsonObj);
}

