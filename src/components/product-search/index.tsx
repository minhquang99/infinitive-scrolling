import { Input } from 'antd'
import { debounce } from 'lodash'
import { useCallback } from 'react'
import styles from "./index.module.scss"

const ProductSearch = (props: { onChange: any }) => {
  const debounceDropDown = useCallback(debounce((nextValue) => props.onChange(nextValue), 300), [])

  const onFieldChange = (event: any) => {
    const { value } = event.target;
    debounceDropDown(value);
  }
  return (
    <div className={styles.search}>
      <Input className={styles.search_input} placeholder='Search...' onChange={onFieldChange} />
    </div>
  )
}

export default ProductSearch