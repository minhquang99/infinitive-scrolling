export interface IResponseProduct {
    limit: number,
    products: any,
    skip: number,
    total: number
}

export interface IProductItem {
    id: number,
    title: string,
    thumbnail: string,
    price: number
}