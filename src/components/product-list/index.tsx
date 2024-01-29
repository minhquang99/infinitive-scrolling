import ProductSearch from "@components/product-search";
import { IProductItem, IResponseProduct } from "@interfaces/products";
import { Axios } from "@shared/axios";
import { Spin, notification } from "antd";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";

const DEFAULT_SKIP_NUMBER = 20;

const ProductList = () => {
  const spinnerRef = useRef(null);
  const [remainingProducts, setRemainingProducts] = useState<boolean>(true);
  const [skipTime, setSkipTime] = useState<number>(0);
  const [listProducts, setListProducts] = useState<IProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchYet, setIsSearchYet] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  function callbackScrollInf(entries: any) {
    var div = document.getElementById("list-products");
    if (div) {
      // Product list is need overflow or not
      var isListOverflowY: boolean = false;
      isListOverflowY = div.scrollHeight > div.clientHeight;

      const firstEntry = entries[0];
      if (search == "") {
        if (firstEntry.isIntersecting && remainingProducts) {
          getProducts(DEFAULT_SKIP_NUMBER);
        }
      } else {
        if (firstEntry.isIntersecting && isListOverflowY && listProducts.length >= skipTime * DEFAULT_SKIP_NUMBER && remainingProducts) {
          filterProducts(search);
        }
      }
    }
  }

  function hideSpinner(total: number, limit: number) {
    if (total <= limit || total == limit + skipTime * DEFAULT_SKIP_NUMBER) {
      document.getElementById("spinner")?.classList.add("hide");
    } else {
      document.getElementById("spinner")?.classList.remove("hide");
    }
  }

  // Get Products
  const getProducts = async (lim: number, skip?: number) => {
    setIsLoading(true);
    await Axios("products", `limit=${lim}&skip=${skipTime * DEFAULT_SKIP_NUMBER}`)
      .then((res: IResponseProduct) => {
        if (res.products.length > 0) {
          setListProducts((listProducts: any) => [...listProducts, ...res.products]);
          setRemainingProducts(true);
          setSkipTime(skipTime + 1);
        } else {
          setRemainingProducts(false);
        }

        // Hide Spinner Ref when Total Products is no more than limit
        hideSpinner(res.total, res.limit);
      })
      .catch((err) => {
        console.log(err);
        notification.error({ message: "Server Error!" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Filter
  const filterProducts = async (data: string) => {
    setIsLoading(true);
    await Axios("products/search", `q=${data}&limit=${DEFAULT_SKIP_NUMBER}&skip=${skipTime * DEFAULT_SKIP_NUMBER}`)
      .then((res: IResponseProduct) => {
        if (res.products.length > 0) {
          setListProducts((listProducts: any) => [...listProducts, ...res.products]);
          setRemainingProducts(true);
          setSkipTime(skipTime + 1);
        } else {
          setRemainingProducts(false);
        }

        // Hide Spinner Ref when Total Products is no more than limit
        hideSpinner(res.total, res.limit);
      })
      .catch((err) => {
        console.log(err);
        notification.error({ message: "Server Error!" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // console.log(listProducts);
    const obs = new IntersectionObserver(callbackScrollInf, {
      root: document.querySelector("#list-product"),
      rootMargin: "0px",
      threshold: 0,
    });
    if (obs && spinnerRef.current) {
      obs.observe(spinnerRef.current);
    }

    return () => {
      if (obs) {
        obs.disconnect();
      }
    };
  }, [listProducts]);

  useEffect(() => {
    document.getElementById("spinner")?.classList.remove("hide");
    setListProducts([]);
    if (search !== "") {
      setIsSearchYet(true);
      filterProducts(search);
    } else if (isSearchYet && search == "" && listProducts.length == 0) {
      // Get All Products again after search a null and delele all search value
      getProducts(DEFAULT_SKIP_NUMBER);
    }
  }, [search]);

  return (
    <>
      <ProductSearch
        onChange={(data: string) => {
          setSkipTime(0);
          setSearch(data);
        }}
      />
      <div className={`${styles.products} ${isLoading && listProducts.length == 0 ? styles["loading"] : ""}`} id="list-products">
        {listProducts?.map((product: IProductItem, index: number) => (
          <div className={styles.products_item} key={`product-${index}`}>
            <img className={styles.products_item_image} src={product.thumbnail} alt="" />
            <p className={styles.products_item_title}>{product.title}</p>
            <p className={styles.products_item_price}>{product.price} $</p>
          </div>
        ))}
        <div className={styles.products_lazy} ref={spinnerRef} id="spinner">
          <Spin size="small" />
        </div>
        {listProducts.length == 0 && !isLoading && (
          <div className={styles.products_empty}>
            <p>Not found any products!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductList;
