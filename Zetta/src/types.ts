export interface Product {
    id: number;
    title: string;
    price: number;
    img: string;
}

export interface Category {
    id: string;
    title: string;
    image: string;
    products: Product[];
}