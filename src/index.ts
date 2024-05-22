import "./index.scss";

import {InitHeader, UpdateBookCounter} from "./modules/header/header";
import {SlideInfo, InitSlider} from "./modules/slider/slider";
import {InitBookGallery, LoadBookGalleryChunk} from "./modules/book_gallery/book_gallery";




InitHeader();


const slidesData: SlideInfo[] = [
	{ imgPath: "./images/slider/slide_1.jpg", desc: "Description of the slide 1" },
	{ imgPath: "./images/slider/slide_2.jpg", desc: "Description of the slide 2" },
	{ imgPath: "./images/slider/slide_3.jpg", desc: "Description of the slide 3" }];

InitSlider(slidesData, 0/*initial slide index*/, 5000/*ms*/);


const bookCategories: string[] = ["Architecture", "Art & Fashion", "Biography",
	"Business", "Crafts & Hobbies", "Drama", "Fiction", "Food & Drink",
	"Health & Wellbeing", "History & Politics", "Humor", "Poetry", "Psychology",
	"Science", "Technology", "Travel & Maps"];

InitBookGallery(bookCategories, "AIzaSyAHbnThJUXRj4p3BsGqEj6wfew1hIuREhs",
	0/*initial category index*/, 6/*number of books at once*/,
	() => UpdateBookCounter());
LoadBookGalleryChunk();


