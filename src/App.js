import './App.css';
import productList from './product.js'
import { useEffect, useState} from 'react';

function App() {

  const [cartItem, setCartItem] = useState([]);
  const [showCart, setShowCart] = useState(false)
  const [products, setProduct] = useState([])
  // localStorage.setItem("products", JSON.stringify(products))

  const getCartFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('cart'))
  }
  const getProductList = () => {
    let productLocalStorage = JSON.parse(localStorage.getItem('products'))
    if(!productLocalStorage || !productLocalStorage.length) {
      localStorage.setItem('products', JSON.stringify(productList))
    }
    return JSON.parse(localStorage.getItem('products'))
  }

  useEffect(() => {
    const getCart = getCartFromLocalStorage()
    const getProduct = getProductList()
   
    if(getCart){
      setCartItem(getCart);
    }   
    if(getProduct.length !== 0) {
      setProduct(getProduct)
    }
    else{
      setProduct(productList)
    }
  }, [])


  const addToCart = async (id, event) => {
   let product = {
      id,
      qty: 1
    } 
    let cartList = []
    let productsItem = []
    const getCart = getCartFromLocalStorage() 
    const getProduct = getProductList()
    const isExist = checkProductExistInCart(id, getCart) 
    console.log(isExist, 'isExist')
    if(getCart) { 
      cartList = getCart
    }
    if(getProduct){
      productsItem = getProduct
    }

    let indexProd = productsItem.findIndex((obj => obj.id === id));
    if(isExist) {
      let indexObj = 0
      indexObj = cartList.findIndex((obj => obj.id === id));
      const checkOOS = checkIsOutOfStock(id, cartList[indexObj].qty)    
      if(checkOOS){
        alert('qty sudah melebihi jumlah stock')
        return
      }
        cartList[indexObj].qty += 1
    } else { 
      cartList.push(product)
    }
    productsItem[indexProd].stock -= 1
    setToLocalStorage(cartList, productsItem)
  }

  const checkIsOutOfStock = (id, count, type) =>{
    var found = productList.find(function (cart) {
      return cart.id === id
    });
    console.log(found.stock, 'vs' , count)
    if(found.stock <= count){
      return true
    }
    return false

  }
  const checkProductExistInCart = (id, cart_data) => {
    if(cart_data && cart_data.length > 0) {
      const isExist = cart_data.find(cart => cart.id === id);
      return Boolean(isExist)
    }
    return false
  }
  
  const getProductFromCart = () => {
    setShowCart(true);
    const getCart = getCartFromLocalStorage() 
    let cartList = [] 
    if(getCart && getCart.length > 0) { 
      getCart.forEach(cart => { 
        productList.find(products => { 
          if(products.id === cart.id) {
            cartList.push({...products, qty:cart.qty}) 
          }
        })
        setCartItem(cartList); 
      })
    }
  }

  const updateCart = (id, event, type) =>{
    let qty = 0
    if(parseInt(event.target.value)) qty = parseInt(event.target.value)
    if (isNaN(qty)){
      qty = 0
    }  
    // const productData = productList
    let cartList = [...cartItem]
    let dataProduct = [...products]
    let indexObj = cartList.findIndex((obj => obj.id === id))
    let indexProd = dataProduct.findIndex((p => p.id === id))
    if(type==='edit'){
      const isOOS = checkIsOutOfStock(id, qty, 'edit')
        if(isOOS){
          alert('qty sudah melebihi jumlah stock')
        return
        }
        let qtybefore = cartList[indexObj].qty
        if(qty === 0){
          dataProduct[indexProd].stock = dataProduct[indexProd].stock + qtybefore
        }
        else{
          if(qtybefore !== qty) {
            dataProduct[indexProd].stock -= qty
          }
        }
        cartList[indexObj].qty = qty 
        setToLocalStorage(cartList, productList)
    }
    else if(type === 'add'){
      const isOOS = checkIsOutOfStock(id, cartList[indexObj].qty)
      if(isOOS){
        alert('qty sudah melebihi jumlah stock')
        return
      }
        dataProduct[indexProd].stock -= 1
        cartList[indexObj].qty += 1
        setToLocalStorage(cartList, dataProduct)
    }
    else{
      if(cartList[indexObj].qty > 1){
        cartList[indexObj].qty -= 1
        dataProduct[indexProd].stock += 1
        setToLocalStorage(cartList, dataProduct)
      }
      else if(cartList[indexObj].qty <= 1 ){
        console.log('sini1', dataProduct)
        if(!deleteCart(id, cartList, dataProduct)) {
          setToLocalStorage(cartList, dataProduct)
        }     
      }     
    } 
  }

  const deleteCart = (idCart, cartList, product ,type) => {
    let indexProd = product.findIndex((p => p.id === idCart))
    const isConfirm = window.confirm('Apakah kamu yakin ingin menghapus produk dari keranjang?');
    if(!isConfirm) {
      if(type === 'isnull'){
          // console.log(product[indexProd].stock -=1)
        product[indexProd].stock -= 1
        localStorage.setItem("products", JSON.stringify(product))
        getProductList()  
      }
      return false
    }
    const deletedArray =  cartList.filter(({ id }) => id !== idCart);
    if(type === 'deleteIcon'){   
     product[indexProd].stock += 1     
    }
    else{
      let prod = productList.find((pl => pl.id === idCart))     
      product[indexProd].stock = prod.stock
    }
    console.log("deleted", product)
    setToLocalStorage(deletedArray, product)
    return true
  }
  const updateIfNull = (e, id, list) =>{
    if (e.target.value  === '0'){
      const deleted = deleteCart(id, list, getProductList(), 'isnull' )
      if(!deleted){
        let cartList = [...list]
        let indexObj = cartList.findIndex((obj => obj.id === id))
        cartList[indexObj].qty = 1
        setToLocalStorage(cartList, getProductList())
      }
    }
    if(e.target.value.length >= 2){  
      e.target.value= e.target.value.replace(/^0+/, '')
    }
  }

  const setToLocalStorage = (carts, product) => {
    setProduct(product)
    setCartItem(carts)
    localStorage.setItem("cart", JSON.stringify(carts))
    localStorage.setItem("products", JSON.stringify(product)) 
  }

  return (
    <div className="App">
      <header className="App-header">
       <h1>XZYmart</h1>
       <div className="cartIcon" onClick={getProductFromCart}><span>{cartItem.length !== 0? cartItem.length:"" } </span><i className="fas fa-shopping-cart"></i></div>     
      </header>
      <section>
        <h3>Produk terlaris</h3>
        <div className="row">
        {products.map((item, i) => (
          <div className="card" key={i}>
          <img src={item.image} alt="" width="100%" />
          <div className="product-info">
            <div className="name">{item.name}</div>
            <div className="price">Rp. {item.price}</div>
            <div style={{marginTop: '1rem'}} className={item.stock === 0? 'stock empty' : 'stock'}>{item.stock === 0? 'Stok habis' : `${item.stock} pcs`}</div>
            <button className="add-cart" onClick={()=>addToCart(item.id)}>Add to cart</button>
          </div>
          </div>
        ))}
        </div>
        <div className={showCart? "overlay active" : "overlay"} onClick={ () => setShowCart(false)}></div>
        <div className={showCart? 'productCartList active' : 'productCartList'}>
          <div className="title flex-center-between">
          <h3>Keranjang Saya</h3>
          <i className="fas fa-times" style={{cursor: 'pointer'}} onClick={ () => setShowCart(false)}></i>
          </div>
          
          <div className="listProductCart">
            {cartItem.length !== 0 ? (
              
              cartItem.map((item, i) => (
                <div className="itemCart" key={i}>
                  <img src={item.image} alt="" width="100%" />
                  <div className="info">
                    <div className="name">{item.name}</div>
                    <div className="price">Rp. {item.price}</div>
                    <div className="inputgroup" style={{display: 'flex', marginTop: '1rem'}}>
                      <button onClick={(e) => updateCart(item.id, e, 'decrease')}>-</button><input type="number" value={item.qty} onChange={(e) => updateCart(item.id, e, 'edit')} style={{width: `50%`}} onBlur={(e) => updateIfNull(e, item.id, cartItem)}></input> <button onClick={(e) => updateCart(item.id, e, 'add')}>+</button>
                    </div>
                    <i className="fas fa-trash" style={{marginTop: '2rem', cursor: 'pointer'}} onClick={(e) => deleteCart(item.id, cartItem, products , 'deleteIcon')}></i>
                  </div>
                </div>
              ))
            ) : (
              <h4>Belum ada product</h4>
            )
           
            
          }
          
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
